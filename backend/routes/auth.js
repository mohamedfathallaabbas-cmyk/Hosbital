import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. البحث عن المستخدم بالإيميل
    const user = await prisma.user.findUnique({
      where: { email },
      include: { patientProfile: true, doctorProfile: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }

    // 2. التحقق من كلمة المرور (مقارنة المشفر)
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }

    // 3. توليد التوكن (JWT)
    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role, 
        email: user.email,
        patientId: user.patientProfile?.id,
        doctorId: user.doctorProfile?.id
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 4. إرسال الرد للفرونت إند
    res.json({
      message: 'تم تسجيل الدخول بنجاح',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        patientId: user.patientProfile?.id,
        doctorId: user.doctorProfile?.id
      }
    });

  } catch (error) {
    console.error('Login API Error:', error);
    res.status(500).json({ error: 'حدث خطأ داخلي في السيرفر' });
  }
});

export default router;
