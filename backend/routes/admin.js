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
    const isStaffRole = ['RECEPTION', 'PHARMACIST', 'LAB_TECH', 'NURSE', 'FINANCIAL_MANAGER', 'STAFF', 'ADMIN'].includes(role);
    const user = await prisma.user.create({
      data: {
        name, email, password: hashed, role, phone,
        ...(role === 'DOCTOR' ? {
          doctorProfile: {
            create: { 
              specialty: specialty || 'عام', 
              consultFee: 350, 
              departmentId: departmentId ? parseInt(departmentId) : (await prisma.department.findFirst())?.id || 1 
            }
          }
        } : {}),
        ...(role === 'PATIENT' ? {
          patientProfile: {
            create: {}
          }
        } : {}),
        ...(isStaffRole ? {
          staffProfile: {
            create: {
              category: role === 'LAB_TECH' ? 'LAB_STAFF' : role === 'PHARMACIST' ? 'PHARMACY_STAFF' : 'ADMIN_STAFF',
              jobTitle: role === 'FINANCIAL_MANAGER' ? 'مدير مالي' : role === 'RECEPTION' ? 'استقبال' : role === 'PHARMACIST' ? 'صيدلي' : role === 'LAB_TECH' ? 'فني مختبر' : 'موظف',
              shift: 'صباحي',
              salary: 0,
              allowances: 0
            }
          }
        } : {})
      },
      select: { id: true, name: true, email: true, role: true, phone: true, createdAt: true }
    });
    res.status(201).json({ message: 'تم إنشاء المستخدم بنجاح', user });
  } catch (err) {
    console.error(err);
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

router.patch('/users/:id/reset-password', requireRole('ADMIN'), async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
  }
  try {
    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });
    if (user.role === 'PATIENT') {
      return res.status(403).json({ error: 'لا يمكن لمدير النظام تغيير كلمة مرور المريض لأسباب أمنية' });
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { password: hashed }
    });
    res.json({ message: 'تم إعادة تعيين كلمة المرور بنجاح' });
  } catch (err) {
    res.status(500).json({ error: 'خطأ في إعادة تعيين كلمة المرور' });
  }
});

router.delete('/users/:id', requireRole('ADMIN'), async (req, res) => {
  const { id } = req.params;
  const userId = parseInt(id);
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        staffProfile: true,
        doctorProfile: true,
        patientProfile: true
      }
    });

    if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });

    await prisma.$transaction(async (tx) => {
      // 1. If it's a staff member
      if (user.staffProfile) {
        const staffId = user.staffProfile.id;
        await tx.payrollItem.deleteMany({ where: { payroll: { is: { employeeId: staffId } } } });
        await tx.payroll.deleteMany({ where: { employeeId: staffId } });
        await tx.salaryAdjustment.deleteMany({ where: { employeeId: staffId } });
        await tx.leaveRequest.deleteMany({ where: { employeeId: staffId } });
        await tx.attendance.deleteMany({ where: { userId } });
        await tx.nursingAssignment.deleteMany({ where: { nurseId: staffId } });
        await tx.staff.delete({ where: { id: staffId } });
      }

      // 2. If it's a doctor
      if (user.doctorProfile) {
        const doctorId = user.doctorProfile.id;
        await tx.admission.deleteMany({ where: { doctorId } });
        await tx.appointment.deleteMany({ where: { doctorId } });
        await tx.prescription.deleteMany({ where: { doctorId } });
        await tx.doctor.delete({ where: { id: doctorId } });
      }

      // 3. If it's a patient
      if (user.patientProfile) {
        const patientId = user.patientProfile.id;
        await tx.invoiceItem.deleteMany({ where: { invoice: { is: { patientId } } } });
        await tx.payment.deleteMany({ where: { invoice: { is: { patientId } } } });
        await tx.invoice.deleteMany({ where: { patientId } });
        await tx.admission.deleteMany({ where: { patientId } });
        await tx.appointment.deleteMany({ where: { patientId } });
        await tx.radiologyRecord.deleteMany({ where: { patientId } });
        await tx.patientFile.deleteMany({ where: { patientId } });
        await tx.patient.delete({ where: { id: patientId } });
      }

      // 4. Clean up notifications and audit logs
      await tx.auditLog.deleteMany({ where: { userId } });
      await tx.notification.deleteMany({ where: { userId } });

      // 5. Delete User itself
      await tx.user.delete({ where: { id: userId } });
    });

    res.json({ message: 'تم حذف المستخدم بنجاح' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'خطأ في حذف المستخدم من النظام' });
  }
});

