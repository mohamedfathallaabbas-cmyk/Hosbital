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
      // 1. Revenue aggregation (DB-level, PAID invoices)
      const totalRevenueResult = await prisma.invoice.aggregate({
        where:  { status: 'PAID' },
        _sum:   { totalAmount: true },
      });
      const totalRevenue = totalRevenueResult._sum.totalAmount || 0;

      // 2. Actual Expenses aggregation
      // a. Payroll expenses (sum of netSalary of PAID payrolls)
      const payrollPaidResult = await prisma.payroll.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { netSalary: true }
      });
      const payrollExpenses = payrollPaidResult._sum.netSalary || 0;

      // b. Medicine purchase expenses (APPROVED purchase requests)
      const approvedPurchases = await prisma.purchaseRequest.findMany({
        where: { status: 'APPROVED' },
        include: { medicine: true }
      });
      const medicineExpenses = approvedPurchases.reduce((sum, req) => {
        const price = req.medicine?.price || 0;
        return sum + (req.quantity * price);
      }, 0);

      // c. Simulated general operational overhead (utilities, rent, maintenance - 15% of revenue)
      const operationalExpenses = totalRevenue * 0.15;

      const totalExpenses = payrollExpenses + medicineExpenses + operationalExpenses;
      const netProfit = totalRevenue - totalExpenses;

      // 3. Outstanding Payments (sum of UNPAID and PARTIAL invoices)
      const pendingInvoicesResult = await prisma.invoice.aggregate({
        where: { status: { in: ['UNPAID', 'PARTIAL'] } },
        _sum: { totalAmount: true }
      });
      const pendingInvoicesAmount = pendingInvoicesResult._sum.totalAmount || 0;

      // 4. Revenue by department using groupBy at DB level
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

      // 5. Monthly trend — 6 months (aggregating revenue, payroll, and purchases per month)
      const monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const label = d.toLocaleString('ar-EG', { month: 'long' });
        const start = new Date(d.getFullYear(), d.getMonth(), 1);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);

        const monthNum = d.getMonth() + 1;
        const yearNum = d.getFullYear();

        // Revenue for month
        const rResult = await prisma.invoice.aggregate({
          where: { status: 'PAID', createdAt: { gte: start, lte: end } },
          _sum:  { totalAmount: true },
        });
        const mRevenue = rResult._sum.totalAmount || 0;

        // Payroll for month
        const pResult = await prisma.payroll.aggregate({
          where: { month: monthNum, year: yearNum, paymentStatus: 'PAID' },
          _sum: { netSalary: true }
        });
        const mPayroll = pResult._sum.netSalary || 0;

        // Purchase requests for month
        const mPurchasesRaw = await prisma.purchaseRequest.findMany({
          where: { status: 'APPROVED', createdAt: { gte: start, lte: end } },
          include: { medicine: true }
        });
        const mPurchases = mPurchasesRaw.reduce((sum, req) => sum + (req.quantity * (req.medicine?.price || 0)), 0);

        const mOperational = mRevenue * 0.15;
        const mExpenses = mPayroll + mPurchases + mOperational;
        const mProfit = mRevenue - mExpenses;

        monthlyData.push({
          month: label,
          revenue: mRevenue,
          expenses: mExpenses,
          profit: mProfit
        });
      }

      // 6. General counts
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
        pendingInvoicesAmount,
        revenueByDept,
        monthlyData,
        stats: {
          patients: patientsCount,
          doctors: doctorsCount,
          appointments: apptsCount,
          invoices: invoicesCount,
          pendingInvoices: pendingInvoicesCount
        },
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
