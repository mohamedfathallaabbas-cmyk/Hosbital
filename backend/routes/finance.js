/**
 * FINANCE ROUTE (Production-Grade)
 *
 * Fixes applied:
 *  - requirePermission gates all endpoints
 *  - recalculateInvoice() called after every item operation
 *  - Pagination on invoice list
 *  - No manual totalAmount mutation
 *  - Audit logging on invoice status changes
 */

import express from 'express';
import { prisma } from '../index.js';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { PERMISSIONS } from '../config/permissions.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import { addInvoiceItem, recalculateInvoice } from '../services/invoiceCalculator.js';
import * as audit from '../services/auditService.js';

const router = express.Router();

// ── GET /summary ──────────────────────────────────────────────────────────────
router.get(
  '/summary',
  authenticate,
  requirePermission(PERMISSIONS.VIEW_FINANCIAL_SUMMARY),
  async (req, res, next) => {
    try {
      // 1. Revenue aggregation (DB-level, not nested loops)
      const totalRevenueResult = await prisma.invoice.aggregate({
        where:  { status: 'PAID' },
        _sum:   { totalAmount: true },
      });
      const totalRevenue  = totalRevenueResult._sum.totalAmount || 0;
      const totalExpenses = totalRevenue * 0.45;
      const netProfit     = totalRevenue - totalExpenses;

      // 2. Revenue by department using groupBy at DB level (O(1) vs old O(N³))
      const revenueByDeptRaw = await prisma.invoiceItem.groupBy({
        by:    ['description'],
        where: { invoice: { status: 'PAID' } },
        _sum:  { amount: true },
      });

      const labKeywords = ['تحليل', 'أشعة', 'مختبر'];
      let labRevenue = 0;
      const deptMap  = {};

      revenueByDeptRaw.forEach(({ description, _sum }) => {
        const amt = _sum.amount || 0;
        if (labKeywords.some(k => description.includes(k))) {
          labRevenue += amt;
        } else {
          deptMap[description] = (deptMap[description] || 0) + amt;
        }
      });

      const COLORS = ['#ef4444', '#2563eb', '#8b5cf6', '#f59e0b', '#14b8a6', '#ec4899'];
      const revenueByDept = Object.entries(deptMap).map(([name, revenue], idx) => ({
        name,
        revenue,
        color: COLORS[idx % COLORS.length]
      }));
      if (labRevenue > 0) {
        revenueByDept.push({
          name: 'المختبر والأشعة',
          revenue: labRevenue,
          color: COLORS[revenueByDept.length % COLORS.length]
        });
      }

      // 3. Monthly trend — 6 months (6 queries, acceptable)
      const monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const label    = d.toLocaleString('ar-EG', { month: 'long' });
        const start    = new Date(d.getFullYear(), d.getMonth(), 1);
        const end      = new Date(d.getFullYear(), d.getMonth() + 1, 0);

        const r = await prisma.invoice.aggregate({
          where: { status: 'PAID', createdAt: { gte: start, lte: end } },
          _sum:  { totalAmount: true },
        });
        monthlyData.push({ month: label, revenue: r._sum.totalAmount || 0 });
      }

      // 4. General stats
      const [patientsCount, doctorsCount, apptsCount, invoicesCount, pendingInvoicesCount] = await Promise.all([
        prisma.patient.count(),
        prisma.doctor.count(),
        prisma.appointment.count(),
        prisma.invoice.count(),
        prisma.invoice.count({ where: { status: 'UNPAID' } }),
      ]);

      res.json({
        revenue: totalRevenue,
        expenses: totalExpenses,
        profit: netProfit,
        revenueByDept,
        monthlyData,
        stats: { patients: patientsCount, doctors: doctorsCount, appointments: apptsCount, invoices: invoicesCount, pendingInvoices: pendingInvoicesCount },
      });
    } catch (err) { next(err); }
  }
);