router.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true, name: true, email: true, role: true, phone: true, isActive: true, createdAt: true,
        doctorProfile: { include: { department: true } },
        staffProfile: true,
        patientProfile: true
      }
    });
    if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'خطأ في جلب المستخدم' });
  }
});

// ========================
// إدارة الأطباء
// ========================
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, isActive: true } },
        department: true
      }
    });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب بيانات الأطباء' });
  }
});

router.patch('/doctors/:id', requireRole('ADMIN', 'FINANCIAL_MANAGER'), async (req, res) => {
  const { specialty, consultFee, clinicNumber, departmentId } = req.body;
  try {
    const updated = await prisma.doctor.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(specialty && { specialty }),
        ...(consultFee !== undefined && { consultFee: parseFloat(consultFee) || 0 }),
        ...(clinicNumber !== undefined && { clinicNumber }),
        ...(departmentId && { departmentId: parseInt(departmentId) })
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, isActive: true } },
        department: true
      }
    });
    res.json({ message: 'تم تحديث بيانات الطبيب بنجاح', doctor: updated });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في تحديث بيانات الطبيب' });
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

// ========================
// إدارة الأسرة
// ========================
router.get('/beds', async (req, res) => {
  try {
    const beds = await prisma.bed.findMany({
      include: {
        room: {
          include: {
            ward: {
              include: {
                department: true
              }
            }
          }
        },
        admissions: {
          where: { dischargedAt: null },
          include: {
            patient: {
              include: {
                user: { select: { name: true } }
              }
            }
          }
        }
      }
    });

    const formatted = beds.map(b => {
      const activeAdmission = b.admissions[0];
      let rawNumber = b.bedNumber;
      let status = b.isOccupied ? 'occupied' : 'available';
      
      if (rawNumber.includes('#')) {
        const parts = rawNumber.split('#');
        rawNumber = parts[0];
        status = parts[1];
      }

      return {
        id: b.id,
        number: rawNumber,
        dept: b.room?.ward?.name || b.room?.ward?.department?.name || 'قسم عام',
        floor: b.room?.roomNumber || 'الأول',
        status: status,
        patient: activeAdmission?.patient?.user?.name || '',
        since: activeAdmission?.admittedAt ? new Date(activeAdmission.admittedAt).toISOString().split('T')[0] : '',
        type: b.room?.type || 'عادي'
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ في جلب بيانات الأسرة' });
  }
});

router.post('/beds', requireRole('ADMIN'), async (req, res) => {
  const { number, dept, floor, status, type } = req.body;
  try {
    let ward = await prisma.ward.findFirst({
      where: { name: dept }
    });
    if (!ward) {
      const defaultDept = await prisma.department.findFirst() || await prisma.department.create({ data: { name: 'قسم عام', description: 'قسم عام للمستشفى' } });
      ward = await prisma.ward.create({
        data: {
          name: dept,
          type: 'GENERAL',
          capacity: 10,
          departmentId: defaultDept.id
        }
      });
    }

    let room = await prisma.room.findFirst({
      where: { roomNumber: floor, wardId: ward.id }
    });
    if (!room) {
      room = await prisma.room.create({
        data: {
          roomNumber: floor,
          type: type || 'عادي',
          pricePerDay: 500,
          wardId: ward.id
        }
      });
    }

    const dbBedNumber = status === 'maintenance' ? `${number}#maintenance` : number;
    const bed = await prisma.bed.create({
      data: {
        bedNumber: dbBedNumber,
        roomId: room.id,
        isOccupied: status === 'occupied'
      }
    });

    res.status(201).json({ message: 'تم إضافة السرير بنجاح', bed });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ في إضافة السرير' });
  }
});

router.patch('/beds/:id', requireRole('ADMIN'), async (req, res) => {
  const { number, dept, floor, status, type } = req.body;
  try {
    const bedId = parseInt(req.params.id);
    const existingBed = await prisma.bed.findUnique({ where: { id: bedId } });
    if (!existingBed) return res.status(404).json({ error: 'السرير غير موجود' });

    const finalNumber = number || existingBed.bedNumber.split('#')[0];
    const dbBedNumber = status === 'maintenance' ? `${finalNumber}#maintenance` : finalNumber;

    const updated = await prisma.bed.update({
      where: { id: bedId },
      data: {
        bedNumber: dbBedNumber,
        isOccupied: status === 'occupied'
      }
    });

    res.json({ message: 'تم تحديث السرير بنجاح', bed: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ في تحديث السرير' });
  }
});

router.delete('/beds/:id', requireRole('ADMIN'), async (req, res) => {
  try {
    const bedId = parseInt(req.params.id);
    await prisma.bed.delete({ where: { id: bedId } });
    res.json({ message: 'تم حذف السرير بنجاح' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ في حذف السرير' });
  }
});

export default router;
