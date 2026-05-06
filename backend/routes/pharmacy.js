import express from 'express';
import { prisma } from '../index.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// GET: جلب جميع الروشتات (لصيدلية المستشفى)
router.get('/prescriptions', authenticate, async (req, res) => {
  const { status } = req.query;
  
  try {
    const prescriptions = await prisma.prescription.findMany({
      where: { ...(status && { status }) },
      include: {
        medicalRecord: {
          include: {
            appointment: {
              include: {
                patient: { include: { user: true } },
                doctor: { include: { user: true } }
              }
            }
          }
        },
        items: { include: { medicine: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(prescriptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ في جلب الروشتات' });
  }
});

// PATCH: صرف الروشتة + تخفيض المخزون
router.patch('/prescriptions/:id/dispense', authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    // 1. جلب الروشتة مع الأدوية
    const prescription = await prisma.prescription.findUnique({
      where: { id: parseInt(id) },
      include: { 
        items: { include: { medicine: true } },
        medicalRecord: { include: { appointment: true } }
      }
    });

    if (!prescription) return res.status(404).json({ error: 'الروشتة غير موجودة' });
    if (prescription.status === 'DISPENSED') return res.status(400).json({ error: 'تم صرف هذه الروشتة مسبقاً' });

    // 2. التحقق من توفر المخزون لكل دواء
    const stockErrors = [];
    for (const item of prescription.items) {
      if (item.medicine.stock < item.quantity) {
        stockErrors.push(`${item.medicine.name}: المتاح ${item.medicine.stock}، المطلوب ${item.quantity}`);
      }
    }
    if (stockErrors.length > 0) {
      return res.status(400).json({ error: 'مخزون غير كافٍ', details: stockErrors });
    }

    // 3. تنفيذ الصرف وتحديث المخزون وإضافة التكلفة للفاتورة
    await prisma.$transaction(async (tx) => {
      // أ. تحديث حالة الروشتة
      await tx.prescription.update({
        where: { id: parseInt(id) },
        data: { status: 'DISPENSED' }
      });

      // ب. تخفيض المخزون
      for (const item of prescription.items) {
        await tx.medicine.update({
          where: { id: item.medicineId },
          data: { stock: { decrement: item.quantity } }
        });
      }

      // ج. إضافة التكلفة للفاتورة المالية
      const appointment = prescription.medicalRecord.appointment;
      if (appointment && appointment.patientId) {
        let invoice = await tx.invoice.findFirst({
          where: { patientId: appointment.patientId, status: 'PENDING' },
          orderBy: { createdAt: 'desc' }
        });

        if (!invoice) {
          invoice = await tx.invoice.create({
            data: { patientId: appointment.patientId, totalAmount: 0, status: 'PENDING' }
          });
        }

        const totalMedsCost = prescription.items.reduce((sum, item) => sum + (item.medicine.price * item.quantity), 0);

        await tx.invoiceItem.create({
          data: {
            invoiceId: invoice.id,
            description: `أدوية روشتة رقم #${prescription.id}`,
            amount: totalMedsCost,
            quantity: 1
          }
        });

        await tx.invoice.update({
          where: { id: invoice.id },
          data: { totalAmount: { increment: totalMedsCost } }
        });
      }
    });

    res.json({ message: 'تم صرف الروشتة وتحديث المخزون بنجاح ✓' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ في صرف الروشتة' });
  }
});

// GET: جلب جرد الأدوية
router.get('/inventory', authenticate, async (req, res) => {
  try {
    const medicines = await prisma.medicine.findMany({ orderBy: { name: 'asc' } });
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب الأدوية' });
  }
});

export default router;

