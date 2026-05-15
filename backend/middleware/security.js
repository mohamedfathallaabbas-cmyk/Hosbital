/**
 * SECURITY MIDDLEWARE
 * 
 * Centralizes all security-related Express middleware:
 *   - helmet (secure headers)
 *   - CORS hardening
 *   - rate limiting (auth, uploads, general)
 *   - compression
 *   - request size limits
 */

import helmet   from 'helmet';
import cors     from 'cors';
import rateLimit from 'express-rate-limit';
import compression from 'compression';

// ── Allowed Origins ──────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000')
  .split(',')
  .map(o => o.trim());

// ── Helmet ───────────────────────────────────────────────────────────────────
export const helmetMiddleware = helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow file downloads
});

// ── CORS ─────────────────────────────────────────────────────────────────────
export const corsMiddleware = cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, Postman in dev)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods:     ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

// ── Rate Limiters ─────────────────────────────────────────────────────────────

/** Auth routes: 10 attempts per 15 min (brute-force protection) */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      10,
  message:  { success: false, code: 'RATE_LIMIT', message: 'لقد تجاوزت الحد المسموح من محاولات تسجيل الدخول، حاول بعد 15 دقيقة' },
  standardHeaders: true,
  legacyHeaders:   false,
  skipSuccessfulRequests: true, // count only failures
});

/** Upload routes: 20 uploads per 10 min per IP */
export const uploadRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max:      20,
  message:  { success: false, code: 'RATE_LIMIT', message: 'لقد تجاوزت الحد المسموح من عمليات الرفع' },
  standardHeaders: true,
  legacyHeaders:   false,
});

/** General API: 300 requests per minute */
export const generalRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max:      300,
  message:  { success: false, code: 'RATE_LIMIT', message: 'عدد الطلبات تجاوز الحد، يرجى المحاولة لاحقاً' },
  standardHeaders: true,
  legacyHeaders:   false,
});

// ── Compression ───────────────────────────────────────────────────────────────
export const compressionMiddleware = compression({
  level:     6,
  threshold: 1024, // only compress responses > 1KB
});
