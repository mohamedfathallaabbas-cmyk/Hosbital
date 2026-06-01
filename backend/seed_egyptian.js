import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const EGYPTIAN_NAMES = [
  'محمد أحمد علي', 'محمود إبراهيم حسن', 'أحمد محمود عباس', 'مصطفى كمال الدين', 'علي زين العابدين',
  'زكريا يحيى فؤاد', 'ياسين طه حسين', 'إبراهيم السيد البدوي', 'حسن الشاذلي الجمل', 'عمر كمال الشناوي',
  'سارة محمود عبد الرحمن', 'زينب علي الشريف', 'مريم إبراهيم سالم', 'فاطمة الزهراء حسن', 'هدى محمد رشدي',
  'ليلى عبد الله مرسي', 'نورا السيد كامل', 'آية مصطفى خليل', 'دعاء يحيى سعيد', 'منى محمود الجيار'
];

async function main() {
  console.log('🌱 Starting Egyptian Data Seed...');
  const pass = await bcrypt.hash('123456', 10);

  // 1. جلب دكتور وقسم للطوارئ والباطنة للتجارب
  const deptB = await prisma.department.findFirst({ where: { name: 'الباطنة' } });
  const docB = await prisma.doctor.findFirst({ where: { departmentId: deptB?.id } });

  for (let i = 0; i < EGYPTIAN_NAMES.length; i++) {
    const name = EGYPTIAN_NAMES[i];
    const email = `patient${i + 10}@alshifa.com`;
    const phone = `01${Math.floor(Math.random() * 2)} ${Math.floor(Math.random() * 89999999 + 10000000)}`;
    const nationalId = `2${Math.floor(Math.random() * 9)}0${Math.floor(Math.random() * 12 + 1)}0${Math.floor(Math.random() * 28 + 1)}${Math.floor(Math.random() * 89999 + 10000)}`;

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        name,
        email,
        password: pass,
        role: 'PATIENT',
        phone,
        patientProfile: {
          create: {
            nationalId,
            bloodType: ['A+', 'O+', 'B+', 'AB+'][Math.floor(Math.random() * 4)],
            weight: Math.floor(Math.random() * 50 + 50),
            height: Math.floor(Math.random() * 40 + 150)
          }
        }
      },
      include: { patientProfile: true }
    });

    // إضافة حجز لكل مريض (بعضهم قيد المراجعة وبعضهم في الانتظار)
    if (docB && user.patientProfile) {
      await prisma.appointment.create({
        data: {
          patientId: user.patientProfile.id,
          doctorId: docB.id,
          date: new Date(),
          timeSlot: `${Math.floor(Math.random() * 8 + 8)}:00 ص`,
          type: i % 3 === 0 ? 'FOLLOWUP' : 'CHECKUP',
          status: i % 4 === 0 ? 'SCHEDULED' : i % 4 === 1 ? 'WAITING' : i % 4 === 2 ? 'COMPLETED' : 'CANCELLED'
        }
      });
      
      // للمكتملين، نضيف سجل طبي
      if (i % 4 === 2) {
        const appt = await prisma.appointment.findFirst({
           where: { patientId: user.patientProfile.id, status: 'COMPLETED' }
        });
        if (appt) {
          await prisma.medicalRecord.create({
            data: {
              appointmentId: appt.id,
              complaint: 'صداع مستمر وآلام في المعدة',
              diagnosis: 'التهاب بسيط في جدار المعدة نتيجة سوء تغذية',
              treatmentPlan: 'تنظيم الوجبات + أدوية مضادة للحموضة',
              notes: 'يحتاج مراجعة بعد اسبوعين'
            }
          });
        }
      }
    }
  }

  console.log(`✅ Successfully seeded ${EGYPTIAN_NAMES.length} Egyptian patients with appointments.`);
}

main().finally(() => prisma.$disconnect());
