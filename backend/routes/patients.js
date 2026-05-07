import express from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../index.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// GET: البحث عن جميع المرضى أو مريض محدد
router.get('/', authenticate, async (req, res) => {
  const { search } = req.query;
  try {
    const patients = await prisma.patient.findMany({
      where: search ? {
        OR: [
          { nationalId: { contains: search } },
          { user: { name: { contains: search } } },
          { user: { phone: { contains: search } } }
        ]
      } : {},
      include: {
        user: { select: { name: true, email: true, phone: true } }
      }
    });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب بيانات المرضى' });
  }
});

// GET: جلب مريض واحد بتفاصيله الكاملة
router.get('/:id', authenticate, async (req, res) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { user: true }
    });
    if (!patient) return res.status(404).json({ error: 'المريض غير موجود' });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب المريض' });
  }
});

// GET: ملخص المريض (مواعيد، سجلات، فواتير)
router.get('/:id/summary', authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        user: true,
        appointments: { include: { doctor: { include: { user: true, department: true } } }, orderBy: { date: 'desc' }, take: 5 },
        invoices: { orderBy: { createdAt: 'desc' }, take: 5 },
        admissions: { include: { bed: { include: { room: { include: { ward: true } } } } }, orderBy: { admittedAt: 'desc' }, take: 5 }
      }
    });
    
    if (!patient) return res.status(404).json({ error: 'المريض غير موجود' });
    
    // جلب آخر السجلات الطبية
    const medicalRecords = await prisma.medicalRecord.findMany({
      where: { appointment: { patientId: id } },
      include: { appointment: { include: { doctor: { include: { user: true } } } }, prescriptions: { include: { items: { include: { medicine: true } } } } },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    res.json({ ...patient, medicalRecords });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب ملخص المريض' });
  }
});

// PATCH: تعديل بيانات المريض
router.patch('/:id', authenticate, async (req, res) => {
  const { weight, height, bloodType, allergies, chronicDiseases, emergencyContact, phone } = req.body;
  try {
    const id = parseInt(req.params.id);
    const patient = await prisma.patient.update({
      where: { id },
      data: {
        weight: weight ? parseFloat(weight) : undefined,
        height: height ? parseFloat(height) : undefined,
        bloodType,
        allergies,
        chronicDiseases,
        emergencyContact,
        ...(phone && { user: { update: { phone } } })
      },
      include: { user: true }
    });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في تحديث بيانات المريض' });
  }
});

// POST: تسجيل مريض جديد من قبل الاستقبال
router.post('/', async (req, res) => {
  const { name, email, phone, nationalId, dateOfBirth, gender, bloodType } = req.body;
  
  try {
    const defaultPassword = await bcrypt.hash(nationalId || '123456', 10);
    const generatedEmail = email || `patient_${nationalId || Date.now()}@alshifa.local`;
    
    const newUser = await prisma.user.create({
      data: {
        name,
        email: generatedEmail,
        phone,
        password: defaultPassword,
        role: 'PATIENT',
        patientProfile: {
          create: {
            nationalId,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            gender,
            bloodType
          }
        }
      },
      include: {
        patientProfile: true
      }
    });

    res.status(201).json({ message: 'تم تسجيل المريض بنجاح', patient: newUser.patientProfile });
  } catch (error) {
    console.error(error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'البريد الإلكتروني أو الرقم القومي مسجل مسبقاً في النظام' });
    }
    res.status(500).json({ error: 'حدث خطأ أثناء تسجيل المريض' });
  }
});

export default router;
