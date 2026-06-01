/**
 * GLOBAL ERROR HANDLER
 * 
 * Must be registered as the LAST middleware in index.js:
 *   app.use(errorHandler);
 * 
 * Handles:
 *  - Custom AppError subclasses (operational errors → clean JSON)
 *  - Prisma errors (P2002 unique, P2025 not found, etc.)
 *  - Unexpected errors (hides details in production)
 */

import { AppError } from '../utils/errors.js';

const isProd = process.env.NODE_ENV === 'production';

export function errorHandler(err, req, res, next) {
  // ── 1. Custom operational errors ────────────────────────────────────────────
  if (err.isOperational) {
    const body = {
      success:  false,
      code:     err.code,
      message:  err.message,
    };
    if (err.fields) body.fields = err.fields;
    return res.status(err.statusCode).json(body);
  }

  // ── 2. Prisma well-known error codes ────────────────────────────────────────
  if (err.code === 'P2002') {
    // Unique constraint violation
    const field = err.meta?.target?.join(', ') || 'field';
    return res.status(409).json({
      success: false,
      code:    'CONFLICT',
      message: `يوجد تعارض في البيانات: الحقل (${field}) مستخدم مسبقاً`,
    });
  }

  if (err.code === 'P2025') {
    // Record not found
    return res.status(404).json({
      success: false,
      code:    'NOT_FOUND',
      message: 'السجل المطلوب غير موجود',
    });
  }

  if (err.code === 'P2003') {
    // Foreign key constraint
    return res.status(400).json({
      success: false,
      code:    'INVALID_REFERENCE',
      message: 'بيانات مرجعية غير صحيحة (foreign key violation)',
    });
  }

  // ── 3. Unexpected / programmer errors ───────────────────────────────────────
  // Never leak stack traces or internal details in production
  console.error('[SERVER ERROR]', {
    url:     req.originalUrl,
    method:  req.method,
    userId:  req.user?.id,
    error:   err.message,
    stack:   err.stack,
  });

  return res.status(500).json({
    success: false,
    code:    'SERVER_ERROR',
    message: 'حدث خطأ داخلي في الخادم',
    ...(isProd ? {} : { detail: err.message }),
  });
}
