/**
 * PATIENTS ROUTE (Production-Grade)
 *
 * Fixes applied:
 *  - IDOR: enforcePatientOwnership on all patient-scoped endpoints
 *  - requirePermission for staff access
 *  - Pagination on list endpoint
 *  - Passwords never returned in responses
 *  - Proper error propagation
 */

import express from 'express';
import bcrypt  from 'bcryptjs';
import { prisma } from '../index.js';
import {
  authenticate,
  requirePermission,
  enforcePatientOwnership,
} from '../middleware/auth.js';
import { PERMISSIONS } from '../config/permissions.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

const router = express.Router();

// ── GET / — Staff only ────────────────────────────────────────────────────────
router.get(
  '/',
  authenticate,
  requirePermission(PERMISSIONS.VIEW_ALL_PATIENTS),
  async (req, res, next) => {
    const { search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    try {
      let where = search
        ? {
            OR: [
              { nationalId:  { contains: search } },
              { user: { name:  { contains: search, mode: 'insensitive' } } },
              { user: { phone: { contains: search } } },
            ],
          }
        : {};

      if (req.user.role === 'DOCTOR') {
        where = {
          ...where,
          appointments: { some: { doctorId: req.user.doctorId } }
        };
      }

      const [patients, total] = await Promise.all([
        prisma.patient.findMany({
          where,
          include: { user: { select: { name: true, email: true, phone: true, createdAt: true } } },
          skip,
          take: parseInt(limit),
          orderBy: { id: 'desc' },
        }),
        prisma.patient.count({ where }),
      ]);

      res.json({ data: patients, total, page: parseInt(page), limit: parseInt(limit) });
    } catch (err) { next(err); }
  }
);

// ── GET /:id — IDOR protected ─────────────────────────────────────────────────
router.get('/:id', authenticate, enforcePatientOwnership, async (req, res, next) => {
  try {
    const patient = await prisma.patient.findUnique({
      where:   { id: parseInt(req.params.id) },
      include: { user: { select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true } } },
    });
    if (!patient) return next(new NotFoundError('المريض غير موجود'));
    res.json(patient);
  } catch (err) { next(err); }
});

// ── GET /:id/summary — IDOR protected ────────────────────────────────────────
router.get('/:id/summary', authenticate, enforcePatientOwnership, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        user:        { select: { id: true, name: true, email: true, phone: true } },
        appointments: {
          include:  { doctor: { include: { user: { select: { name: true } }, department: true } } },
          orderBy:  { date: 'desc' },
          take:     5,
        },
        invoices:   { orderBy: { createdAt: 'desc' }, take: 5 },
        admissions: {
          include:  { bed: { include: { room: { include: { ward: true } } } } },
          orderBy:  { admittedAt: 'desc' },
          take:     5,
        },
      },
    });
    if (!patient) return next(new NotFoundError('المريض غير موجود'));

    const medicalRecords = await prisma.medicalRecord.findMany({
      where:   { appointment: { patientId: id } },
      include: {
        appointment:   { include: { doctor: { include: { user: { select: { name: true } } } } } },
        prescriptions: { include: { items: { include: { medicine: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take:    5,
    });

    res.json({ ...patient, medicalRecords });
  } catch (err) { next(err); }
});

// ── PATCH /:id — IDOR protected ───────────────────────────────────────────────
router.patch('/:id', authenticate, enforcePatientOwnership, async (req, res, next) => {
  const { weight, height, bloodType, allergies, chronicDiseases, emergencyContact, phone } = req.body;

  try {
    const id = parseInt(req.params.id);
    const patient = await prisma.patient.update({
      where: { id },
      data:  {
        weight:           weight ? parseFloat(weight) : undefined,
        height:           height ? parseFloat(height) : undefined,
        bloodType:        bloodType        || undefined,
        allergies:        allergies        || undefined,
        chronicDiseases:  chronicDiseases  || undefined,
        emergencyContact: emergencyContact || undefined,
        ...(phone && { user: { update: { phone } } }),
      },
      include: { user: { select: { name: true, email: true, phone: true } } },
    });
    res.json(patient);
  } catch (err) { next(err); }
});

// ── POST / — Reception registers a walk-in patient ────────────────────────────
router.post('/', authenticate, requirePermission(PERMISSIONS.MANAGE_PATIENT), async (req, res, next) => {
  const { name, email, phone, nationalId, dateOfBirth, gender, bloodType } = req.body;
  if (!name) return next(new ValidationError('الاسم إجباري'));

  try {
    const defaultPassword  = await bcrypt.hash(nationalId || '123456', 10);
    const generatedEmail   = email || `patient_${nationalId || Date.now()}@alshifa.local`;

    const newUser = await prisma.user.create({
      data: {
        name,
        email:    generatedEmail,
        phone,
        password: defaultPassword,
        role:     'PATIENT',
        patientProfile: {
          create: {
            nationalId,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            gender,
            bloodType,
          },
        },
      },
      include: { patientProfile: true },
    });

    res.status(201).json({ message: 'تم تسجيل المريض بنجاح', patient: newUser.patientProfile });
  } catch (err) { next(err); }
});

export default router;
