import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const firstNamesMale = ['أحمد', 'محمد', 'علي', 'عمر', 'خالد', 'محمود', 'مصطفى', 'يوسف', 'حسن', 'عبد الرحمن', 'سمير', 'كريم', 'هشام', 'سعيد', 'هاني', 'ممدوح', 'حسين', 'إبراهيم', 'طارق', 'ماجد', 'سليمان', 'شريف', 'عماد', 'وائل', 'جمال', 'أشرف', 'مساعد', 'عبد الله', 'سعد', 'فهد'];
const firstNamesFemale = ['نورا', 'ليلى', 'فاطمة', 'هدى', 'أميرة', 'نور', 'منى', 'سارة', 'شيماء', 'ياسمين', 'رنا', 'ريهام', 'دعاء', 'أمل', 'مروة', 'سلمى', 'هند', 'عبير', 'خلود', 'دينا', 'شروق', 'نهى', 'رانيا', 'غادة', 'بسمة', 'سما', 'نجلاء', 'مي', 'علا', 'رحاب'];
const familyNames = ['الشافعي', 'الخالدي', 'العتيبي', 'السيد', 'عبد السلام', 'الرشيدي', 'الدالي', 'مكاوي', 'جلال', 'سليم', 'عثمان', 'رضا', 'الحداد', 'منصور', 'صالح', 'زهران', 'شرف', 'الهواري', 'المصري', 'شحاتة', 'بسيوني', 'الجندي', 'العربي', 'أبو الفضل', 'عفيفي', 'فاروق', 'سليمان', 'الشرقاوي', 'عوض', 'طه'];

function generateName(isMale = true) {
  const first = isMale 
    ? firstNamesMale[Math.floor(Math.random() * firstNamesMale.length)] 
    : firstNamesFemale[Math.floor(Math.random() * firstNamesFemale.length)];
  const second = firstNamesMale[Math.floor(Math.random() * firstNamesMale.length)];
  const family = familyNames[Math.floor(Math.random() * familyNames.length)];
  return `${first} ${second} ${family}`;
}

