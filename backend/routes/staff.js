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
      include: { user: { select: { name: true, email: true, phone: true, role: true } } }
    });
    if (!staffProfile) return res.status(404).json({ error: 'ملف الموظف غير موجود' });
    res.json(staffProfile);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب بيانات الموظف' });
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
  const { name, email, phone, role, category, jobTitle, shift, salary, nationalId, address, department, allowances } = req.body;
  try {
    const defaultPassword = await bcrypt.hash(nationalId || '123456', 10);
    const newStaff = await prisma.user.create({
      data: {
        name, email, phone, role, password: defaultPassword,
        staffProfile: {
          create: {
            category, jobTitle, shift, salary: parseFloat(salary), nationalId, address, department, allowances: allowances ? parseFloat(allowances) : 0
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
        ...(salary !== undefined && { salary: parseFloat(salary) }),
        ...(allowances !== undefined && { allowances: parseFloat(allowances) })
      }
    });
    res.json({ message: 'تم تحديث الراتب بنجاح', staff: updated });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في تحديث الراتب' });
  }
});

export default router;
