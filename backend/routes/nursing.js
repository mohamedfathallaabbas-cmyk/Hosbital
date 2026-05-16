import express from 'express';
import { prisma } from '../index.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// GET /assignments - تعيينات الممرضين
router.get('/assignments', requireRole('ADMIN', 'OPERATIONS_MANAGER', 'NURSE'), async (req, res) => {
  try {
    const assignments = await prisma.nursingAssignment.findMany({
      where: { isActive: true },
      include: {
        nurse: { include: { user: true } },
        bed: { include: { room: { include: { ward: true } } } }
      }
    });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب التعيينات' });
  }
});

// POST /assignments - تعيين ممرضة لسرير
router.post('/assignments', requireRole('ADMIN', 'OPERATIONS_MANAGER'), async (req, res) => {
  const { nurseId, bedId, shift } = req.body;
  try {
    const assignment = await prisma.nursingAssignment.create({
      data: {
        nurseId: parseInt(nurseId),
        bedId: parseInt(bedId),
        shift
      }
    });
    res.status(201).json({ message: 'تم تعيين الممرضة بنجاح', assignment });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في إنشاء التعيين' });
  }
});

// GET /assignments/my - أسرة المريض التابعة للممرضة
router.get('/assignments/my', requireRole('NURSE'), async (req, res) => {
  try {
    const staffProfile = await prisma.staff.findUnique({ where: { userId: req.user.id } });
    if (!staffProfile) return res.status(404).json({ error: 'ملف الممرض غير موجود' });

    const assignments = await prisma.nursingAssignment.findMany({
      where: { nurseId: staffProfile.id, isActive: true },
      include: {
        bed: { 
          include: { 
            room: { include: { ward: true } },
            admissions: {
              where: { status: 'ADMITTED' },
              include: { patient: { include: { user: true } } }
            }
          } 
        }
      }
    });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب أسرة الممرضة' });
  }
});

// GET /dashboard-stats - إحصائيات لوحة تحكم التمريض
router.get('/dashboard-stats', requireRole('NURSE'), async (req, res) => {
  try {
    const staffProfile = await prisma.staff.findUnique({ where: { userId: req.user.id } });
    if (!staffProfile) return res.status(404).json({ error: 'ملف الممرض غير موجود' });

    // Get active assignments
    const assignments = await prisma.nursingAssignment.findMany({
      where: { nurseId: staffProfile.id, isActive: true },
      include: {
        bed: {
          include: {
            admissions: {
              where: { status: 'ADMITTED' },
              include: { 
                patient: { include: { user: true } },
                doctor: { include: { user: true } }
              }
            }
          }
        }
      }
    });

    const activeAdmissions = assignments.flatMap(a => a.bed?.admissions || []);
    const patientIds = activeAdmissions.map(a => a.patientId);

    // Mock critical cases count (for example: based on vital signs or triage)
    const criticalCases = 0; // Or calculate if we have recent triage

    // Tasks (e.g., pending prescriptions for these patients today)
    // We'll just return some mock tasks for now or count them if the model supports it.
    const remainingTasks = activeAdmissions.length * 2; // Simple mock for demonstration
    const medsGivenToday = activeAdmissions.length; // Simple mock

    res.json({
      currentPatients: activeAdmissions.length,
      criticalCases,
      remainingTasks,
      medsGivenToday,
      patients: activeAdmissions.map(adm => ({
        id: adm.id,
        patientId: adm.patientId,
        name: adm.patient?.user?.name,
        room: assignments.find(a => a.bedId === adm.bedId)?.bed?.bedNumber || 'غير محدد',
        status: adm.status === 'ADMITTED' ? 'مستقر' : 'حرج',
        doctorName: adm.doctor?.user?.name || 'غير محدد',
        lastVitals: 'ضغط 120/80 - حرارة 37', // Mock for now
        bloodType: adm.patient?.bloodType || '-'
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب إحصائيات التمريض' });
  }
});

// POST /notes - إضافة ملاحظة تمريضية
router.post('/notes', requireRole('NURSE'), async (req, res) => {
  const { admissionId, content, vitalSigns } = req.body;
  try {
    const staffProfile = await prisma.staff.findUnique({ where: { userId: req.user.id } });
    if (!staffProfile) return res.status(404).json({ error: 'ملف الممرض غير موجود' });

    const note = await prisma.nurseNote.create({
      data: {
        admissionId: parseInt(admissionId),
        nurseId: staffProfile.id,
        content,
        vitalSigns: vitalSigns || null
      }
    });
    res.status(201).json({ message: 'تم حفظ الملاحظة', note });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في حفظ الملاحظة' });
  }
});

// GET /notes/admission/:admissionId - ملاحظات تنويم معين
router.get('/notes/admission/:admissionId', async (req, res) => {
  try {
    const notes = await prisma.nurseNote.findMany({
      where: { admissionId: parseInt(req.params.admissionId) },
      include: { nurse: { include: { user: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب الملاحظات' });
  }
});

// PATCH /patients/:patientId/vitals - تحديث القياسات الحيوية
router.patch('/patients/:patientId/vitals', requireRole('NURSE'), async (req, res) => {
  const { weight, height, bloodType } = req.body;
  try {
    const updated = await prisma.patient.update({
      where: { id: parseInt(req.params.patientId) },
      data: {
        weight: weight ? parseFloat(weight) : undefined,
        height: height ? parseFloat(height) : undefined,
        bloodType
      }
    });
    res.json({ message: 'تم تحديث البيانات الحيوية بنجاح', patient: updated });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في تحديث القياسات' });
  }
});

export default router;
