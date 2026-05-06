import express from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../index.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// كل مسارات الإدارة محمية بالـ JWT ودور ADMIN
router.use(authenticate);

// ========================
// إحصائيات النظام الكاملة
// ========================
// ========================
// إحصائيات النظام (Role-aware)
// ========================
router.get('/stats', async (req, res) => {
  const { id: userId, role } = req.user;

  try {
    let stats = {};

    if (role === 'DOCTOR') {
      const doctorProfile = await prisma.doctor.findUnique({ where: { userId } });
      if (!doctorProfile) return res.status(404).json({ error: 'الملف الطبي غير موجود' });
      const doctorId = doctorProfile.id;

      const [
        myPatientsCount, myAppointmentsTotal, myPendingAppts, 
        myCompletedAppts, myPendingPrescriptions
      ] = await Promise.all([
        // عدد المرضى الفريدين الذين زاروا هذا الدكتور
        prisma.appointment.groupBy({
          by: ['patientId'],
          where: { doctorId }
        }).then(res => res.length),
        prisma.appointment.count({ where: { doctorId } }),
        prisma.appointment.count({ where: { doctorId, status: 'WAITING' } }),
        prisma.appointment.count({ where: { doctorId, status: 'COMPLETED' } }),
        prisma.prescription.count({ 
          where: { status: 'PENDING', medicalRecord: { appointment: { doctorId } } } 
        }),
      ]);

      stats = {
        patients: myPatientsCount,
        doctors: 1,
        appointments: { total: myAppointmentsTotal, pending: myPendingAppts, completed: myCompletedAppts },
        revenue: 0, // الخصوصية المالية
        medicines: { total: 0, lowStock: 0 },
        pendingPrescriptions: myPendingPrescriptions
      };
    } else {
      // ADMIN, MANAGER, RECEPTION — إحصائيات كاملة
      const [
        totalPatients, totalDoctors, totalAppointments,
        pendingAppts, completedAppts, totalInvoices,
        paidInvoices, totalMedicines, lowStockMeds,
        totalUsers, pendingPrescriptions
      ] = await Promise.all([
        prisma.patient.count(),
        prisma.doctor.count(),
        prisma.appointment.count(),
        prisma.appointment.count({ where: { status: 'WAITING' } }),
        prisma.appointment.count({ where: { status: 'COMPLETED' } }),
        prisma.invoice.count(),
        prisma.invoice.count({ where: { status: 'PAID' } }),
        prisma.medicine.count(),
        prisma.medicine.count({ where: { stock: { lt: 10 } } }),
        prisma.user.count(),
        prisma.prescription.count({ where: { status: 'PENDING' } }),
      ]);

      const revenue = await prisma.invoice.aggregate({
        where: { status: 'PAID' },
        _sum: { totalAmount: true }
      });

      stats = {
        patients: totalPatients,
        doctors: totalDoctors,
        appointments: { total: totalAppointments, pending: pendingAppts, completed: completedAppts },
        invoices: { total: totalInvoices, paid: paidInvoices },
        medicines: { total: totalMedicines, lowStock: lowStockMeds },
        users: totalUsers,
        revenue: revenue._sum.totalAmount || 0,
        pendingPrescriptions
      };
    }

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في جلب الإحصائيات' });
  }
});

// ========================
// إدارة المستخدمين
// ========================
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, email: true, role: true,
        phone: true, isActive: true, createdAt: true,
        doctorProfile: { select: { specialty: true, department: { select: { name: true } } } },
        patientProfile: { select: { bloodType: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'خطأ في جلب المستخدمين' });
  }
});

router.post('/users', requireRole('ADMIN'), async (req, res) => {
  const { name, email, password, role, phone, specialty, departmentId } = req.body;
  try {
    const hashed = await bcrypt.hash(password || '123456', 10);
    const user = await prisma.user.create({
      data: {
        name, email, password: hashed, role, phone,
        ...(role === 'DOCTOR' && specialty && departmentId ? {
          doctorProfile: {
            create: { specialty, consultFee: 350, departmentId: parseInt(departmentId) }
          }
        } : {})
      },
      select: { id: true, name: true, email: true, role: true, phone: true, createdAt: true }
    });
    res.status(201).json({ message: 'تم إنشاء المستخدم بنجاح', user });
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'البريد الإلكتروني مستخدم بالفعل' });
    res.status(500).json({ error: 'خطأ في إنشاء المستخدم' });
  }
});

router.patch('/users/:id/status', requireRole('ADMIN'), async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { isActive }
    });
    res.json({ message: isActive ? 'تم تفعيل المستخدم' : 'تم تعطيل المستخدم', user });
  } catch (err) {
    res.status(500).json({ error: 'خطأ في تحديث الحالة' });
  }
});

router.patch('/users/:id', requireRole('ADMIN'), async (req, res) => {
  const { id } = req.params;
  const { name, phone, role } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { name, phone, role }
    });
    res.json({ message: 'تم التحديث بنجاح', user });
  } catch (err) {
    res.status(500).json({ error: 'خطأ في التحديث' });
  }
});

// ========================
// إدارة الأقسام
// ========================
router.get('/departments', async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        _count: { select: { doctors: true } }
      },
      orderBy: { name: 'asc' }
    });
    res.json(departments);
  } catch (err) {
    res.status(500).json({ error: 'خطأ في جلب الأقسام' });
  }
});

router.post('/departments', requireRole('ADMIN'), async (req, res) => {
  const { name, description } = req.body;
  try {
    const dept = await prisma.department.create({ data: { name, description } });
    res.status(201).json({ message: 'تم إنشاء القسم', department: dept });
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'القسم موجود بالفعل' });
    res.status(500).json({ error: 'خطأ في إنشاء القسم' });
  }
});

// ========================
// سجل النشاطات (Audit Log بسيط)
// ========================
router.get('/activity', async (req, res) => {
  try {
    // نجلب آخر 50 موعد وفاتورة وسجل طبي كمرجع للنشاط
    const [recentAppts, recentInvoices, recentRecords] = await Promise.all([
      prisma.appointment.findMany({
        take: 20,
        orderBy: { date: 'desc' },
        include: { patient: { include: { user: { select: { name: true } } } } }
      }),
      prisma.invoice.findMany({
        take: 15,
        orderBy: { createdAt: 'desc' },
        include: { patient: { include: { user: { select: { name: true } } } } }
      }),
      prisma.medicalRecord.findMany({
        take: 15,
        orderBy: { createdAt: 'desc' },
        include: { appointment: { include: { patient: { include: { user: { select: { name: true } } } } } } }
      })
    ]);

    const activities = [
      ...recentAppts.map(a => ({
        type: 'appointment', action: `حجز موعد - ${a.patient?.user?.name}`,
        detail: `الحالة: ${a.status}`, time: a.date, color: '#f59e0b'
      })),
      ...recentInvoices.map(i => ({
        type: 'invoice', action: `فاتورة - ${i.patient?.user?.name}`,
        detail: `${i.totalAmount} ج.م — ${i.status}`, time: i.createdAt, color: '#10b981'
      })),
      ...recentRecords.map(r => ({
        type: 'record', action: `سجل طبي - ${r.appointment?.patient?.user?.name}`,
        detail: r.diagnosis, time: r.createdAt, color: '#2563eb'
      }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 30);

    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: 'خطأ في جلب سجل النشاطات' });
  }
});

export default router;
