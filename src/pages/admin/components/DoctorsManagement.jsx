import { useState, useEffect } from 'react';
import {
  Users, Stethoscope, Building2, Calendar,
  Bed, FileText, BookOpen, Activity, LogOut,
  HeartPulse, PlusCircle, Pencil, Trash2, Search,
  Eye, Phone, CheckCircle, Clock, User, Save, X
} from 'lucide-react';
import StatCard from '../../../components/hospital/StatCard';
import Modal from '../../../components/hospital/Modal';
import ConfirmDialog from '../../../components/hospital/ConfirmDialog';
import { ToastContainer } from '../../../components/hospital/Toast';
import { useToast } from '../../../hooks/useToast';
import api from '../../../lib/api';

const SPECIALTIES = ['قلب وأوعية دموية', 'أعصاب', 'عظام ومفاصل', 'طب أطفال', 'باطنة وجهاز هضمي', 'نساء وتوليد', 'عيون', 'جراحة عامة', 'أسنان', 'طوارئ'];

function DoctorForm({ initial, onSave, onClose, isFinance }) {
  const [form, setForm] = useState(initial || { name: '', specialty: '', clinic: '', phone: '', email: '', fee: '350', departmentId: '' });
  const [depts, setDepts] = useState([]);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    api.get('/admin/departments').then(r => setDepts(r.data || [])).catch(() => {});
  }, []);

  return (
    <form className="p-6 space-y-4 font-cairo" onSubmit={e => { e.preventDefault(); onSave(form); }}>
      <div className="grid grid-cols-2 gap-4">
        
        {/* Name */}
        <div className="col-span-2">
          <label className="block text-slate-600 text-sm font-semibold mb-1">الاسم الكامل</label>
          <input required disabled={isFinance} value={form.name} onChange={e => set('name', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:border-blue-400 outline-none transition disabled:opacity-70" placeholder="د. الاسم الكامل" />
        </div>

        {/* Specialty */}
        <div>
          <label className="block text-slate-600 text-sm font-semibold mb-1">التخصص</label>
          <select required disabled={isFinance} value={form.specialty} onChange={e => set('specialty', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:border-blue-400 outline-none disabled:opacity-70">
            <option value="">اختر التخصص</option>
            {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Department Selection */}
        <div>
          <label className="block text-slate-600 text-sm font-semibold mb-1">القسم بالمستشفى</label>
          <select required disabled={isFinance} value={form.departmentId} onChange={e => set('departmentId', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:border-blue-400 outline-none disabled:opacity-70">
            <option value="">اختر القسم</option>
            {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-slate-600 text-sm font-semibold mb-1">رقم الهاتف</label>
          <input required disabled={isFinance} value={form.phone} onChange={e => set('phone', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:border-blue-400 outline-none disabled:opacity-70" placeholder="01xxxxxxxxx" />
        </div>

        {/* Email */}
        <div>
          <label className="block text-slate-600 text-sm font-semibold mb-1">البريد الإلكتروني</label>
          <input required disabled={isFinance} type="email" value={form.email} onChange={e => set('email', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:border-blue-400 outline-none disabled:opacity-70" placeholder="doctor@shifaa.eg" />
        </div>

        {/* Clinic Number */}
        <div>
          <label className="block text-slate-600 text-sm font-semibold mb-1">رقم العيادة</label>
          <input disabled={isFinance} value={form.clinic} onChange={e => set('clinic', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:border-blue-400 outline-none disabled:opacity-70" placeholder="عيادة 5" />
        </div>

        {/* Consultation Fee (Only editable/visible for Finance) */}
        {isFinance && (
          <div>
            <label className="block text-slate-600 text-sm font-bold text-blue-600 mb-1">سعر الكشف (ج.م) *</label>
            <input required type="number" value={form.fee} onChange={e => set('fee', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-blue-200 text-sm bg-blue-50/20 focus:bg-white focus:border-blue-400 outline-none" placeholder="500" />
          </div>
        )}

      </div>

      <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
        <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 text-sm">إلغاء</button>
        <button type="submit" className="flex-1 py-3 rounded-xl text-white font-bold text-sm hover:scale-[1.02] transition-all flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
          <Save className="w-4 h-4" />حفظ البيانات
        </button>
      </div>
    </form>
  );
}

function DoctorDetails({ doctor, isFinance }) {
  return (
    <div className="p-6 space-y-4 font-cairo">
      <div className="text-center pb-4 border-b border-slate-100">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-black mx-auto mb-3" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
          {doctor.name?.charAt(0) || 'ط'}
        </div>
        <h4 className="font-bold text-slate-800 text-lg">{doctor.name}</h4>
        <span className="badge-purple text-xs mt-1 inline-block">{doctor.specialty}</span>
      </div>

      <div className="space-y-2 text-sm">
        {[
          { label: 'البريد الإلكتروني', value: doctor.email || '—' },
          { label: 'رقم الهاتف', value: doctor.phone || '—' },
          { label: 'رقم العيادة', value: doctor.clinic || 'غير محدد' },
          isFinance && { label: 'سعر الكشف المعتمد', value: doctor.fee ? `${doctor.fee} ج.م` : '—' }
        ].filter(Boolean).map((item, i) => (
          <div key={i} className="flex justify-between p-3 rounded-xl bg-slate-50">
            <span className="text-slate-500">{item.label}</span>
            <span className="font-bold text-slate-800">{item.value}</span>
          </div>
        ))}
      </div>
      <button onClick={doctor.onClose} className="mt-5 w-full py-3 rounded-xl text-white font-bold text-sm" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>إغلاق</button>
    </div>
  );
}

export default function DoctorsManagement() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editDoc, setEditDoc] = useState(null);
  const [viewDoc, setViewDoc] = useState(null);
  const [deleteDoc, setDeleteDoc] = useState(null);
  const { toasts, addToast, removeToast } = useToast();

  const currentRole = (() => {
    try { return JSON.parse(sessionStorage.getItem('hospitalUser') || '{}').role?.toUpperCase(); } catch { return ''; }
  })();
  const isFinance = currentRole === 'FINANCIAL_MANAGER';
  const isAdmin = currentRole === 'ADMIN';

  const loadDoctors = () => {
    setLoading(true);
    api.get('/admin/doctors')
      .then(res => {
        const mapped = res.data.map(d => ({
          id: d.id,
          userId: d.userId,
          name: d.user?.name || 'مجهول',
          email: d.user?.email || '',
          phone: d.user?.phone || '',
          specialty: d.specialty || 'عام',
          clinic: d.clinicNumber || '',
          fee: d.consultFee || 0,
          status: d.user?.isActive ? 'active' : 'inactive',
          departmentId: d.departmentId
        }));
        setDoctors(mapped);
      })
      .catch(() => addToast('تعذر تحميل بيانات الأطباء', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadDoctors(); }, []);

  const filtered = doctors.filter(d => d.name.includes(search) || d.specialty.includes(search));

  const handleAdd = async (form) => {
    try {
      await api.post('/admin/users', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: 'doctor-shifa-2026',
        role: 'DOCTOR',
        specialty: form.specialty,
        departmentId: parseInt(form.departmentId)
      });
      setAddOpen(false);
      addToast('تم إضافة الطبيب بنجاح ✓', 'success');
      loadDoctors();
    } catch (err) {
      addToast(err.response?.data?.error || 'فشل إضافة الطبيب', 'error');
    }
  };

  const handleEdit = async (form) => {
    try {
      if (isFinance) {
        // Finance can only edit fee
        await api.patch(`/admin/doctors/${editDoc.id}`, {
          consultFee: parseFloat(form.fee || 0)
        });
      } else {
        // Admin edits specialty and clinicNumber
        await api.patch(`/admin/doctors/${editDoc.id}`, {
          specialty: form.specialty,
          clinicNumber: form.clinic,
          departmentId: parseInt(form.departmentId)
        });
        // And update user full name and phone number
        await api.patch(`/admin/users/${editDoc.userId}`, {
          name: form.name,
          phone: form.phone
        });
      }
      setEditDoc(null);
      addToast('تم تحديث بيانات الطبيب بنجاح ✓', 'success');
      loadDoctors();
    } catch (err) {
      addToast('فشل تحديث البيانات', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/users/${deleteDoc.userId}`);
      setDeleteDoc(null);
      addToast('تم حذف الطبيب بنجاح', 'success');
      loadDoctors();
    } catch (err) {
      addToast('فشل حذف الطبيب', 'error');
    }
  };

  return (
    <div className="p-6 fade-in font-cairo">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div className="section-header mb-0">
          <div className="section-header-line" style={{ background: 'linear-gradient(180deg, #8b5cf6, #7c3aed)' }} />
          <h3 className="text-xl font-bold">{isFinance ? 'رواتب وعقود الأطباء' : 'إدارة الأطباء'}</h3>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white">
            <Search className="w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} className="text-sm outline-none w-36" placeholder="بحث..." />
          </div>
          {isAdmin && (
            <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium hover:scale-[1.02] transition-all" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
              <PlusCircle className="w-4 h-4" />إضافة طبيب
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
        <table className="hospital-table">
          <thead>
            <tr>
              <th>الطبيب</th>
              <th>التخصص</th>
              <th>الهاتف</th>
              {isFinance && <th>سعر الكشف</th>}
              <th>الحالة</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center py-10 animate-pulse text-slate-400">جاري التحميل...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-10 text-slate-400">لا توجد نتائج للبحث</td></tr>
            ) : filtered.map(d => (
              <tr key={d.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                      {d.name?.split(' ')[1]?.charAt(0) || 'ط'}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{d.name}</p>
                      <p className="text-slate-400 text-xs">{d.email}</p>
                    </div>
                  </div>
                </td>
                <td><span className="badge-purple">{d.specialty}</span></td>
                <td className="text-slate-600 text-sm font-mono">{d.phone}</td>
                {isFinance && <td className="font-semibold text-slate-800">{d.fee ? `${d.fee} ج.م` : '—'}</td>}
                <td><span className={d.status === 'active' ? 'badge-success' : 'badge-warning'}>{d.status === 'active' ? 'نشط' : 'إجازة'}</span></td>
                <td>
                  <div className="flex gap-2">
                    <button onClick={() => setViewDoc(d)} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="عرض التفاصيل"><Eye className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setEditDoc(d)} className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors" title="تعديل"><Pencil className="w-3.5 h-3.5" /></button>
                    {isAdmin && (
                      <button onClick={() => setDeleteDoc(d)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors" title="حذف"><Trash2 className="w-3.5 h-3.5" /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="إضافة طبيب جديد" size="lg">
        <DoctorForm onSave={handleAdd} onClose={() => setAddOpen(false)} isFinance={isFinance} />
      </Modal>
      <Modal open={!!editDoc} onClose={() => setEditDoc(null)} title="تعديل بيانات الطبيب" size="lg">
        {editDoc && <DoctorForm initial={editDoc} onSave={handleEdit} onClose={() => setEditDoc(null)} isFinance={isFinance} />}
      </Modal>
      <Modal open={!!viewDoc} onClose={() => setViewDoc(null)} title="تفاصيل الطبيب" size="md">
        {viewDoc && <DoctorDetails doctor={viewDoc} isFinance={isFinance} onClose={() => setViewDoc(null)} />}
      </Modal>
      <ConfirmDialog open={!!deleteDoc} onClose={() => setDeleteDoc(null)} onConfirm={handleDelete}
        title="حذف الطبيب" message={`هل أنت متأكد من حذف ${deleteDoc?.name}؟ لا يمكن التراجع عن هذا الإجراء.`} />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}