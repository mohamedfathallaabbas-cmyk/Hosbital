import express from 'express';
import { prisma } from '../index.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// جميع المسارات محمية
router.use(authenticate);

const toInt = (value) => (value === undefined || value === null || value === '' ? null : parseInt(value));

async function createPrescriptionItems(tx, prescriptionId, items = []) {
  for (const item of items) {
    const requestedName = item.name || item.medicineName || '';
    const medicineId = toInt(item.medicineId);
    const medicine = medicineId
      ? await tx.medicine.findUnique({ where: { id: medicineId } })
      : requestedName
        ? await tx.medicine.findFirst({ where: { name: requestedName } })
        : null;

    await tx.prescriptionItem.create({
      data: {
        prescriptionId,
        medicineId: medicine?.id || null,
        medicineName: medicine ? null : requestedName,
        dosage: item.dosage || item.dose || '-',
        frequency: item.frequency || item.freq || '-',
        duration: item.duration || '-',
        quantity: toInt(item.quantity) || 1
      }
    });
  }
}

router.post('/prescriptions', requireRole('DOCTOR', 'ADMIN'), async (req, res) => {
  const { patientId, appointmentId, complaint, diagnosis, treatmentPlan, notes, prescriptions = [] } = req.body;

  if (!patientId && !appointmentId) {
    return res.status(400).json({ error: 'اختيار المريض أو الموعد إجباري' });
  }
  if (!prescriptions.length) {
    return res.status(400).json({ error: 'يجب إدخال دواء واحد على الأقل' });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      let finalAppointmentId = toInt(appointmentId);

      if (!finalAppointmentId) {
        const doctor = await tx.doctor.findUnique({ where: { userId: req.user.id } });
        if (!doctor) throw new Error('ملف الطبيب غير موجود');

        const appointment = await tx.appointment.create({
          data: {
            patientId: toInt(patientId),
            doctorId: doctor.id,
            date: new Date(),
            timeSlot: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
            type: 'PRESCRIPTION',
            status: 'COMPLETED'
          }
        });
        finalAppointmentId = appointment.id;
      }

      const record = await tx.medicalRecord.upsert({
        where: { appointmentId: finalAppointmentId },
        update: {
          complaint: complaint || undefined,
          diagnosis: diagnosis || undefined,
          treatmentPlan: treatmentPlan || undefined,
          notes: notes || undefined
        },
        create: {
          appointmentId: finalAppointmentId,
          complaint: complaint || null,
          diagnosis: diagnosis || null,
          treatmentPlan: treatmentPlan || null,
          notes: notes || null
        }
      });

      await tx.appointment.update({
        where: { id: finalAppointmentId },
        data: { status: 'COMPLETED' }
      });

      const prescription = await tx.prescription.create({
        data: { medicalRecordId: record.id, status: 'PENDING' }
      });

      await createPrescriptionItems(tx, prescription.id, prescriptions);
      return { record, prescription };
    });

    res.status(201).json({ message: 'تم حفظ الروشتة وإرسالها للصيدلية', ...result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'حدث خطأ أثناء حفظ الروشتة' });
  }
});

router.get('/radiology', requireRole('ADMIN', 'DOCTOR', 'LAB_TECH', 'PATIENT'), async (req, res) => {
  const { patientId } = req.query;
  try {
    const finalPatientId = req.user.role === 'PATIENT' ? req.user.patientId : patientId;
    const records = await prisma.radiologyRecord.findMany({
      where: finalPatientId ? { patientId: parseInt(finalPatientId) } : {},
      include: {
        patient: { include: { user: { select: { name: true, phone: true } } } },
        doctor: { include: { user: { select: { name: true } } } }
      },
      orderBy: { uploadedAt: 'desc' }
    });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب ملفات الأشعة' });
  }
});

router.post('/radiology', requireRole('ADMIN', 'DOCTOR', 'LAB_TECH', 'PATIENT'), async (req, res) => {
  const { patientId, doctorId, type, description, fileUrl } = req.body;
  const finalPatientId = req.user.role === 'PATIENT' ? req.user.patientId : patientId;
  if (!finalPatientId || !type || !fileUrl) {
    return res.status(400).json({ error: 'المريض ونوع الأشعة ورابط الملف بيانات إجبارية' });
  }

  try {
    let finalDoctorId = toInt(doctorId);
    if (!finalDoctorId) {
      const doctor = await prisma.doctor.findUnique({ where: { userId: req.user.id } });
      finalDoctorId = doctor?.id || (await prisma.doctor.findFirst())?.id;
    }
    if (!finalDoctorId) return res.status(400).json({ error: 'يجب تحديد الطبيب المسؤول' });

    const record = await prisma.radiologyRecord.create({
      data: {
        patientId: parseInt(finalPatientId),
        doctorId: finalDoctorId,
        type,
        description: description || null,
        fileUrl
      }
    });
    res.status(201).json({ message: 'تم حفظ ملف الأشعة', record });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في حفظ ملف الأشعة' });
  }
});

