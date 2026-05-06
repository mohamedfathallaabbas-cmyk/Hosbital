import express from 'express';
import { prisma } from '../index.js';

const router = express.Router();

// GET: عرض التاريخ الطبي لمريض معين
router.get('/patient/:patientId', async (req, res) => {
  const { patientId } = req.params;
  
  try {
    const records = await prisma.medicalRecord.findMany({
      where: { appointment: { patientId: parseInt(patientId) } },
      include: {
        appointment: { include: { doctor: { include: { user: true, department: true } } } },
        prescriptions: { include: { items: { include: { medicine: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب التاريخ الطبي' });
  }
});

// POST: إضافة كشف طبي جديد وروشتة
router.post('/', async (req, res) => {
  const { appointmentId, complaint, diagnosis, treatmentPlan, notes, prescriptions } = req.body;
  
  try {
    // 1. إنشاء السجل الطبي (الكشف)
    const newRecord = await prisma.medicalRecord.create({
      data: {
        appointmentId: parseInt(appointmentId),
        complaint,
        diagnosis,
        treatmentPlan,
        notes
      }
    });

    // 2. تحديث حالة الموعد إلى COMPLETED (مكتمل)
    await prisma.appointment.update({
      where: { id: parseInt(appointmentId) },
      data: { status: 'COMPLETED' }
    });

    // 3. إنشاء الروشتة إذا قام الطبيب بكتابة أدوية
    if (prescriptions && prescriptions.length > 0) {
      const newPrescription = await prisma.prescription.create({
        data: {
          medicalRecordId: newRecord.id,
          status: 'PENDING' // في انتظار صرفها من الصيدلية
        }
      });

      // إضافة تفاصيل الأدوية للروشتة
      for (const item of prescriptions) {
        // التأكد من وجود الدواء في قاعدة البيانات، وإلا يتم إنشاؤه لتبسيط التجربة
        let medicine = await prisma.medicine.findFirst({ where: { name: item.name } });
        if (!medicine) {
          medicine = await prisma.medicine.create({
            data: { name: item.name, category: 'عام', price: 0 }
          });
        }

        await prisma.prescriptionItem.create({
          data: {
            prescriptionId: newPrescription.id,
            medicineId: medicine.id,
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration,
            quantity: 1
          }
        });
      }
    }

    res.status(201).json({ message: 'تم حفظ الكشف الطبي وإصدار الروشتة بنجاح', record: newRecord });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ أثناء حفظ السجل الطبي' });
  }
});

export default router;
