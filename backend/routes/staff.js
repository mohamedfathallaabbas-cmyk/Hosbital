import express from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../index.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// GET / - جميع الموظفين
router.get('/', requireRole('ADMIN', 'OPERATIONS_MANAGER', 'FINANCIAL_MANAGER'), async (req, res) => {
  try {
    const staff = await prisma.staff.findMany({
      include: { user: { select: { name: true, email: true, phone: true, role: true, isActive: true } } }
    });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب بيانات الموظفين' });
  }
});

// GET /me - بيانات الموظف نفسه
router.get('/me', async (req, res) => {
  try {
    const staffProfile = await prisma.staff.findUnique({
      where: { userId: req.user.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            role: true,
            attendance: { orderBy: { date: 'desc' }, take: 30 }
          }
        }
      }
    });
    if (!staffProfile) return res.status(404).json({ error: 'ملف الموظف غير موجود' });

    const attendance = staffProfile.user.attendance || [];
    const leaveDaysUsed = attendance.filter((item) => item.status === 'LEAVE').length;
    const absentDays = attendance.filter((item) => item.status === 'ABSENT').length;
    const deductions = absentDays * ((staffProfile.salary || 0) / 30);

    res.json({
      ...staffProfile,
      leave: {
        balance: 21,
        used: leaveDaysUsed,
        remaining: Math.max(0, 21 - leaveDaysUsed)
      },
      payroll: {
        salary: staffProfile.salary || 0,
        allowances: staffProfile.allowances || 0,
        deductions,
        netSalary: (staffProfile.salary || 0) + (staffProfile.allowances || 0) - deductions,
        isPaid: false,
        lastPaymentDate: null
      },
      attendance
    });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب بيانات الموظف' });
  }
});

router.post('/me/attendance', async (req, res) => {
  const { action, notes } = req.body;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const attendance = await prisma.attendance.upsert({
      where: { userId_date: { userId: req.user.id, date: today } },
      update: {
        ...(action === 'checkout' ? { checkOut: new Date() } : { checkIn: new Date() }),
        notes
      },
      create: {
        userId: req.user.id,
        date: today,
        checkIn: action === 'checkout' ? null : new Date(),
        checkOut: action === 'checkout' ? new Date() : null,
        status: 'PRESENT',
        notes
      }
    });
    res.json({ message: 'تم تسجيل الحضور والانصراف', attendance });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في تسجيل الحضور والانصراف' });
  }
});

