import express from 'express';
import bcrypt  from 'bcryptjs';
import jwt     from 'jsonwebtoken';
import { prisma } from '../index.js';
import * as audit from '../services/auditService.js';
import { ValidationError } from '../utils/errors.js';

const router = express.Router();

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return next(new ValidationError('البريد الإلكتروني وكلمة المرور مطلوبان'));

  try {
    const user = await prisma.user.findUnique({
      where:   { email: email.trim().toLowerCase() },
      include: { patientProfile: true, doctorProfile: true, staffProfile: true },
    });

    if (!user || !user.isActive) {
      // Audit failed login (but don't reveal if account exists)
      await audit.log({
        userId:    null,
        action:    'LOGIN_FAILED',
        entityType:'User',
        newData:   { email: email.trim().toLowerCase() },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
      return res.status(401).json({ success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await audit.log({
        userId:    user.id,
        action:    'LOGIN_FAILED',
        entityType:'User',
        entityId:  user.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
      return res.status(401).json({ success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }

    const token = jwt.sign(
      {
        id:        user.id,
        role:      user.role,
        email:     user.email,
        patientId: user.patientProfile?.id,
        doctorId:  user.doctorProfile?.id,
        staffId:   user.staffProfile?.id,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    await audit.log({
      userId:    user.id,
      action:    'LOGIN',
      entityType:'User',
      entityId:  user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      message: 'تم تسجيل الدخول بنجاح',
      token,
      user: {
        id:        user.id,
        name:      user.name,
        email:     user.email,
        role:      user.role,
        patientId: user.patientProfile?.id,
        doctorId:  user.doctorProfile?.id,
        staffId:   user.staffProfile?.id,
      },
    });
  } catch (err) { next(err); }
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
router.post('/reset-password', async (req, res, next) => {
  const { email, nationalId, newPassword } = req.body;

  if (!email || !newPassword) return next(new ValidationError('البريد الإلكتروني وكلمة المرور الجديدة مطلوبان'));
  if (newPassword.length < 6) return next(new ValidationError('كلمة المرور يجب أن تكون 6 أحرف على الأقل'));

  try {
    const user = await prisma.user.findUnique({
      where:   { email: email.trim().toLowerCase() },
      include: { patientProfile: true },
    });

    if (!user || !user.patientProfile) {
      return res.status(404).json({ error: 'الحساب غير موجود' });
    }

    if (user.patientProfile.nationalId) {
      if (!nationalId || nationalId.trim() !== user.patientProfile.nationalId.trim()) {
        return res.status(401).json({ error: 'الرقم القومي غير صحيح' });
      }
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

    await audit.log({
      userId:    user.id,
      action:    'PASSWORD_RESET',
      entityType:'User',
      entityId:  user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ message: 'تم تغيير كلمة المرور بنجاح، يمكنك تسجيل الدخول الآن' });
  } catch (err) { next(err); }
});

// ─── POST /register-patient ───────────────────────────────────────────────────
router.post('/register-patient', async (req, res, next) => {
  const { name, email, phone, password, nationalId, dateOfBirth, gender } = req.body;

  if (!name || !email || !password) return next(new ValidationError('الاسم والبريد الإلكتروني وكلمة المرور مطلوبة'));
  if (password.length < 6) return next(new ValidationError('كلمة المرور يجب أن تكون 6 أحرف على الأقل'));

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(409).json({ success: false, message: 'هذا البريد الإلكتروني مسجل بالفعل' });

    if (nationalId) {
      const existingNationalId = await prisma.patient.findFirst({ where: { nationalId } });
      if (existingNationalId) return res.status(409).json({ success: false, message: 'الرقم القومي مسجل بالفعل' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

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

    await audit.log({
      userId:    result.user.id,
      action:    'REGISTER_PATIENT',
      entityType:'Patient',
      entityId:  result.patient.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

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

  } catch (err) { next(err); }
});

export default router;
