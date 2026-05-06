import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');
  
  // التشفير الموحد لكلمة المرور الافتراضية (123456)
  const defaultPassword = await bcrypt.hash('123456', 10);

  // بيانات المستخدمين الافتراضية التي كانت بالفرونت إند
  const users = [
    { name: 'أحمد محمد السيد', email: 'patient@alshifa.com', role: 'patient' },
    { name: 'د. سارة العمري', email: 'doctor@alshifa.com', role: 'doctor' },
    { name: 'نورا الخالدي', email: 'reception@alshifa.com', role: 'reception' },
    { name: 'عمر الإدريسي', email: 'admin@alshifa.com', role: 'admin' },
    { name: 'خالد المنصور', email: 'manager@alshifa.com', role: 'manager' }
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        password: defaultPassword,
        role: u.role
      }
    });
    console.log(`✅ Created user: ${u.email} (${u.role})`);
  }

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