// GET /me/leaves - جلب طلبات إجازة الموظف
router.get('/me/leaves', async (req, res) => {
  try {
    const staffProfile = await prisma.staff.findUnique({ where: { userId: req.user.id } });
    if (!staffProfile) return res.status(404).json({ error: 'ملف الموظف غير موجود' });

    const leaves = await prisma.leaveRequest.findMany({
      where: { employeeId: staffProfile.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب الإجازات' });
  }
});

// POST /me/leaves - تقديم طلب إجازة جديد
router.post('/me/leaves', async (req, res) => {
  const { leaveType, startDate, endDate, reason } = req.body;
  try {
    const staffProfile = await prisma.staff.findUnique({ where: { userId: req.user.id } });
    if (!staffProfile) return res.status(404).json({ error: 'ملف الموظف غير موجود' });

    const newLeave = await prisma.leaveRequest.create({
      data: {
        employeeId: staffProfile.id,
        leaveType: leaveType || 'ANNUAL',
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        status: 'PENDING'
      }
    });
    res.status(201).json({ message: 'تم تقديم طلب الإجازة بنجاح', leave: newLeave });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في تقديم طلب الإجازة' });
  }
});

// GET /leaves - جلب جميع الإجازات (للمدير والادمن)
router.get('/leaves', requireRole('ADMIN', 'MANAGER', 'OPERATIONS_MANAGER'), async (req, res) => {
  try {
    const { status } = req.query;
    const where = status ? { status } : {};
    const leaves = await prisma.leaveRequest.findMany({
      where,
      include: {
        employee: { include: { user: { select: { name: true, email: true, phone: true } } } },
        reviewer: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب طلبات الإجازات' });
  }
});

// PATCH /leaves/:id/status - قبول/رفض الإجازة
router.patch('/leaves/:id/status', requireRole('ADMIN', 'MANAGER', 'OPERATIONS_MANAGER'), async (req, res) => {
  const { status, rejectionReason } = req.body;
  if (!['APPROVED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ error: 'حالة غير صحيحة' });
  }
  try {
    // جلب الطلب أولاً للتحقق
    const existing = await prisma.leaveRequest.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!existing) return res.status(404).json({ error: 'طلب الإجازة غير موجود' });

    const updateData = {
      status,
      reviewedBy: req.user.id,
      reviewedAt: new Date(),
    };

    // إذا كان الرفض، نضيف السبب في حقل reason
    if (status === 'REJECTED' && rejectionReason) {
      updateData.reason = `${existing.reason || ''} [سبب الرفض: ${rejectionReason}]`.trim();
    }

    const leave = await prisma.leaveRequest.update({
      where: { id: parseInt(req.params.id) },
      data: updateData
    });
    res.json({ message: `تم ${status === 'APPROVED' ? 'قبول' : 'رفض'} الإجازة بنجاح`, leave });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ في تحديث حالة الإجازة' });
  }
});

// GET /by-category/:category - موظفين حسب الفئة
router.get('/by-category/:category', async (req, res) => {
  try {
    const staff = await prisma.staff.findMany({
      where: { category: req.params.category.toUpperCase() },
      include: { user: { select: { name: true, phone: true } } }
    });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب الموظفين' });
  }
});

// GET /:id - موظف واحد
router.get('/:id', requireRole('ADMIN', 'OPERATIONS_MANAGER'), async (req, res) => {
  try {
    const staff = await prisma.staff.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { user: true }
    });
    if (!staff) return res.status(404).json({ error: 'الموظف غير موجود' });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب الموظف' });
  }
});

// POST / - إضافة موظف (Admin)
router.post('/', requireRole('ADMIN'), async (req, res) => {
  const { name, email, phone, role, category, jobTitle, shift, salary, nationalId, address, department, allowances, password } = req.body;
  try {
    const defaultPassword = await bcrypt.hash(password || nationalId || '123456', 10);
    const newStaff = await prisma.user.create({
      data: {
        name, email, phone, role: role || 'STAFF', password: defaultPassword,
        staffProfile: {
          create: {
            category: category || 'ADMIN_STAFF', jobTitle, shift, salary: salary ? parseFloat(salary) : 0, nationalId, address, department, allowances: allowances ? parseFloat(allowances) : 0
          }
        }
      },
      include: { staffProfile: true }
    });
    res.status(201).json({ message: 'تم إضافة الموظف بنجاح', staff: newStaff.staffProfile });
  } catch (error) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'البريد الإلكتروني أو الرقم القومي مسجل مسبقاً' });
    res.status(500).json({ error: 'خطأ في إضافة الموظف' });
  }
});

// PATCH /:id - تعديل بيانات الموظف الأساسية (Operations Manager / Admin)
router.patch('/:id', requireRole('ADMIN', 'OPERATIONS_MANAGER'), async (req, res) => {
  const { category, jobTitle, shift, department, address, notes } = req.body;
  try {
    const updated = await prisma.staff.update({
      where: { id: parseInt(req.params.id) },
      data: { category, jobTitle, shift, department, address, notes }
    });
    res.json({ message: 'تم تحديث البيانات بنجاح', staff: updated });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في تحديث الموظف' });
  }
});

// PATCH /:id/salary - تعديل الراتب والبدلات (Financial Manager / Admin)
router.patch('/:id/salary', requireRole('ADMIN', 'FINANCIAL_MANAGER'), async (req, res) => {
  const { salary, allowances } = req.body;
  try {
    const updated = await prisma.staff.update({
      where: { id: parseInt(req.params.id) },
      data: { 
        ...(salary !== undefined && { salary: parseFloat(salary) || 0 }),
        ...(allowances !== undefined && { allowances: parseFloat(allowances) || 0 })
      }
    });
    res.json({ message: 'تم تحديث الراتب بنجاح', staff: updated });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في تحديث الراتب' });
  }
});

export default router;
