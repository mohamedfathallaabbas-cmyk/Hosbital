import express from 'express';
import { prisma } from '../index.js';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { PERMISSIONS } from '../config/permissions.js';

const router = express.Router();

// ── GET / ──────────────────────────────────────────────────────────────────
// Fetch all system settings. We allow any authenticated user to view them (e.g. for themes, names).
router.get('/', async (req, res, next) => {
  try {
    const settings = await prisma.systemSetting.findMany();
    res.json(settings);
  } catch (err) { next(err); }
});

// ── POST / ─────────────────────────────────────────────────────────────────
// Update or create settings. Admin only.
router.post('/', authenticate, requirePermission(PERMISSIONS.MANAGE_SYSTEM_SETTINGS || 'MANAGE_USERS'), async (req, res, next) => {
  const { settings } = req.body; // Expects an array: [{ key: 'hospitalName', value: 'Al-Shifa' }, ...]
  
  if (!Array.isArray(settings)) {
    return res.status(400).json({ error: 'settings must be an array' });
  }

  try {
    const results = await prisma.$transaction(
      settings.map(s => 
        prisma.systemSetting.upsert({
          where: { key: s.key },
          update: { value: JSON.stringify(s.value), userId: req.user.id },
          create: { key: s.key, value: JSON.stringify(s.value), userId: req.user.id }
        })
      )
    );

    res.json({ message: 'تم تحديث إعدادات النظام بنجاح', results });
  } catch (err) { next(err); }
});

export default router;
