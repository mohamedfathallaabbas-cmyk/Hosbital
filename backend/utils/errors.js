/**
 * CUSTOM ERROR CLASSES
 * 
 * Centralizes all HTTP error types so every route can throw
 * a typed error and the global error handler formats it correctly.
 * 
 * Usage:
 *   throw new NotFoundError('الموعد غير موجود');
 *   throw new ForbiddenError('غير مصرح لك بهذا الإجراء');
 */

export class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || 'APP_ERROR';
    this.isOperational = true; // distinguishes from unexpected bugs
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, fields = {}) {
    super(message, 400, 'VALIDATION_ERROR');
    this.fields = fields;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'غير مصرح: يجب تسجيل الدخول أولاً') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'غير مصرح لك بتنفيذ هذا الإجراء') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'العنصر المطلوب غير موجود') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'يوجد تعارض في البيانات') {
    super(message, 409, 'CONFLICT');
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'لقد تجاوزت الحد المسموح من الطلبات، يرجى المحاولة لاحقاً') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}
