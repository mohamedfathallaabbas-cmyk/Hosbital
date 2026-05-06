import express from 'express';
import { prisma } from '../index.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// GET: جلب جميع طلبات المعامل (لفني المعمل)
router.get('/orders', authenticate, async (req, res) => {
  try {
    const orders = await prisma.labOrder.findMany({
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
        test: true
      },
      orderBy: { orderedAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ في جلب طلبات المعامل' });
  }
});

// POST: إنشاء طلب معمل جديد (من قبل الطبيب)
router.post('/orders', authenticate, async (req, res) => {
  const { patientId, testId, notes } = req.body;
  const doctorId = req.user.doctorId;

  try {
    const newOrder = await prisma.labOrder.create({
      data: {
        patientId: parseInt(patientId),
        doctorId: parseInt(doctorId),
        testId: parseInt(testId),
        status: 'PENDING'
      },
      include: { test: true }
    });

    // إضافة تكلفة التحليل للفاتورة الحالية للمريض (أو إنشاء فاتورة جديدة إذا لم توجد)
    let invoice = await prisma.invoice.findFirst({
      where: { patientId: parseInt(patientId), status: 'PENDING' },
      orderBy: { createdAt: 'desc' }
    });

    if (!invoice) {
      invoice = await prisma.invoice.create({
        data: {
          patientId: parseInt(patientId),
          totalAmount: 0,
          status: 'PENDING'
        }
      });
    }

    await prisma.invoiceItem.create({
      data: {
        invoiceId: invoice.id,
        description: `تحليل/أشعة: ${newOrder.test.name}`,
        amount: newOrder.test.cost,
        quantity: 1
      }
    });

    // تحديث إجمالي الفاتورة
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { totalAmount: { increment: newOrder.test.cost } }
    });

    res.status(201).json({ message: 'تم إرسال طلب المعمل وإضافة الرسوم للفاتورة', order: newOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ في إنشاء طلب المعمل' });
  }
});

// PATCH: تحديث نتيجة التحليل (من قبل فني المعمل)
router.patch('/orders/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { result, status = 'COMPLETED' } = req.body;

  try {
    const updated = await prisma.labOrder.update({
      where: { id: parseInt(id) },
      data: { 
        result, 
        status,
        completedAt: new Date()
      }
    });
    res.json({ message: 'تم تحديث نتيجة التحليل بنجاح', order: updated });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في تحديث النتيجة' });
  }
});

// GET: جلب كتالوج التحاليل المتاحة
router.get('/catalog', async (req, res) => {
  try {
    const catalog = await prisma.labTestCatalog.findMany();
    res.json(catalog);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب كتالوج التحاليل' });
  }
});

export default router;
