import express from 'express';
import { prisma } from '../index.js';
import { authenticate, requireRole } from '../middleware/auth.js';

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

// PATCH: صرف الروشتة + تخفيض المخزون بطريقة آمنة
router.patch('/prescriptions/:id/dispense', authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    const prescription = await prisma.prescription.findUnique({
      where: { id: parseInt(id) },
      include: { 
        items: { include: { medicine: true } },
        medicalRecord: { include: { appointment: true } }
      }
    });

    if (!prescription) return res.status(404).json({ error: 'الروشتة غير موجودة' });
    if (prescription.status === 'DISPENSED') return res.status(400).json({ error: 'تم صرف هذه الروشتة مسبقاً' });

    // تنفيذ الصرف وتحديث المخزون وإضافة التكلفة للفاتورة
    await prisma.$transaction(async (tx) => {
      // 1. تحديث حالة الروشتة
      await tx.prescription.update({
        where: { id: parseInt(id) },
        data: { status: 'DISPENSED' }
      });

      // 2. تخفيض المخزون للأدوية الموجودة بالصيدلية (Atomic and Safe)
      for (const item of prescription.items) {
        if (!item.medicineId) continue; // دواء غير مسجل بالصيدلية

        const updatedMedicine = await tx.medicine.updateMany({
          where: { 
            id: item.medicineId,
            stock: { gte: item.quantity } // يمنع النزول تحت الصفر
          },
          data: { stock: { decrement: item.quantity } }
        });

        if (updatedMedicine.count === 0) {
          throw new Error(`مخزون الدواء ${item.medicine?.name || item.medicineName} غير كافٍ`);
        }
      }

      // 3. إضافة التكلفة للفاتورة المالية
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

        const totalMedsCost = prescription.items.reduce((sum, item) => {
          if (item.medicineId && item.medicine) {
            return sum + (item.medicine.price * item.quantity);
          }
          return sum;
        }, 0);

        await tx.invoiceItem.create({
          data: {
            invoiceId: invoice.id,
            description: `أدوية روشتة رقم #${prescription.id}`,
            amount: totalMedsCost
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
    if (error.message.includes('غير كافٍ')) {
      return res.status(400).json({ error: error.message });
    }
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

// GET: جلب الأدوية التي وصلت للحد الأدنى من المخزون
router.get('/inventory/low-stock', authenticate, async (req, res) => {
  try {
    const lowStock = await prisma.medicine.findMany({
      where: { stock: { lt: 20 } },
      orderBy: { stock: 'asc' }
    });
    res.json(lowStock);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب بيانات المخزون المنخفض' });
  }
});

// POST: إضافة دواء جديد للمخزون
router.post('/inventory', authenticate, requireRole('ADMIN', 'PHARMACIST', 'MANAGER'), async (req, res) => {
  const { name, genericName, category, stock, price, expiryDate } = req.body;
  try {
    const newMed = await prisma.medicine.create({
      data: {
        name,
        genericName,
        category,
        stock: parseInt(stock),
        price: parseFloat(price),
        expiryDate: expiryDate ? new Date(expiryDate) : null
      }
    });
    res.status(201).json({ message: 'تمت إضافة الدواء بنجاح', medicine: newMed });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في إضافة الدواء' });
  }
});

// PATCH: تعديل بيانات دواء
router.patch('/inventory/:id', authenticate, requireRole('ADMIN', 'PHARMACIST', 'MANAGER'), async (req, res) => {
  const { id } = req.params;
  const { name, genericName, category, stock, price, expiryDate } = req.body;
  try {
    const updated = await prisma.medicine.update({
      where: { id: parseInt(id) },
      data: {
        name,
        genericName,
        category,
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(expiryDate !== undefined && { expiryDate: new Date(expiryDate) })
      }
    });
    res.json({ message: 'تم التعديل بنجاح', medicine: updated });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في تعديل الدواء' });
  }
});

export default router;
