/**
 * PHARMACY ROUTE (Production-Grade)
 * 
 * Fixes applied:
 *  - requirePermission('DISPENSE_MEDICINE') — patients CANNOT dispense
 *  - Audit log on every dispense
 *  - Invoice totals recalculated via invoiceCalculator (fixes accounting mismatch)
 *  - Atomic transaction with rollback on insufficient stock
 *  - Pagination on inventory listing
 */

import express from 'express';
import { prisma } from '../index.js';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { PERMISSIONS } from '../config/permissions.js';
import { NotFoundError, ValidationError, ConflictError } from '../utils/errors.js';
import { addInvoiceItem } from '../services/invoiceCalculator.js';
import * as audit from '../services/auditService.js';

const router = express.Router();

// ── GET /prescriptions ────────────────────────────────────────────────────────
router.get(
  '/prescriptions',
  authenticate,
  requirePermission(PERMISSIONS.VIEW_PRESCRIPTIONS),
  async (req, res, next) => {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    try {
      const where = status ? { status } : {};
      const [prescriptions, total] = await Promise.all([
        prisma.prescription.findMany({
          where,
          include: {
            medicalRecord: {
              include: {
                appointment: {
                  include: {
                    patient: { include: { user: true } },
                    doctor:  { include: { user: true } },
                  },
                },
              },
            },
            items: { include: { medicine: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: parseInt(limit),
        }),
        prisma.prescription.count({ where }),
      ]);
      res.json({ data: prescriptions, total, page: parseInt(page), limit: parseInt(limit) });
    } catch (err) { next(err); }
  }
);

// ── PATCH /prescriptions/:id/dispense ─────────────────────────────────────────
router.patch(
  '/prescriptions/:id/dispense',
  authenticate,
  requirePermission(PERMISSIONS.DISPENSE_MEDICINE), // ← PHARMACIST or ADMIN only
  async (req, res, next) => {
    const prescriptionId = parseInt(req.params.id);

    try {
      const prescription = await prisma.prescription.findUnique({
        where: { id: prescriptionId },
        include: {
          items: { include: { medicine: true } },
          medicalRecord: { include: { appointment: true } },
        },
      });

      if (!prescription) return next(new NotFoundError('الروشتة غير موجودة'));
      if (prescription.status === 'DISPENSED') {
        return next(new ConflictError('تم صرف هذه الروشتة مسبقاً'));
      }

      // ── Atomic Transaction ───────────────────────────────────────────────────
      await prisma.$transaction(async (tx) => {
        // 1. Mark as dispensed
        await tx.prescription.update({
          where: { id: prescriptionId },
          data:  { status: 'DISPENSED' },
        });

        // 2. Decrement stock — atomic guard prevents negative stock
        for (const item of prescription.items) {
          if (!item.medicineId) continue; // external medicine, no stock decrement

          const updated = await tx.medicine.updateMany({
            where: {
              id:    item.medicineId,
              stock: { gte: item.quantity }, // only decrement if enough stock
            },
            data: { stock: { decrement: item.quantity } },
          });

          if (updated.count === 0) {
            throw new Error(`مخزون الدواء "${item.medicine?.name || item.medicineName}" غير كافٍ (المطلوب: ${item.quantity})`);
          }
        }

        // 3. Add cost to patient invoice using the calculator service (fixes accounting bug)
        const appointment = prescription.medicalRecord?.appointment;
        if (appointment?.patientId) {
          let invoice = await tx.invoice.findFirst({
            where:   { patientId: appointment.patientId, status: { in: ['UNPAID', 'PARTIAL'] } },
            orderBy: { createdAt: 'desc' },
          });

          if (!invoice) {
            invoice = await tx.invoice.create({
              data: { patientId: appointment.patientId, totalAmount: 0, subtotal: 0, tax: 0 },
            });
          }

          const medsCost = prescription.items.reduce((sum, item) => {
            if (item.medicineId && item.medicine?.price) {
              return sum + (item.medicine.price * item.quantity);
            }
            return sum;
          }, 0);

          if (medsCost > 0) {
            // addInvoiceItem also calls recalculateInvoice — fixes subtotal/tax mismatch
            await addInvoiceItem(
              { invoiceId: invoice.id, description: `أدوية روشتة رقم #${prescriptionId}`, amount: medsCost },
              tx
            );
          }
        }
      });

      // ── Audit Log ────────────────────────────────────────────────────────────
      await audit.log({
        ...audit.fromRequest(req),
        action:     'DISPENSE_MEDICINE',
        entityType: 'Prescription',
        entityId:   prescriptionId,
        newData:    { status: 'DISPENSED', dispensedBy: req.user.id },
      });

      res.json({ message: 'تم صرف الروشتة وتحديث المخزون بنجاح ✓' });
    } catch (err) {
      if (err.message?.includes('غير كافٍ')) {
        return next(new ValidationError(err.message));
      }
      next(err);
    }
  }
);

// ── GET /inventory ────────────────────────────────────────────────────────────
router.get('/inventory', authenticate, requirePermission(PERMISSIONS.VIEW_PRESCRIPTIONS, { any: true }), async (req, res, next) => {
  const { page = 1, limit = 50, search } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  try {
    const where = search
      ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { genericName: { contains: search, mode: 'insensitive' } }] }
      : {};

    const [medicines, total] = await Promise.all([
      prisma.medicine.findMany({ where, orderBy: { name: 'asc' }, skip, take: parseInt(limit) }),
      prisma.medicine.count({ where }),
    ]);
    res.json({ data: medicines, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) { next(err); }
});

// ── GET /inventory/low-stock ──────────────────────────────────────────────────
router.get('/inventory/low-stock', authenticate, requirePermission(PERMISSIONS.MANAGE_INVENTORY), async (req, res, next) => {
  try {
    const lowStock = await prisma.medicine.findMany({
      where:   { stock: { lt: 20 } },
      orderBy: { stock: 'asc' },
    });
    res.json(lowStock);
  } catch (err) { next(err); }
});

// ── POST /inventory ───────────────────────────────────────────────────────────
router.post('/inventory', authenticate, requirePermission(PERMISSIONS.MANAGE_INVENTORY), async (req, res, next) => {
  const { name, genericName, category, stock, price, expiryDate } = req.body;
  if (!name || !category || price === undefined) {
    return next(new ValidationError('الاسم والفئة والسعر بيانات إجبارية'));
  }

  try {
    const newMed = await prisma.medicine.create({
      data: {
        name,
        genericName,
        category,
        stock:      parseInt(stock || 0),
        price:      parseFloat(price),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
      },
    });
    res.status(201).json({ message: 'تمت إضافة الدواء بنجاح', medicine: newMed });
  } catch (err) { next(err); }
});

// ── PATCH /inventory/:id ──────────────────────────────────────────────────────
router.patch('/inventory/:id', authenticate, requirePermission(PERMISSIONS.MANAGE_INVENTORY), async (req, res, next) => {
  const { name, genericName, category, stock, price, expiryDate } = req.body;

  try {
    const updated = await prisma.medicine.update({
      where: { id: parseInt(req.params.id) },
      data:  {
        ...(name        !== undefined && { name }),
        ...(genericName !== undefined && { genericName }),
        ...(category    !== undefined && { category }),
        ...(stock       !== undefined && { stock: parseInt(stock) }),
        ...(price       !== undefined && { price: parseFloat(price) }),
        ...(expiryDate  !== undefined && { expiryDate: new Date(expiryDate) }),
      },
    });
    res.json({ message: 'تم التعديل بنجاح', medicine: updated });
  } catch (err) { next(err); }
});

// ── GET /purchase-requests ──────────────────────────────────────────────────────
router.get(
  '/purchase-requests',
  authenticate,
  requirePermission(PERMISSIONS.MANAGE_INVENTORY),
  async (req, res, next) => {
    try {
      const { status } = req.query;
      const where = status ? { status } : {};
      const requests = await prisma.purchaseRequest.findMany({
        where,
        include: {
          medicine: true,
          pharmacist: { select: { id: true, name: true } },
          admin: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      res.json({ data: requests });
    } catch (err) { next(err); }
  }
);

// ── POST /purchase-requests ───────────────────────────────────────────────────
router.post(
  '/purchase-requests',
  authenticate,
  requirePermission(PERMISSIONS.MANAGE_INVENTORY),
  async (req, res, next) => {
    try {
      const { medicineId, medicineName, quantity, notes } = req.body;
      
      if (!quantity || quantity <= 0) {
        return next(new ValidationError('يجب أن تكون الكمية أكبر من صفر'));
      }
      if (!medicineId && !medicineName) {
        return next(new ValidationError('يجب تحديد الدواء أو كتابة اسمه'));
      }

      const request = await prisma.purchaseRequest.create({
        data: {
          medicineId: medicineId ? parseInt(medicineId) : null,
          medicineName: medicineName || 'غير محدد',
          quantity: parseInt(quantity),
          notes,
          pharmacistId: req.user.id,
        }
      });

      await audit.log({
        ...audit.fromRequest(req),
        action: 'CREATE_PURCHASE_REQUEST',
        entityType: 'PurchaseRequest',
        entityId: request.id,
        newData: { quantity, medicineId, medicineName }
      });

      res.status(201).json({ success: true, message: 'تم إرسال الطلب للإدارة', data: request });
    } catch (err) { next(err); }
  }
);

// ── PATCH /purchase-requests/:id/status ───────────────────────────────────────
router.patch(
  '/purchase-requests/:id/status',
  authenticate,
  async (req, res, next) => {
    try {
      // Only ADMIN or specific roles can approve
      if (req.user.role !== 'ADMIN' && req.user.role !== 'MANAGER') {
        return res.status(403).json({ error: 'غير مصرح لك باعتماد الطلبات' });
      }

      const { status, rejectionReason } = req.body;
      if (!['APPROVED', 'REJECTED'].includes(status)) {
        return next(new ValidationError('حالة غير صالحة'));
      }

      const purchaseReq = await prisma.purchaseRequest.findUnique({ where: { id: parseInt(req.params.id) } });
      if (!purchaseReq) return next(new NotFoundError('الطلب غير موجود'));
      if (purchaseReq.status !== 'PENDING') return next(new ConflictError('لا يمكن تعديل طلب تم التعامل معه'));

      const updated = await prisma.$transaction(async (tx) => {
        const reqUpdate = await tx.purchaseRequest.update({
          where: { id: purchaseReq.id },
          data: {
            status,
            rejectionReason: status === 'REJECTED' ? rejectionReason : null,
            adminId: req.user.id,
          }
        });

        if (status === 'APPROVED' && reqUpdate.medicineId) {
          await tx.medicine.update({
            where: { id: reqUpdate.medicineId },
            data: { stock: { increment: reqUpdate.quantity } }
          });
        }
        return reqUpdate;
      });

      await audit.log({
        ...audit.fromRequest(req),
        action: 'UPDATE_PURCHASE_REQUEST_STATUS',
        entityType: 'PurchaseRequest',
        entityId: updated.id,
        newData: { status, rejectionReason }
      });

      res.json({ success: true, message: `تم ${status === 'APPROVED' ? 'اعتماد' : 'رفض'} الطلب بنجاح`, data: updated });
    } catch (err) { next(err); }
  }
);

export default router;