async function main() {
  console.log('⏳ جاري مسح البيانات القديمة لضمان التهيئة النظيفة...');
  
  // Clean all tables in dependency order
  await prisma.radiologyRecord.deleteMany();
  await prisma.patientFile.deleteMany();
  await prisma.bloodDonation.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.salaryAdjustment.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.nurseNote.deleteMany();
  await prisma.triage.deleteMany();
  await prisma.prescriptionItem.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.medicalRecord.deleteMany();
  await prisma.labOrder.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.purchaseRequest.deleteMany();
  await prisma.payrollItem.deleteMany();
  await prisma.payroll.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.claim.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.admission.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.nursingAssignment.deleteMany();
  await prisma.user.deleteMany();
  await prisma.bed.deleteMany();
  await prisma.room.deleteMany();
  await prisma.ward.deleteMany();
  await prisma.medicine.deleteMany();
  await prisma.labTestCatalog.deleteMany();
  await prisma.department.deleteMany();

  console.log('⏳ جاري رفع بيانات مستشفى الشفاء الأساسية (البيانات الشاملة الضخمة)...');

  // Password '123456' hashed
  const passHash = '$2a$10$c0h6OjcnHiF0b1V3IZgJv.4ymKJNZG.JhIsJlKFBjsfMdP8yO1raG'; 

  // --- 1. Departments ---
  console.log('➡️ إضافة الأقسام...');
  const deptCardio = await prisma.department.create({ data: { name: 'قسم أمراض القلب', description: 'رعاية متكاملة لأمراض القلب والأوعية الدموية' }});
  const deptInternal = await prisma.department.create({ data: { name: 'قسم الباطنة العامة', description: 'رعاية الأمراض الباطنية والجهاز الهضمي' }});
  const deptPed = await prisma.department.create({ data: { name: 'قسم طب الأطفال', description: 'رعاية طبية متكاملة للأطفال والمواليد' }});
  const deptSurg = await prisma.department.create({ data: { name: 'قسم الجراحة العامة', description: 'العمليات الجراحية العامة والتخصصية' }});
  const deptOrtho = await prisma.department.create({ data: { name: 'قسم جراحة العظام', description: 'علاج الكسور وتشوهات العظام والمفاصل' }});
  const deptObgyn = await prisma.department.create({ data: { name: 'قسم النساء والتوليد', description: 'متابعة الحمل والرعاية الصحية للمرأة' }});
  const deptOphthal = await prisma.department.create({ data: { name: 'قسم طب العيون والرمد', description: 'فحص وعلاج أمراض العيون والبصريات' }});
  const deptEnt = await prisma.department.create({ data: { name: 'قسم الأنف والأذن والحنجرة', description: 'علاج مشاكل السمع والاتزان والأنف والبلعوم' }});
  const deptDerm = await prisma.department.create({ data: { name: 'قسم الأمراض الجلدية', description: 'علاج الأمراض الجلدية والليزر' }});
  const deptDent = await prisma.department.create({ data: { name: 'قسم طب الأسنان', description: 'رعاية وتجميل وصحة الفم والأسنان' }});
  const deptNeuro = await prisma.department.create({ data: { name: 'قسم المخ والأعصاب', description: 'تشخيص وعلاج أمراض الجهاز العصبي' }});
  const deptER = await prisma.department.create({ data: { name: 'قسم الطوارئ والحوادث', description: 'حالات الطوارئ والرعاية العاجلة 24 ساعة' }});
  const deptICU = await prisma.department.create({ data: { name: 'العناية المركزة', description: 'الحالات الحرجة وتوفير الرعاية المركزة' }});
  const departments = [deptCardio, deptInternal, deptPed, deptSurg, deptOrtho, deptObgyn, deptOphthal, deptEnt, deptDerm, deptDent, deptNeuro, deptER, deptICU];

  // --- 2. Wards, Rooms, Beds ---
  console.log('➡️ إضافة العنابر والأسرة...');
  const wardICU = await prisma.ward.create({ data: { departmentId: deptICU.id, name: 'عنبر العناية المركزة أ', type: 'ICU', capacity: 10 }});
  const roomICU1 = await prisma.room.create({ data: { wardId: wardICU.id, roomNumber: 'ICU-101', type: 'SINGLE', pricePerDay: 1500 }});
  const roomICU2 = await prisma.room.create({ data: { wardId: wardICU.id, roomNumber: 'ICU-102', type: 'SINGLE', pricePerDay: 1500 }});
  
  const beds = [];
  for (let i = 1; i <= 5; i++) {
    beds.push(await prisma.bed.create({ data: { roomId: roomICU1.id, bedNumber: `B-0${i}`, isOccupied: false }}));
    beds.push(await prisma.bed.create({ data: { roomId: roomICU2.id, bedNumber: `B-0${i + 5}`, isOccupied: false }}));
  }

  const wardPed = await prisma.ward.create({ data: { departmentId: deptPed.id, name: 'عنبر الأطفال', type: 'GENERAL', capacity: 10 }});
  const roomPed1 = await prisma.room.create({ data: { wardId: wardPed.id, roomNumber: 'PED-201', type: 'SHARED', pricePerDay: 300 }});
  for (let i = 1; i <= 10; i++) {
    beds.push(await prisma.bed.create({ data: { roomId: roomPed1.id, bedNumber: `P-0${i}`, isOccupied: false }}));
  }

  // --- 3. Medical Catalog (Medicines & Labs) ---
  console.log('➡️ إضافة الأدوية والتحاليل...');
  const medicines = [
    await prisma.medicine.create({ data: { name: 'Panadol Advance 500mg', category: 'مسكنات', price: 25.0, stock: 500 }}),
    await prisma.medicine.create({ data: { name: 'Augmentin 1g', category: 'مضادات حيوية', price: 90.0, stock: 50 }}),
    await prisma.medicine.create({ data: { name: 'Amoxicillin 500mg', category: 'مضادات حيوية', price: 40.0, stock: 10 }}), 
    await prisma.medicine.create({ data: { name: 'Concor 5mg', category: 'أدوية ضغط', price: 65.0, stock: 150 }}),
    await prisma.medicine.create({ data: { name: 'Voltaren 50mg', category: 'مسكنات', price: 35.0, stock: 100 }}),
    await prisma.medicine.create({ data: { name: 'Ventolin Inhaler', category: 'أدوية صدر', price: 85.0, stock: 80 }}),
    await prisma.medicine.create({ data: { name: 'Gliclazide 60mg', category: 'أدوية سكر', price: 55.0, stock: 120 }}),
    await prisma.medicine.create({ data: { name: 'Lipitor 20mg', category: 'دهون وكوليسترول', price: 110.0, stock: 90 }}),
    await prisma.medicine.create({ data: { name: 'Nexium 40mg', category: 'جهاز هضمي', price: 95.0, stock: 150 }}),
    await prisma.medicine.create({ data: { name: 'Cataflam 50mg', category: 'مسكنات', price: 30.0, stock: 200 }})
  ];
  
  const labTests = [
    await prisma.labTestCatalog.create({ data: { name: 'صورة دم كاملة (CBC)', type: 'LAB', cost: 150.0 }}),
    await prisma.labTestCatalog.create({ data: { name: 'تحليل سكر تراكمي (HbA1c)', type: 'LAB', cost: 120.0 }}),
    await prisma.labTestCatalog.create({ data: { name: 'أشعة سينية على الصدر (X-Ray)', type: 'RADIOLOGY', cost: 250.0 }}),
    await prisma.labTestCatalog.create({ data: { name: 'تحليل وظائف كبد (ALT, AST)', type: 'LAB', cost: 180.0 }}),
    await prisma.labTestCatalog.create({ data: { name: 'تحليل وظائف كلى (Urea, Creatinine)', type: 'LAB', cost: 160.0 }}),
    await prisma.labTestCatalog.create({ data: { name: 'رسم قلب كهربائي (ECG)', type: 'RADIOLOGY', cost: 200.0 }}),
    await prisma.labTestCatalog.create({ data: { name: 'أشعة رنين مغناطيسي (MRI)', type: 'RADIOLOGY', cost: 850.0 }}),
    await prisma.labTestCatalog.create({ data: { name: 'تحليل كوليسترول ودهون ثلاثية', type: 'LAB', cost: 140.0 }})
  ];

  // Helper arrays to collect generated IDs
  const allStaff = [];
  const allDoctors = [];
  const allNurses = [];
  const allPatients = [];

  // --- 4. ADMINS (At least 10) ---
  console.log('➡️ إنشاء المدراء (10)...');
  const userAdminMain = await prisma.user.create({ data: { email: 'admin@alshifa.com', password: passHash, name: 'عمر الإدريسي', role: 'ADMIN', phone: '01111111111' }});
  const staffAdminMain = await prisma.staff.create({ data: { userId: userAdminMain.id, category: 'ADMIN', jobTitle: 'مدير النظام', salary: 15000 }});
  allStaff.push(staffAdminMain);
  
  for (let i = 2; i <= 10; i++) {
    const email = `admin${i}@alshifa.com`;
    const name = generateName(Math.random() > 0.3);
    const u = await prisma.user.create({ data: { email, password: passHash, name, role: 'ADMIN', phone: `011100000${i}0` }});
    const s = await prisma.staff.create({ data: { userId: u.id, category: 'ADMIN', jobTitle: 'إداري نظام', salary: 8000 + i * 200 }});
    allStaff.push(s);
  }

  // --- 5. FINANCIAL MANAGERS (At least 10) ---
  console.log('➡️ إنشاء المدير المالي (10)...');
  const userFinMain = await prisma.user.create({ data: { email: 'finance@alshifa.com', password: passHash, name: 'طارق المالي', role: 'FINANCIAL_MANAGER', phone: '01111111112' }});
  const staffFinMain = await prisma.staff.create({ data: { userId: userFinMain.id, category: 'ADMIN', jobTitle: 'مدير مالي', salary: 12000 }});
  allStaff.push(staffFinMain);

  for (let i = 2; i <= 10; i++) {
    const email = `finance${i}@alshifa.com`;
    const name = generateName(Math.random() > 0.4);
    const u = await prisma.user.create({ data: { email, password: passHash, name, role: 'FINANCIAL_MANAGER', phone: `011200000${i}0` }});
    const s = await prisma.staff.create({ data: { userId: u.id, category: 'ADMIN', jobTitle: 'محاسب مالي', salary: 6000 + i * 150 }});
    allStaff.push(s);
  }

  // --- 6. RECEPTIONISTS (At least 10) ---
  console.log('➡️ إنشاء الاستقبال (10)...');
  const userRecMain = await prisma.user.create({ data: { email: 'reception@alshifa.com', password: passHash, name: 'نورا الخالدي', role: 'RECEPTION', phone: '01111111113' }});
  const staffRecMain = await prisma.staff.create({ data: { userId: userRecMain.id, category: 'ADMIN', jobTitle: 'موظف استقبال رئيسي', salary: 5000 }});
  allStaff.push(staffRecMain);

  for (let i = 2; i <= 10; i++) {
    const email = `reception${i}@alshifa.com`;
    const name = generateName(false); // Mostly female receptionists for variety
    const u = await prisma.user.create({ data: { email, password: passHash, name, role: 'RECEPTION', phone: `011300000${i}0` }});
    const s = await prisma.staff.create({ data: { userId: u.id, category: 'ADMIN', jobTitle: 'موظف استقبال', salary: 3500 + i * 100 }});
    allStaff.push(s);
  }

  // --- 7. PHARMACISTS (At least 10) ---
  console.log('➡️ إنشاء الصيادلة (10)...');
  const userPharMain = await prisma.user.create({ data: { email: 'pharmacist@alshifa.com', password: passHash, name: 'د. يوسف الصيدلي', role: 'PHARMACIST', phone: '01111111114' }});
  const staffPharMain = await prisma.staff.create({ data: { userId: userPharMain.id, category: 'MEDICAL', jobTitle: 'صيدلي أول', salary: 8000 }});
  allStaff.push(staffPharMain);

  for (let i = 2; i <= 10; i++) {
    const email = `pharmacist${i}@alshifa.com`;
    const name = generateName(Math.random() > 0.5);
    const u = await prisma.user.create({ data: { email, password: passHash, name, role: 'PHARMACIST', phone: `011400000${i}0` }});
    const s = await prisma.staff.create({ data: { userId: u.id, category: 'MEDICAL', jobTitle: 'صيدلي مساعد', salary: 5000 + i * 200 }});
    allStaff.push(s);
  }

  // --- 8. LAB TECHNICIANS (At least 10) ---
  console.log('➡️ إنشاء فنيي المختبر (10)...');
  const userLabMain = await prisma.user.create({ data: { email: 'lab@alshifa.com', password: passHash, name: 'ماجد المختبر', role: 'LAB_TECH', phone: '01111111115' }});
  const staffLabMain = await prisma.staff.create({ data: { userId: userLabMain.id, category: 'MEDICAL', jobTitle: 'فني تحاليل رئيسي', salary: 7000 }});
  allStaff.push(staffLabMain);

  for (let i = 2; i <= 10; i++) {
    const email = `lab${i}@alshifa.com`;
    const name = generateName(Math.random() > 0.5);
    const u = await prisma.user.create({ data: { email, password: passHash, name, role: 'LAB_TECH', phone: `011500000${i}0` }});
    const s = await prisma.staff.create({ data: { userId: u.id, category: 'MEDICAL', jobTitle: 'فني تحاليل مختص', salary: 4500 + i * 150 }});
    allStaff.push(s);
  }

  // --- 9. STAFF (At least 10) ---
  console.log('➡️ إنشاء الموظفين الإداريين (10)...');
  const userStaffMain = await prisma.user.create({ data: { email: 'staff@alshifa.com', password: passHash, name: 'سعيد عبد الرحمن', role: 'STAFF', phone: '01111111116' }});
  const staffNormalMain = await prisma.staff.create({ data: { userId: userStaffMain.id, category: 'GENERAL', jobTitle: 'موظف إداري رئيسي', salary: 4000 }});
  allStaff.push(staffNormalMain);

  for (let i = 2; i <= 10; i++) {
    const email = `staff${i}@alshifa.com`;
    const name = generateName(Math.random() > 0.5);
    const u = await prisma.user.create({ data: { email, password: passHash, name, role: 'STAFF', phone: `011600000${i}0` }});
    const s = await prisma.staff.create({ data: { userId: u.id, category: 'GENERAL', jobTitle: 'موظف سكرتارية', salary: 3000 + i * 100 }});
    allStaff.push(s);
  }

  // --- 10. DOCTORS (Explicitly covering all 13 departments with at least 2 doctors each) ---
  console.log('➡️ إنشاء الأطباء...');
  
  const doctorTemplates = [
    { email: 'magdy@alshifa.com', name: 'د. مجدي يعقوب', specialty: 'استشاري أمراض القلب والقسطرة', dept: deptCardio, fee: 600, clinic: 'C-201' },
    { email: 'doctor.cardio2@alshifa.com', name: 'د. خالد الرشيدي', specialty: 'أخصائي أمراض القلب والأوعية', dept: deptCardio, fee: 350, clinic: 'C-202' },
    { email: 'doctor@alshifa.com', name: 'د. سارة العمري', specialty: 'استشارية الأمراض الباطنية والجهاز الهضمي', dept: deptInternal, fee: 400, clinic: 'C-203' },
    { email: 'doctor.internal2@alshifa.com', name: 'د. علي الشافعي', specialty: 'أخصائي باطنة عامة وغدد صماء', dept: deptInternal, fee: 250, clinic: 'C-204' },
    { email: 'doctor.ped1@alshifa.com', name: 'د. فاطمة الجمال', specialty: 'استشارية طب الأطفال والمواليد', dept: deptPed, fee: 300, clinic: 'C-205' },
    { email: 'doctor.ped2@alshifa.com', name: 'د. ليلى السيد', specialty: 'أخصائية طب الأطفال وحديثي الولادة', dept: deptPed, fee: 200, clinic: 'C-206' },
    { email: 'doctor.surg1@alshifa.com', name: 'د. عمر منصور', specialty: 'استشاري الجراحة العامة والمناظير', dept: deptSurg, fee: 500, clinic: 'C-207' },
    { email: 'doctor.surg2@alshifa.com', name: 'د. طارق سليم', specialty: 'أخصائي جراحة عامة وجراحة سمنة', dept: deptSurg, fee: 300, clinic: 'C-208' },
    { email: 'doctor.ortho1@alshifa.com', name: 'د. محمد مكاوي', specialty: 'استشاري جراحة العظام والمفاصل', dept: deptOrtho, fee: 450, clinic: 'C-209' },
    { email: 'doctor.ortho2@alshifa.com', name: 'د. محمود جلال', specialty: 'أخصائي إصابات ملاعب وجراحة عظام', dept: deptOrtho, fee: 300, clinic: 'C-210' },
    { email: 'doctor.obgyn1@alshifa.com', name: 'د. ريم الحسيني', specialty: 'استشارية أمراض النساء والتوليد وعقم', dept: deptObgyn, fee: 500, clinic: 'C-211' },
    { email: 'doctor.obgyn2@alshifa.com', name: 'د. منى السيد', specialty: 'أخصائية أمراض النساء والتوليد ورعاية الحمل', dept: deptObgyn, fee: 300, clinic: 'C-212' },
    { email: 'doctor.eye1@alshifa.com', name: 'د. هشام زهران', specialty: 'استشاري طب وجراحة العيون والليزك', dept: deptOphthal, fee: 400, clinic: 'C-213' },
    { email: 'doctor.eye2@alshifa.com', name: 'د. ياسمين شرف', specialty: 'أخصائية طب وجراحة العيون', dept: deptOphthal, fee: 250, clinic: 'C-214' },
    { email: 'doctor.ent1@alshifa.com', name: 'د. شريف بسيوني', specialty: 'استشاري طب وجراحة الأنف والأذن والحنجرة', dept: deptEnt, fee: 350, clinic: 'C-215' },
    { email: 'doctor.ent2@alshifa.com', name: 'د. غادة الهواري', specialty: 'أخصائية جراحة الأنف والأذن والحنجرة', dept: deptEnt, fee: 200, clinic: 'C-216' },
    { email: 'doctor.derm1@alshifa.com', name: 'د. سعيد طه', specialty: 'استشاري الأمراض الجلدية والتجميل والليزر', dept: deptDerm, fee: 400, clinic: 'C-217' },
    { email: 'doctor.derm2@alshifa.com', name: 'د. ريهام الدالي', specialty: 'أخصائية الأمراض الجلدية والتجميل', dept: deptDerm, fee: 250, clinic: 'C-218' },
    { email: 'doctor.dent1@alshifa.com', name: 'د. ممدوح الحربي', specialty: 'أخصائي علاج الجذور وتجميل الأسنان', dept: deptDent, fee: 300, clinic: 'C-219' },
    { email: 'doctor.dent2@alshifa.com', name: 'د. دينا عثمان', specialty: 'طبيبة وجراحة الفم والأسنان', dept: deptDent, fee: 200, clinic: 'C-220' },
    { email: 'doctor.neuro1@alshifa.com', name: 'د. سليمان الحداد', specialty: 'استشاري أمراض المخ والأعصاب', dept: deptNeuro, fee: 500, clinic: 'C-221' },
    { email: 'doctor.neuro2@alshifa.com', name: 'د. سلمى الجندي', specialty: 'أخصائية أمراض مخ وأعصاب وباطنة أعصاب', dept: deptNeuro, fee: 300, clinic: 'C-222' },
    { email: 'doctor.er1@alshifa.com', name: 'د. وائل المصري', specialty: 'طبيب طوارئ وحوادث مناوب', dept: deptER, fee: 150, clinic: 'ER-1' },
    { email: 'doctor.er2@alshifa.com', name: 'د. دعاء شحاتة', specialty: 'طبيبة طوارئ ورعاية حرجة', dept: deptER, fee: 150, clinic: 'ER-2' },
    { email: 'doctor.icu1@alshifa.com', name: 'د. جمال شرف', specialty: 'استشاري عناية مركزة وتخدير', dept: deptICU, fee: 150, clinic: 'ICU-A' },
    { email: 'doctor.icu2@alshifa.com', name: 'د. عبير العربي', specialty: 'أخصائية رعاية مركزة وحالات حرجة', dept: deptICU, fee: 150, clinic: 'ICU-B' }
  ];

  for (let i = 0; i < doctorTemplates.length; i++) {
    const t = doctorTemplates[i];
    const u = await prisma.user.create({
      data: {
        email: t.email,
        password: passHash,
        name: t.name,
        role: 'DOCTOR',
        phone: `01230000${String(i).padStart(3, '0')}`
      }
    });

    const d = await prisma.doctor.create({
      data: {
        userId: u.id,
        departmentId: t.dept.id,
        specialty: t.specialty,
        consultFee: t.fee,
        clinicNumber: t.clinic
      }
    });

    await prisma.staff.create({
      data: {
        userId: u.id,
        category: 'MEDICAL',
        jobTitle: t.specialty.startsWith('استشاري') ? 'استشاري أول' : 'طبيب معالج',
        salary: 10000 + i * 500
      }
    });

    allDoctors.push(d);
  }

  // --- 11. NURSES (At least 10) ---
  console.log('➡️ إنشاء التمريض (10)...');
  const nurseUser1 = await prisma.user.create({ data: { email: 'nurse1@alshifa.com', password: passHash, name: 'فاطمة محمد', role: 'NURSE', phone: '01333333331' }});
  const nurseProfile1 = await prisma.staff.create({ data: { userId: nurseUser1.id, category: 'MEDICAL', jobTitle: 'ممرضة أولى', salary: 6000 }});
  allNurses.push(nurseProfile1);

  const nurseUser2 = await prisma.user.create({ data: { email: 'nurse2@alshifa.com', password: passHash, name: 'هدى سعيد', role: 'NURSE', phone: '01333333332' }});
  const nurseProfile2 = await prisma.staff.create({ data: { userId: nurseUser2.id, category: 'MEDICAL', jobTitle: 'ممرضة عناية مركزة', salary: 5500 }});
  allNurses.push(nurseProfile2);

  for (let i = 3; i <= 10; i++) {
    const email = `nurse${i}@alshifa.com`;
    const name = generateName(false); // Keep nurses mostly female for realistic balance
    const u = await prisma.user.create({ data: { email, password: passHash, name, role: 'NURSE', phone: `013300000${i}0` }});
    const s = await prisma.staff.create({ data: { userId: u.id, category: 'MEDICAL', jobTitle: 'ممرض مناوب', salary: 4000 + i * 150 }});
    allNurses.push(s);
  }

  // --- 12. PATIENTS (At least 30) ---
  console.log('➡️ إنشاء المرضى (30)...');
  const bloodTypes = ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'];
  const chronicList = ['السكري', 'الضغط', 'الربو', 'الكوليسترول', 'حساسية القمح', 'الغدة الدرقية', null];

  // Patients 1, 2, 3
  const userPat1 = await prisma.user.create({ data: { email: 'patient1@alshifa.com', password: passHash, name: 'محمود عبد السلام', role: 'PATIENT', phone: '01555555551' }});
  const pat1 = await prisma.patient.create({ data: { userId: userPat1.id, nationalId: '29001011234561', gender: 'ذكر', bloodType: 'O+', dateOfBirth: new Date('1990-05-15'), chronicDiseases: 'الضغط', weight: 80, height: 180, allergies: 'حساسية البنسلين' }});
  allPatients.push(pat1);

  const userPat2 = await prisma.user.create({ data: { email: 'patient2@alshifa.com', password: passHash, name: 'ليلى مصطفى', role: 'PATIENT', phone: '01555555552' }});
  const pat2 = await prisma.patient.create({ data: { userId: userPat2.id, nationalId: '29001011234562', gender: 'أنثى', bloodType: 'A-', dateOfBirth: new Date('2015-08-20'), weight: 35, height: 120 }});
  allPatients.push(pat2);

  const userPat3 = await prisma.user.create({ data: { email: 'patient3@alshifa.com', password: passHash, name: 'سمير جلال', role: 'PATIENT', phone: '01555555553' }});
  const pat3 = await prisma.patient.create({ data: { userId: userPat3.id, nationalId: '29001011234563', gender: 'ذكر', bloodType: 'B+', dateOfBirth: new Date('1975-01-10'), chronicDiseases: 'السكري', weight: 92, height: 172, allergies: 'حساسية الأسبرين' }});
  allPatients.push(pat3);

  // Patients 4 to 30
  for (let i = 4; i <= 30; i++) {
    const email = `patient${i}@alshifa.com`;
    const isMale = Math.random() > 0.5;
    const name = generateName(isMale);
    const bloodType = bloodTypes[i % bloodTypes.length];
    const chronicDiseases = chronicList[i % chronicList.length];
    const nationalId = `29${90 - i}01011234${50 + i}`;
    
    const u = await prisma.user.create({ data: { email, password: passHash, name, role: 'PATIENT', phone: `015500000${i}0` }});
    const p = await prisma.patient.create({ 
      data: { 
        userId: u.id, 
        nationalId, 
        gender: isMale ? 'ذكر' : 'أنثى', 
        bloodType, 
        dateOfBirth: new Date(1960 + i * 2, i % 12, (i * 3) % 28 + 1), 
        chronicDiseases,
        weight: 60 + i * 1,
        height: 155 + i * 0.8
      }
    });
    allPatients.push(p);
  }

  // --- 13. Appointments & Medical Records ---
  console.log('➡️ إضافة المواعيد والتشخيصات التفاعلية...');
  const apptTypes = ['CHECKUP', 'FOLLOWUP', 'EMERGENCY'];
  const timeSlots = ['08:00 ص', '09:00 ص', '10:00 ص', '11:00 ص', '12:00 م', '01:00 م', '02:00 م', '03:00 م', '04:00 م'];

  // Add 1 completed and 1 scheduled appointment for each patient to make database rich
  for (let i = 0; i < allPatients.length; i++) {
    const patient = allPatients[i];
    const doctor = allDoctors[i % allDoctors.length];
    
    // Past completed appointment
    const datePast = new Date();
    datePast.setDate(datePast.getDate() - (i % 7 + 1));
    const apptCompleted = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        date: datePast,
        timeSlot: timeSlots[i % timeSlots.length],
        status: 'COMPLETED',
        type: apptTypes[i % apptTypes.length]
      }
    });

    const triage = await prisma.triage.create({
      data: {
        appointmentId: apptCompleted.id,
        bloodPressure: `${110 + (i % 3) * 10}/${70 + (i % 3) * 5}`,
        heartRate: 70 + (i % 4) * 5,
        temperature: 36.6 + (i % 5) * 0.1
      }
    });

    const record = await prisma.medicalRecord.create({
      data: {
        appointmentId: apptCompleted.id,
        complaint: `يعاني من شكوى مستمرة رقم ${i + 1}`,
        diagnosis: `تشخيص حالة رقم ${i + 1}`,
        treatmentPlan: 'متابعة بانتظام مع أخذ الدواء والراحة',
        notes: 'حالة المريض تحتاج مراقبة مستمرة لأسلوب الحياة والغذاء.'
      }
    });

    // Create prescription with items
    const prescription = await prisma.prescription.create({ data: { medicalRecordId: record.id, status: i % 3 === 0 ? 'PENDING' : 'DISPENSED' }});
    const medIdx1 = i % medicines.length;
    const medIdx2 = (i + 2) % medicines.length;
    await prisma.prescriptionItem.create({
      data: {
        prescriptionId: prescription.id,
        medicineId: medicines[medIdx1].id,
        dosage: '1 حبة',
        frequency: 'مرتين يوميا',
        duration: '7 أيام',
        quantity: 1
      }
    });
    await prisma.prescriptionItem.create({
      data: {
        prescriptionId: prescription.id,
        medicineId: medicines[medIdx2].id,
        dosage: '1 حبة',
        frequency: 'مرة واحدة قبل النوم',
        duration: '14 يوم',
        quantity: 1
      }
    });

    // Add Lab Order
    const test = labTests[i % labTests.length];
    await prisma.labOrder.create({
      data: {
        doctorId: doctor.id,
        patientId: patient.id,
        testId: test.id,
        status: i % 2 === 0 ? 'COMPLETED' : 'PENDING',
        result: i % 2 === 0 ? `التحليل سليم ومؤشرات الـ ${test.name} ممتازة ولا تظهر أي شذوذ.` : null
      }
    });

    // Scheduled future appointment
    const dateFuture = new Date();
    dateFuture.setDate(dateFuture.getDate() + (i % 5 + 1));
    await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        date: dateFuture,
        timeSlot: timeSlots[(i + 3) % timeSlots.length],
        status: i % 5 === 0 ? 'WAITING' : 'SCHEDULED',
        type: 'FOLLOWUP'
      }
    });
  }

  // --- 14. Admissions & Nurse Notes ---
  console.log('➡️ إضافة المنومين والملاحظات التمريضية...');
  // Admit patients on first 5 beds
  for (let i = 0; i < 5; i++) {
    const patient = allPatients[i + 5]; // Choose patient 5 to 9
    const doctor = allDoctors[i % allDoctors.length];
    const nurse = allNurses[i % allNurses.length];
    const bed = beds[i];
    
    await prisma.bed.update({ where: { id: bed.id }, data: { isOccupied: true } });
    
    const admission = await prisma.admission.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        bedId: bed.id,
        reason: `متابعة ما بعد العملية ومراقبة الحالة الحرجة`,
        status: 'ADMITTED',
        admittedAt: new Date(new Date().setDate(new Date().getDate() - i))
      }
    });

    await prisma.nurseNote.create({
      data: {
        admissionId: admission.id,
        nurseId: nurse.id,
        content: `المريض في وعيه، العلامات الحيوية جيدة، تم إعطاء المحاليل بانتظام.`,
        vitalSigns: `BP: ${120 + i * 2}/${80 + i}, HR: ${70 + i * 3}, Temp: 36.8, SpO2: 98%`
      }
    });
  }

  // --- 15. Financials (Invoices, Payroll) ---
  console.log('➡️ إضافة المعاملات المالية (فواتير، رواتب)...');
  for (let i = 0; i < allPatients.length; i++) {
    const patient = allPatients[i];
    await prisma.invoice.create({
      data: {
        patientId: patient.id,
        totalAmount: 300.0 + i * 50,
        subtotal: 300.0 + i * 50,
        status: i % 2 === 0 ? 'PAID' : 'PENDING',
        dueDate: new Date(new Date().setDate(new Date().getDate() + 10))
      }
    });
  }

  // Create payroll for all staff
  for (let i = 0; i < allStaff.length; i++) {
    const staff = allStaff[i];
    await prisma.payroll.create({
      data: {
        employeeId: staff.id,
        month: 6,
        year: 2026,
        baseSalary: staff.salary,
        netSalary: staff.salary,
        paymentStatus: i % 3 === 0 ? 'PENDING' : 'PAID',
        paidAt: i % 3 === 0 ? null : new Date()
      }
    });
  }

  // --- 16. HR Requests ---
  console.log('➡️ إضافة طلبات الإجازات وطلبات الأدوية...');
  for (let i = 0; i < allNurses.length; i++) {
    const nurse = allNurses[i];
    await prisma.leaveRequest.create({
      data: {
        employeeId: nurse.id,
        leaveType: i % 2 === 0 ? 'ANNUAL' : 'SICK',
        startDate: new Date('2026-07-01'),
        endDate: new Date('2026-07-07'),
        reason: 'طلب إجازة دورية للراحة والاستجمام',
        status: i % 3 === 0 ? 'PENDING' : 'APPROVED',
        reviewedBy: i % 3 === 0 ? null : userAdminMain.id,
        reviewedAt: i % 3 === 0 ? null : new Date()
      }
    });
  }

  for (let i = 0; i < 5; i++) {
    const med = medicines[i % medicines.length];
    await prisma.purchaseRequest.create({
      data: {
        pharmacistId: userPharMain.id,
        medicineId: med.id,
        medicineName: med.name,
        quantity: 100 + i * 50,
        notes: `نقص شديد في مخزون ${med.name} في صيدلية المستشفى الرئيسية`,
        status: i % 2 === 0 ? 'APPROVED' : 'PENDING'
      }
    });
  }

  console.log('✅ تمت عملية الـ Seeding بنجاح! قاعدة البيانات جاهزة وممتلئة ببيانات حقيقية ضخمة لجميع الأدوار.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });