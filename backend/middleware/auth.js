/**
 * AUTH & RBAC MIDDLEWARE (Production-Grade)
 *
 * authenticate       – verifies JWT, attaches req.user
 * requireRole        – legacy helper (keeps backward compat)
 * requirePermission  – preferred granular RBAC check
 * enforcePatientOwnership – IDOR guard for patient-scoped routes
 */

import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import { hasPermission } from '../config/permissions.js';

// ── 1. JWT Authentication ─────────────────────────────────────────────────────
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('غير مصرح: التوكن مفقود أو غير صالح'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, email, patientId?, doctorId?, staffId? }
    next();
  } catch (err) {
    return next(new UnauthorizedError('التوكن منتهي الصلاحية أو غير صحيح'));
  }
}

// ── 2. Role-Based Guard (legacy compatibility) ────────────────────────────────
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(new UnauthorizedError());
    const userRole = (req.user.role || '').toUpperCase();
    if (!roles.map(r => r.toUpperCase()).includes(userRole)) {
      return next(new ForbiddenError(`هذه العملية تتطلب صلاحيات: ${roles.join(', ')}`));
    }
    next();
  };
}

// ── 3. Permission-Based Guard (preferred) ────────────────────────────────────
/**
 * requirePermission('DISPENSE_MEDICINE')
 *   – checks against the centralized ROLE_PERMISSIONS map.
 *   – supports multiple permissions (all must be present unless { any: true })
 *
 * @param {...string} permissions
 * @param {{ any?: boolean }} [opts]
 */
export function requirePermission(...args) {
  // Support optional trailing options object: requirePermission('A','B',{any:true})
  const opts        = typeof args[args.length - 1] === 'object' ? args.pop() : {};
  const permissions = args;
  const matchAny    = opts.any === true;

  return (req, res, next) => {
    if (!req.user) return next(new UnauthorizedError());

    const role   = req.user.role;
    const check  = (perm) => hasPermission(role, perm);
    const passed = matchAny
      ? permissions.some(check)
      : permissions.every(check);

    if (!passed) {
      return next(new ForbiddenError('ليس لديك صلاحية تنفيذ هذا الإجراء'));
    }
    next();
  };
}

// ── 4. Patient Ownership Guard (IDOR Protection) ─────────────────────────────
/**
 * Prevents a PATIENT from reading or mutating another patient's data.
 * Staff roles (ADMIN, DOCTOR, etc.) pass through unmodified.
 *
 * Checks (in order):
 *   req.params.id  (when route is /patients/:id)
 *   req.params.patientId
 *   req.body.patientId
 *   req.query.patientId
 */
export function enforcePatientOwnership(req, res, next) {
  if (!req.user) return next(new UnauthorizedError());

  // Non-patient roles are unrestricted
  if (req.user.role !== 'PATIENT') return next();

  if (!req.user.patientId) {
    return next(new ForbiddenError('لا يوجد ملف مريض مرتبط بهذا الحساب'));
  }

  // Determine which ID the request is targeting
  let targetId =
    req.params.patientId ||
    req.params.id ||
    req.body?.patientId ||
    req.query.patientId;

  if (targetId && String(targetId) !== String(req.user.patientId)) {
    return next(new ForbiddenError('غير مصرح لك بالوصول إلى بيانات مريض آخر'));
  }

  // Force all downstream handlers to use the authenticated patient's own ID
  if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
    req.body.patientId = req.user.patientId;
  }
  req.query.patientId   = req.user.patientId;
  res.locals.patientId  = req.user.patientId;

  next();
}

// ── 5. Medical Record Ownership ───────────────────────────────────────────────
/**
 * For routes that touch medical records by record ID.
 * Patients can only access their own records.
 * Requires prisma to be imported inside the function to avoid circular deps.
 */
export function enforceMedicalRecordOwnership(req, res, next) {
  if (!req.user) return next(new UnauthorizedError());
  if (req.user.role !== 'PATIENT') return next(); // staff pass through
  // Actual DB ownership check happens inside the route handler after fetching the record.
  // This middleware just marks the request for downstream enforcement.
  req._enforcePatientRecordOwnership = true;
  next();
}
