import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Adding Lab Technician user...');
  const pass = await bcrypt.hash('123456', 10);

  const labUser = await prisma.user.upsert({
    where: { email: 'lab@alshifa.com' },
    update: {},
    create: {
      name: 'م. حسام المعمل',
      email: 'lab@alshifa.com',
      password: pass,
      role: 'LAB',
      phone: '01022233344'
    }
  });

  console.log('✅ Lab Technician created: lab@alshifa.com');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
