export const EGYPTIAN_DOCTORS = [
  { id: 1, name: 'د. أحمد محمود عبدالعزيز', specialty: 'قلب وأوعية دموية', clinic: 'عيادة 5', phone: '01001234567', email: 'a.mahmoud@shifaa.eg', experience: 18, patients: 1420, status: 'active', license: 'EG-HEA-2341', address: 'مدينة نصر، القاهرة', schedule: 'الأحد - الثلاثاء - الخميس', fee: 500 },
  { id: 2, name: 'د. سارة خالد الشافعي', specialty: 'أعصاب', clinic: 'عيادة 3', phone: '01112345678', email: 's.khalid@shifaa.eg', experience: 12, patients: 980, status: 'active', license: 'EG-HEA-1892', address: 'المعادي، القاهرة', schedule: 'الاثنين - الأربعاء - الجمعة', fee: 450 },
  { id: 3, name: 'د. محمد إبراهيم حسن', specialty: 'عظام ومفاصل', clinic: 'عيادة 8', phone: '01223456789', email: 'm.ibrahim@shifaa.eg', experience: 20, patients: 1650, status: 'active', license: 'EG-HEA-0987', address: 'الزمالك، القاهرة', schedule: 'الأحد - الثلاثاء - الخميس', fee: 600 },
  { id: 4, name: 'د. فاطمة علي الجمال', specialty: 'طب أطفال', clinic: 'عيادة 1', phone: '01034567890', email: 'f.ali@shifaa.eg', experience: 15, patients: 2340, status: 'active', license: 'EG-HEA-2105', address: 'مصر الجديدة، القاهرة', schedule: 'يومياً', fee: 400 },
  { id: 5, name: 'د. عمر يوسف النجار', specialty: 'باطنة وجهاز هضمي', clinic: 'عيادة 6', phone: '01145678901', email: 'o.youssef@shifaa.eg', experience: 14, patients: 870, status: 'vacation', license: 'EG-HEA-1763', address: 'شبرا، القاهرة', schedule: 'الاثنين - الأربعاء', fee: 350 },
  { id: 6, name: 'د. ريم محمد الحسيني', specialty: 'نساء وتوليد', clinic: 'عيادة 9', phone: '01256789012', email: 'r.hussein@shifaa.eg', experience: 16, patients: 1890, status: 'active', license: 'EG-HEA-2890', address: 'الدقي، الجيزة', schedule: 'الأحد - الثلاثاء - الخميس', fee: 550 },
];

export const EGYPTIAN_PATIENTS = [
  { id: 1, name: 'محمد أحمد السيد', age: 45, gender: 'male', phone: '01001112233', blood: 'A+', address: 'حلوان، القاهرة', id_number: '28901014500123', insurance: 'التأمين الصحي الشامل', status: 'active', lastVisit: '2025-03-15', doctor: 'د. أحمد محمود عبدالعزيز', diagnosis: 'ضغط دم مرتفع' },
  { id: 2, name: 'نورا عبدالله الرشيدي', age: 32, gender: 'female', phone: '01122334455', blood: 'B+', address: 'مدينة نصر، القاهرة', id_number: '29201024600234', insurance: 'لا يوجد', status: 'active', lastVisit: '2025-04-02', doctor: 'د. سارة خالد الشافعي', diagnosis: 'صداع نصفي' },
  { id: 3, name: 'خالد عمر الدالي', age: 58, gender: 'male', phone: '01233445566', blood: 'O-', address: 'المعادي، القاهرة', id_number: '26701034700345', insurance: 'شركة AXA', status: 'admitted', lastVisit: '2025-04-10', doctor: 'د. محمد إبراهيم حسن', diagnosis: 'كسر في الحوض' },
  { id: 4, name: 'أميرة سعيد جمعة', age: 28, gender: 'female', phone: '01344556677', blood: 'AB+', address: 'الزيتون، القاهرة', id_number: '29701044800456', insurance: 'بيما', status: 'active', lastVisit: '2025-04-18', doctor: 'د. فاطمة علي الجمال', diagnosis: 'ألتهاب الزائدة' },
  { id: 5, name: 'عبدالرحمن حسين مكاوي', age: 67, gender: 'male', phone: '01455667788', blood: 'A-', address: 'شبرا الخيمة، القليوبية', id_number: '25801054900567', insurance: 'التأمين الصحي الشامل', status: 'active', lastVisit: '2025-03-28', doctor: 'د. عمر يوسف النجار', diagnosis: 'سكري نوع 2' },
];

export const DEPARTMENTS = [
  { id: 1, name: 'قسم القلب والأوعية', head: 'د. أحمد محمود عبدالعزيز', doctors: 8, beds: 24, occupancy: 87, phone: '02-2345-6781', floor: 'الطابق الثالث' },
  { id: 2, name: 'قسم الأعصاب', head: 'د. سارة خالد الشافعي', doctors: 5, beds: 16, occupancy: 62, phone: '02-2345-6782', floor: 'الطابق الثاني' },
  { id: 3, name: 'قسم العظام والمفاصل', head: 'د. محمد إبراهيم حسن', doctors: 6, beds: 20, occupancy: 75, phone: '02-2345-6783', floor: 'الطابق الأول' },
  { id: 4, name: 'طب الأطفال والمواليد', head: 'د. فاطمة علي الجمال', doctors: 10, beds: 30, occupancy: 93, phone: '02-2345-6784', floor: 'الطابق الرابع' },
  { id: 5, name: 'النساء والتوليد', head: 'د. ريم محمد الحسيني', doctors: 7, beds: 22, occupancy: 70, phone: '02-2345-6785', floor: 'الطابق الخامس' },
];

export const BOOKINGS = [
  { id: 'B-2025-001', patient: 'محمد أحمد السيد', doctor: 'د. أحمد محمود عبدالعزيز', dept: 'قلب', date: '2025-04-24', time: '10:00', status: 'pending', type: 'كشف', phone: '01001112233' },
  { id: 'B-2025-002', patient: 'نورا عبدالله الرشيدي', doctor: 'د. سارة خالد الشافعي', dept: 'أعصاب', date: '2025-04-24', time: '10:30', status: 'approved', type: 'متابعة', phone: '01122334455' },
  { id: 'B-2025-003', patient: 'خالد عمر الدالي', doctor: 'د. محمد إبراهيم حسن', dept: 'عظام', date: '2025-04-24', time: '11:00', status: 'pending', type: 'أشعة', phone: '01233445566' },
  { id: 'B-2025-004', patient: 'أميرة سعيد جمعة', doctor: 'د. فاطمة علي الجمال', dept: 'أطفال', date: '2025-04-25', time: '9:00', status: 'rejected', type: 'كشف', phone: '01344556677' },
  { id: 'B-2025-005', patient: 'عبدالرحمن حسين مكاوي', doctor: 'د. عمر يوسف النجار', dept: 'باطنة', date: '2025-04-25', time: '11:30', status: 'pending', type: 'تحاليل', phone: '01455667788' },
];