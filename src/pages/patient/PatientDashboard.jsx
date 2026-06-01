import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../lib/api';
import {
  User, Calendar, FileText, Heart, Activity, Clock,
  Star, Pill, LayoutDashboard, Upload,
  LogOut, HeartPulse, Search, CheckCircle,
  Droplets, Menu, X, Eye, PlusCircle, Stethoscope, DollarSign
} from 'lucide-react';
import Topbar from '../../components/hospital/Topbar';
import StatCard from '../../components/hospital/StatCard';
import Modal from '../../components/hospital/Modal';
import ConfirmDialog from '../../components/hospital/ConfirmDialog';
import { ToastContainer } from '../../components/hospital/Toast';
import { useToast } from '../../hooks/useToast';
import { EGYPTIAN_DOCTORS } from '../../lib/egyptianData';
import MedicalHistory from './MedicalHistory';

const sidebarLinks = [
  { icon: LayoutDashboard, label: 'لوحة التحكم', path: '/patient/dashboard' },
  { icon: Calendar, label: 'مواعيدي', path: '/patient/appointments' },
  { icon: FileText, label: 'السجل الطبي', path: '/patient/medical-history' },
  { icon: Upload, label: 'رفع الملفات', path: '/patient/uploads' },
  { icon: Droplets, label: 'التبرع بالدم', path: '/patient/blood-donation' },
  { icon: User, label: 'الملف الشخصي', path: '/patient/profile' },
];

const appointments = [
  { doctor: 'د. أحمد السيد', specialty: 'قلب وأوعية', date: 'الخميس 24 أبريل', time: '10:30 ص', status: 'confirmed', avatar: 'أ' },
  { doctor: 'د. سارة العمري', specialty: 'أعصاب', date: 'الاثنين 28 أبريل', time: '2:00 م', status: 'pending', avatar: 'س' },
];

const medHistory = [
  { date: '15 مارس 2025', diagnosis: 'التهاب رئوي', doctor: 'د. خالد الرحيمي', status: 'متعافٍ' },
  { date: '5 يناير 2025', diagnosis: 'ضغط دم مرتفع', doctor: 'د. أحمد السيد', status: 'تحت المتابعة' },
  { date: '20 أكتوبر 2024', diagnosis: 'كسر في اليد', doctor: 'د. عمر الحارثي', status: 'متعافٍ' },
];

