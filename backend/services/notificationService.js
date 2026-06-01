import { prisma } from '../index.js';

/**
 * Creates a notification in the database and emits it via Socket.io if available.
 */
export async function sendNotification({ userId, title, message, type = 'INFO', link = null }) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        link
      }
    });

    // Emit via Socket.io if initialized and attached to global.io
    if (global.io) {
      global.io.to(`user_${userId}`).emit('notification', notification);
    }

    return notification;
  } catch (err) {
    console.error('[NotificationService] Failed to send notification:', err.message);
  }
}
