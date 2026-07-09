import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Master Seeding for Al-Shifa Hospital...');

  // 1. مسح البيانات السابقة (لضمان بيئة نظيفة)
  console.log('🧹 Clearing old data...');
  await prisma.$transaction([
    prisma.leaveRequest.deleteMany(),
    prisma.purchaseRequest.deleteMany(),
    prisma.auditLog.deleteMany(),
    prisma.article.deleteMany(),
    prisma.salaryAdjustment.deleteMany(),
    prisma.payrollItem.deleteMany(),
    prisma.payroll.deleteMany(),
    prisma.attendance.deleteMany(),
    prisma.radiologyRecord.deleteMany(),
    prisma.bloodDonation.deleteMany(),
    prisma.patientFile.deleteMany(),
    prisma.nursingAssignment.deleteMany(),
    prisma.nurseNote.deleteMany(),
    prisma.admission.deleteMany(),
    prisma.bed.deleteMany(),
    prisma.room.deleteMany(),
    prisma.ward.deleteMany(),
    prisma.claim.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.invoiceItem.deleteMany(),
    prisma.invoice.deleteMany(),
    prisma.insurancePolicy.deleteMany(),
    prisma.insuranceClass.deleteMany(),
    prisma.insuranceCompany.deleteMany(),
    prisma.prescriptionItem.deleteMany(),
    prisma.prescription.deleteMany(),
    prisma.medicalRecord.deleteMany(),
    prisma.triage.deleteMany(),
    prisma.appointment.deleteMany(),
    prisma.labOrder.deleteMany(),
    prisma.labTestCatalog.deleteMany(),
    prisma.patient.deleteMany(),
    prisma.doctor.deleteMany(),
    prisma.staff.deleteMany(),
    prisma.department.deleteMany(),
    prisma.medicine.deleteMany(),
    prisma.user.deleteMany()
  ]);

  // 2. إنشاء الأقسام
  console.log('🏢 Creating Departments...');
  const departmentsData = [
    { name: 'الباطنة العامة', description: 'تشخيص وعلاج الأمراض الباطنية' },
    { name: 'الجراحة العامة', description: 'العمليات الجراحية العامة' },
    { name: 'طب الأطفال', description: 'رعاية صحة الأطفال' },
    { name: 'القلب والأوعية الدموية', description: 'أمراض وجراحات القلب' },
    { name: 'النساء والتوليد', description: 'رعاية الحوامل وأمراض النساء' },
    { name: 'جراحة العظام', description: 'أمراض وجراحات العظام والمفاصل' },
    { name: 'الأمراض الجلدية', description: 'علاج الأمراض الجلدية والتناسلية' },
    { name: 'العيون', description: 'أمراض وجراحات العيون' },
    { name: 'الأنف والأذن والحنجرة', description: 'جراحات الأنف والأذن' },
    { name: 'الطوارئ', description: 'استقبال الحالات الحرجة 24/7' },
    { name: 'الأمراض النفسية', description: 'العلاج النفسي والعصبي' },
    { name: 'الغسيل الكلوي', description: 'وحدة الكلى الصناعية' }
  ];

  const depts = {};
  for (const dept of departmentsData) {
    depts[dept.name] = await prisma.department.create({ data: dept });
  }

  // 3. إنشاء الحسابات النظامية (System Accounts) والموظفين
  console.log('👥 Creating Staff & Users...');
  const defaultPassword = await bcrypt.hash('123456', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'أحمد الإداري (مدير النظام)', email: 'admin@alshifa.com', phone: '01011112222', role: 'ADMIN', password: defaultPassword,
      staffProfile: { create: { category: 'ADMIN_STAFF', jobTitle: 'مدير نظام تقنية المعلومات', shift: 'صباحي', salary: 15000, nationalId: '29001011234567' } }
    }
  });

  const manager = await prisma.user.create({
    data: {
      name: 'د. خالد المستشفى (مدير المستشفى)', email: 'manager@alshifa.com', phone: '01122223333', role: 'MANAGER', password: defaultPassword,
      staffProfile: { create: { category: 'ADMIN_STAFF', jobTitle: 'مدير عام المستشفى', shift: 'صباحي', salary: 30000, nationalId: '28002021234567' } }
    }
  });

  const finManager = await prisma.user.create({
    data: {
      name: 'محمود المالي (المدير المالي)', email: 'finance@alshifa.com', phone: '01233334444', role: 'FINANCIAL_MANAGER', password: defaultPassword,
      staffProfile: { create: { category: 'ADMIN_STAFF', jobTitle: 'المدير المالي', shift: 'صباحي', salary: 20000, nationalId: '28503031234567' } }
    }
  });

  const opsManager = await prisma.user.create({
    data: {
      name: 'سعيد التشغيل (مدير التشغيل)', email: 'operations@alshifa.com', phone: '01544445555', role: 'OPERATIONS_MANAGER', password: defaultPassword,
      staffProfile: { create: { category: 'ADMIN_STAFF', jobTitle: 'مدير التشغيل', shift: 'صباحي', salary: 18000, nationalId: '28804041234567' } }
    }
  });

  const reception1 = await prisma.user.create({
    data: {
      name: 'منى الاستقبال', email: 'reception1@alshifa.com', phone: '01055556666', role: 'RECEPTION', password: defaultPassword,
      staffProfile: { create: { category: 'ADMIN_STAFF', jobTitle: 'موظف استقبال', shift: 'صباحي', salary: 6000, nationalId: '29505051234567' } }
    }
  });

  const pharmacist = await prisma.user.create({
    data: {
      name: 'د. يوسف الصيدلي', email: 'pharmacist@alshifa.com', phone: '01166667777', role: 'PHARMACIST', password: defaultPassword,
      staffProfile: { create: { category: 'MEDICAL', jobTitle: 'صيدلي', shift: 'مسائي', salary: 9000, nationalId: '29206061234567' } }
    }
  });

  const labTech = await prisma.user.create({
    data: {
      name: 'أسامة فني المعمل', email: 'lab@alshifa.com', phone: '01277778888', role: 'LAB_TECH', password: defaultPassword,
      staffProfile: { create: { category: 'MEDICAL', jobTitle: 'فني معمل', shift: 'صباحي', salary: 7000, nationalId: '29007071234567' } }
    }
  });

  const nursesData = [
    { name: 'فاطمة ممرضة الباطنة', email: 'nurse1@alshifa.com', phone: '01088889999', shift: 'صباحي', id: '29108081234567' },
    { name: 'سعاد ممرضة العناية', email: 'nurse2@alshifa.com', phone: '01199990000', shift: 'مسائي', id: '28509091234567' },
    { name: 'حنان ممرضة الجراحة', email: 'nurse3@alshifa.com', phone: '01200001111', shift: 'ليلي', id: '29010101234567' },
    { name: 'سمر ممرضة طوارئ', email: 'nurse4@alshifa.com', phone: '01511112222', shift: 'صباحي', id: '29311111234567' },
    { name: 'زينب ممرضة أطفال', email: 'nurse5@alshifa.com', phone: '01022223333', shift: 'مسائي', id: '28812121234567' }
  ];

  const nurses = [];
  for (const n of nursesData) {
    const user = await prisma.user.create({
      data: {
        name: n.name, email: n.email, phone: n.phone, role: 'NURSE', password: defaultPassword,
        staffProfile: { create: { category: 'MEDICAL', jobTitle: 'ممرض', shift: n.shift, salary: 6500, nationalId: n.id } }
      },
      include: { staffProfile: true }
    });
    nurses.push(user);
  }

  // 4. إنشاء الأطباء (25 طبيب مصري)
  console.log('🩺 Creating Doctors...');
  const doctorsList = [
    { name: 'د. مجدي يعقوب', email: 'magdy@alshifa.com', dept: 'القلب والأوعية الدموية', spec: 'جراح قلب', fee: 500, num: 'A101' },
    { name: 'د. حسام موافي', email: 'hossam@alshifa.com', dept: 'الباطنة العامة', spec: 'استشاري باطنة', fee: 400, num: 'B201' },
    { name: 'د. هبة قطب', email: 'heba@alshifa.com', dept: 'الأمراض النفسية', spec: 'استشاري نفسي', fee: 350, num: 'C301' },
    { name: 'د. محمد أبو الغيط', email: 'aboelgheit@alshifa.com', dept: 'الجراحة العامة', spec: 'استشاري جراحة', fee: 450, num: 'D401' },
    { name: 'د. رشا النجار', email: 'rasha@alshifa.com', dept: 'طب الأطفال', spec: 'أخصائي أطفال', fee: 300, num: 'E501' },
    { name: 'د. عمرو حسن', email: 'amr@alshifa.com', dept: 'النساء والتوليد', spec: 'استشاري نساء', fee: 350, num: 'F601' },
    { name: 'د. ياسر البطراوي', email: 'yasser@alshifa.com', dept: 'جراحة العظام', spec: 'جراح عظام', fee: 400, num: 'G701' },
    { name: 'د. عاصم فرج', email: 'asem@alshifa.com', dept: 'الأمراض الجلدية', spec: 'استشاري جلدية', fee: 300, num: 'H801' },
    { name: 'د. محمد حازم', email: 'hazem@alshifa.com', dept: 'العيون', spec: 'استشاري رمد', fee: 350, num: 'I901' },
    { name: 'د. طارق السعيد', email: 'tarek@alshifa.com', dept: 'الأنف والأذن والحنجرة', spec: 'أخصائي أنف وأذن', fee: 300, num: 'J001' },
    // إضافة أطباء للطوارئ
    { name: 'د. محمود صقر', email: 'sakr@alshifa.com', dept: 'الطوارئ', spec: 'طبيب طوارئ', fee: 200, num: 'ER1' },
    { name: 'د. أحمد الجزار', email: 'gazzar@alshifa.com', dept: 'الطوارئ', spec: 'طبيب طوارئ', fee: 200, num: 'ER2' }
  ];

  const docs = {};
  for (const d of doctorsList) {
    const user = await prisma.user.create({
      data: {
        name: d.name, email: d.email, phone: `01${Math.floor(Math.random() * 1000000000)}`, role: 'DOCTOR', password: defaultPassword,
        doctorProfile: { create: { specialty: d.spec, consultFee: d.fee, clinicNumber: d.num, departmentId: depts[d.dept].id } }
      },
      include: { doctorProfile: true }
    });
    docs[d.name] = user;
  }

  // 5. الأجنحة والأسرة
  console.log('🛏️ Creating Wards and Beds...');
  const erWard = await prisma.ward.create({ data: { name: 'جناح الطوارئ', type: 'طوارئ', capacity: 10, departmentId: depts['الطوارئ'].id } });
  const icuWard = await prisma.ward.create({ data: { name: 'العناية المركزة', type: 'عناية مركزة', capacity: 8, departmentId: depts['القلب والأوعية الدموية'].id } });
  const internalWard = await prisma.ward.create({ data: { name: 'جناح الباطنة', type: 'عام', capacity: 20, departmentId: depts['الباطنة العامة'].id } });
  const surgeryWard = await prisma.ward.create({ data: { name: 'جناح الجراحة', type: 'عام', capacity: 15, departmentId: depts['الجراحة العامة'].id } });

  const wardsList = [
    { ward: erWard, rooms: 5, bedsPerRoom: 2, price: 500, type: 'مشترك' },
    { ward: icuWard, rooms: 8, bedsPerRoom: 1, price: 2000, type: 'خاص' },
    { ward: internalWard, rooms: 10, bedsPerRoom: 2, price: 800, type: 'مشترك' },
    { ward: surgeryWard, rooms: 15, bedsPerRoom: 1, price: 1200, type: 'خاص' }
  ];

  const allBeds = [];
  for (const w of wardsList) {
    for (let r = 1; r <= w.rooms; r++) {
      const room = await prisma.room.create({
        data: { wardId: w.ward.id, roomNumber: `${w.ward.id}0${r}`, type: w.type, pricePerDay: w.price }
      });
      for (let b = 1; b <= w.bedsPerRoom; b++) {
        const bed = await prisma.bed.create({
          data: { roomId: room.id, bedNumber: `${room.roomNumber}-${b}`, isOccupied: false }
        });
        allBeds.push(bed);
      }
    }
  }

  // 6. شركات التأمين
  console.log('🛡️ Creating Insurance Companies...');
  const insuranceCos = [];
  const comp1 = await prisma.insuranceCompany.create({ data: { name: 'بوبا مصر (Bupa)', email: 'info@bupa.com.eg', phone: '16816' } });
  const comp2 = await prisma.insuranceCompany.create({ data: { name: 'أليانز مصر (Allianz)', email: 'contact@allianz.com.eg', phone: '19909' } });
  const comp3 = await prisma.insuranceCompany.create({ data: { name: 'مصر للتأمين', email: 'support@misr.com.eg', phone: '19114' } });
  insuranceCos.push(comp1, comp2, comp3);

  // Create default classes for Bupa, Allianz and Misr
  for (const comp of insuranceCos) {
    await prisma.insuranceClass.create({
      data: {
        companyId: comp.id,
        name: 'الفئة الذهبية (Gold)',
        defaultCoverage: 90.0,
        consultationCov: 95.0,
        labCoverage: 90.0,
        radCoverage: 90.0,
        pharmacyCoverage: 80.0,
        maxAnnualLimit: 50000.0
      }
    });
    await prisma.insuranceClass.create({
      data: {
        companyId: comp.id,
        name: 'الفئة الفضية (Silver)',
        defaultCoverage: 80.0,
        consultationCov: 80.0,
        labCoverage: 80.0,
        radCoverage: 80.0,
        pharmacyCoverage: 70.0,
        maxAnnualLimit: 25000.0
      }
    });
  }

  // 7. الأدوية (كتالوج مصري)
  console.log('💊 Creating Medicines...');
  const medsData = [
    { name: 'Panadol Extra 500mg', genericName: 'Paracetamol + Caffeine', category: 'أقراص', stock: 500, price: 30 },
    { name: 'Augmentin 1g', genericName: 'Amoxicillin + Clavulanic Acid', category: 'أقراص', stock: 200, price: 110 },
    { name: 'Congestal', genericName: 'Paracetamol + Chlorpheniramine', category: 'أقراص', stock: 300, price: 25 },
    { name: 'Brufen 400mg', genericName: 'Ibuprofen', category: 'أقراص', stock: 450, price: 40 },
    { name: 'Zithromax 500mg', genericName: 'Azithromycin', category: 'كبسول', stock: 150, price: 85 },
    { name: 'Amaryl 2mg', genericName: 'Glimepiride', category: 'أقراص', stock: 250, price: 45 },
    { name: 'Concor 5mg', genericName: 'Bisoprolol', category: 'أقراص', stock: 350, price: 55 },
    { name: 'Eltroxin 50mcg', genericName: 'Levothyroxine', category: 'أقراص', stock: 100, price: 40 },
    { name: 'Ketofan 50mg', genericName: 'Ketoprofen', category: 'كبسول', stock: 400, price: 20 },
    { name: 'Motilium 10mg', genericName: 'Domperidone', category: 'أقراص', stock: 200, price: 35 }
  ];
  for (const med of medsData) {
    await prisma.medicine.create({ data: med });
  }

  // 8. كتالوج التحاليل
  console.log('🧪 Creating Lab Tests...');
  const testsData = [
    { name: 'صورة دم كاملة (CBC)', type: 'دم', cost: 150 },
    { name: 'سكر صائم (FBS)', type: 'دم', cost: 70 },
    { name: 'وظائف كلى (Creatinine & Urea)', type: 'دم', cost: 200 },
    { name: 'وظائف كبد (ALT, AST)', type: 'دم', cost: 180 },
    { name: 'تحليل بول كامل', type: 'بول', cost: 60 },
    { name: 'أشعة عادية على الصدر', type: 'أشعة', cost: 250 }
  ];
  const allTests = [];
  for (const t of testsData) {
    allTests.push(await prisma.labTestCatalog.create({ data: t }));
  }

  // 9. المرضى (50 مريض)
  console.log('🧑‍🤝‍🧑 Creating 50 Patients...');
  const firstNames = ['أحمد', 'محمد', 'محمود', 'علي', 'مصطفى', 'إبراهيم', 'فاطمة', 'عائشة', 'خديجة', 'مريم', 'زينب', 'سارة', 'عمر', 'حسن', 'حسين'];
  const lastNames = ['النجار', 'الحداد', 'المصري', 'إسماعيل', 'توفيق', 'عبدالله', 'عثمان', 'سليمان', 'يوسف', 'حسن'];
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  
  const patientsList = [];
  for (let i = 1; i <= 50; i++) {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    const gender = ['فاطمة', 'عائشة', 'خديجة', 'مريم', 'زينب', 'سارة'].includes(fn) ? 'أنثى' : 'ذكر';
    
    const user = await prisma.user.create({
      data: {
        name: `${fn} ${ln}`,
        email: `patient${i}@alshifa.com`,
        phone: `01${Math.floor(Math.random() * 1000000000)}`,
        password: defaultPassword,
        role: 'PATIENT',
        patientProfile: {
          create: {
            nationalId: `2${Math.floor(Math.random() * 9000000000000)}`,
            dateOfBirth: new Date(1960 + Math.random() * 50, 1, 1),
            gender,
            bloodType: bloodTypes[Math.floor(Math.random() * bloodTypes.length)]
          }
        }
      },
      include: { patientProfile: true }
    });
    patientsList.push(user.patientProfile);

    // ربط بعض المرضى بوثائق تأمين (30%)
    if (Math.random() > 0.7) {
      const company = insuranceCos[Math.floor(Math.random() * insuranceCos.length)];
      const classes = await prisma.insuranceClass.findMany({ where: { companyId: company.id } });
      const cls = classes[Math.floor(Math.random() * classes.length)];
      await prisma.insurancePolicy.create({
        data: {
          patientId: user.patientProfile.id,
          companyId: company.id,
          classId: cls?.id || null,
          policyNumber: `POL-${Math.floor(Math.random() * 100000)}`,
          coveragePct: cls ? cls.defaultCoverage : 80.0,
          expiryDate: new Date(2027, 1, 1)
        }
      });
    }
  }

  // 10. التنويم وتعيينات التمريض (15 مريض منوّم)
  console.log('🏥 Admitting Patients & Assigning Nurses...');
  const admittedPatients = patientsList.slice(0, 15);
  for (let i = 0; i < admittedPatients.length; i++) {
    const p = admittedPatients[i];
    const bed = allBeds[i];
    const doc = docs[Object.keys(docs)[Math.floor(Math.random() * Object.keys(docs).length)]].doctorProfile;
    
    // تنويم المريض
    await prisma.bed.update({ where: { id: bed.id }, data: { isOccupied: true } });
    const adm = await prisma.admission.create({
      data: {
        patientId: p.id,
        doctorId: doc.id,
        bedId: bed.id,
        reason: 'ملاحظة وحالة مستقرة',
        status: 'ADMITTED'
      }
    });

    // تعيين ممرضة للسرير
    const nurse = nurses[Math.floor(Math.random() * nurses.length)].staffProfile;
    await prisma.nursingAssignment.create({
      data: {
        nurseId: nurse.id,
        bedId: bed.id,
        shift: nurse.shift
      }
    });

    // إضافة ملاحظة تمريضية
    await prisma.nurseNote.create({
      data: {
        admissionId: adm.id,
        nurseId: nurse.id,
        content: 'المريض مستقر وتم إعطاء الأدوية بانتظام.',
        vitalSigns: 'BP: 120/80, HR: 75, Temp: 37.1'
      }
    });
  }

  console.log('✅ Master Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
