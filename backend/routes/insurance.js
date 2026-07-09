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
        classes: true,
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
      include: { patient: { include: { user: true } }, company: true, class: true }
    });
    res.json(policies);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب الوثائق' });
  }
});

// POST /policies - ربط مريض بوثيقة
router.post('/policies', async (req, res) => {
  const { patientId, companyId, policyNumber, coveragePct, classId, expiryDate } = req.body;
  try {
    let resolvedCoverage = parseFloat(coveragePct || 80);
    if (classId) {
      const cls = await prisma.insuranceClass.findUnique({ where: { id: parseInt(classId) } });
      if (cls) resolvedCoverage = cls.defaultCoverage;
    }
    
    const policy = await prisma.insurancePolicy.create({
      data: {
        patientId: parseInt(patientId),
        companyId: parseInt(companyId),
        policyNumber,
        coveragePct: resolvedCoverage,
        classId: classId ? parseInt(classId) : null,
        expiryDate: new Date(expiryDate)
      },
      include: { company: true, class: true }
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

// GET /classes - فئات التأمين لشركة معينة أو الكل
router.get('/classes', async (req, res) => {
  const { companyId } = req.query;
  try {
    const classes = await prisma.insuranceClass.findMany({
      where: companyId ? { companyId: parseInt(companyId) } : {},
      include: { company: true }
    });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب فئات التأمين' });
  }
});

// POST /classes - إضافة فئة تأمين جديدة لشركة
router.post('/classes', async (req, res) => {
  const {
    companyId,
    name,
    defaultCoverage,
    consultationCov,
    labCoverage,
    radCoverage,
    pharmacyCoverage,
    maxAnnualLimit
  } = req.body;
  
  try {
    const newClass = await prisma.insuranceClass.create({
      data: {
        companyId: parseInt(companyId),
        name,
        defaultCoverage: parseFloat(defaultCoverage || 80),
        consultationCov: parseFloat(consultationCov || defaultCoverage || 80),
        labCoverage: parseFloat(labCoverage || defaultCoverage || 80),
        radCoverage: parseFloat(radCoverage || defaultCoverage || 80),
        pharmacyCoverage: parseFloat(pharmacyCoverage || defaultCoverage || 80),
        maxAnnualLimit: parseFloat(maxAnnualLimit || 10000)
      }
    });
    res.status(201).json({ message: 'تم إضافة فئة التأمين بنجاح', class: newClass });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في إضافة فئة التأمين' });
  }
});

// PATCH /classes/:id - تعديل فئة تأمين
router.patch('/classes/:id', async (req, res) => {
  const {
    name,
    defaultCoverage,
    consultationCov,
    labCoverage,
    radCoverage,
    pharmacyCoverage,
    maxAnnualLimit
  } = req.body;
  
  try {
    const updatedClass = await prisma.insuranceClass.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(name !== undefined && { name }),
        ...(defaultCoverage !== undefined && { defaultCoverage: parseFloat(defaultCoverage) }),
        ...(consultationCov !== undefined && { consultationCov: parseFloat(consultationCov) }),
        ...(labCoverage !== undefined && { labCoverage: parseFloat(labCoverage) }),
        ...(radCoverage !== undefined && { radCoverage: parseFloat(radCoverage) }),
        ...(pharmacyCoverage !== undefined && { pharmacyCoverage: parseFloat(pharmacyCoverage) }),
        ...(maxAnnualLimit !== undefined && { maxAnnualLimit: parseFloat(maxAnnualLimit) })
      }
    });
    res.json({ message: 'تم تعديل فئة التأمين بنجاح', class: updatedClass });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في تعديل فئة التأمين' });
  }
});

// DELETE /classes/:id - حذف فئة تأمين
router.delete('/classes/:id', async (req, res) => {
  try {
    await prisma.insuranceClass.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: 'تم حذف فئة التأمين بنجاح' });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في حذف فئة التأمين' });
  }
});

export default router;
