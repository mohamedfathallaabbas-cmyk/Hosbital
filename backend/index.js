import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.js';
import patientRoutes from './routes/patients.js';
import appointmentRoutes from './routes/appointments.js';
import medicalRecordRoutes from './routes/medicalRecords.js';
import financeRoutes from './routes/finance.js';
import pharmacyRoutes from './routes/pharmacy.js';
import adminRoutes from './routes/admin.js';
import labsRoutes from './routes/labs.js';


dotenv.config();

const app = express();
export const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// المسار العام (لا يحتاج توكن)
app.use('/api/auth', authRoutes);

// المسارات المحمية بالـ JWT (middleware داخل كل route)
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/labs', labsRoutes);


app.get('/api', (req, res) => {
  res.json({ message: 'مرحباً بك في سيرفر مستشفى الشفاء API 🏥', status: 'Active' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 URL: http://localhost:${PORT}/api`);
  console.log(`========================================`);
});
