import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const pass = await bcrypt.hash('123456', 10);

  const missingUsers = [
    { name: 'نورا الخالدي', email: 'reception@alshifa.com', role: 'RECEPTION', phone: '01011122233' },
    { name: 'عمر الإدريسي', email: 'admin@alshifa.com', role: 'ADMIN', phone: '01122233344' },
    { name: 'خالد المنصور', email: 'manager@alshifa.com', role: 'MANAGER', phone: '01233344455' }
  ];

  for (const u of missingUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        password: pass,
        role: u.role,
        phone: u.phone
      }
    });
    console.log(`✅ Created missing user: ${u.email}`);
  }
}

main().finally(() => prisma.$disconnect());
