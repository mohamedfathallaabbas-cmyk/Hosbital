import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/auth.js';
import patientRoutes from './routes/patients.js';
import appointmentRoutes from './routes/appointments.js';
import medicalRecordRoutes from './routes/medicalRecords.js';
import financeRoutes from './routes/finance.js';
import pharmacyRoutes from './routes/pharmacy.js';
import adminRoutes from './routes/admin.js';
import labsRoutes from './routes/labs.js';
import admissionsRoutes from './routes/admissions.js';
import nursingRoutes from './routes/nursing.js';
import staffRoutes from './routes/staff.js';
import insuranceRoutes from './routes/insurance.js';
import reportsRoutes from './routes/reports.js';

dotenv.config();

const app = express();
export const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // Logging HTTP requests

// المسارات
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/labs', labsRoutes);
app.use('/api/admissions', admissionsRoutes);
app.use('/api/nursing', nursingRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/insurance', insuranceRoutes);
app.use('/api/reports', reportsRoutes);

app.get('/api', (req, res) => {
  res.json({ message: 'مرحباً بك في سيرفر مستشفى الشفاء API 🏥', status: 'Active' });
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'المسار غير موجود' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'حدث خطأ داخلي في الخادم', details: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 URL: http://localhost:${PORT}/api`);
  console.log(`========================================`);
});
