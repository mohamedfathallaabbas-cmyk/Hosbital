/**
 * MEDICAL RECORDS ROUTE (Production-Grade)
 *
 * Fixes applied:
 *  - IDOR: GET /patient/:patientId requires ownership or authorized role
 *  - IDOR: GET /:id checks patient ownership before returning data
 *  - PATCH /:id restricted to DOCTOR/ADMIN
 *  - All errors propagated via next()
 *  - Pagination on history endpoints
 */

import express from 'express';
import { prisma } from '../index.js';
import {
  authenticate,
  requirePermission,
  enforcePatientOwnership,
} from '../middleware/auth.js';
import { PERMISSIONS } from '../config/permissions.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors.js';
import * as audit from '../services/auditService.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

const toInt = (v) => (v === undefined || v === null || v === '' ? null : parseInt(v));

// ── Helper: create prescription items inside a transaction ───────────────────
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
        medicineId:   medicine?.id || null,
        medicineName: medicine ? null : requestedName,
        dosage:       item.dosage || item.dose || '-',
        frequency:    item.frequency || item.freq || '-',
        duration:     item.duration || '-',
        quantity:     toInt(item.quantity) || 1,
      },
    });
  }
}

// ── POST /prescriptions ───────────────────────────────────────────────────────
router.post('/prescriptions', requirePermission(PERMISSIONS.CREATE_MEDICAL_RECORD), async (req, res, next) => {
  const { patientId, appointmentId, complaint, diagnosis, treatmentPlan, notes, prescriptions = [] } = req.body;

  if (!patientId && !appointmentId) return next(new ValidationError('اختيار المريض أو الموعد إجباري'));
  if (!prescriptions.length)        return next(new ValidationError('يجب إدخال دواء واحد على الأقل'));

  try {
    const result = await prisma.$transaction(async (tx) => {
      let finalAppointmentId = toInt(appointmentId);

      if (!finalAppointmentId) {
        const doctor = await tx.doctor.findUnique({ where: { userId: req.user.id } });
        if (!doctor) throw new NotFoundError('ملف الطبيب غير موجود');

        const appointment = await tx.appointment.create({
          data: {
            patientId: toInt(patientId),
            doctorId:  doctor.id,
            date:      new Date(),
            timeSlot:  new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
            type:      'PRESCRIPTION',
            status:    'COMPLETED',
          },
        });
        finalAppointmentId = appointment.id;
      }

      const record = await tx.medicalRecord.upsert({
        where:  { appointmentId: finalAppointmentId },
        update: {
          complaint:     complaint     || undefined,
          diagnosis:     diagnosis     || undefined,
          treatmentPlan: treatmentPlan || undefined,
          notes:         notes         || undefined,
        },
        create: {
          appointmentId: finalAppointmentId,
          complaint:     complaint     || null,
          diagnosis:     diagnosis     || null,
          treatmentPlan: treatmentPlan || null,
          notes:         notes         || null,
        },
      });

      await tx.appointment.update({
        where: { id: finalAppointmentId },
        data:  { status: 'COMPLETED' },
      });

      const prescription = await tx.prescription.create({
        data: { medicalRecordId: record.id, status: 'PENDING' },
      });

      await createPrescriptionItems(tx, prescription.id, prescriptions);
      return { record, prescription };
    });

    await audit.log({
      ...audit.fromRequest(req),
      action:     'CREATE_PRESCRIPTION',
      entityType: 'Prescription',
      entityId:   result.prescription.id,
      newData:    { patientId, appointmentId, medicineCount: prescriptions.length },
    });

    res.status(201).json({ message: 'تم حفظ الروشتة وإرسالها للصيدلية', ...result });
  } catch (err) { next(err); }
});

