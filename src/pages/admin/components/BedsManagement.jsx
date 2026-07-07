import { useState, useEffect } from 'react';
import { PlusCircle, Pencil, Trash2, Bed, Search } from 'lucide-react';
import Modal from '../../../components/hospital/Modal';
import ConfirmDialog from '../../../components/hospital/ConfirmDialog';
import { ToastContainer } from '../../../components/hospital/Toast';
import { useToast } from '../../../hooks/useToast';
import api from '../../../lib/api';

const BED_STATUS = { occupied: { label: 'مشغول', cls: 'badge-danger' }, available: { label: 'شاغر', cls: 'badge-success' }, maintenance: { label: 'صيانة', cls: 'badge-warning' } };

export default function BedsManagement() {
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDept, setFilterDept] = useState('all');
  const [addOpen, setAddOpen] = useState(false);
  const [editBed, setEditBed] = useState(null);
  const [deleteBed, setDeleteBed] = useState(null);
  const { toasts, addToast, removeToast } = useToast();
  
  const emptyBed = { number: '', dept: '', floor: '', status: 'available', type: 'عادي' };
  const [form, setFormB] = useState(emptyBed);
  const setF = (k, v) => setFormB(p => ({ ...p, [k]: v }));

  const loadBeds = () => {
    setLoading(true);
    api.get('/admin/beds')
      .then(res => {
        setBeds(res.data || []);
      })
      .catch(() => addToast('تعذر تحميل بيانات الأسرة', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadBeds(); }, []);

  const depts = [...new Set(beds.map(b => b.dept))];
  const filtered = beds.filter(b =>
    (filterStatus === 'all' || b.status === filterStatus) &&
    (filterDept === 'all' || b.dept === filterDept)
  );

  const stats = {
    total: beds.length,
    occupied: beds.filter(b => b.status === 'occupied').length,
    available: beds.filter(b => b.status === 'available').length,
    maintenance: beds.filter(b => b.status === 'maintenance').length
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/beds', form);
      addToast('تم إضافة السرير بنجاح بقاعدة البيانات ✓', 'success');
      setAddOpen(false);
      loadBeds();
    } catch {
      addToast('فشل في إضافة السرير', 'error');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/admin/beds/${editBed.id}`, form);
      addToast('تم تحديث بيانات وحالة السرير بنجاح ✓', 'success');
      setEditBed(null);
      loadBeds();
    } catch {
      addToast('فشل في تعديل بيانات السرير', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/admin/beds/${deleteBed.id}`);
      addToast('تم حذف السرير من قاعدة البيانات بنجاح', 'success');
      setDeleteBed(null);
      loadBeds();
    } catch {
      addToast('فشل حذف السرير', 'error');
    }
  };

  const BedForm = ({ onSubmit, onClose }) => (
    <form className="p-6 space-y-4 font-cairo" onSubmit={onSubmit}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-600 text-sm font-semibold mb-1">رقم السرير</label>
          <input required value={form.number} onChange={e => setF('number', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:bg-white focus:border-purple-400" placeholder="مثال: B-01" />
        </div>
        <div>
          <label className="block text-slate-600 text-sm font-semibold mb-1">القسم</label>
          <input required value={form.dept} onChange={e => setF('dept', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:bg-white focus:border-purple-400" placeholder="مثال: العناية المركزة" />
        </div>
        <div>
          <label className="block text-slate-600 text-sm font-semibold mb-1">الطابق / رقم الغرفة</label>
          <input required value={form.floor} onChange={e => setF('floor', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:bg-white focus:border-purple-400" placeholder="مثال: ICU-101" />
        </div>
        <div>
          <label className="block text-slate-600 text-sm font-semibold mb-1">النوع</label>
          <select value={form.type} onChange={e => setF('type', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none">
            {['عادي','خاص','عناية مركزة','عزل'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-slate-600 text-sm font-semibold mb-1">حالة السرير الحالية</label>
          <select value={form.status} onChange={e => setF('status', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:border-purple-400">
            <option value="available">شاغر (متاح للمرضى)</option>
            <option value="maintenance">تحت الصيانة (غير متاح)</option>
            <option value="occupied">مشغول (منوم به مريض)</option>
          </select>
        </div>
      </div>
      <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
        <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50">إلغاء</button>
        <button type="submit" className="flex-1 py-3 rounded-xl text-white font-bold hover:scale-[1.02] transition-all" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>حفظ البيانات</button>
      </div>
    </form>
  );

  return (
    <div className="p-6 fade-in font-cairo">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div className="section-header mb-0">
          <div className="section-header-line" style={{ background: 'linear-gradient(180deg, #f59e0b, #d97706)' }} />
          <h3 className="text-xl font-bold">إدارة الأسرة</h3>
        </div>
        <div className="flex gap-3 flex-wrap">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-cairo outline-none">
            <option value="all">كل الحالات</option>
            <option value="available">شاغر</option>
            <option value="occupied">مشغول</option>
            <option value="maintenance">صيانة</option>
          </select>
          <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-cairo outline-none">
            <option value="all">كل الأقسام</option>
            {depts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <button onClick={() => { setFormB(emptyBed); setAddOpen(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium hover:scale-[1.02] transition-all" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
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
          <thead>
            <tr>
              <th>رقم السرير</th>
              <th>القسم / الطابق (الغرفة)</th>
              <th>النوع</th>
              <th>المريض المنوم</th>
              <th>الحالة الحالية</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center py-12 text-slate-400 animate-pulse">جاري التحميل...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-12 text-slate-400">لا توجد أسرة مسجلة مطابقة للبحث</td></tr>
            ) : filtered.map(b => (
              <tr key={b.id}>
                <td><span className="font-bold text-slate-800 text-base">{b.number}</span></td>
                <td>
                  <div>
                    <p className="font-medium text-slate-700 text-sm">{b.dept}</p>
                    <p className="text-slate-400 text-xs">الغرفة {b.floor}</p>
                  </div>
                </td>
                <td><span className="badge-purple text-xs">{b.type}</span></td>
                <td>
                  {b.patient ? (
                    <div>
                      <p className="text-sm font-medium text-slate-700">{b.patient}</p>
                      <p className="text-xs text-slate-400">منذ {b.since}</p>
                    </div>
                  ) : (
                    <span className="text-slate-300 text-sm">—</span>
                  )}
                </td>
                <td><span className={BED_STATUS[b.status]?.cls || 'badge-info'}>{BED_STATUS[b.status]?.label}</span></td>
                <td>
                  <div className="flex gap-2">
                    <button onClick={() => { setFormB({ ...b }); setEditBed(b); }} className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors" title="تعديل"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setDeleteBed(b)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors" title="حذف"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="إضافة سرير جديد" size="md">
        <BedForm onSubmit={handleAddSubmit} onClose={() => setAddOpen(false)} />
      </Modal>
      <Modal open={!!editBed} onClose={() => setEditBed(null)} title="تعديل بيانات وحالة السرير" size="md">
        {editBed && <BedForm onSubmit={handleEditSubmit} onClose={() => setEditBed(null)} />}
      </Modal>
      <ConfirmDialog open={!!deleteBed} onClose={() => setDeleteBed(null)} onConfirm={handleDeleteConfirm}
        title="حذف السرير" message={`هل أنت متأكد من حذف السرير "${deleteBed?.number}"؟ لا يمكن التراجع عن هذا الإجراء.`} />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}