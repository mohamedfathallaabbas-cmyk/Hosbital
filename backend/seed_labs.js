import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tests = [
    { name: 'صورة دم كاملة (CBC)', type: 'LAB', cost: 150 },
    { name: 'وظائف كبد (Liver Profile)', type: 'LAB', cost: 250 },
    { name: 'سكر صائم (Fasting Blood Sugar)', type: 'LAB', cost: 80 },
    { name: 'أشعة سينية على الصدر (Chest X-Ray)', type: 'RADIOLOGY', cost: 350 },
    { name: 'رنين مغناطيسي على المخ (MRI)', type: 'RADIOLOGY', cost: 1200 },
    { name: 'تحليل وظائف كلى (Kidney Function)', type: 'LAB', cost: 200 },
  ];

  try {
    await prisma.labOrder.deleteMany({});
    await prisma.labTestCatalog.deleteMany({});
    
    await prisma.labTestCatalog.createMany({
      data: tests
    });
    console.log('✅ Lab Catalog Seeded Successfully!');
  } catch (e) {
    console.error('❌ Error seeding labs:', e);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
