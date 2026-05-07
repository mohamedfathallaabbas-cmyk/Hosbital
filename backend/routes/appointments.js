import express from 'express';
import { prisma } from '../index.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// GET: عرض المواعيد
router.get('/', authenticate, async (req, res) => {
  const { status, patientId: queryPatientId } = req.query;
  const { id: userId, role } = req.user; 

  try {
    let whereClause = {};

    if (role === 'DOCTOR') {
      const doctorProfile = await prisma.doctor.findUnique({ where: { userId } });
      if (!doctorProfile) return res.status(404).json({ error: 'الملف الطبي غير موجود' });
      whereClause.doctorId = doctorProfile.id;
    } else if (role === 'PATIENT') {
      const patientProfile = await prisma.patient.findUnique({ where: { userId } });
      if (!patientProfile) return res.status(404).json({ error: 'ملف المريض غير موجود' });
      whereClause.patientId = patientProfile.id;
    } else if (queryPatientId) {
      whereClause.patientId = parseInt(queryPatientId);
    }

    if (status) whereClause.status = status;

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        patient: { include: { user: { select: { name: true, phone: true } } } },
        doctor: { include: { user: { select: { name: true } }, department: true } },
        triage: true
      },
      orderBy: { date: 'asc' }
    });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب المواعيد' });
  }
});

// GET: مواعيد اليوم
router.get('/today', authenticate, async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const appointments = await prisma.appointment.findMany({
      where: {
        date: { gte: todayStart, lte: todayEnd }
      },
      include: {
        patient: { include: { user: { select: { name: true, phone: true } } } },
        doctor: { include: { user: { select: { name: true } }, department: true } },
        triage: true
      },
      orderBy: { timeSlot: 'asc' }
    });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب مواعيد اليوم' });
  }
});

// GET: مواعيد المتابعة لمريض منوم
router.get('/admission/:admissionId/followups', authenticate, async (req, res) => {
  const { admissionId } = req.params;
  try {
    const followups = await prisma.appointment.findMany({
      where: { admissionId: parseInt(admissionId), type: 'FOLLOWUP_INPATIENT' },
      include: { doctor: { include: { user: true } } }
    });
    res.json(followups);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب مواعيد المتابعة' });
  }
});

// GET: موعد واحد بتفاصيله
router.get('/:id', authenticate, async (req, res) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true, department: true } },
        triage: true,
        medicalRecord: true
      }
    });
    if (!appointment) return res.status(404).json({ error: 'الموعد غير موجود' });
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب الموعد' });
  }
});

// POST: حجز موعد جديد
router.post('/', authenticate, async (req, res) => {
  const { patientId, doctorId, date, timeSlot, type, departmentId, admissionId } = req.body;
  const { role, id: userId } = req.user;

  try {
    let finalPatientId = patientId ? parseInt(patientId) : null;
    let finalDoctorId = doctorId ? parseInt(doctorId) : null;

    if (role === 'PATIENT' && !finalPatientId) {
      const patientProfile = await prisma.patient.findUnique({ where: { userId } });
      if (!patientProfile) return res.status(400).json({ error: 'لم يتم العثور على ملف المريض' });
      finalPatientId = patientProfile.id;
    }

    if (!finalDoctorId && departmentId) {
      const doctor = await prisma.doctor.findFirst({
        where: { departmentId: parseInt(departmentId) }
      });
      if (doctor) finalDoctorId = doctor.id;
    }

    if (!finalDoctorId) {
      const anyDoctor = await prisma.doctor.findFirst();
      if (!anyDoctor) return res.status(400).json({ error: 'لا يوجد أطباء متاحين' });
      finalDoctorId = anyDoctor.id;
    }

    const initialStatus = role === 'PATIENT' ? 'SCHEDULED' : 'WAITING';

    const newAppointment = await prisma.appointment.create({
      data: {
        patientId: finalPatientId,
        doctorId: finalDoctorId,
        date: new Date(date),
        timeSlot,
        type: type || 'CHECKUP',
        status: initialStatus,
        admissionId: admissionId ? parseInt(admissionId) : null
      },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true, department: true } }
      }
    });

    res.status(201).json({ message: 'تم حجز الموعد بنجاح', appointment: newAppointment });
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ أثناء الحجز' });
  }
});

// PATCH: تحديث حالة الموعد
router.patch('/:id/status', authenticate, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const updated = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: { status }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'فشل تحديث حالة الموعد' });
  }
});

// PATCH: رفض الموعد
router.patch('/:id/reject', authenticate, async (req, res) => {
  const { id } = req.params;
  const { rejectionReason } = req.body;
  if (!rejectionReason) return res.status(400).json({ error: 'سبب الرفض إجباري' });

  try {
    const updated = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: { status: 'REJECTED', rejectionReason }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'فشل رفض الموعد' });
  }
});

// POST: قياسات Triage
router.post('/:id/triage', authenticate, async (req, res) => {
  const { id } = req.params;
  const { bloodPressure, heartRate, temperature, oxygenLevel, priorityLevel, notes } = req.body;

  try {
    const triage = await prisma.triage.upsert({
      where: { appointmentId: parseInt(id) },
      update: { bloodPressure, heartRate: parseInt(heartRate), temperature: parseFloat(temperature), oxygenLevel: parseInt(oxygenLevel), priorityLevel, notes },
      create: {
        appointmentId: parseInt(id),
        bloodPressure,
        heartRate: parseInt(heartRate),
        temperature: parseFloat(temperature),
        oxygenLevel: parseInt(oxygenLevel),
        priorityLevel,
        notes
      }
    });
    res.status(201).json({ message: 'تم تسجيل القياسات بنجاح', triage });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في تسجيل القياسات' });
  }
});

// DELETE: إلغاء موعد
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await prisma.appointment.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: 'تم إلغاء الموعد' });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في إلغاء الموعد' });
  }
});

export default router;
