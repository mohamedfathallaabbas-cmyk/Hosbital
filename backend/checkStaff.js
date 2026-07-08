import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const staff = await prisma.staff.findMany({
    include: { user: true }
  });
  console.log('Total staff in database:', staff.length);
  staff.forEach(s => {
    console.log(`ID: ${s.id}, Name: ${s.user?.name}, Role: ${s.user?.role}, Category: ${s.category}, JobTitle: ${s.jobTitle}`);
  });
  await prisma.$disconnect();
}

main();
