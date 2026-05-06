import express from 'express';
import { prisma } from '../index.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// GET: جلب الملخص المالي والتحليلات للوحة تحكم المدير
router.get('/summary', async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: { 
        items: true,
        patient: { include: { user: true } }
      }
    });

    const paidInvoices = invoices.filter(inv => inv.status === 'PAID');
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalExpenses = totalRevenue * 0.45; // افتراضياً المصاريف 45%
    const netProfit = totalRevenue - totalExpenses;

    // 1. حساب الإيرادات حسب القسم (عن طريق البحث في بنود الفواتير)
    const deptStats = await prisma.department.findMany({
      include: {
        doctors: {
          include: {
            appointments: {
              where: { invoices: { some: { status: 'PAID' } } },
              include: { invoices: true }
            }
          }
        }
      }
    });

    const revenueByDept = deptStats.map(dept => {
      let revenue = 0;
      dept.doctors.forEach(doc => {
        doc.appointments.forEach(appt => {
          appt.invoices.forEach(inv => {
            if (inv.status === 'PAID') revenue += inv.totalAmount;
          });
        });
      });
      return { name: dept.name, value: revenue };
    });

    // إضافة إيرادات المعامل والأشعة (التي ليست مرتبطة بطبيب معين مباشرة في الموعد)
    const labItems = await prisma.invoiceItem.findMany({
      where: {
        description: { contains: 'تحليل' },
        invoice: { status: 'PAID' }
      }
    });
    const labRevenue = labItems.reduce((sum, item) => sum + item.amount, 0);
    if (labRevenue > 0) {
      revenueByDept.push({ name: 'المختبر والأشعة', value: labRevenue });
    }

    // 2. حساب النمو الشهري (لآخر 6 أشهر)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthLabel = date.toLocaleString('ar-EG', { month: 'long' });
      
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthRevenue = paidInvoices
        .filter(inv => inv.createdAt >= startOfMonth && inv.createdAt <= endOfMonth)
        .reduce((sum, inv) => sum + inv.totalAmount, 0);

      monthlyData.push({ month: monthLabel, revenue: monthRevenue });
    }

    res.json({
      revenue: totalRevenue,
      expenses: totalExpenses,
      profit: netProfit,
      revenueByDept,
      monthlyData,
      stats: {
        patients: await prisma.patient.count(),
        doctors: await prisma.doctor.count(),
        appointments: await prisma.appointment.count(),
        invoices: invoices.length,
        pendingInvoices: invoices.filter(i => i.status !== 'PAID').length
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ في تحليل البيانات المالية' });
  }
});


// POST: إنشاء فاتورة جديدة للمريض (تُستدعى غالباً من قسم الاستقبال)
router.post('/invoices', async (req, res) => {
  const { patientId, items, discount = 0, status = 'UNPAID' } = req.body;
  // الشكل المتوقع لـ items:
  // [{ description: 'كشف باطنة', amount: 300 }]

  try {
    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.amount), 0);
    const tax = subtotal * 0.14; // ضريبة قيمة مضافة 14%
    const totalAmount = (subtotal + tax) - parseFloat(discount);

    const newInvoice = await prisma.invoice.create({
      data: {
        patientId: parseInt(patientId),
        subtotal,
        tax,
        discount: parseFloat(discount),
        totalAmount,
        status,
        items: {
          create: items.map(item => ({
            description: item.description,
            amount: parseFloat(item.amount)
          }))
        }
      },
      include: { items: true, patient: { include: { user: true } } }
    });

    res.status(201).json({ message: 'تم إصدار الفاتورة بنجاح', invoice: newInvoice });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ في إنشاء الفاتورة' });
  }
});

// GET: جلب قائمة الفواتير لصفحة المحاسبة
router.get('/invoices', async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        patient: { include: { user: { select: { name: true, phone: true } } } },
        items: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب الفواتير' });
  }
});

// GET: جلب جميع الفواتير المعلقة (للاستقبال والمدير)
router.get('/invoices', authenticate, async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { status: 'PENDING' },
      include: {
        patient: { include: { user: true } },
        items: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب الفواتير' });
  }
});

// PATCH: تحديث حالة الفاتورة (دفع)
router.patch('/invoices/:id/status', authenticate, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const updated = await prisma.invoice.update({
      where: { id: parseInt(id) },
      data: { status }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في تحديث حالة الفاتورة' });
  }
});

export default router;
