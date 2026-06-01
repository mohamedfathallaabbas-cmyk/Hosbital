import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Users, Stethoscope, Building2, Calendar,
  Bed, FileText, BookOpen, Activity, Settings, LogOut,
  HeartPulse, PlusCircle, Pencil, Trash2, Search,
  Menu, X, BarChart3, Eye, Phone, MapPin, CheckCircle,
  Clock, User, Tag, Image, AlignLeft
} from 'lucide-react';
import StatCard from '../../../components/hospital/StatCard';
import Modal from '../../../components/hospital/Modal';
import ConfirmDialog from '../../../components/hospital/ConfirmDialog';
import { ToastContainer } from '../../../components/hospital/Toast';
import { useToast } from '../../../hooks/useToast';
import { EGYPTIAN_DOCTORS, EGYPTIAN_PATIENTS, DEPARTMENTS } from '../../../lib/egyptianData';

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

export default DoctorsManagement;