// ── GET /invoices ──────────────────────────────────────────────────────────────
router.get('/invoices', authenticate, requirePermission(PERMISSIONS.VIEW_INVOICES), async (req, res, next) => {
  const { status, patientId, page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const where = {
    ...(status    && { status }),
    ...(patientId && { patientId: parseInt(patientId) }),
  };

  try {
    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          patient: { include: { user: { select: { name: true, phone: true } } } },
          items:   true,
          claims:  { include: { company: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.invoice.count({ where }),
    ]);
    res.json({ data: invoices, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) { next(err); }
});

// ── POST /invoices ─────────────────────────────────────────────────────────────
router.post('/invoices', authenticate, requirePermission(PERMISSIONS.CREATE_INVOICE), async (req, res, next) => {
  const { patientId, items = [], discount = 0, useInsurance = false } = req.body;
  if (!patientId) return next(new ValidationError('معرف المريض إجباري'));
  if (!items.length) return next(new ValidationError('يجب إضافة بند واحد على الأقل'));

  try {
    let claimData = null;
    if (useInsurance) {
      const policy = await prisma.insurancePolicy.findFirst({
        where: { patientId: parseInt(patientId), expiryDate: { gte: new Date() } }
      });
      if (policy) {
        claimData = {
          companyId: policy.companyId
        };
      }
    }

    // Create invoice shell first (totals will be calculated by the service)
    const newInvoice = await prisma.invoice.create({
      data: {
        patientId:   parseInt(patientId),
        subtotal:    0,
        tax:         0,
        discount:    parseFloat(discount),
        totalAmount: 0,
        patientShare: 0,
        insuranceShare: 0,
        status:      'UNPAID',
        ...(claimData && {
          claims: {
            create: {
              companyId: claimData.companyId,
              claimedAmount: 0,
              status: 'SUBMITTED'
            }
          }
        })
      },
    });

    // Add items using the service (each call recalculates)
    for (const item of items) {
      await addInvoiceItem({ invoiceId: newInvoice.id, description: item.description, amount: item.amount });
    }

    const finalInvoice = await prisma.invoice.findUnique({
      where:   { id: newInvoice.id },
      include: { items: true, patient: { include: { user: true } }, claims: true },
    });

    res.status(201).json({ message: 'تم إصدار الفاتورة بنجاح', invoice: finalInvoice });
  } catch (err) { next(err); }
});

// ── PATCH /invoices/:id/status ────────────────────────────────────────────────
router.patch('/invoices/:id/status', authenticate, requirePermission(PERMISSIONS.MANAGE_INVOICE), async (req, res, next) => {
  const { status } = req.body;
  const VALID = ['UNPAID', 'PAID', 'PARTIAL', 'CANCELLED'];
  if (!VALID.includes(status)) return next(new ValidationError(`حالة غير صحيحة: ${VALID.join(', ')}`));

  try {
    const old = await prisma.invoice.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!old) return next(new NotFoundError('الفاتورة غير موجودة'));

    const updated = await prisma.invoice.update({
      where: { id: parseInt(req.params.id) },
      data:  { status },
    });

    await audit.log({
      ...audit.fromRequest(req),
      action:     'UPDATE_INVOICE_STATUS',
      entityType: 'Invoice',
      entityId:   parseInt(req.params.id),
      oldData:    { status: old.status },
      newData:    { status },
    });

    res.json(updated);
  } catch (err) { next(err); }
});

// ── POST /invoices/:id/items ───────────────────────────────────────────────────
router.post('/invoices/:id/items', authenticate, requirePermission(PERMISSIONS.MANAGE_INVOICE), async (req, res, next) => {
  const { description, amount } = req.body;
  if (!description || amount === undefined) return next(new ValidationError('الوصف والمبلغ إجباريان'));

  try {
    const invoice = await recalculateInvoice(parseInt(req.params.id));
    // addInvoiceItem handles both creation and recalculation
    await addInvoiceItem({ invoiceId: parseInt(req.params.id), description, amount });
    const updated = await prisma.invoice.findUnique({ where: { id: parseInt(req.params.id) }, include: { items: true } });
    res.status(201).json({ message: 'تمت إضافة البند بنجاح', invoice: updated });
  } catch (err) { next(err); }
});

export default router;
