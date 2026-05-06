import express from 'express';
import { prisma } from '../index.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// GET: عرض المواعيد — كل دور يرى ما يخصه تلقائياً
router.get('/', authenticate, async (req, res) => {
  const { status, patientId: queryPatientId } = req.query;
  const { id: userId, role } = req.user; // من الـ JWT token

  try {
    let whereClause = {};

    if (role === 'DOCTOR') {
      // الطبيب يرى مواعيده هو فقط
      const doctorProfile = await prisma.doctor.findUnique({ where: { userId } });
      if (!doctorProfile) return res.status(404).json({ error: 'الملف الطبي غير موجود' });
      whereClause.doctorId = doctorProfile.id;
    } else if (role === 'PATIENT') {
      // المريض يرى مواعيده هو فقط
      const patientProfile = await prisma.patient.findUnique({ where: { userId } });
      if (!patientProfile) return res.status(404).json({ error: 'ملف المريض غير موجود' });
      whereClause.patientId = patientProfile.id;
    } else if (queryPatientId) {
      // استقبال/ادمن ممكن يفلتر بـ patientId
      whereClause.patientId = parseInt(queryPatientId);
    }
    // RECEPTION, ADMIN, MANAGER — يشوفوا الكل (بدون فلتر)

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
    console.error(error);
    res.status(500).json({ error: 'خطأ في جلب المواعيد' });
  }
});

// POST: حجز موعد جديد (المريض أو الاستقبال)
router.post('/', authenticate, async (req, res) => {
  const { patientId, doctorId, date, timeSlot, type, departmentId } = req.body;
  const { role, id: userId } = req.user;

  try {
    let finalPatientId = patientId ? parseInt(patientId) : null;
    let finalDoctorId = doctorId ? parseInt(doctorId) : null;

    // إذا كان المريض هو من يحجز، نجلب patientId من ملفه تلقائياً
    if (role === 'PATIENT' && !finalPatientId) {
      const patientProfile = await prisma.patient.findUnique({ where: { userId } });
      if (!patientProfile) return res.status(400).json({ error: 'لم يتم العثور على ملف المريض' });
      finalPatientId = patientProfile.id;
    }

    // إذا لم يُحدد طبيب، نختار أول طبيب في القسم المطلوب
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

    // المريض يحجز → حالة SCHEDULED (تنتظر موافقة الاستقبال)
    // الاستقبال يحجز → حالة WAITING مباشرة
    const initialStatus = role === 'PATIENT' ? 'SCHEDULED' : 'WAITING';

    const newAppointment = await prisma.appointment.create({
      data: {
        patientId: finalPatientId,
        doctorId: finalDoctorId,
        date: new Date(date),
        timeSlot,
        type: type || 'CHECKUP',
        status: initialStatus
      },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true, department: true } }
      }
    });

    res.status(201).json({ message: 'تم حجز الموعد بنجاح', appointment: newAppointment });
  } catch (error) {
    console.error(error);
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

export default router;
