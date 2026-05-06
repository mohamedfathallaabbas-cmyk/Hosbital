/**
 * seed_medicines.js
 * يجلب 2000 دواء حقيقي من FDA Open API ويضيفهم لقاعدة البيانات
 * التشغيل: node seed_medicines.js
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// تصنيف شكل الدواء للعربي
const mapDosageForm = (form) => {
  if (!form) return 'أقراص';
  const f = form.toUpperCase();
  if (f.includes('TABLET')) return 'أقراص';
  if (f.includes('CAPSULE')) return 'كبسولات';
  if (f.includes('SYRUP') || f.includes('SOLUTION') || f.includes('LIQUID')) return 'شراب';
  if (f.includes('INJECTION') || f.includes('INJECTABLE')) return 'حقن';
  if (f.includes('CREAM') || f.includes('GEL') || f.includes('OINTMENT')) return 'مراهم';
  if (f.includes('INHALER') || f.includes('AEROSOL')) return 'بخاخ';
  if (f.includes('SUSPENSION')) return 'معلق';
  if (f.includes('PATCH')) return 'لاصقة جلدية';
  if (f.includes('SUPPOSITORY')) return 'تحاميل';
  if (f.includes('DROP')) return 'قطرة';
  if (f.includes('POWDER')) return 'مسحوق';
  if (f.includes('FILM')) return 'أقراص مغلفة';
  return 'أقراص';
};

// توليد سعر عشوائي واقعي بالجنيه المصري
const randomPrice = () => {
  const tiers = [
    [20, 60],    // OTC رخيصة
    [60, 150],   // OTC متوسطة
    [150, 350],  // وصفة طبية
    [350, 800],  // أدوية متخصصة
    [800, 2500], // أدوية مزمنة ومتقدمة
  ];
  const tier = tiers[Math.floor(Math.random() * tiers.length)];
  const price = Math.random() * (tier[1] - tier[0]) + tier[0];
  return Math.round(price * 10) / 10;
};

// توليد كمية مخزون عشوائية
const randomStock = () => {
  const r = Math.random();
  if (r < 0.05) return 0;           // نافد 5%
  if (r < 0.15) return Math.floor(Math.random() * 9) + 1;   // قارب على النفاذ 10%
  return Math.floor(Math.random() * 490) + 10; // متاح 85%
};

// جلب دفعة من الأدوية بالـ skip
async function fetchBatch(skip, limit = 100) {
  const url = `https://api.fda.gov/drug/ndc.json?limit=${limit}&skip=${skip}&search=product_type:"HUMAN+PRESCRIPTION+DRUG"+OR+product_type:"HUMAN+OTC+DRUG"`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`FDA API error: ${res.status}`);
  }
  const data = await res.json();
  return data.results || [];
}

async function main() {
  console.log('🌱 بدء استيراد الأدوية من FDA Open API...');
  console.log('⏳ هذا قد يستغرق دقيقة أو دقيقتين...\n');

  let totalInserted = 0;
  let totalSkipped = 0;
  const batchSize = 100;
  const targetCount = 2000;
  const batches = Math.ceil(targetCount / batchSize); // 20 دفعة

  for (let i = 0; i < batches; i++) {
    const skip = i * batchSize;
    console.log(`📦 جلب الدفعة ${i + 1}/${batches} (سجلات ${skip} - ${skip + batchSize})...`);

    let results;
    try {
      results = await fetchBatch(skip, batchSize);
    } catch (err) {
      console.error(`  ❌ خطأ في الدفعة ${i + 1}:`, err.message);
      // محاولة أخرى بعد ثانية
      await new Promise(r => setTimeout(r, 1000));
      try {
        results = await fetchBatch(skip, batchSize);
      } catch (err2) {
        console.error(`  ❌ فشل مرة ثانية، تخطي هذه الدفعة`);
        continue;
      }
    }

    for (const drug of results) {
      const name = drug.brand_name || drug.generic_name;
      if (!name || name.length < 2 || name.length > 200) {
        totalSkipped++;
        continue;
      }

      const genericName = drug.generic_name || null;
      const category = mapDosageForm(drug.dosage_form);
      const price = randomPrice();
      const stock = randomStock();

      try {
        await prisma.medicine.upsert({
          where: { name: name.trim() },
          update: { genericName, category, price, stock },
          create: {
            name: name.trim(),
            genericName: genericName ? genericName.trim().substring(0, 255) : null,
            category,
            price,
            stock,
          }
        });
        totalInserted++;
      } catch (err) {
        // تجاهل التكرارات أو أسماء طويلة جداً
        totalSkipped++;
      }
    }

    // انتظار قصير بين الدفعات لتجنب rate limiting
    if (i < batches - 1) {
      await new Promise(r => setTimeout(r, 300));
    }
  }

  console.log('\n✅ اكتمل الاستيراد!');
  console.log(`📊 تم إضافة/تحديث: ${totalInserted} دواء`);
  console.log(`⏭️  تم تخطي: ${totalSkipped} سجل (تكرار أو بيانات ناقصة)`);

  // إحصائيات المخزون
  const lowStock = await prisma.medicine.count({ where: { stock: { lt: 10, gt: 0 } } });
  const outOfStock = await prisma.medicine.count({ where: { stock: 0 } });
  const total = await prisma.medicine.count();
  console.log(`\n📋 إجمالي الأدوية في قاعدة البيانات: ${total}`);
  console.log(`⚠️  قارب على النفاذ (أقل من 10): ${lowStock}`);
  console.log(`🔴 نفدت الكمية: ${outOfStock}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
