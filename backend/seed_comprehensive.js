import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seed...');
  const pass = await bcrypt.hash('123456', 10);

  // 1. إضافة الأقسام
  const dept1 = await prisma.department.upsert({ where: { name: 'الطوارئ' }, update: {}, create: { name: 'الطوارئ' } });
  const dept2 = await prisma.department.upsert({ where: { name: 'الباطنة' }, update: {}, create: { name: 'الباطنة' } });
  const dept3 = await prisma.department.upsert({ where: { name: 'الأطفال' }, update: {}, create: { name: 'الأطفال' } });

  // 2. إضافة الأطباء وربطهم بالأقسام
  const doc1 = await prisma.user.upsert({
    where: { email: 'doctor@alshifa.com' },
    update: {},
    create: {
      name: 'د. سارة العمري', email: 'doctor@alshifa.com', password: pass, role: 'DOCTOR', phone: '01011112222',
      doctorProfile: { create: { specialty: 'استشاري باطنة', consultFee: 350, departmentId: dept2.id } }
    }
  });

  const doc2 = await prisma.user.upsert({
    where: { email: 'ahmed.ped@alshifa.com' },
    update: {},
    create: {
      name: 'د. أحمد صبري', email: 'ahmed.ped@alshifa.com', password: pass, role: 'DOCTOR', phone: '01233334444',
      doctorProfile: { create: { specialty: 'أخصائي أطفال', consultFee: 250, departmentId: dept3.id } }
    }
  });

  // 3. إضافة مريض للتجارب
  const pat1 = await prisma.user.upsert({
    where: { email: 'patient@alshifa.com' },
    update: {},
    create: {
      name: 'أحمد محمد السيد', email: 'patient@alshifa.com', password: pass, role: 'PATIENT', phone: '01555556666',
      patientProfile: { create: { nationalId: '29001011234567', bloodType: 'O+', weight: 75, height: 175 } }
    }
  });

  // إضافة صيدلي
  const pharm = await prisma.user.upsert({
    where: { email: 'pharmacy@alshifa.com' },
    update: {},
    create: {
      name: 'د. يوسف الصيدلي', email: 'pharmacy@alshifa.com', password: pass, role: 'PHARMACIST', phone: '01000000000'
    }
  });

  // 4. إضافة أدوية للصيدلية
  await prisma.medicine.upsert({ where: { name: 'Panadol Advance 500mg' }, update: {}, create: { name: 'Panadol Advance 500mg', category: 'أقراص', stock: 150, price: 35.5 } });
  await prisma.medicine.upsert({ where: { name: 'Augmentin 1g' }, update: {}, create: { name: 'Augmentin 1g', category: 'أقراص', stock: 45, price: 120 } });
  await prisma.medicine.upsert({ where: { name: 'Amoxicillin 500mg' }, update: {}, create: { name: 'Amoxicillin 500mg', category: 'كبسولات', stock: 200, price: 45 } });
  await prisma.medicine.upsert({ where: { name: 'Brufen 400mg' }, update: {}, create: { name: 'Brufen 400mg', category: 'أقراص', stock: 80, price: 40 } });
  await prisma.medicine.upsert({ where: { name: 'Cataflam 50mg' }, update: {}, create: { name: 'Cataflam 50mg', category: 'أقراص', stock: 15, price: 65 } });
  await prisma.medicine.upsert({ where: { name: 'Concor 5mg' }, update: {}, create: { name: 'Concor 5mg', category: 'أقراص', stock: 5, price: 75 } });

  // 5. إضافة حجز مبدئي
  const patientRecord = await prisma.patient.findFirst();
  const doctorRecord = await prisma.doctor.findFirst();

  await prisma.appointment.create({
    data: {
      patientId: patientRecord.id,
      doctorId: doctorRecord.id,
      date: new Date(),
      timeSlot: '10:30 ص',
      type: 'كشف',
      status: 'SCHEDULED'
    }
  });

  console.log('🎉 Comprehensive Seeding completed successfully!');
}

main().finally(() => prisma.$disconnect());