router.get('/blood-donations', requireRole('ADMIN', 'OPERATIONS_MANAGER', 'LAB_TECH', 'PATIENT'), async (req, res) => {
  try {
    const where = req.user.role === 'PATIENT'
      ? { nationalId: req.query.nationalId || '__none__' }
      : {};
    const donations = await prisma.bloodDonation.findMany({ where, orderBy: { donationDate: 'desc' } });
    res.json(donations);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب تبرعات الدم' });
  }
});

router.post('/blood-donations', requireRole('ADMIN', 'OPERATIONS_MANAGER', 'LAB_TECH', 'PATIENT'), async (req, res) => {
  const { donorName, nationalId, bloodType, quantity, status, notes } = req.body;
  if (!donorName || !nationalId || !bloodType || !quantity) {
    return res.status(400).json({ error: 'اسم المتبرع والرقم القومي والفصيلة والكمية بيانات إجبارية' });
  }

  try {
    const donation = await prisma.bloodDonation.create({
      data: {
        donorName,
        nationalId,
        bloodType,
        quantity: parseFloat(quantity),
        status: status || 'TESTING',
        notes: notes || null
      }
    });
    res.status(201).json({ message: 'تم تسجيل تبرع الدم', donation });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في تسجيل تبرع الدم' });
  }
});

// GET: عرض التاريخ الطبي لمريض معين
router.get('/patient/:patientId', async (req, res) => {
  const { patientId } = req.params;
  
  try {
    const records = await prisma.medicalRecord.findMany({
      where: { appointment: { patientId: parseInt(patientId) } },
      include: {
        appointment: { include: { doctor: { include: { user: true, department: true } } } },
        prescriptions: { include: { items: { include: { medicine: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب التاريخ الطبي' });
  }
});

// GET: جلب سجل طبي واحد
router.get('/:id', async (req, res) => {
  try {
    const record = await prisma.medicalRecord.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        appointment: { include: { doctor: { include: { user: true } }, patient: { include: { user: true } } } },
        prescriptions: { include: { items: { include: { medicine: true } } } }
      }
    });
    if (!record) return res.status(404).json({ error: 'السجل غير موجود' });
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب السجل الطبي' });
  }
});

// PATCH: تعديل السجل الطبي
router.patch('/:id', async (req, res) => {
  const { complaint, diagnosis, treatmentPlan, notes } = req.body;
  try {
    const updated = await prisma.medicalRecord.update({
      where: { id: parseInt(req.params.id) },
      data: { complaint, diagnosis, treatmentPlan, notes }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في تعديل السجل الطبي' });
  }
});

// POST: إضافة كشف طبي جديد وروشتة
router.post('/', async (req, res) => {
  const { appointmentId, complaint, diagnosis, treatmentPlan, notes, prescriptions } = req.body;
  
  try {
    // 1. إنشاء السجل الطبي (الكشف)
    const newRecord = await prisma.medicalRecord.create({
      data: {
        appointmentId: parseInt(appointmentId),
        complaint: complaint || null,
        diagnosis: diagnosis || null,
        treatmentPlan: treatmentPlan || null,
        notes: notes || null
      }
    });

    // 2. تحديث حالة الموعد إلى COMPLETED (مكتمل)
    await prisma.appointment.update({
      where: { id: parseInt(appointmentId) },
      data: { status: 'COMPLETED' }
    });

    // 3. إنشاء الروشتة إذا قام الطبيب بكتابة أدوية
    if (prescriptions && prescriptions.length > 0) {
      const newPrescription = await prisma.prescription.create({
        data: {
          medicalRecordId: newRecord.id,
          status: 'PENDING' // في انتظار صرفها من الصيدلية
        }
      });

      // إضافة تفاصيل الأدوية للروشتة
      for (const item of prescriptions) {
        // التأكد من وجود الدواء في قاعدة البيانات، وإلا يتم إنشاؤه لتبسيط التجربة
        let medicine = await prisma.medicine.findFirst({ where: { name: item.name } });
        if (!medicine) {
          medicine = await prisma.medicine.create({
            data: { name: item.name, category: 'عام', price: 0 }
          });
        }

        await prisma.prescriptionItem.create({
          data: {
            prescriptionId: newPrescription.id,
            medicineId: medicine.id,
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration,
            quantity: 1
          }
        });
      }
    }

    res.status(201).json({ message: 'تم حفظ الكشف الطبي وإصدار الروشتة بنجاح', record: newRecord });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ أثناء حفظ السجل الطبي' });
  }
});

export default router;
