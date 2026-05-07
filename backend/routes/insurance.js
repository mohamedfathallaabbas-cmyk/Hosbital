import express from 'express';
import { prisma } from '../index.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// GET /companies - شركات التأمين
router.get('/companies', async (req, res) => {
  try {
    const companies = await prisma.insuranceCompany.findMany({
      include: {
        _count: { select: { policies: true, claims: true } }
      }
    });
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب شركات التأمين' });
  }
});

// POST /companies - إضافة شركة
router.post('/companies', async (req, res) => {
  const { name, email, phone } = req.body;
  try {
    const company = await prisma.insuranceCompany.create({
      data: { name, email, phone }
    });
    res.status(201).json({ message: 'تم إضافة الشركة', company });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في إضافة الشركة' });
  }
});

// PATCH /companies/:id - تعديل شركة
router.patch('/companies/:id', async (req, res) => {
  const { name, email, phone } = req.body;
  try {
    const company = await prisma.insuranceCompany.update({
      where: { id: parseInt(req.params.id) },
      data: { name, email, phone }
    });
    res.json({ message: 'تم التعديل بنجاح', company });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في تعديل الشركة' });
  }
});

// GET /policies - وثائق التأمين
router.get('/policies', async (req, res) => {
  try {
    const policies = await prisma.insurancePolicy.findMany({
      include: { patient: { include: { user: true } }, company: true }
    });
    res.json(policies);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب الوثائق' });
  }
});

// POST /policies - ربط مريض بوثيقة
router.post('/policies', async (req, res) => {
  const { patientId, companyId, policyNumber, coveragePct, expiryDate } = req.body;
  try {
    const policy = await prisma.insurancePolicy.create({
      data: {
        patientId: parseInt(patientId),
        companyId: parseInt(companyId),
        policyNumber,
        coveragePct: parseFloat(coveragePct),
        expiryDate: new Date(expiryDate)
      },
      include: { company: true }
    });
    res.status(201).json({ message: 'تم ربط المريض بالتأمين', policy });
  } catch (error) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'رقم الوثيقة مسجل مسبقاً' });
    res.status(500).json({ error: 'خطأ في إضافة الوثيقة' });
  }
});

// GET /claims - جميع طلبات التعويض
router.get('/claims', async (req, res) => {
  const { status } = req.query;
  try {
    const claims = await prisma.claim.findMany({
      where: status ? { status } : {},
      include: { invoice: { include: { patient: { include: { user: true } } } }, company: true },
      orderBy: { submittedAt: 'desc' }
    });
    res.json(claims);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب المطالبات' });
  }
});

// GET /claims/pending - المطالبات المعلقة
router.get('/claims/pending', async (req, res) => {
  try {
    const claims = await prisma.claim.findMany({
      where: { status: 'SUBMITTED' },
      include: { invoice: { include: { patient: { include: { user: true } } } }, company: true },
      orderBy: { submittedAt: 'asc' }
    });
    res.json(claims);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب المطالبات المعلقة' });
  }
});

// POST /claims - تقديم مطالبة على فاتورة
router.post('/claims', async (req, res) => {
  const { invoiceId, companyId, claimedAmount } = req.body;
  try {
    const claim = await prisma.claim.create({
      data: {
        invoiceId: parseInt(invoiceId),
        companyId: parseInt(companyId),
        claimedAmount: parseFloat(claimedAmount)
      }
    });
    res.status(201).json({ message: 'تم إرسال المطالبة لشركة التأمين', claim });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في إرسال المطالبة' });
  }
});

// PATCH /claims/:id - تحديث حالة المطالبة
router.patch('/claims/:id', async (req, res) => {
  const { status, remarks } = req.body;
  try {
    const claim = await prisma.claim.update({
      where: { id: parseInt(req.params.id) },
      data: { status, remarks }
    });

    // إذا تم القبول يمكن تحديث حالة الفاتورة أو خصم المبلغ هنا
    if (status === 'APPROVED') {
      const remainingAmount = claim.claimedAmount; // تبسيط
      // ... منطق مالي إضافي إذا لزم
    }

    res.json({ message: 'تم تحديث حالة المطالبة', claim });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في تحديث المطالبة' });
  }
});

export default router;
