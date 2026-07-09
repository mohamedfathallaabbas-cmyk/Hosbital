import express from 'express';
import dotenv  from 'dotenv';
import morgan  from 'morgan';
import path    from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors'; // حطها فوق خالص مع باقي الـ imports لو مش موجودة

// ── Security & Utils ─────────────────────────────────────────────────────────
import {
  helmetMiddleware,
  corsMiddleware,
  generalRateLimiter,
  authRateLimiter,
  uploadRateLimiter,
  compressionMiddleware,
} from './middleware/security.js';
import { errorHandler } from './middleware/errorHandler.js';

// ── Routes ───────────────────────────────────────────────────────────────────
import authRoutes         from './routes/auth.js';
import patientRoutes      from './routes/patients.js';
import appointmentRoutes  from './routes/appointments.js';
import medicalRecordRoutes from './routes/medicalRecords.js';
import financeRoutes      from './routes/finance.js';
import pharmacyRoutes     from './routes/pharmacy.js';
import adminRoutes        from './routes/admin.js';
import labsRoutes         from './routes/labs.js';
import admissionsRoutes   from './routes/admissions.js';
import nursingRoutes      from './routes/nursing.js';
import staffRoutes        from './routes/staff.js';
import insuranceRoutes    from './routes/insurance.js';
import reportsRoutes      from './routes/reports.js';
import patientFilesRoutes from './routes/patientFiles.js';
import systemSettingsRoutes from './routes/systemSettings.js';

// ── Bootstrap ────────────────────────────────────────────────────────────────
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const httpServer = http.createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Socket.io initialization

io.on('connection', (socket) => {
  console.log(`[Socket] User connected: ${socket.id}`);
  
  // A client will emit 'join' with their user ID
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`[Socket] User ${userId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] User disconnected: ${socket.id}`);
  });
});

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

// ── Core Middleware ──────────────────────────────────────────────────────────
app.use(helmetMiddleware);
// app.use(corsMiddleware);

app.use(cors({
    origin: true,
    credentials: true
}));
app.use(compressionMiddleware);
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsers — 10 MB limit (files go through multer, not JSON body)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Rate Limiting ─────────────────────────────────────────────────────────────
app.use('/api/', generalRateLimiter);

// ── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status:    'ok',
      timestamp: new Date().toISOString(),
      uptime:    process.uptime(),
      db:        'connected',
      env:       process.env.NODE_ENV || 'development',
    });
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

app.get('/api', (req, res) => {
  res.json({ message: 'مرحباً بك في سيرفر مستشفى الشفاء API 🏥', status: 'Active', version: '2.0.0' });
});

// ── API Routes ────────────────────────────────────────────────────────────────
// Auth routes get stricter rate limiting
app.use('/api/auth', authRateLimiter, authRoutes);

// Patient file uploads get their own rate limiter
app.use('/api/patient-files', uploadRateLimiter, patientFilesRoutes);

// Standard routes
app.use('/api/patients',        patientRoutes);
app.use('/api/appointments',    appointmentRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/finance',         financeRoutes);
app.use('/api/pharmacy',        pharmacyRoutes);
app.use('/api/admin',           adminRoutes);
app.use('/api/labs',            labsRoutes);
app.use('/api/admissions',      admissionsRoutes);
app.use('/api/nursing',         nursingRoutes);
app.use('/api/staff',           staffRoutes);
app.use('/api/insurance',       insuranceRoutes);
app.use('/api/reports',         reportsRoutes);
app.use('/api/system-settings', systemSettingsRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'المسار غير موجود' });
});

// ── Global Error Handler (MUST be last) ──────────────────────────────────────
app.use(errorHandler);

// ── Server Startup ────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '5000', 10);

// const server = httpServer.listen(PORT, () => {
//   console.log('========================================');
//   console.log(`🚀 Server running on port ${PORT}`);
//   console.log(`🌍 ENV: ${process.env.NODE_ENV || 'development'}`);
//   console.log(`🔗 URL: http://localhost:${PORT}/api`);
//   console.log(`❤️  Health: http://localhost:${PORT}/health`);
//   console.log('========================================');
// });

const server = httpServer.listen(PORT, "0.0.0.0", () => {
  console.log('========================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API: /api`);
  console.log(`❤️  Health: /health`);
  console.log('========================================');
});

// ── Graceful Shutdown ─────────────────────────────────────────────────────────
async function shutdown(signal) {
  console.log(`\n[${signal}] Graceful shutdown initiated…`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log('✓ Database disconnected. Bye!');
    process.exit(0);
  });
  // Force shutdown after 10 s
  setTimeout(() => process.exit(1), 10_000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
process.on('uncaughtException',  (err) => { console.error('[uncaughtException]', err); process.exit(1); });
process.on('unhandledRejection', (err) => { console.error('[unhandledRejection]', err); });