// ── GET /radiology ─────────────────────────────────────────────────────────────
router.get('/radiology', requirePermission(PERMISSIONS.VIEW_RADIOLOGY), async (req, res, next) => {
  const { patientId } = req.query;
  const finalPatientId = req.user.role === 'PATIENT' ? req.user.patientId : patientId;

  try {
    const records = await prisma.radiologyRecord.findMany({
      where:   finalPatientId ? { patientId: parseInt(finalPatientId) } : {},
      include: {
        patient: { include: { user: { select: { name: true, phone: true } } } },
        doctor:  { include: { user: { select: { name: true } } } },
      },
      orderBy: { uploadedAt: 'desc' },
    });
    res.json(records);
  } catch (err) { next(err); }
});

// ── POST /radiology ────────────────────────────────────────────────────────────
router.post('/radiology', requirePermission(PERMISSIONS.VIEW_RADIOLOGY), async (req, res, next) => {
  const { patientId, doctorId, type, description, fileUrl } = req.body;
  const finalPatientId = req.user.role === 'PATIENT' ? req.user.patientId : patientId;

  if (!finalPatientId || !type || !fileUrl) {
    return next(new ValidationError('المريض ونوع الأشعة ورابط الملف بيانات إجبارية'));
  }

  try {
    let finalDoctorId = toInt(doctorId);
    if (!finalDoctorId) {
      const doctor = await prisma.doctor.findUnique({ where: { userId: req.user.id } });
      finalDoctorId = doctor?.id || (await prisma.doctor.findFirst())?.id;
    }
    if (!finalDoctorId) return next(new ValidationError('يجب تحديد الطبيب المسؤول'));

    const record = await prisma.radiologyRecord.create({
      data: {
        patientId:   parseInt(finalPatientId),
        doctorId:    finalDoctorId,
        type,
        description: description || null,
        fileUrl,
      },
    });
    res.status(201).json({ message: 'تم حفظ ملف الأشعة', record });
  } catch (err) { next(err); }
});

// ── GET /blood-donations ───────────────────────────────────────────────────────
router.get('/blood-donations', async (req, res, next) => {
  const { role } = req.user;
  try {
    const where = role === 'PATIENT'
      ? { nationalId: req.query.nationalId || '__none__' }
      : {};
    const donations = await prisma.bloodDonation.findMany({ where, orderBy: { donationDate: 'desc' } });
    res.json(donations);
  } catch (err) { next(err); }
});

// ── POST /blood-donations ──────────────────────────────────────────────────────
router.post('/blood-donations', async (req, res, next) => {
  const { donorName, nationalId, bloodType, quantity, status, notes } = req.body;
  if (!donorName || !nationalId || !bloodType || !quantity) {
    return next(new ValidationError('اسم المتبرع والرقم القومي والفصيلة والكمية بيانات إجبارية'));
  }

  try {
    const donation = await prisma.bloodDonation.create({
      data: {
        donorName,
        nationalId,
        bloodType,
        quantity: parseFloat(quantity),
        status:   status || 'TESTING',
        notes:    notes  || null,
      },
    });
    res.status(201).json({ message: 'تم تسجيل تبرع الدم', donation });
  } catch (err) { next(err); }
});