function DashboardHome() {
  const user = (() => { try { return JSON.parse(sessionStorage.getItem('hospitalUser') || '{}'); } catch { return {}; } })();
  const [appointments, setAppointments] = useState([]);
  const [medHistory, setMedHistory] = useState([]);

  const [labs, setLabs] = useState([]);

  useEffect(() => {
    if (user.patientId) {
      api.get(`/appointments?patientId=${user.patientId}`)
        .then(res => setAppointments(res.data?.data || res.data || []))
        .catch(console.error);
        
      api.get(`/medical-records/patient/${user.patientId}`)
        .then(res => setMedHistory(res.data?.data || res.data || []))
        .catch(console.error);

      api.get(`/labs/orders?patientId=${user.patientId}`)
        .then(res => setLabs(res.data?.data || res.data || []))
        .catch(console.error);
    }
  }, [user.patientId]);

  return (
    <div className="p-6 space-y-8 fade-in">
      {/* Welcome */}
      <div className="relative overflow-hidden rounded-3xl p-8"
        style={{ background: 'linear-gradient(135deg, #2563eb, #14b8a6)' }}>
        <div className="absolute top-0 left-0 w-48 h-48 rounded-full blur-3xl opacity-20"
          style={{ background: 'white', transform: 'translate(-30%, -30%)' }} />
        <div className="relative">
          <p className="text-blue-100 text-sm mb-1">أهلاً بك،</p>
          <h2 className="text-white text-3xl font-black mb-2">{user.name || 'أحمد محمد'}</h2>
          <p className="text-blue-100">لديك {appointments.filter(a => a.status !== 'COMPLETED').length} مواعيد قادمة</p>
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2">
              <Heart className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-medium">فصيلة الدم: مسجلة بملفك</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2">
              <Activity className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-medium">آخر زيارة: {medHistory.length > 0 ? new Date(medHistory[0].createdAt).toLocaleDateString('ar-EG') : 'لا يوجد'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'المواعيد القادمة', value: appointments.filter(a => a.status !== 'COMPLETED' && a.status !== 'CANCELLED').length.toString(), icon: Calendar, gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)' },
          { title: 'الزيارات الكلية', value: medHistory.length.toString(), icon: Activity, gradient: 'linear-gradient(135deg, #14b8a6, #0d9488)' },
          { title: 'الأدوية الموصوفة', value: medHistory.reduce((acc, curr) => acc + (curr.prescriptions?.length || 0), 0).toString(), icon: Pill, gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
          { title: 'نتائج التحاليل', value: labs.filter(l => l.status === 'COMPLETED').length.toString(), icon: FileText, gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
        ].map((s, i) => <StatCard key={i} {...s} index={i} />)}
      </div>

      {/* Upcoming Appointments */}
      <div>
        <div className="section-header">
          <div className="section-header-line" />
          <h3 className="text-xl font-bold text-slate-900">المواعيد القادمة</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {appointments.length === 0 ? <p className="text-slate-500">لا توجد مواعيد حالية</p> : appointments.slice(0,2).map((appt, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #2563eb, #14b8a6)' }}>
                  {appt.doctor?.user?.name?.charAt(3) || 'د'}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900">{appt.doctor?.user?.name}</h4>
                  <p className="text-slate-500 text-sm">{appt.doctor?.department?.name || 'طبيب عام'}</p>
                </div>
                <span className={appt.status === 'SCHEDULED' ? 'badge-info' : appt.status === 'WAITING' ? 'badge-warning' : 'badge-success'}>
                  {appt.status}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Calendar className="w-4 h-4" />
                  {new Date(appt.date).toLocaleDateString('ar-EG')}
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Clock className="w-4 h-4" />
                  {appt.timeSlot}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Medical History */}
      <div>
        <div className="section-header">
          <div className="section-header-line" />
          <h3 className="text-xl font-bold text-slate-900">السجل الطبي الأخير</h3>
        </div>
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
          <table className="hospital-table">
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>التشخيص</th>
                <th>الطبيب</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {medHistory.length === 0 ? <tr><td colSpan="4" className="text-center py-4 text-slate-500">لا توجد سجلات طبية سابقة</td></tr> : medHistory.map((h, i) => (
                <tr key={i}>
                  <td className="text-slate-500 text-sm">{new Date(h.createdAt).toLocaleDateString('ar-EG')}</td>
                  <td className="font-medium text-slate-800">{h.diagnosis}</td>
                  <td className="text-slate-600">{h.appointment?.doctor?.user?.name}</td>
                  <td>
                    <span className="badge-success">مكتمل</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AppointmentsPage() {
  const [allAppts, setAllAppts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [bookOpen, setBookOpen] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [bookForm, setBookForm] = useState({ departmentId: '', doctorId: '', date: '', timeSlot: '', type: 'CHECKUP' });
  const [loading, setLoading] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  const user = (() => { try { return JSON.parse(sessionStorage.getItem('hospitalUser') || '{}'); } catch { return {}; } })();

  useEffect(() => {
    fetchAppts();
    api.get('/admin/departments').then(r => setDepartments(r.data)).catch(console.error);
  }, []);

  const fetchAppts = () => {
    api.get('/appointments').then(r => setAllAppts(r.data?.data || r.data || [])).catch(console.error);
  };

  // عند اختيار القسم — جلب الأطباء التابعين له
  useEffect(() => {
    if (bookForm.departmentId) {
      api.get('/admin/users').then(r => {
        const deptDoctors = r.data.filter(u => u.role === 'DOCTOR' && u.doctorProfile?.department?.name);
        setDoctors(deptDoctors);
      }).catch(console.error);
    }
  }, [bookForm.departmentId]);

  const handleBook = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/appointments', {
        departmentId: bookForm.departmentId || undefined,
        doctorId: bookForm.doctorId || undefined,
        date: bookForm.date,
        timeSlot: bookForm.timeSlot,
        type: bookForm.type,
      });
      addToast('تم تقديم طلب الحجز بنجاح — في انتظار موافقة الاستقبال ✓', 'success');
      setBookOpen(false);
      setBookForm({ departmentId: '', doctorId: '', date: '', timeSlot: '', type: 'CHECKUP' });
      fetchAppts();
    } catch (err) {
      addToast(err.response?.data?.error || 'خطأ في الحجز', 'error');
    } finally {
      setLoading(false);
    }
  };

  const statusLabel = { SCHEDULED: 'قيد المراجعة', WAITING: 'في الانتظار', IN_PROGRESS: 'جارٍ الكشف', COMPLETED: 'مكتمل', CANCELLED: 'ملغى' };
  const statusBadge = { SCHEDULED: 'badge-info', WAITING: 'badge-warning', IN_PROGRESS: 'badge-warning', COMPLETED: 'badge-success', CANCELLED: 'badge-danger' };

  const filtered = filter === 'all' ? allAppts : allAppts.filter(a => a.status === filter);

  const timeSlots = ['08:00 ص', '09:00 ص', '10:00 ص', '11:00 ص', '12:00 م', '01:00 م', '02:00 م', '03:00 م', '04:00 م'];
  const apptTypes = [{ v: 'CHECKUP', l: 'كشف عام' }, { v: 'FOLLOWUP', l: 'متابعة' }, { v: 'EMERGENCY', l: 'طارئ' }];

  return (
    <div className="p-6 space-y-6 fade-in">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="section-header mb-0">
          <div className="section-header-line" />
          <h3 className="text-xl font-bold text-slate-900">مواعيدي</h3>
        </div>
        <button onClick={() => setBookOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-medium text-sm"
          style={{ background: 'linear-gradient(135deg, #2563eb, #14b8a6)' }}>
          <PlusCircle className="w-4 h-4" />حجز موعد جديد
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[['all', 'الكل'], ['SCHEDULED', 'قيد المراجعة'], ['WAITING', 'انتظار'], ['COMPLETED', 'مكتمل'], ['CANCELLED', 'ملغى']].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)}
            className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all ${filter === v ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            style={filter === v ? { background: 'linear-gradient(135deg, #2563eb, #14b8a6)' } : {}}>
            {l}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-200" />
            <p className="text-slate-500">لا توجد مواعيد</p>
            <button onClick={() => setBookOpen(true)} className="mt-4 px-6 py-2 rounded-xl text-white text-sm font-medium" style={{ background: 'linear-gradient(135deg, #2563eb, #14b8a6)' }}>
              احجز موعدك الأول
            </button>
          </div>
        ) : filtered.map((appt, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #2563eb, #14b8a6)' }}>
                  {appt.doctor?.user?.name?.charAt(3) || 'د'}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{appt.doctor?.user?.name}</h4>
                  <p className="text-slate-500 text-sm">{appt.doctor?.department?.name || 'طبيب عام'}</p>
                </div>
              </div>
              <span className={statusBadge[appt.status] || 'badge-info'}>{statusLabel[appt.status] || appt.status}</span>
            </div>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
              <span className="flex items-center gap-1.5 text-slate-500 text-sm"><Calendar className="w-4 h-4" />{new Date(appt.date).toLocaleDateString('ar-EG')}</span>
              <span className="flex items-center gap-1.5 text-slate-500 text-sm"><Clock className="w-4 h-4" />{appt.timeSlot || '—'}</span>
              <span className="flex items-center gap-1.5 text-slate-500 text-sm"><Stethoscope className="w-4 h-4" />{appt.type}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Book Appointment Modal */}
      <Modal open={bookOpen} onClose={() => setBookOpen(false)} title="حجز موعد جديد" size="sm">
        <form className="p-6 space-y-4" onSubmit={handleBook}>
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-blue-700 text-sm font-medium">📋 سيتم مراجعة طلبك من قِبَل الاستقبال وتأكيده</p>
          </div>

          <div>
            <label className="block text-slate-600 text-sm font-semibold mb-1">القسم الطبي</label>
            <select required value={bookForm.departmentId} onChange={e => setBookForm(p => ({ ...p, departmentId: e.target.value, doctorId: '' }))}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:border-blue-400 font-cairo">
              <option value="">اختر القسم...</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 text-sm font-semibold mb-1">الطبيب (اختياري)</label>
            <select value={bookForm.doctorId} onChange={e => setBookForm(p => ({ ...p, doctorId: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:border-blue-400 font-cairo">
              <option value="">أي طبيب متاح</option>
              {doctors.filter(d => d.doctorProfile).map(d => (
                <option key={d.id} value={d.doctorProfile?.id}>{d.name} — {d.doctorProfile?.specialty}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 text-sm font-semibold mb-1">نوع الزيارة</label>
            <select value={bookForm.type} onChange={e => setBookForm(p => ({ ...p, type: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:border-blue-400 font-cairo">
              {apptTypes.map(t => <option key={t.v} value={t.v}>{t.l}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 text-sm font-semibold mb-1">التاريخ</label>
              <input required type="date" min={new Date().toISOString().split('T')[0]} value={bookForm.date}
                onChange={e => setBookForm(p => ({ ...p, date: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:border-blue-400 font-cairo" />
            </div>
            <div>
              <label className="block text-slate-600 text-sm font-semibold mb-1">الوقت</label>
              <select required value={bookForm.timeSlot} onChange={e => setBookForm(p => ({ ...p, timeSlot: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:border-blue-400 font-cairo">
                <option value="">اختر...</option>
                {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setBookOpen(false)} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold font-cairo">إلغاء</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl text-white font-bold font-cairo"
              style={{ background: loading ? '#94a3b8' : 'linear-gradient(135deg, #2563eb, #14b8a6)' }}>
              {loading ? 'جاري الإرسال...' : 'تأكيد الحجز'}
            </button>
          </div>
        </form>
      </Modal>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}



function BloodDonation() {
  const user = (() => { try { return JSON.parse(sessionStorage.getItem('hospitalUser') || '{}'); } catch { return {}; } })();
  const { toasts, addToast, removeToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [donations, setDonations] = useState([]);
  const [form, setForm] = useState({ quantity: 450, notes: '' });

  const load = async () => {
    if (!user.patientId) return;
    const patientRes = await api.get('/patients/' + user.patientId);
    setProfile(patientRes.data);
    const donationRes = await api.get('/medical-records/blood-donations', { params: { nationalId: patientRes.data.nationalId } });
    setDonations(donationRes.data?.data || donationRes.data || []);
  };

  useEffect(() => { load().catch(console.error); }, [user.patientId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!profile?.nationalId) return addToast('يجب تسجيل الرقم القومي في الملف الشخصي أولا', 'error');
    try {
      await api.post('/medical-records/blood-donations', {
        donorName: profile.user?.name || user.name,
        nationalId: profile.nationalId,
        bloodType: profile.bloodType || 'غير محدد',
        quantity: form.quantity,
        notes: form.notes
      });
      setForm({ quantity: 450, notes: '' });
      addToast('تم تسجيل التبرع بالدم بنجاح', 'success');
      await load();
    } catch (err) {
      addToast(err.response?.data?.error || 'فشل تسجيل التبرع', 'error');
    }
  };

  return (
    <div className="p-6 fade-in space-y-6">
      <div className="section-header"><div className="section-header-line" /><h3 className="text-xl font-bold text-slate-900">التبرع بالدم</h3></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={submit} className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="p-5 rounded-2xl text-white" style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)' }}>
            <h4 className="text-2xl font-black mb-2">تسجيل تبرع بالدم</h4>
            <p className="text-red-100 text-sm">سيتم حفظ بيانات التبرع في قاعدة البيانات.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-slate-50"><p className="text-xs text-slate-400 mb-1">المتبرع</p><p className="font-bold text-slate-800">{profile?.user?.name || user.name}</p></div>
            <div className="p-3 rounded-xl bg-slate-50"><p className="text-xs text-slate-400 mb-1">فصيلة الدم</p><p className="font-bold text-red-600">{profile?.bloodType || 'غير مسجلة'}</p></div>
            <input type="number" min="100" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} className="px-4 py-3 rounded-xl border bg-slate-50 font-cairo" placeholder="الكمية بالملليلتر" />
            <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className="px-4 py-3 rounded-xl border bg-slate-50 font-cairo" placeholder="ملاحظات" />
          </div>
          <button className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold">حفظ التبرع</button>
        </form>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h4 className="font-bold text-slate-900 mb-4">سجل التبرعات ({donations.length})</h4>
          <div className="space-y-3 max-h-96 overflow-auto">
            {donations.length === 0 ? <p className="text-slate-400 text-sm text-center py-6">لا توجد تبرعات مسجلة</p> : donations.map(d => (
              <div key={d.id} className="p-3 rounded-xl bg-red-50 border border-red-100"><div className="flex justify-between"><span className="font-bold text-slate-800">{d.quantity} ml</span><span className="badge-info">{d.status}</span></div><p className="text-xs text-slate-500 mt-1">{new Date(d.donationDate).toLocaleDateString('ar-EG')}</p>{d.notes && <p className="text-xs text-slate-500 mt-1">{d.notes}</p>}</div>
            ))}
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

function ProfilePage() {
  const user = (() => { try { return JSON.parse(sessionStorage.getItem('hospitalUser') || '{}'); } catch { return {}; } })();
  const { toasts, addToast, removeToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ phone: '', bloodType: '', weight: '', height: '', allergies: '', chronicDiseases: '', emergencyContact: '' });

  useEffect(() => {
    if (!user.patientId) return;
    api.get('/patients/' + user.patientId).then(res => {
      setProfile(res.data);
      setForm({ phone: res.data.user?.phone || '', bloodType: res.data.bloodType || '', weight: res.data.weight || '', height: res.data.height || '', allergies: res.data.allergies || '', chronicDiseases: res.data.chronicDiseases || '', emergencyContact: res.data.emergencyContact || '' });
    }).catch(console.error);
  }, [user.patientId]);

  const set = (key, value) => setForm(p => ({ ...p, [key]: value }));
  const save = async (e) => {
    e.preventDefault();
    try {
      const res = await api.patch('/patients/' + user.patientId, form);
      setProfile(res.data);
      addToast('تم تحديث الملف الشخصي بنجاح', 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'فشل تحديث الملف الشخصي', 'error');
    }
  };

  return (
    <div className="p-6 fade-in">
      <div className="section-header"><div className="section-header-line" /><h3 className="text-xl font-bold text-slate-900">الملف الشخصي</h3></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center"><div className="w-24 h-24 rounded-3xl flex items-center justify-center text-white text-3xl font-black mx-auto mb-4 shadow-xl" style={{ background: 'linear-gradient(135deg, #2563eb, #14b8a6)' }}>{profile?.user?.name?.charAt(0) || user.name?.charAt(0) || 'م'}</div><h3 className="text-xl font-black text-slate-900">{profile?.user?.name || user.name}</h3><p className="text-slate-500 text-sm mb-4">مريض مسجل</p><div className="flex justify-center gap-3"><span className="badge-info">{profile?.bloodType || 'بدون فصيلة'}</span><span className="badge-success">نشط</span></div></div>
        <form onSubmit={save} className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100"><h4 className="font-bold text-slate-900 mb-5">تعديل المعلومات الشخصية والصحية</h4><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><input value={form.phone} onChange={e => set('phone', e.target.value)} className="px-4 py-3 rounded-xl border bg-slate-50 font-cairo" placeholder="رقم الهاتف" /><select value={form.bloodType} onChange={e => set('bloodType', e.target.value)} className="px-4 py-3 rounded-xl border bg-slate-50 font-cairo"><option value="">فصيلة الدم</option>{['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(b => <option key={b}>{b}</option>)}</select><input type="number" value={form.weight} onChange={e => set('weight', e.target.value)} className="px-4 py-3 rounded-xl border bg-slate-50 font-cairo" placeholder="الوزن" /><input type="number" value={form.height} onChange={e => set('height', e.target.value)} className="px-4 py-3 rounded-xl border bg-slate-50 font-cairo" placeholder="الطول" /><input value={form.emergencyContact} onChange={e => set('emergencyContact', e.target.value)} className="px-4 py-3 rounded-xl border bg-slate-50 font-cairo" placeholder="رقم الطوارئ" /><input value={profile?.nationalId || ''} disabled className="px-4 py-3 rounded-xl border bg-slate-100 text-slate-400 font-cairo" placeholder="الرقم القومي" /><textarea value={form.allergies} onChange={e => set('allergies', e.target.value)} className="md:col-span-2 px-4 py-3 rounded-xl border bg-slate-50 h-24 resize-none font-cairo" placeholder="الحساسيات" /><textarea value={form.chronicDiseases} onChange={e => set('chronicDiseases', e.target.value)} className="md:col-span-2 px-4 py-3 rounded-xl border bg-slate-50 h-24 resize-none font-cairo" placeholder="الأمراض المزمنة" /></div><button className="btn-primary-hospital mt-6 flex items-center gap-2"><User className="w-4 h-4" />حفظ البيانات</button></form>
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

function UploadsPage() {
  const user = (() => { try { return JSON.parse(sessionStorage.getItem('hospitalUser') || '{}'); } catch { return {}; } })();
  const [files, setFiles] = useState([]);
  const [preview, setPreview] = useState(null);
  const { toasts, addToast, removeToast } = useToast();
  const load = () => { if (!user.patientId) return; api.get('/medical-records/radiology', { params: { patientId: user.patientId } }).then(res => setFiles(res.data?.data || res.data || [])).catch(console.error); };
  useEffect(() => { load(); }, [user.patientId]);
  const toDataUrl = (file) => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });
  const handleFileChange = async (e) => {
    const selected = Array.from(e.target.files);
    try { for (const file of selected) { const fileUrl = await toDataUrl(file); await api.post('/medical-records/radiology', { patientId: user.patientId, type: file.type?.includes('pdf') ? 'PDF' : 'Medical Upload', description: file.name, fileUrl }); } addToast('تم رفع الملفات وربطها بالباك إند', 'success'); await load(); } catch (err) { addToast(err.response?.data?.error || 'فشل رفع الملفات', 'error'); }
    e.target.value = '';
  };
  return (
    <div className="p-6 fade-in"><div className="section-header"><div className="section-header-line" /><h3 className="text-xl font-bold">رفع الملفات الطبية</h3></div><div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><div><label className="block bg-white rounded-2xl p-8 text-center border-2 border-dashed border-slate-200 shadow-sm cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all"><Upload className="w-12 h-12 text-slate-300 mx-auto mb-4" /><h4 className="text-lg font-bold text-slate-700 mb-2">ارفع ملفاتك الطبية</h4><p className="text-slate-400 text-sm mb-4">سيتم حفظ الملف في سجلات الأشعة/الملفات الطبية بالباك إند</p><span className="inline-flex items-center gap-2 btn-primary-hospital text-sm"><Upload className="w-4 h-4" />اختر ملفا</span><input type="file" multiple accept="image/*,.pdf" className="hidden" onChange={handleFileChange} /></label><p className="text-slate-400 text-xs text-center mt-3">يدعم: PDF، JPG، PNG، JPEG</p></div><div><h4 className="font-bold text-slate-900 mb-4">الملفات المحفوظة ({files.length})</h4>{files.length === 0 ? <div className="text-center py-12 text-slate-300"><FileText className="w-12 h-12 mx-auto mb-3" /><p>لا توجد ملفات مرفوعة بعد</p></div> : <div className="space-y-3">{files.map((f) => <motion.div key={f.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-100 shadow-sm"><div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0"><FileText className="w-5 h-5 text-blue-500" /></div><div className="flex-1 min-w-0"><p className="font-medium text-slate-800 text-sm truncate">{f.description || f.type}</p><p className="text-slate-400 text-xs">{f.type} - {new Date(f.uploadedAt).toLocaleDateString('ar-EG')}</p></div>{f.fileUrl?.startsWith('data:image') && <button onClick={() => setPreview(f.fileUrl)} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"><Eye className="w-4 h-4" /></button>}</motion.div>)}</div>}</div></div>{preview && <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4" onClick={() => setPreview(null)}><img src={preview} alt="preview" className="max-w-full max-h-full rounded-2xl shadow-2xl" /></div>}<ToastContainer toasts={toasts} removeToast={removeToast} /></div>
  );
}

export default function PatientDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);

  const user = (() => {
    try { return JSON.parse(sessionStorage.getItem('hospitalUser') || '{}'); } catch { return {}; }
  })();

  const handleLogout = () => {
    sessionStorage.removeItem('hospitalUser');
    navigate('/role-select');
  };

  const currentTitle = sidebarLinks.find(l => l.path === location.pathname)?.label || 'لوحة التحكم';

  return (
    <div className="flex min-h-screen font-cairo" dir="rtl">
      {/* Sidebar */}
      <aside className="sidebar hidden md:flex flex-col" style={{ width: '260px' }}>
        {/* Logo */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #2563eb, #14b8a6)' }}>
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">مستشفى الشفاء</div>
              <div className="text-slate-400 text-xs">بوابة المريض</div>
            </div>
          </div>
        </div>
        {/* User */}
        <div className="mx-4 mt-4 p-3 rounded-xl" style={{ background: 'rgba(37,99,235,0.15)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold"
              style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)' }}>
              {user.name?.charAt(0) || 'م'}
            </div>
            <div>
              <div className="text-white text-sm font-semibold truncate max-w-36">{user.name}</div>
              <div className="text-blue-300 text-xs">مريض</div>
            </div>
          </div>
        </div>
        {/* Nav */}
        <nav className="flex-1 p-3 mt-2">
          {sidebarLinks.map((item, i) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={i} to={item.path}
                className={`sidebar-item ${isActive ? 'active' : ''}`}>
                <item.icon className="w-5 h-5 flex-shrink-0" style={{ color: isActive ? '#2563eb' : undefined }} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout} className="sidebar-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
            <LogOut className="w-5 h-5" /><span>خروج</span>
          </button>
        </div>
      </aside>

      {/* Mobile menu */}
      <button onClick={() => setMobileMenu(true)}
        className="fixed top-4 right-4 z-50 md:hidden w-11 h-11 rounded-xl flex items-center justify-center shadow-lg"
        style={{ background: 'linear-gradient(135deg, #2563eb, #14b8a6)' }}>
        <Menu className="w-5 h-5 text-white" />
      </button>
      {mobileMenu && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileMenu(false)} />
          <aside className="sidebar absolute right-0 top-0 flex flex-col" style={{ width: '260px' }}>
            <div className="p-4 flex justify-between items-center border-b border-white/10">
              <span className="text-white font-bold">القائمة</span>
              <button onClick={() => setMobileMenu(false)} className="text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <nav className="flex-1 p-3 mt-2">
              {sidebarLinks.map((item, i) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link key={i} to={item.path} onClick={() => setMobileMenu(false)}
                    className={`sidebar-item ${isActive ? 'active' : ''}`}>
                    <item.icon className="w-5 h-5" /><span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-white/10">
              <button onClick={handleLogout} className="sidebar-item w-full text-red-400">
                <LogOut className="w-5 h-5" /><span>خروج</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 min-h-screen" style={{ background: 'linear-gradient(135deg, #f1f5f9, #e8f4fd, #f0fdfa)', marginRight: '260px' }}
        id="main-content">
        <Topbar title={currentTitle} roleColor="#2563eb" />
        <div className="md:ml-0">
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="dashboard" element={<DashboardHome />} />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="blood-donation" element={<BloodDonation />} />
            <Route path="medical-history" element={<MedicalHistory />} />
            <Route path="uploads" element={<UploadsPage />} />
          </Routes>
        </div>
      </main>

      {/* Mobile main */}
      <style>{`@media (max-width: 768px) { #main-content { margin-right: 0 !important; } }`}</style>
    </div>
  );
}
