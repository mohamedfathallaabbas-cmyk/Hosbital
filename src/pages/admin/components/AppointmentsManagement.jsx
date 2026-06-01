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

export default AppointmentsManagement;