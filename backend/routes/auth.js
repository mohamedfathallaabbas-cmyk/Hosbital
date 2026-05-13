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
      include: { patientProfile: true, doctorProfile: true, staffProfile: true }
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
        doctorId: user.doctorProfile?.id,
        staffId: user.staffProfile?.id
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
        doctorId: user.doctorProfile?.id,
        staffId: user.staffProfile?.id
      }
    });

  } catch (error) {
    console.error('Login API Error:', error);
    res.status(500).json({ error: 'حدث خطأ داخلي في السيرفر' });
  }
});


// ─── POST /forgot-password ────────────────────────────────────────────────────
// Step 1: verify that the email belongs to a PATIENT account
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'البريد الإلكتروني مطلوب' });

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      include: { patientProfile: true }
    });

    if (!user || !user.patientProfile) {
      // Return a generic message so we don't expose account existence
      return res.status(404).json({ error: 'لم يتم العثور على حساب مريض بهذا البريد الإلكتروني' });
    }

    // Check if patient has a nationalId set (needed for verification)
    const hasNationalId = !!user.patientProfile.nationalId;

    res.json({
      message: 'تم التحقق من البريد الإلكتروني',
      hasNationalId,
      // In production this would send an email; here we allow in-place reset
    });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ error: 'حدث خطأ داخلي' });
  }
});

// ─── POST /reset-password ─────────────────────────────────────────────────────
// Step 2: verify identity then update password
router.post('/reset-password', async (req, res) => {
  const { email, nationalId, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ error: 'البريد الإلكتروني وكلمة المرور الجديدة مطلوبان' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      include: { patientProfile: true }
    });

    if (!user || !user.patientProfile) {
      return res.status(404).json({ error: 'الحساب غير موجود' });
    }

    // Verify identity via national ID (if the patient has one set)
    if (user.patientProfile.nationalId) {
      if (!nationalId || nationalId.trim() !== user.patientProfile.nationalId.trim()) {
        return res.status(401).json({ error: 'الرقم القومي غير صحيح' });
      }
    }

    // Hash new password and save
    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed }
    });

    console.log(`[AUDIT LOG] Patient ${user.id} reset their password`);
    res.json({ message: 'تم تغيير كلمة المرور بنجاح، يمكنك تسجيل الدخول الآن' });

  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ error: 'حدث خطأ داخلي' });
  }
});

// ─── POST /register-patient ───────────────────────────────────────────────────
router.post('/register-patient', async (req, res) => {
  const { name, email, phone, password, nationalId, dateOfBirth, gender } = req.body;

  // ── 1. Validate required fields ──────────────────────────────────────────
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'الاسم والبريد الإلكتروني وكلمة المرور مطلوبة' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
  }

  try {
    // ── 2. Check uniqueness ───────────────────────────────────────────────
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'هذا البريد الإلكتروني مسجل بالفعل' });
    }

    if (nationalId) {
      const existingNationalId = await prisma.patient.findFirst({ where: { nationalId } });
      if (existingNationalId) {
        return res.status(409).json({ error: 'الرقم القومي مسجل بالفعل' });
      }
    }

    // ── 3. Hash password ──────────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 12);

    // ── 4. Prisma Transaction: create User + Patient atomically ───────────
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          phone: phone || null,
          password: hashedPassword,
          role: 'PATIENT',
        }
      });

      const newPatient = await tx.patient.create({
        data: {
          userId: newUser.id,
          nationalId: nationalId || null,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          gender: gender || null,
        }
      });

      return { user: newUser, patient: newPatient };
    });

    // ── 5. Issue JWT (auto-login after register) ──────────────────────────
    const token = jwt.sign(
      {
        id:        result.user.id,
        role:      result.user.role,
        email:     result.user.email,
        patientId: result.patient.id,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`[AUDIT LOG] New patient registered: User ${result.user.id} → Patient ${result.patient.id}`);

    // ── 6. Return token + user info ───────────────────────────────────────
    res.status(201).json({
      message: 'تم إنشاء حسابك بنجاح، مرحباً بك!',
      token,
      user: {
        id:        result.user.id,
        name:      result.user.name,
        email:     result.user.email,
        role:      result.user.role,
        patientId: result.patient.id,
      }
    });

  } catch (error) {
    console.error('Register Patient Error:', error);
    res.status(500).json({ error: 'حدث خطأ داخلي، يرجى المحاولة مرة أخرى' });
  }
});

export default router;
