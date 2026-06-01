import express from 'express';
import { prisma } from '../index.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// ── GET / ──────────────────────────────────────────────────────────────────
// Fetch notifications for the logged-in user
router.get('/', async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    
    const unreadCount = await prisma.notification.count({
      where: { userId: req.user.id, isRead: false }
    });

    res.json({ data: notifications, unreadCount });
  } catch (err) { next(err); }
});

// ── PATCH /:id/read ────────────────────────────────────────────────────────
// Mark a specific notification as read
router.patch('/:id/read', async (req, res, next) => {
  try {
    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    
    if (!notification || notification.userId !== req.user.id) {
      return res.status(404).json({ error: 'إشعار غير موجود' });
    }

    const updated = await prisma.notification.update({
      where: { id: parseInt(req.params.id) },
      data: { isRead: true }
    });

    res.json(updated);
  } catch (err) { next(err); }
});

// ── PATCH /read-all ────────────────────────────────────────────────────────
// Mark all notifications as read
router.patch('/read-all', async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true }
    });

    res.json({ message: 'تم تحديد كل الإشعارات كمقروءة' });
  } catch (err) { next(err); }
});

export default router;