// ── GET /patient/:patientId ────────────────────────────────────────────────────
// IDOR FIX: Patients can only access their own history; staff need VIEW_MEDICAL_RECORDS.
router.get('/patient/:patientId', authenticate, async (req, res, next) => {
  const requestedPatientId = parseInt(req.params.patientId);
  const { role, patientId: ownPatientId } = req.user;

  // Authorization check
  if (role === 'PATIENT') {
    if (requestedPatientId !== ownPatientId) {
      return next(new ForbiddenError('غير مصرح لك بعرض السجلات الطبية لمريض آخر'));
    }
  } else {
    // Staff must have the VIEW_MEDICAL_RECORDS permission
    const { hasPermission } = await import('../config/permissions.js');
    if (!hasPermission(role, PERMISSIONS.VIEW_MEDICAL_RECORDS)) {
      return next(new ForbiddenError('ليس لديك صلاحية عرض السجلات الطبية'));
    }
  }

  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  try {
    const [records, total] = await Promise.all([
      prisma.medicalRecord.findMany({
        where:   { appointment: { patientId: requestedPatientId } },
        include: {
          appointment: { include: { doctor: { include: { user: true, department: true } }, triage: true } },
          prescriptions: { include: { items: { include: { medicine: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.medicalRecord.count({ where: { appointment: { patientId: requestedPatientId } } }),
    ]);
    res.json({ data: records, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) { next(err); }
});

// ── GET /:id ──────────────────────────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const record = await prisma.medicalRecord.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        appointment: {
          include: {
            doctor:  { include: { user: true } },
            patient: { include: { user: true } },
          },
        },
        prescriptions: { include: { items: { include: { medicine: true } } } },
      },
    });
    if (!record) return next(new NotFoundError('السجل غير موجود'));

    // IDOR: patients can only access their own records
    if (req.user.role === 'PATIENT' && record.appointment.patientId !== req.user.patientId) {
      return next(new ForbiddenError('غير مصرح لك بعرض هذا السجل'));
    }

    res.json(record);
  } catch (err) { next(err); }
});

// ── PATCH /:id ─────────────────────────────────────────────────────────────────
router.patch('/:id', requirePermission(PERMISSIONS.EDIT_MEDICAL_RECORD), async (req, res, next) => {
  const { complaint, diagnosis, treatmentPlan, notes } = req.body;
  try {
    const updated = await prisma.medicalRecord.update({
      where: { id: parseInt(req.params.id) },
      data:  { complaint, diagnosis, treatmentPlan, notes },
    });

    await audit.log({
      ...audit.fromRequest(req),
      action:     'EDIT_MEDICAL_RECORD',
      entityType: 'MedicalRecord',
      entityId:   parseInt(req.params.id),
      newData:    { complaint, diagnosis, treatmentPlan, notes },
    });

    res.json(updated);
  } catch (err) { next(err); }
});

// ── POST / ─────────────────────────────────────────────────────────────────────
router.post('/', requirePermission(PERMISSIONS.CREATE_MEDICAL_RECORD), async (req, res, next) => {
  const { appointmentId, complaint, diagnosis, treatmentPlan, notes, prescriptions } = req.body;
  if (!appointmentId) return next(new ValidationError('معرف الموعد إجباري'));

  try {
    const newRecord = await prisma.medicalRecord.upsert({
      where:  { appointmentId: parseInt(appointmentId) },
      update: {
        complaint:     complaint     || undefined,
        diagnosis:     diagnosis     || undefined,
        treatmentPlan: treatmentPlan || undefined,
        notes:         notes         || undefined,
      },
      create: {
        appointmentId: parseInt(appointmentId),
        complaint:     complaint     || null,
        diagnosis:     diagnosis     || null,
        treatmentPlan: treatmentPlan || null,
        notes:         notes         || null,
      },
    });

    await prisma.appointment.update({
      where: { id: parseInt(appointmentId) },
      data:  { status: 'COMPLETED' },
    });

    if (prescriptions?.length) {
      const newPrescription = await prisma.prescription.create({
        data: { medicalRecordId: newRecord.id, status: 'PENDING' },
      });

      for (const item of prescriptions) {
        let medicine = await prisma.medicine.findFirst({ where: { name: item.name } });
        if (!medicine) {
          medicine = await prisma.medicine.create({
            data: { name: item.name, category: 'عام', price: 0 },
          });
        }
        await prisma.prescriptionItem.create({
          data: {
            prescriptionId: newPrescription.id,
            medicineId:     medicine.id,
            medicineName:   item.name,
            dosage:         item.dosage,
            frequency:      item.frequency,
            duration:       item.duration,
            quantity:       1,
          },
        });
      }
    }

    res.status(201).json({ message: 'تم حفظ الكشف الطبي وإصدار الروشتة بنجاح', record: newRecord });
  } catch (err) { next(err); }
});

export default router;
