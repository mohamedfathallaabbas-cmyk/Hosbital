import { useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, Stethoscope, Building2, Calendar,
  Bed, FileText, BookOpen, Activity, Settings, LogOut,
  HeartPulse, PlusCircle, Pencil, Trash2, Search,
  Menu, X, BarChart3, Eye, Phone, MapPin, CheckCircle,
  Clock, User, Tag, Image, AlignLeft
} from 'lucide-react';
import Topbar from '../../components/hospital/Topbar';
import StatCard from '../../components/hospital/StatCard';
import Modal from '../../components/hospital/Modal';
import ConfirmDialog from '../../components/hospital/ConfirmDialog';
import { ToastContainer } from '../../components/hospital/Toast';
import { useToast } from '../../hooks/useToast';
import { EGYPTIAN_DOCTORS, EGYPTIAN_PATIENTS, DEPARTMENTS } from '../../lib/egyptianData';

const sidebarLinks = [
  { icon: LayoutDashboard, label: 'لوحة التحكم', path: '/admin/dashboard' },
  { icon: Stethoscope, label: 'إدارة الأطباء', path: '/admin/doctors' },
  { icon: Users, label: 'إدارة المستخدمين', path: '/admin/patients' },
  { icon: Building2, label: 'إدارة الأقسام', path: '/admin/departments' },
  { icon: Calendar, label: 'إدارة المواعيد', path: '/admin/appointments' },
  { icon: Bed, label: 'إدارة الأسرة', path: '/admin/beds' },
  { icon: BookOpen, label: 'المدونة والمحتوى', path: '/admin/blog' },
  { icon: BarChart3, label: 'التقارير التشغيلية', path: '/admin/reports' },
  { icon: Settings, label: 'إعدادات النظام', path: '/admin/settings' },
];

const SPECIALTIES = ['قلب وأوعية دموية', 'أعصاب', 'عظام ومفاصل', 'طب أطفال', 'باطنة وجهاز هضمي', 'نساء وتوليد', 'عيون', 'جراحة عامة', 'أسنان', 'طوارئ'];

function DoctorForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || { name: '', specialty: '', clinic: '', phone: '', email: '', experience: '', fee: '', address: '', schedule: '', status: 'active' });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <form className="p-6 space-y-4" onSubmit={e => { e.preventDefault(); onSave(form); }}>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-slate-600 text-sm font-semibold mb-1">الاسم الكامل</label>
          <input required value={form.name} onChange={e => set('name', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:border-blue-400 outline-none transition font-cairo" placeholder="د. الاسم الكامل" />
        </div>
        <div>
          <label className="block text-slate-600 text-sm font-semibold mb-1">التخصص</label>
          <select required value={form.specialty} onChange={e => set('specialty', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:border-blue-400 outline-none font-cairo">
            <option value="">اختر التخصص</option>
            {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-slate-600 text-sm font-semibold mb-1">رقم العيادة</label>
          <input value={form.clinic} onChange={e => set('clinic', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:border-blue-400 outline-none font-cairo" placeholder="عيادة 5" />
        </div>
        <div>
          <label className="block text-slate-600 text-sm font-semibold mb-1">رقم الهاتف</label>
          <input value={form.phone} onChange={e => set('phone', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:border-blue-400 outline-none font-cairo" placeholder="01xxxxxxxxx" />
        </div>
        <div>
          <label className="block text-slate-600 text-sm font-semibold mb-1">البريد الإلكتروني</label>
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:border-blue-400 outline-none font-cairo" placeholder="doctor@shifaa.eg" />
        </div>
        <div>
          <label className="block text-slate-600 text-sm font-semibold mb-1">سنوات الخبرة</label>
          <input type="number" min="1" value={form.experience} onChange={e => set('experience', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:border-blue-400 outline-none font-cairo" placeholder="10" />
        </div>
        <div>
          <label className="block text-slate-600 text-sm font-semibold mb-1">سعر الكشف (ج.م)</label>
          <input type="number" value={form.fee} onChange={e => set('fee', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:border-blue-400 outline-none font-cairo" placeholder="500" />
        </div>
        <div className="col-span-2">
          <label className="block text-slate-600 text-sm font-semibold mb-1">العنوان</label>
          <input value={form.address} onChange={e => set('address', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:border-blue-400 outline-none font-cairo" placeholder="مدينة نصر، القاهرة" />
        </div>
        <div>
          <label className="block text-slate-600 text-sm font-semibold mb-1">أيام العمل</label>
          <input value={form.schedule} onChange={e => set('schedule', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:border-blue-400 outline-none font-cairo" placeholder="الأحد - الثلاثاء - الخميس" />
        </div>
        <div>
          <label className="block text-slate-600 text-sm font-semibold mb-1">الحالة</label>
          <select value={form.status} onChange={e => set('status', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:border-blue-400 outline-none font-cairo">
            <option value="active">نشط</option>
            <option value="vacation">إجازة</option>
          </select>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors font-cairo">إلغاء</button>
        <button type="submit" className="flex-1 py-3 rounded-xl text-white font-bold font-cairo" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>حفظ البيانات</button>
      </div>
    </form>
  );
}

function DoctorDetails({ doctor, onClose }) {
  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
          {doctor.name.split(' ')[1]?.charAt(0) || 'د'}
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-900">{doctor.name}</h3>
          <p className="text-slate-500">{doctor.specialty}</p>
          <span className={doctor.status === 'active' ? 'badge-success' : 'badge-warning'}>{doctor.status === 'active' ? 'نشط' : 'إجازة'}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { l: 'رقم الترخيص', v: doctor.license || 'EG-HEA-' + doctor.id },
          { l: 'رقم الهاتف', v: doctor.phone },
          { l: 'البريد الإلكتروني', v: doctor.email },
          { l: 'العيادة', v: doctor.clinic },
          { l: 'سنوات الخبرة', v: doctor.experience + ' سنة' },
          { l: 'عدد المرضى', v: (doctor.patients || 0).toLocaleString() },
          { l: 'سعر الكشف', v: doctor.fee ? `${doctor.fee} ج.م` : '—' },
          { l: 'أيام العمل', v: doctor.schedule || '—' },
          { l: 'العنوان', v: doctor.address || '—' },
        ].map((f, i) => (
          <div key={i} className={`p-3 rounded-xl bg-slate-50 ${i === 8 ? 'col-span-2' : ''}`}>
            <p className="text-slate-400 text-xs mb-1">{f.l}</p>
            <p className="text-slate-800 font-semibold text-sm">{f.v}</p>
          </div>
        ))}
      </div>
      <button onClick={onClose} className="mt-5 w-full py-3 rounded-xl text-white font-bold font-cairo" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>إغلاق</button>
    </div>
  );
}

function DoctorsManagement() {
  const [doctors, setDoctors] = useState(EGYPTIAN_DOCTORS);
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editDoc, setEditDoc] = useState(null);
  const [viewDoc, setViewDoc] = useState(null);
  const [deleteDoc, setDeleteDoc] = useState(null);
  const { toasts, addToast, removeToast } = useToast();

  const filtered = doctors.filter(d => d.name.includes(search) || d.specialty.includes(search));

  const handleAdd = (form) => {
    setDoctors(prev => [...prev, { ...form, id: Date.now(), patients: 0 }]);
    setAddOpen(false);
    addToast('تم إضافة الطبيب بنجاح ✓', 'success');
  };
  const handleEdit = (form) => {
    setDoctors(prev => prev.map(d => d.id === editDoc.id ? { ...d, ...form } : d));
    setEditDoc(null);
    addToast('تم تحديث بيانات الطبيب ✓', 'success');
  };
  const handleDelete = () => {
    setDoctors(prev => prev.filter(d => d.id !== deleteDoc.id));
    addToast('تم حذف الطبيب من النظام', 'error');
  };

  return (
    <div className="p-6 fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div className="section-header mb-0">
          <div className="section-header-line" style={{ background: 'linear-gradient(180deg, #8b5cf6, #7c3aed)' }} />
          <h3 className="text-xl font-bold">إدارة الأطباء</h3>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white">
            <Search className="w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} className="text-sm outline-none font-cairo w-36" placeholder="بحث..." />
          </div>
          <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
            <PlusCircle className="w-4 h-4" />إضافة طبيب
          </button>
        </div>
      </div>
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
        <table className="hospital-table">
          <thead><tr><th>الطبيب</th><th>التخصص</th><th>الهاتف</th><th>سعر الكشف</th><th>الحالة</th><th>إجراءات</th></tr></thead>
          <tbody>
            {filtered.map(d => (
              <tr key={d.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                      {d.name.split(' ')[1]?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{d.name}</p>
                      <p className="text-slate-400 text-xs">{d.email}</p>
                    </div>
                  </div>
                </td>
                <td><span className="badge-purple">{d.specialty}</span></td>
                <td className="text-slate-600 text-sm">{d.phone}</td>
                <td className="font-semibold text-slate-800">{d.fee ? `${d.fee} ج.م` : '—'}</td>
                <td><span className={d.status === 'active' ? 'badge-success' : 'badge-warning'}>{d.status === 'active' ? 'نشط' : 'إجازة'}</span></td>
                <td>
                  <div className="flex gap-2">
                    <button onClick={() => setViewDoc(d)} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="عرض التفاصيل"><Eye className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setEditDoc(d)} className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors" title="تعديل"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setDeleteDoc(d)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors" title="حذف"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-12 text-slate-400">لا توجد نتائج للبحث</div>}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="إضافة طبيب جديد" size="lg">
        <DoctorForm onSave={handleAdd} onClose={() => setAddOpen(false)} />
      </Modal>
      <Modal open={!!editDoc} onClose={() => setEditDoc(null)} title="تعديل بيانات الطبيب" size="lg">
        {editDoc && <DoctorForm initial={editDoc} onSave={handleEdit} onClose={() => setEditDoc(null)} />}
      </Modal>
      <Modal open={!!viewDoc} onClose={() => setViewDoc(null)} title="تفاصيل الطبيب" size="md">
        {viewDoc && <DoctorDetails doctor={viewDoc} onClose={() => setViewDoc(null)} />}
      </Modal>
      <ConfirmDialog open={!!deleteDoc} onClose={() => setDeleteDoc(null)} onConfirm={handleDelete}
        title="حذف الطبيب" message={`هل أنت متأكد من حذف ${deleteDoc?.name}؟ لا يمكن التراجع عن هذا الإجراء.`} />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

function PatientForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || { name: '', age: '', gender: 'male', phone: '', blood: 'A+', address: '', insurance: '', diagnosis: '', status: 'active' });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <form className="p-6 space-y-4" onSubmit={e => { e.preventDefault(); onSave(form); }}>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-slate-600 text-sm font-semibold mb-1">الاسم الكامل</label>
          <input required value={form.name} onChange={e => set('name', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:border-blue-400 outline-none font-cairo" placeholder="اسم المريض كاملاً" />
        </div>
        <div>
          <label className="block text-slate-600 text-sm font-semibold mb-1">العمر</label>
          <input type="number" value={form.age} onChange={e => set('age', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:border-blue-400 outline-none font-cairo" placeholder="35" />
        </div>
        <div>
          <label className="block text-slate-600 text-sm font-semibold mb-1">النوع</label>
          <select value={form.gender} onChange={e => set('gender', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 font-cairo outline-none">
            <option value="male">ذكر</option><option value="female">أنثى</option>
          </select>
        </div>
        <div>
          <label className="block text-slate-600 text-sm font-semibold mb-1">رقم الهاتف</label>
          <input value={form.phone} onChange={e => set('phone', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:border-blue-400 outline-none font-cairo" placeholder="01xxxxxxxxx" />
        </div>
        <div>
          <label className="block text-slate-600 text-sm font-semibold mb-1">فصيلة الدم</label>
          <select value={form.blood} onChange={e => set('blood', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 font-cairo outline-none">
            {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(b => <option key={b}>{b}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-slate-600 text-sm font-semibold mb-1">العنوان</label>
          <input value={form.address} onChange={e => set('address', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:border-blue-400 outline-none font-cairo" placeholder="الحي، المحافظة" />
        </div>
        <div>
          <label className="block text-slate-600 text-sm font-semibold mb-1">شركة التأمين</label>
          <input value={form.insurance} onChange={e => set('insurance', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:border-blue-400 outline-none font-cairo" placeholder="لا يوجد" />
        </div>
        <div>
          <label className="block text-slate-600 text-sm font-semibold mb-1">التشخيص</label>
          <input value={form.diagnosis} onChange={e => set('diagnosis', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:border-blue-400 outline-none font-cairo" placeholder="التشخيص الأولي" />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors font-cairo">إلغاء</button>
        <button type="submit" className="flex-1 py-3 rounded-xl text-white font-bold font-cairo" style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>حفظ البيانات</button>
      </div>
    </form>
  );
}

function PatientsManagement() {
  const [patients, setPatients] = useState(EGYPTIAN_PATIENTS);
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editPat, setEditPat] = useState(null);
  const [viewPat, setViewPat] = useState(null);
  const [deletePat, setDeletePat] = useState(null);
  const { toasts, addToast, removeToast } = useToast();

  const filtered = patients.filter(p => p.name.includes(search) || p.phone.includes(search));

  const medHistory = [
    { date: '15 مارس 2025', diagnosis: 'التهاب رئوي', doctor: 'د. أحمد محمود', status: 'متعافٍ', cost: '800 ج.م' },
    { date: '5 يناير 2025', diagnosis: 'ضغط دم مرتفع', doctor: 'د. أحمد محمود', status: 'متابعة', cost: '1200 ج.م' },
    { date: '20 أكتوبر 2024', diagnosis: 'تحاليل دورية', doctor: 'د. عمر النجار', status: 'طبيعي', cost: '350 ج.م' },
  ];

  return (
    <div className="p-6 fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div className="section-header mb-0">
          <div className="section-header-line" style={{ background: 'linear-gradient(180deg, #2563eb, #1d4ed8)' }} />
          <h3 className="text-xl font-bold">إدارة المرضى</h3>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white">
            <Search className="w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} className="text-sm outline-none font-cairo w-36" placeholder="بحث بالاسم أو الهاتف..." />
          </div>
          <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium" style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
            <PlusCircle className="w-4 h-4" />إضافة مريض
          </button>
        </div>
      </div>
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
        <table className="hospital-table">
          <thead><tr><th>المريض</th><th>العمر</th><th>الهاتف</th><th>فصيلة الدم</th><th>التشخيص</th><th>الحالة</th><th>إجراءات</th></tr></thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{ background: 'linear-gradient(135deg, #2563eb, #14b8a6)' }}>
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{p.name}</p>
                      <p className="text-slate-400 text-xs">{p.address}</p>
                    </div>
                  </div>
                </td>
                <td className="text-slate-600">{p.age} سنة</td>
                <td className="text-slate-600 text-sm">{p.phone}</td>
                <td><span className="badge-danger">{p.blood}</span></td>
                <td className="text-slate-600 text-sm">{p.diagnosis}</td>
                <td><span className={p.status === 'active' ? 'badge-success' : p.status === 'admitted' ? 'badge-info' : 'badge-warning'}>{p.status === 'active' ? 'نشط' : p.status === 'admitted' ? 'منوم' : 'غير نشط'}</span></td>
                <td>
                  <div className="flex gap-2">
                    <button onClick={() => setViewPat(p)} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setEditPat(p)} className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setDeletePat(p)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="إضافة مريض جديد" size="lg">
        <PatientForm onSave={f => { setPatients(prev => [...prev, { ...f, id: Date.now(), lastVisit: new Date().toISOString().split('T')[0] }]); setAddOpen(false); addToast('تم إضافة المريض بنجاح ✓', 'success'); }} onClose={() => setAddOpen(false)} />
      </Modal>
      <Modal open={!!editPat} onClose={() => setEditPat(null)} title="تعديل بيانات المريض" size="lg">
        {editPat && <PatientForm initial={editPat} onSave={f => { setPatients(prev => prev.map(p => p.id === editPat.id ? { ...p, ...f } : p)); setEditPat(null); addToast('تم تحديث البيانات ✓', 'success'); }} onClose={() => setEditPat(null)} />}
      </Modal>
      <Modal open={!!viewPat} onClose={() => setViewPat(null)} title="السجل الطبي للمريض" size="lg">
        {viewPat && (
          <div className="p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-black" style={{ background: 'linear-gradient(135deg, #2563eb, #14b8a6)' }}>{viewPat.name.charAt(0)}</div>
              <div><h3 className="text-lg font-black text-slate-900">{viewPat.name}</h3><p className="text-slate-500 text-sm">{viewPat.age} سنة • {viewPat.blood} • {viewPat.phone}</p></div>
            </div>
            <h4 className="font-bold text-slate-900 mb-3">السجل الطبي</h4>
            <div className="space-y-3">
              {medHistory.map((h, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: h.status === 'متعافٍ' ? '#14b8a6' : '#f59e0b' }} />
                  <div className="flex-1"><p className="font-medium text-slate-800 text-sm">{h.diagnosis}</p><p className="text-slate-400 text-xs">{h.doctor} — {h.date}</p></div>
                  <div className="text-left"><span className={h.status === 'متعافٍ' ? 'badge-success' : 'badge-warning'}>{h.status}</span><p className="text-slate-400 text-xs mt-1">{h.cost}</p></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
      <ConfirmDialog open={!!deletePat} onClose={() => setDeletePat(null)} onConfirm={() => { setPatients(prev => prev.filter(p => p.id !== deletePat.id)); addToast('تم حذف المريض من النظام', 'error'); }}
        title="حذف المريض" message={`هل أنت متأكد من حذف ${deletePat?.name}؟`} />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

function DepartmentsManagement() {
  const [depts, setDepts] = useState(DEPARTMENTS);
  const [addOpen, setAddOpen] = useState(false);
  const [editDept, setEditDept] = useState(null);
  const [deleteDept, setDeleteDept] = useState(null);
  const { toasts, addToast, removeToast } = useToast();
  const emptyForm = { name: '', head: '', doctors: '', beds: '', occupancy: 0, phone: '', floor: '' };
  const [form, setForm] = useState(emptyForm);
  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const DeptForm = ({ onSave, onClose }) => (
    <form className="p-6 space-y-4" onSubmit={e => { e.preventDefault(); onSave(form); }}>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2"><label className="block text-slate-600 text-sm font-semibold mb-1">اسم القسم</label><input required value={form.name} onChange={e => setF('name', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none font-cairo" /></div>
        <div><label className="block text-slate-600 text-sm font-semibold mb-1">رئيس القسم</label><input value={form.head} onChange={e => setF('head', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none font-cairo" /></div>
        <div><label className="block text-slate-600 text-sm font-semibold mb-1">عدد الأطباء</label><input type="number" value={form.doctors} onChange={e => setF('doctors', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none font-cairo" /></div>
        <div><label className="block text-slate-600 text-sm font-semibold mb-1">عدد الأسرة</label><input type="number" value={form.beds} onChange={e => setF('beds', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none font-cairo" /></div>
        <div><label className="block text-slate-600 text-sm font-semibold mb-1">الطابق</label><input value={form.floor} onChange={e => setF('floor', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none font-cairo" placeholder="الطابق الثالث" /></div>
        <div className="col-span-2"><label className="block text-slate-600 text-sm font-semibold mb-1">رقم الهاتف</label><input value={form.phone} onChange={e => setF('phone', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none font-cairo" /></div>
      </div>
      <div className="flex gap-3"><button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 font-cairo">إلغاء</button><button type="submit" className="flex-1 py-3 rounded-xl text-white font-bold font-cairo" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>حفظ</button></div>
    </form>
  );

  return (
    <div className="p-6 fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div className="section-header mb-0"><div className="section-header-line" style={{ background: 'linear-gradient(180deg, #8b5cf6, #7c3aed)' }} /><h3 className="text-xl font-bold">إدارة الأقسام</h3></div>
        <button onClick={() => { setForm(emptyForm); setAddOpen(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}><PlusCircle className="w-4 h-4" />إضافة قسم</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {depts.map(dept => (
          <div key={dept.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-3">
              <div><h4 className="font-bold text-slate-900">{dept.name}</h4><p className="text-slate-400 text-sm">{dept.head}</p></div>
              <div className="flex gap-2">
                <button onClick={() => { setForm({ ...dept }); setEditDept(dept); }} className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => setDeleteDept(dept)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center mb-3">
              <div className="p-3 bg-slate-50 rounded-xl"><div className="font-bold text-slate-900">{dept.doctors}</div><div className="text-slate-400 text-xs">طبيب</div></div>
              <div className="p-3 bg-slate-50 rounded-xl"><div className="font-bold text-slate-900">{dept.beds}</div><div className="text-slate-400 text-xs">سرير</div></div>
              <div className="p-3 bg-slate-50 rounded-xl"><div className="font-bold" style={{ color: dept.occupancy > 85 ? '#ef4444' : '#14b8a6' }}>{dept.occupancy}%</div><div className="text-slate-400 text-xs">إشغال</div></div>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${dept.occupancy}%`, background: dept.occupancy > 85 ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #14b8a6, #0d9488)' }} />
            </div>
          </div>
        ))}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="إضافة قسم جديد" size="md">
        <DeptForm onSave={f => { setDepts(prev => [...prev, { ...f, id: Date.now(), occupancy: 0 }]); setAddOpen(false); addToast('تم إضافة القسم بنجاح ✓', 'success'); }} onClose={() => setAddOpen(false)} />
      </Modal>
      <Modal open={!!editDept} onClose={() => setEditDept(null)} title="تعديل بيانات القسم" size="md">
        {editDept && <DeptForm onSave={f => { setDepts(prev => prev.map(d => d.id === editDept.id ? { ...d, ...f } : d)); setEditDept(null); addToast('تم تحديث القسم ✓', 'success'); }} onClose={() => setEditDept(null)} />}
      </Modal>
      <ConfirmDialog open={!!deleteDept} onClose={() => setDeleteDept(null)} onConfirm={() => { setDepts(prev => prev.filter(d => d.id !== deleteDept.id)); addToast('تم حذف القسم', 'error'); }}
        title="حذف القسم" message={`هل أنت متأكد من حذف قسم "${deleteDept?.name}"؟`} />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

// ===================== APPOINTMENTS =====================
const INIT_APPOINTMENTS = [
  { id: 1, patient: 'محمد أحمد علي', doctor: 'د. أحمد السيد', dept: 'قسم القلب', date: '2026-04-24', time: '09:00 ص', type: 'كشف جديد', status: 'confirmed', phone: '01012345678' },
  { id: 2, patient: 'فاطمة حسن', doctor: 'د. سارة العمري', dept: 'قسم الأعصاب', date: '2026-04-24', time: '10:30 ص', type: 'متابعة', status: 'pending', phone: '01098765432' },
  { id: 3, patient: 'خالد إبراهيم', doctor: 'د. محمد الحارثي', dept: 'قسم العظام', date: '2026-04-25', time: '11:00 ص', type: 'استشارة', status: 'confirmed', phone: '01234567890' },
  { id: 4, patient: 'نورا سامي', doctor: 'د. فاطمة الزهراء', dept: 'طب الأطفال', date: '2026-04-25', time: '02:00 م', type: 'كشف جديد', status: 'cancelled', phone: '01555555555' },
  { id: 5, patient: 'عمر رمضان', doctor: 'د. أحمد السيد', dept: 'قسم القلب', date: '2026-04-26', time: '08:30 ص', type: 'إجراء طبي', status: 'pending', phone: '01111111111' },
];

const STATUS_APT = { confirmed: { label: 'مؤكد', cls: 'badge-success' }, pending: { label: 'انتظار', cls: 'badge-warning' }, cancelled: { label: 'ملغي', cls: 'badge-danger' } };

function AppointmentsManagement() {
  const [appointments, setAppointments] = useState(INIT_APPOINTMENTS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [addOpen, setAddOpen] = useState(false);
  const [editApt, setEditApt] = useState(null);
  const [deleteApt, setDeleteApt] = useState(null);
  const { toasts, addToast, removeToast } = useToast();
  const emptyApt = { patient: '', doctor: '', dept: '', date: '', time: '', type: 'كشف جديد', status: 'pending', phone: '' };
  const [form, setFormA] = useState(emptyApt);
  const setF = (k, v) => setFormA(p => ({ ...p, [k]: v }));

  const filtered = appointments.filter(a =>
    (filterStatus === 'all' || a.status === filterStatus) &&
    (a.patient.includes(search) || a.doctor.includes(search) || a.dept.includes(search))
  );

  const AptForm = ({ onSave, onClose }) => (
    <form className="p-6 space-y-4" onSubmit={e => { e.preventDefault(); onSave(form); }}>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2"><label className="block text-slate-600 text-sm font-semibold mb-1">اسم المريض</label><input required value={form.patient} onChange={e => setF('patient', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none font-cairo" /></div>
        <div><label className="block text-slate-600 text-sm font-semibold mb-1">رقم الهاتف</label><input value={form.phone} onChange={e => setF('phone', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none font-cairo" /></div>
        <div><label className="block text-slate-600 text-sm font-semibold mb-1">الطبيب</label><input required value={form.doctor} onChange={e => setF('doctor', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none font-cairo" /></div>
        <div><label className="block text-slate-600 text-sm font-semibold mb-1">القسم</label><input value={form.dept} onChange={e => setF('dept', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none font-cairo" /></div>
        <div><label className="block text-slate-600 text-sm font-semibold mb-1">التاريخ</label><input type="date" required value={form.date} onChange={e => setF('date', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none font-cairo" /></div>
        <div><label className="block text-slate-600 text-sm font-semibold mb-1">الوقت</label>
          <select value={form.time} onChange={e => setF('time', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none font-cairo">
            {['08:00 ص','08:30 ص','09:00 ص','09:30 ص','10:00 ص','10:30 ص','11:00 ص','11:30 ص','12:00 م','01:00 م','02:00 م','03:00 م','04:00 م'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div><label className="block text-slate-600 text-sm font-semibold mb-1">نوع الزيارة</label>
          <select value={form.type} onChange={e => setF('type', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none font-cairo">
            {['كشف جديد','متابعة','استشارة','إجراء طبي'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div><label className="block text-slate-600 text-sm font-semibold mb-1">الحالة</label>
          <select value={form.status} onChange={e => setF('status', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none font-cairo">
            <option value="pending">انتظار</option><option value="confirmed">مؤكد</option><option value="cancelled">ملغي</option>
          </select>
        </div>
      </div>
      <div className="flex gap-3"><button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 font-cairo">إلغاء</button><button type="submit" className="flex-1 py-3 rounded-xl text-white font-bold font-cairo" style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>حفظ</button></div>
    </form>
  );

  return (
    <div className="p-6 fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div className="section-header mb-0"><div className="section-header-line" style={{ background: 'linear-gradient(180deg, #2563eb, #3b82f6)' }} /><h3 className="text-xl font-bold">إدارة المواعيد</h3></div>
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white">
            <Search className="w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} className="text-sm outline-none font-cairo w-32" placeholder="بحث..." />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-cairo outline-none">
            <option value="all">كل الحالات</option><option value="confirmed">مؤكد</option><option value="pending">انتظار</option><option value="cancelled">ملغي</option>
          </select>
          <button onClick={() => { setFormA(emptyApt); setAddOpen(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium" style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
            <PlusCircle className="w-4 h-4" />إضافة موعد
          </button>
        </div>
      </div>
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
        <table className="hospital-table">
          <thead><tr><th>المريض</th><th>الطبيب / القسم</th><th>التاريخ والوقت</th><th>نوع الزيارة</th><th>الحالة</th><th>إجراءات</th></tr></thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id}>
                <td><div><p className="font-medium text-slate-800">{a.patient}</p><p className="text-slate-400 text-xs">{a.phone}</p></div></td>
                <td><div><p className="font-medium text-slate-700 text-sm">{a.doctor}</p><p className="text-slate-400 text-xs">{a.dept}</p></div></td>
                <td><div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-blue-400" /><div><p className="text-sm font-medium text-slate-700">{a.date}</p><p className="text-xs text-slate-400">{a.time}</p></div></div></td>
                <td><span className="badge-info text-xs">{a.type}</span></td>
                <td><span className={STATUS_APT[a.status]?.cls || 'badge-info'}>{STATUS_APT[a.status]?.label}</span></td>
                <td>
                  <div className="flex gap-2">
                    <button onClick={() => { setFormA({ ...a }); setEditApt(a); }} className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setDeleteApt(a)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-12 text-slate-400">لا توجد مواعيد</div>}
      </div>
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="إضافة موعد جديد" size="lg">
        <AptForm onSave={f => { setAppointments(prev => [...prev, { ...f, id: Date.now() }]); setAddOpen(false); addToast('تم إضافة الموعد بنجاح ✓', 'success'); }} onClose={() => setAddOpen(false)} />
      </Modal>
      <Modal open={!!editApt} onClose={() => setEditApt(null)} title="تعديل الموعد" size="lg">
        {editApt && <AptForm onSave={f => { setAppointments(prev => prev.map(a => a.id === editApt.id ? { ...a, ...f } : a)); setEditApt(null); addToast('تم تحديث الموعد ✓', 'success'); }} onClose={() => setEditApt(null)} />}
      </Modal>
      <ConfirmDialog open={!!deleteApt} onClose={() => setDeleteApt(null)} onConfirm={() => { setAppointments(prev => prev.filter(a => a.id !== deleteApt.id)); addToast('تم حذف الموعد', 'error'); }}
        title="حذف الموعد" message={`هل أنت متأكد من حذف موعد "${deleteApt?.patient}"؟`} />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

// ===================== BEDS =====================
const INIT_BEDS = [
  { id: 1, number: 'A-101', dept: 'قسم القلب', floor: 'الأول', status: 'occupied', patient: 'محمد أحمد علي', since: '2026-04-20', type: 'عادي' },
  { id: 2, number: 'A-102', dept: 'قسم القلب', floor: 'الأول', status: 'available', patient: '', since: '', type: 'عادي' },
  { id: 3, number: 'B-201', dept: 'قسم الأعصاب', floor: 'الثاني', status: 'occupied', patient: 'فاطمة حسن', since: '2026-04-22', type: 'عادي' },
  { id: 4, number: 'C-301', dept: 'طب الأطفال', floor: 'الثالث', status: 'maintenance', patient: '', since: '', type: 'خاص' },
  { id: 5, number: 'ICU-01', dept: 'العناية المركزة', floor: 'الأرضي', status: 'occupied', patient: 'خالد إبراهيم', since: '2026-04-21', type: 'عناية مركزة' },
  { id: 6, number: 'ICU-02', dept: 'العناية المركزة', floor: 'الأرضي', status: 'available', patient: '', since: '', type: 'عناية مركزة' },
  { id: 7, number: 'B-202', dept: 'قسم العظام', floor: 'الثاني', status: 'occupied', patient: 'سامي النجار', since: '2026-04-19', type: 'خاص' },
  { id: 8, number: 'D-401', dept: 'النساء والتوليد', floor: 'الرابع', status: 'available', patient: '', since: '', type: 'عادي' },
];

const BED_STATUS = { occupied: { label: 'مشغول', cls: 'badge-danger' }, available: { label: 'شاغر', cls: 'badge-success' }, maintenance: { label: 'صيانة', cls: 'badge-warning' } };

function BedsManagement() {
  const [beds, setBeds] = useState(INIT_BEDS);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDept, setFilterDept] = useState('all');
  const [addOpen, setAddOpen] = useState(false);
  const [editBed, setEditBed] = useState(null);
  const [deleteBed, setDeleteBed] = useState(null);
  const { toasts, addToast, removeToast } = useToast();
  const emptyBed = { number: '', dept: '', floor: '', status: 'available', patient: '', since: '', type: 'عادي' };
  const [form, setFormB] = useState(emptyBed);
  const setF = (k, v) => setFormB(p => ({ ...p, [k]: v }));

  const depts = [...new Set(beds.map(b => b.dept))];
  const filtered = beds.filter(b =>
    (filterStatus === 'all' || b.status === filterStatus) &&
    (filterDept === 'all' || b.dept === filterDept)
  );
  const stats = { total: beds.length, occupied: beds.filter(b => b.status === 'occupied').length, available: beds.filter(b => b.status === 'available').length, maintenance: beds.filter(b => b.status === 'maintenance').length };

  const BedForm = ({ onSave, onClose }) => (
    <form className="p-6 space-y-4" onSubmit={e => { e.preventDefault(); onSave(form); }}>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-slate-600 text-sm font-semibold mb-1">رقم السرير</label><input required value={form.number} onChange={e => setF('number', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none font-cairo" placeholder="A-101" /></div>
        <div><label className="block text-slate-600 text-sm font-semibold mb-1">القسم</label><input required value={form.dept} onChange={e => setF('dept', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none font-cairo" /></div>
        <div><label className="block text-slate-600 text-sm font-semibold mb-1">الطابق</label><input value={form.floor} onChange={e => setF('floor', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none font-cairo" /></div>
        <div><label className="block text-slate-600 text-sm font-semibold mb-1">النوع</label>
          <select value={form.type} onChange={e => setF('type', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none font-cairo">
            {['عادي','خاص','عناية مركزة','عزل'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div><label className="block text-slate-600 text-sm font-semibold mb-1">الحالة</label>
          <select value={form.status} onChange={e => setF('status', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none font-cairo">
            <option value="available">شاغر</option><option value="occupied">مشغول</option><option value="maintenance">صيانة</option>
          </select>
        </div>
        {form.status === 'occupied' && <>
          <div><label className="block text-slate-600 text-sm font-semibold mb-1">اسم المريض</label><input value={form.patient} onChange={e => setF('patient', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none font-cairo" /></div>
          <div><label className="block text-slate-600 text-sm font-semibold mb-1">تاريخ الإدخال</label><input type="date" value={form.since} onChange={e => setF('since', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none font-cairo" /></div>
        </>}
      </div>
      <div className="flex gap-3"><button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 font-cairo">إلغاء</button><button type="submit" className="flex-1 py-3 rounded-xl text-white font-bold font-cairo" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>حفظ</button></div>
    </form>
  );

  return (
    <div className="p-6 fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div className="section-header mb-0"><div className="section-header-line" style={{ background: 'linear-gradient(180deg, #f59e0b, #d97706)' }} /><h3 className="text-xl font-bold">إدارة الأسرة</h3></div>
        <div className="flex gap-3 flex-wrap">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-cairo outline-none">
            <option value="all">كل الحالات</option><option value="available">شاغر</option><option value="occupied">مشغول</option><option value="maintenance">صيانة</option>
          </select>
          <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-cairo outline-none">
            <option value="all">كل الأقسام</option>
            {depts.map(d => <option key={d}>{d}</option>)}
          </select>
          <button onClick={() => { setFormB(emptyBed); setAddOpen(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
            <PlusCircle className="w-4 h-4" />إضافة سرير
          </button>
        </div>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { l: 'إجمالي الأسرة', v: stats.total, color: '#64748b' },
          { l: 'مشغولة', v: stats.occupied, color: '#ef4444' },
          { l: 'شاغرة', v: stats.available, color: '#14b8a6' },
          { l: 'صيانة', v: stats.maintenance, color: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 text-center shadow-sm border border-slate-100">
            <div className="text-2xl font-black" style={{ color: s.color }}>{s.v}</div>
            <div className="text-slate-500 text-xs mt-1">{s.l}</div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
        <table className="hospital-table">
          <thead><tr><th>رقم السرير</th><th>القسم / الطابق</th><th>النوع</th><th>المريض</th><th>الحالة</th><th>إجراءات</th></tr></thead>
          <tbody>
            {filtered.map(b => (
              <tr key={b.id}>
                <td><span className="font-bold text-slate-800 text-base">{b.number}</span></td>
                <td><div><p className="font-medium text-slate-700 text-sm">{b.dept}</p><p className="text-slate-400 text-xs">الطابق {b.floor}</p></div></td>
                <td><span className="badge-purple text-xs">{b.type}</span></td>
                <td>{b.patient ? <div><p className="text-sm font-medium text-slate-700">{b.patient}</p><p className="text-xs text-slate-400">منذ {b.since}</p></div> : <span className="text-slate-300 text-sm">—</span>}</td>
                <td><span className={BED_STATUS[b.status]?.cls || 'badge-info'}>{BED_STATUS[b.status]?.label}</span></td>
                <td>
                  <div className="flex gap-2">
                    <button onClick={() => { setFormB({ ...b }); setEditBed(b); }} className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setDeleteBed(b)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-12 text-slate-400">لا توجد أسرة</div>}
      </div>
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="إضافة سرير جديد" size="md">
        <BedForm onSave={f => { setBeds(prev => [...prev, { ...f, id: Date.now() }]); setAddOpen(false); addToast('تم إضافة السرير بنجاح ✓', 'success'); }} onClose={() => setAddOpen(false)} />
      </Modal>
      <Modal open={!!editBed} onClose={() => setEditBed(null)} title="تعديل بيانات السرير" size="md">
        {editBed && <BedForm onSave={f => { setBeds(prev => prev.map(b => b.id === editBed.id ? { ...b, ...f } : b)); setEditBed(null); addToast('تم تحديث السرير ✓', 'success'); }} onClose={() => setEditBed(null)} />}
      </Modal>
      <ConfirmDialog open={!!deleteBed} onClose={() => setDeleteBed(null)} onConfirm={() => { setBeds(prev => prev.filter(b => b.id !== deleteBed.id)); addToast('تم حذف السرير', 'error'); }}
        title="حذف السرير" message={`هل أنت متأكد من حذف السرير "${deleteBed?.number}"؟`} />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

// ===================== BLOG =====================
const INIT_POSTS = [
  { id: 1, title: 'كيف تحافظ على صحة قلبك في 10 خطوات', category: 'صحة القلب', author: 'د. أحمد السيد', date: '2026-04-15', status: 'published', img: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=200&fit=crop', content: 'محتوى المقال...' },
  { id: 2, title: 'أهمية الفحص الدوري المبكر للكشف عن السرطان', category: 'الوقاية', author: 'د. سارة العمري', date: '2026-04-12', status: 'published', img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=200&fit=crop', content: 'محتوى المقال...' },
  { id: 3, title: 'التغذية السليمة لمرضى السكري: دليل شامل', category: 'تغذية', author: 'د. فاطمة الزهراء', date: '2026-04-10', status: 'draft', img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=200&fit=crop', content: 'محتوى المقال...' },
  { id: 4, title: 'تمارين يومية لتقوية العظام والمفاصل', category: 'رياضة وصحة', author: 'د. محمد الحارثي', date: '2026-04-08', status: 'published', img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop', content: 'محتوى المقال...' },
];

const CATEGORIES = ['صحة القلب', 'الوقاية', 'تغذية', 'رياضة وصحة', 'الصحة النفسية', 'نمط الحياة', 'أمراض مزمنة', 'طب الأطفال'];

function BlogManagement() {
  const [posts, setPosts] = useState(INIT_POSTS);
  const [addOpen, setAddOpen] = useState(false);
  const [editPost, setEditPost] = useState(null);
  const [deletePost, setDeletePost] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const { toasts, addToast, removeToast } = useToast();
  const emptyPost = { title: '', category: 'صحة القلب', author: '', date: new Date().toISOString().split('T')[0], status: 'draft', img: '', content: '' };
  const [form, setFormP] = useState(emptyPost);
  const setF = (k, v) => setFormP(p => ({ ...p, [k]: v }));

  const filtered = posts.filter(p => filterStatus === 'all' || p.status === filterStatus);

  const PostForm = ({ onSave, onClose }) => (
    <form className="p-6 space-y-4" onSubmit={e => { e.preventDefault(); onSave(form); }}>
      <div><label className="block text-slate-600 text-sm font-semibold mb-1">عنوان المقال</label><input required value={form.title} onChange={e => setF('title', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none font-cairo" /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-slate-600 text-sm font-semibold mb-1">التصنيف</label>
          <select value={form.category} onChange={e => setF('category', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none font-cairo">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div><label className="block text-slate-600 text-sm font-semibold mb-1">الكاتب</label><input value={form.author} onChange={e => setF('author', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none font-cairo" /></div>
        <div><label className="block text-slate-600 text-sm font-semibold mb-1">تاريخ النشر</label><input type="date" value={form.date} onChange={e => setF('date', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none font-cairo" /></div>
        <div><label className="block text-slate-600 text-sm font-semibold mb-1">الحالة</label>
          <select value={form.status} onChange={e => setF('status', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none font-cairo">
            <option value="draft">مسودة</option><option value="published">منشور</option>
          </select>
        </div>
      </div>
      <div><label className="block text-slate-600 text-sm font-semibold mb-1">رابط الصورة</label><input value={form.img} onChange={e => setF('img', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none font-cairo" placeholder="https://..." /></div>
      <div><label className="block text-slate-600 text-sm font-semibold mb-1">محتوى المقال</label><textarea value={form.content} onChange={e => setF('content', e.target.value)} rows={5} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none font-cairo resize-none" placeholder="اكتب محتوى المقال هنا..." /></div>
      <div className="flex gap-3"><button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 font-cairo">إلغاء</button><button type="submit" className="flex-1 py-3 rounded-xl text-white font-bold font-cairo" style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}>حفظ المقال</button></div>
    </form>
  );

  return (
    <div className="p-6 fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div className="section-header mb-0"><div className="section-header-line" style={{ background: 'linear-gradient(180deg, #14b8a6, #0d9488)' }} /><h3 className="text-xl font-bold">المدونة والمحتوى</h3></div>
        <div className="flex gap-3">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-cairo outline-none">
            <option value="all">الكل</option><option value="published">منشور</option><option value="draft">مسودة</option>
          </select>
          <button onClick={() => { setFormP(emptyPost); setAddOpen(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium" style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}>
            <PlusCircle className="w-4 h-4" />مقال جديد
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(post => (
          <div key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col">
            {post.img && <img src={post.img} alt={post.title} className="w-full h-40 object-cover" />}
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <span className="badge-info text-xs">{post.category}</span>
                <span className={post.status === 'published' ? 'badge-success text-xs' : 'badge-warning text-xs'}>{post.status === 'published' ? 'منشور' : 'مسودة'}</span>
              </div>
              <h4 className="font-bold text-slate-900 mb-2 leading-snug">{post.title}</h4>
              <p className="text-slate-400 text-xs mb-3">{post.author} — {post.date}</p>
              <div className="mt-auto flex gap-2">
                <button onClick={() => { setFormP({ ...post }); setEditPost(post); }} className="flex-1 py-2 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 text-sm font-medium flex items-center justify-center gap-1"><Pencil className="w-3.5 h-3.5" />تعديل</button>
                <button onClick={() => setDeletePost(post)} className="flex-1 py-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 text-sm font-medium flex items-center justify-center gap-1"><Trash2 className="w-3.5 h-3.5" />حذف</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="إضافة مقال جديد" size="lg">
        <PostForm onSave={f => { setPosts(prev => [...prev, { ...f, id: Date.now() }]); setAddOpen(false); addToast('تم نشر المقال بنجاح ✓', 'success'); }} onClose={() => setAddOpen(false)} />
      </Modal>
      <Modal open={!!editPost} onClose={() => setEditPost(null)} title="تعديل المقال" size="lg">
        {editPost && <PostForm onSave={f => { setPosts(prev => prev.map(p => p.id === editPost.id ? { ...p, ...f } : p)); setEditPost(null); addToast('تم تحديث المقال ✓', 'success'); }} onClose={() => setEditPost(null)} />}
      </Modal>
      <ConfirmDialog open={!!deletePost} onClose={() => setDeletePost(null)} onConfirm={() => { setPosts(prev => prev.filter(p => p.id !== deletePost.id)); addToast('تم حذف المقال', 'error'); }}
        title="حذف المقال" message={`هل أنت متأكد من حذف مقال "${deletePost?.title}"؟`} />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

function AdminHome() {
  return (
    <div className="p-6 space-y-8 fade-in">
      <div className="relative overflow-hidden rounded-3xl p-8" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
        <div className="absolute top-0 left-0 w-48 h-48 rounded-full blur-3xl opacity-20 -translate-x-1/4 -translate-y-1/4" style={{ background: 'white' }} />
        <div className="relative">
          <p className="text-purple-100 text-sm mb-1">لوحة الإدارة التشغيلية</p>
          <h2 className="text-white text-3xl font-black mb-2">عمر الإدريسي</h2>
          <p className="text-purple-100">صلاحيات إدارة الأطباء والمرضى والأقسام</p>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'إجمالي المرضى', value: '3,247', icon: Users, gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', trend: 'up', trendValue: '+124' },
          { title: 'الحجوزات اليوم', value: '87', icon: Calendar, gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)', trend: 'up', trendValue: '+12' },
          { title: 'عدد الأطباء', value: '120', icon: Stethoscope, gradient: 'linear-gradient(135deg, #14b8a6, #0d9488)' },
          { title: 'الأسرة الشاغرة', value: '23', icon: Bed, gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
        ].map((s, i) => <StatCard key={i} {...s} index={i} />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/admin/doctors" className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all group cursor-pointer">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(139,92,246,0.1)' }}><Stethoscope className="w-6 h-6" style={{ color: '#8b5cf6' }} /></div>
          <h3 className="font-bold text-slate-900 mb-1">إدارة الأطباء</h3>
          <p className="text-slate-400 text-sm">إضافة وتعديل وحذف الأطباء</p>
        </Link>
        <Link to="/admin/patients" className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all cursor-pointer">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(37,99,235,0.1)' }}><Users className="w-6 h-6" style={{ color: '#2563eb' }} /></div>
          <h3 className="font-bold text-slate-900 mb-1">إدارة المرضى</h3>
          <p className="text-slate-400 text-sm">السجلات الطبية والبيانات</p>
        </Link>
        <Link to="/admin/departments" className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all cursor-pointer">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(20,184,166,0.1)' }}><Building2 className="w-6 h-6" style={{ color: '#14b8a6' }} /></div>
          <h3 className="font-bold text-slate-900 mb-1">إدارة الأقسام</h3>
          <p className="text-slate-400 text-sm">إدارة أقسام المستشفى</p>
        </Link>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);
  const user = (() => { try { return JSON.parse(sessionStorage.getItem('hospitalUser') || '{}'); } catch { return {}; } })();
  const handleLogout = () => { sessionStorage.removeItem('hospitalUser'); navigate('/role-select'); };
  const currentTitle = sidebarLinks.find(l => l.path === location.pathname)?.label || 'لوحة التحكم';

  return (
    <div className="flex min-h-screen font-cairo" dir="rtl">
      <aside className="sidebar hidden md:flex flex-col" style={{ width: '260px' }}>
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}><HeartPulse className="w-5 h-5 text-white" /></div>
          <div><div className="text-white font-bold text-sm">مستشفى الشفاء</div><div className="text-slate-400 text-xs">الإدارة التشغيلية</div></div>
        </div>
        <div className="mx-4 mt-4 p-3 rounded-xl" style={{ background: 'rgba(139,92,246,0.15)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>{user.name?.charAt(0) || 'إ'}</div>
            <div><div className="text-white text-sm font-semibold truncate max-w-36">{user.name}</div><div className="text-purple-300 text-xs">مسؤول النظام</div></div>
          </div>
        </div>
        <nav className="flex-1 p-3 mt-2">
          {sidebarLinks.map((item, i) => {
            const isActive = location.pathname === item.path;
            return <Link key={i} to={item.path} className={`sidebar-item ${isActive ? 'active' : ''}`} style={isActive ? { borderColor: '#8b5cf6' } : {}}><item.icon className="w-5 h-5" style={{ color: isActive ? '#8b5cf6' : undefined }} /><span>{item.label}</span></Link>;
          })}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout} className="sidebar-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"><LogOut className="w-5 h-5" /><span>خروج</span></button>
        </div>
      </aside>
      <button onClick={() => setMobileMenu(true)} className="fixed top-4 right-4 z-50 md:hidden w-11 h-11 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}><Menu className="w-5 h-5 text-white" /></button>
      <main className="flex-1 min-h-screen" style={{ background: 'linear-gradient(135deg, #faf5ff, #eff6ff, #f0fdfa)', marginRight: '260px' }} id="admin-main">
        <Topbar title={currentTitle} roleColor="#8b5cf6" />
        <Routes>
          <Route index element={<AdminHome />} />
          <Route path="dashboard" element={<AdminHome />} />
          <Route path="doctors" element={<DoctorsManagement />} />
          <Route path="patients" element={<PatientsManagement />} />
          <Route path="departments" element={<DepartmentsManagement />} />
          <Route path="appointments" element={<AppointmentsManagement />} />
          <Route path="beds" element={<BedsManagement />} />
          <Route path="blog" element={<BlogManagement />} />
          <Route path="*" element={<AdminHome />} />
        </Routes>
      </main>
      <style>{`@media (max-width: 768px) { #admin-main { margin-right: 0 !important; } }`}</style>
    </div>
  );
}