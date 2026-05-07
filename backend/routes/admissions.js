import express from 'express';
import { prisma } from '../index.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// GET /wards - جلب الأجنحة والغرف والأسرة
router.get('/wards', async (req, res) => {
  try {
    const wards = await prisma.ward.findMany({
      include: {
        rooms: {
          include: {
            beds: true
          }
        }
      }
    });
    res.json(wards);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب الأجنحة' });
  }
});

// GET /wards/:id/beds/available - جلب الأسرة الفارغة في جناح
router.get('/wards/:id/beds/available', async (req, res) => {
  try {
    const beds = await prisma.bed.findMany({
      where: {
        room: { wardId: parseInt(req.params.id) },
        isOccupied: false
      },
      include: { room: true }
    });
    res.json(beds);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب الأسرة' });
  }
});

// GET /active - المرضى المنومين حالياً
router.get('/active', async (req, res) => {
  try {
    const admissions = await prisma.admission.findMany({
      where: { status: 'ADMITTED' },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
        bed: { include: { room: { include: { ward: true } } } },
        nurseNotes: { orderBy: { createdAt: 'desc' }, take: 1 }
      },
      orderBy: { admittedAt: 'desc' }
    });
    res.json(admissions);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب المنومين' });
  }
});

// POST / - تنويم مريض
router.post('/', async (req, res) => {
  const { patientId, doctorId, bedId, reason } = req.body;
  
  try {
    const admission = await prisma.$transaction(async (tx) => {
      // 1. تحديث حالة السرير
      const bed = await tx.bed.update({
        where: { id: parseInt(bedId) },
        data: { isOccupied: true }
      });

      // 2. إنشاء سجل التنويم
      const newAdmission = await tx.admission.create({
        data: {
          patientId: parseInt(patientId),
          doctorId: parseInt(doctorId),
          bedId: parseInt(bedId),
          reason
        },
        include: {
          patient: { include: { user: true } },
          bed: { include: { room: true } }
        }
      });
      return newAdmission;
    });

    res.status(201).json({ message: 'تم تنويم المريض بنجاح', admission });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ في إجراء التنويم' });
  }
});

// PATCH /:id/discharge - صرف مريض منوّم وتحرير السرير
router.patch('/:id/discharge', async (req, res) => {
  try {
    const admission = await prisma.$transaction(async (tx) => {
      const adm = await tx.admission.findUnique({ where: { id: parseInt(req.params.id) } });
      if (!adm) throw new Error('سجل التنويم غير موجود');

      // 1. تحديث حالة التنويم
      const updatedAdm = await tx.admission.update({
        where: { id: adm.id },
        data: { status: 'DISCHARGED', dischargedAt: new Date() }
      });

      // 2. تحرير السرير
      await tx.bed.update({
        where: { id: adm.bedId },
        data: { isOccupied: false }
      });

      return updatedAdm;
    });

    res.json({ message: 'تم صرف المريض وإخلاء السرير', admission });
  } catch (error) {
    res.status(500).json({ error: error.message || 'خطأ في صرف المريض' });
  }
});

// POST /:id/followup - إنشاء موعد متابعة لمريض منوّم
router.post('/:id/followup', async (req, res) => {
  const { date, timeSlot, doctorId } = req.body;
  const admissionId = parseInt(req.params.id);

  try {
    const admission = await prisma.admission.findUnique({ where: { id: admissionId } });
    if (!admission) return res.status(404).json({ error: 'التنويم غير موجود' });

    const newAppt = await prisma.appointment.create({
      data: {
        patientId: admission.patientId,
        doctorId: parseInt(doctorId) || admission.doctorId,
        admissionId,
        date: new Date(date),
        timeSlot,
        type: 'FOLLOWUP_INPATIENT',
        status: 'SCHEDULED'
      }
    });
    res.status(201).json({ message: 'تم إنشاء موعد المتابعة', appointment: newAppt });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في إنشاء موعد المتابعة' });
  }
});

// GET /:id/followups - مواعيد المتابعة لتنويم معين
router.get('/:id/followups', async (req, res) => {
  try {
    const followups = await prisma.appointment.findMany({
      where: { admissionId: parseInt(req.params.id), type: 'FOLLOWUP_INPATIENT' },
      include: { doctor: { include: { user: true } } },
      orderBy: { date: 'asc' }
    });
    res.json(followups);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب مواعيد المتابعة' });
  }
});

export default router;
