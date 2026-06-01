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

export default BedsManagement;