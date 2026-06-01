/**
 * APPOINTMENTS ROUTE (Production-Grade)
 * 
 * Fixes applied:
 *  - Double-booking prevention with DB-level unique + application-level availability check
 *  - RBAC via requirePermission
 *  - Pagination on GET /
 *  - Proper error propagation via next()
 *  - Audit logging on create/cancel
 */

import express from 'express';
import { prisma } from '../index.js';
import { authenticate, requirePermission, enforcePatientOwnership } from '../middleware/auth.js';
import { PERMISSIONS } from '../config/permissions.js';
import { ConflictError, NotFoundError, ValidationError } from '../utils/errors.js';
import * as audit from '../services/auditService.js';

const router = express.Router();

// ── GET / ─────────────────────────────────────────────────────────────────────
router.get('/', authenticate, async (req, res, next) => {
  const { status, patientId: queryPatientId, page = 1, limit = 20, date } = req.query;
  const { id: userId, role } = req.user;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  try {
    let whereClause = {};

    if (role === 'DOCTOR') {
      const doctorProfile = await prisma.doctor.findUnique({ where: { userId } });
      if (!doctorProfile) return next(new NotFoundError('الملف الطبي غير موجود'));
      whereClause.doctorId = doctorProfile.id;
    } else if (role === 'PATIENT') {
      const patientProfile = await prisma.patient.findUnique({ where: { userId } });
      if (!patientProfile) return next(new NotFoundError('ملف المريض غير موجود'));
      whereClause.patientId = patientProfile.id;
    } else if (queryPatientId) {
      whereClause.patientId = parseInt(queryPatientId);
    }

    if (status) whereClause.status = status;
    if (date) {
      const d = new Date(date);
      const start = new Date(d); start.setHours(0,0,0,0);
      const end   = new Date(d); end.setHours(23,59,59,999);
      whereClause.date = { gte: start, lte: end };
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where: whereClause,
        include: {
          patient: { include: { user: { select: { name: true, phone: true } } } },
          doctor:  { include: { user: { select: { name: true } }, department: true } },
          triage:  true,
        },
        orderBy: { date: 'asc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.appointment.count({ where: whereClause }),
    ]);

    res.json({ data: appointments, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) { next(err); }
});

// ── GET /today ────────────────────────────────────────────────────────────────
router.get('/today', authenticate, async (req, res, next) => {
  try {
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd   = new Date(); todayEnd.setHours(23, 59, 59, 999);

    const appointments = await prisma.appointment.findMany({
      where: { date: { gte: todayStart, lte: todayEnd } },
      include: {
        patient: { include: { user: { select: { name: true, phone: true } } } },
        doctor:  { include: { user: { select: { name: true } }, department: true } },
        triage:  true,
      },
      orderBy: { timeSlot: 'asc' },
    });
    res.json(appointments);
  } catch (err) { next(err); }
});

// ── GET /availability ─────────────────────────────────────────────────────────
router.get('/availability', authenticate, async (req, res, next) => {
  const { doctorId, date } = req.query;
  if (!doctorId || !date) return next(new ValidationError('doctorId والتاريخ مطلوبان'));

  try {
    const d = new Date(date);
    const start = new Date(d); start.setHours(0,0,0,0);
    const end   = new Date(d); end.setHours(23,59,59,999);

    const booked = await prisma.appointment.findMany({
      where: {
        doctorId: parseInt(doctorId),
        date:     { gte: start, lte: end },
        status:   { notIn: ['CANCELLED', 'REJECTED'] },
      },
      select: { timeSlot: true },
    });

    res.json({ bookedSlots: booked.map(a => a.timeSlot).filter(Boolean) });
  } catch (err) { next(err); }
});

// ── GET /admission/:admissionId/followups ─────────────────────────────────────
router.get('/admission/:admissionId/followups', authenticate, async (req, res, next) => {
  try {
    const followups = await prisma.appointment.findMany({
      where: { admissionId: parseInt(req.params.admissionId), type: 'FOLLOWUP_INPATIENT' },
      include: { doctor: { include: { user: true } } },
    });
    res.json(followups);
  } catch (err) { next(err); }
});

// ── GET /:id ──────────────────────────────────────────────────────────────────
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        patient: { include: { user: true } },
        doctor:  { include: { user: true, department: true } },
        triage:  true,
        medicalRecord: true,
      },
    });
    if (!appointment) return next(new NotFoundError('الموعد غير موجود'));

    // IDOR: patients can only see their own appointments
    if (req.user.role === 'PATIENT' && appointment.patientId !== req.user.patientId) {
      return next(new NotFoundError('الموعد غير موجود'));
    }

    res.json(appointment);
  } catch (err) { next(err); }
});

