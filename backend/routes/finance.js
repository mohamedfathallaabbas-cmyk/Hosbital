import express from 'express';
import { prisma } from '../index.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// GET: جلب الملخص المالي والتحليلات للوحة تحكم المدير
router.get('/summary', authenticate, async (req, res) => {
  try {
    // 1. إجمالي الإيرادات والمصاريف
    const totalRevenueResult = await prisma.invoice.aggregate({
      where: { status: 'PAID' },
      _sum: { totalAmount: true }
    });
    
    const totalRevenue = totalRevenueResult._sum.totalAmount || 0;
    const totalExpenses = totalRevenue * 0.45; // افتراضياً المصاريف 45%
    const netProfit = totalRevenue - totalExpenses;

    // 2. إيرادات الأقسام باستخدام GroupBy
    // هنا نجلب الفواتير المدفوعة وندمج الأقسام (سنقوم بتجميعها في الذاكرة لكن فقط للفواتير المرتبطة بمواعيد بدلاً من جلب كل شيء)
    const paidInvoices = await prisma.invoice.findMany({
      where: { status: 'PAID' },
      include: {
        patient: {
          include: {
            appointments: {
              include: {
                doctor: { include: { department: true } }
              }
            }
          }
        },
        items: true
      }
    });

    const revenueByDeptMap = {};
    let labRevenue = 0;

    paidInvoices.forEach(inv => {
      // إيرادات المعامل والأشعة
      const labItems = inv.items.filter(item => item.description.includes('تحليل') || item.description.includes('أشعة'));
      labRevenue += labItems.reduce((sum, item) => sum + item.amount, 0);

      // باقي الإيرادات للأقسام (بشكل مبسط، نربط الفاتورة بآخر موعد للمريض)
      if (inv.patient && inv.patient.appointments.length > 0) {
        // نأخذ القسم من أحدث موعد 
        const latestAppt = inv.patient.appointments[inv.patient.appointments.length - 1];
        if (latestAppt && latestAppt.doctor && latestAppt.doctor.department) {
          const deptName = latestAppt.doctor.department.name;
          const nonLabRevenue = inv.totalAmount - labItems.reduce((sum, item) => sum + item.amount, 0);
          
          if (!revenueByDeptMap[deptName]) revenueByDeptMap[deptName] = 0;
          revenueByDeptMap[deptName] += nonLabRevenue;
        }
      }
    });

    const revenueByDept = Object.keys(revenueByDeptMap).map(name => ({
      name, value: revenueByDeptMap[name]
    }));

    if (labRevenue > 0) {
      revenueByDept.push({ name: 'المختبر والأشعة', value: labRevenue });
    }

    // 3. حساب النمو الشهري (لآخر 6 أشهر)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthLabel = date.toLocaleString('ar-EG', { month: 'long' });
      
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthRevenueResult = await prisma.invoice.aggregate({
        where: {
          status: 'PAID',
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        },
        _sum: { totalAmount: true }
      });

      monthlyData.push({ month: monthLabel, revenue: monthRevenueResult._sum.totalAmount || 0 });
    }

    // الإحصائيات العامة
    const [patientsCount, doctorsCount, apptsCount, invoicesCount, pendingInvoicesCount] = await Promise.all([
      prisma.patient.count(),
      prisma.doctor.count(),
      prisma.appointment.count(),
      prisma.invoice.count(),
      prisma.invoice.count({ where: { status: 'PENDING' } })
    ]);

    res.json({
      revenue: totalRevenue,
      expenses: totalExpenses,
      profit: netProfit,
      revenueByDept,
      monthlyData,
      stats: {
        patients: patientsCount,
        doctors: doctorsCount,
        appointments: apptsCount,
        invoices: invoicesCount,
        pendingInvoices: pendingInvoicesCount
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ في تحليل البيانات المالية' });
  }
});


// POST: إنشاء فاتورة جديدة للمريض
router.post('/invoices', authenticate, async (req, res) => {
  const { patientId, items, discount = 0, status = 'UNPAID' } = req.body;

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

// GET: جلب جميع الفواتير (للمحاسبة والاستقبال) مع إمكانية الفلترة
router.get('/invoices', authenticate, async (req, res) => {
  const { status } = req.query;
  try {
    const invoices = await prisma.invoice.findMany({
      where: status ? { status } : {},
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
