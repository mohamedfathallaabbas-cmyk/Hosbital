import express from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../index.js';

const router = express.Router();

// GET: البحث عن جميع المرضى أو مريض محدد
router.get('/', async (req, res) => {
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

// POST: تسجيل مريض جديد من قبل الاستقبال
router.post('/', async (req, res) => {
  const { name, email, phone, nationalId, dateOfBirth, gender, bloodType } = req.body;
  
  try {
    // 1. إنشاء حساب المستخدم والملف الطبي في خطوة واحدة
    const defaultPassword = await bcrypt.hash(nationalId || '123456', 10);
    
    // توليد إيميل افتراضي لأن شاشة الاستقبال لا تطلب إيميل
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