// ── POST / ─────────────────────────────────────────────────────────────────────
router.post('/', authenticate, requirePermission(PERMISSIONS.CREATE_APPOINTMENT), async (req, res, next) => {
  const { patientId, doctorId, date, timeSlot, type, departmentId, admissionId } = req.body;
  const { role, id: userId } = req.user;

  if (!date) return next(new ValidationError('تاريخ الموعد إجباري'));

  try {
    let finalPatientId = patientId ? parseInt(patientId) : null;
    let finalDoctorId  = doctorId  ? parseInt(doctorId)  : null;

    // Patients always book for themselves
    if (role === 'PATIENT') {
      const patientProfile = await prisma.patient.findUnique({ where: { userId } });
      if (!patientProfile) return next(new NotFoundError('لم يتم العثور على ملف المريض'));
      finalPatientId = patientProfile.id;
    }

    // Resolve doctor from department if not provided
    if (!finalDoctorId && departmentId) {
      const doctor = await prisma.doctor.findFirst({ where: { departmentId: parseInt(departmentId) } });
      if (doctor) finalDoctorId = doctor.id;
    }
    if (!finalDoctorId) {
      const anyDoctor = await prisma.doctor.findFirst();
      if (!anyDoctor) return next(new ValidationError('لا يوجد أطباء متاحين'));
      finalDoctorId = anyDoctor.id;
    }

    // ── Application-level double-booking check (before hitting DB constraint) ──
    if (timeSlot) {
      const appointmentDate = new Date(date);
      const conflict = await prisma.appointment.findFirst({
        where: {
          doctorId:  finalDoctorId,
          date:      appointmentDate,
          timeSlot,
          status:    { notIn: ['CANCELLED', 'REJECTED'] },
        },
      });
      if (conflict) {
        return next(new ConflictError('هذا الوقت محجوز بالفعل لدى الطبيب، يرجى اختيار وقت آخر'));
      }
    }

    const initialStatus = role === 'PATIENT' ? 'SCHEDULED' : 'WAITING';

    const newAppointment = await prisma.appointment.create({
      data: {
        patientId:   finalPatientId,
        doctorId:    finalDoctorId,
        date:        new Date(date),
        timeSlot,
        type:        type || 'CHECKUP',
        status:      initialStatus,
        admissionId: admissionId ? parseInt(admissionId) : null,
      },
      include: {
        patient: { include: { user: true } },
        doctor:  { include: { user: true, department: true } },
      },
    });

    await audit.log({
      ...audit.fromRequest(req),
      action:     'CREATE_APPOINTMENT',
      entityType: 'Appointment',
      entityId:   newAppointment.id,
      newData:    { patientId: finalPatientId, doctorId: finalDoctorId, date, timeSlot, type },
    });

    res.status(201).json({ message: 'تم حجز الموعد بنجاح', appointment: newAppointment });
  } catch (err) {
    // Catch DB-level unique violation for race conditions
    if (err.code === 'P2002' && err.meta?.target?.includes('timeSlot')) {
      return next(new ConflictError('هذا الوقت محجوز بالفعل، يرجى اختيار وقت آخر'));
    }
    next(err);
  }
});

// ── PATCH /:id/status ─────────────────────────────────────────────────────────
router.patch('/:id/status', authenticate, requirePermission(PERMISSIONS.MANAGE_APPOINTMENT), async (req, res, next) => {
  const { status } = req.body;
  const VALID_STATUSES = ['SCHEDULED', 'WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
  if (!VALID_STATUSES.includes(status)) return next(new ValidationError(`حالة غير صحيحة. المسموح: ${VALID_STATUSES.join(', ')}`));

  try {
    const updated = await prisma.appointment.update({
      where: { id: parseInt(req.params.id) },
      data:  { status },
    });
    res.json(updated);
  } catch (err) { next(err); }
});

// ── PATCH /:id/reject ─────────────────────────────────────────────────────────
router.patch('/:id/reject', authenticate, requirePermission(PERMISSIONS.MANAGE_APPOINTMENT), async (req, res, next) => {
  const { rejectionReason } = req.body;
  if (!rejectionReason) return next(new ValidationError('سبب الرفض إجباري'));

  try {
    const updated = await prisma.appointment.update({
      where: { id: parseInt(req.params.id) },
      data:  { status: 'REJECTED', rejectionReason },
    });
    res.json(updated);
  } catch (err) { next(err); }
});

// ── POST /:id/triage ──────────────────────────────────────────────────────────
router.post('/:id/triage', authenticate, async (req, res, next) => {
  const { bloodPressure, heartRate, temperature, oxygenLevel, priorityLevel, notes } = req.body;

  try {
    const triage = await prisma.triage.upsert({
      where:  { appointmentId: parseInt(req.params.id) },
      update: {
        bloodPressure,
        heartRate:   heartRate   ? parseInt(heartRate)     : undefined,
        temperature: temperature ? parseFloat(temperature) : undefined,
        oxygenLevel: oxygenLevel ? parseInt(oxygenLevel)   : undefined,
        priorityLevel,
        notes,
      },
      create: {
        appointmentId: parseInt(req.params.id),
        bloodPressure,
        heartRate:   parseInt(heartRate)     || null,
        temperature: parseFloat(temperature) || null,
        oxygenLevel: parseInt(oxygenLevel)   || null,
        priorityLevel: priorityLevel || 'NORMAL',
        notes,
      },
    });
    res.status(201).json({ message: 'تم تسجيل القياسات بنجاح', triage });
  } catch (err) { next(err); }
});

// ── DELETE /:id ───────────────────────────────────────────────────────────────
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const appt = await prisma.appointment.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!appt) return next(new NotFoundError('الموعد غير موجود'));

    // Only patient who owns it or admin/reception can cancel
    if (req.user.role === 'PATIENT' && appt.patientId !== req.user.patientId) {
      const { ForbiddenError } = await import('../utils/errors.js');
      return next(new ForbiddenError('غير مصرح لك بإلغاء هذا الموعد'));
    }

    await prisma.appointment.update({
      where: { id: parseInt(req.params.id) },
      data:  { status: 'CANCELLED' },
    });

    await audit.log({
      ...audit.fromRequest(req),
      action:     'CANCEL_APPOINTMENT',
      entityType: 'Appointment',
      entityId:   parseInt(req.params.id),
    });

    res.json({ message: 'تم إلغاء الموعد' });
  } catch (err) { next(err); }
});

export default router;
