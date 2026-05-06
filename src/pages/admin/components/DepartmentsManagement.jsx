import { useState, useEffect } from 'react';
import { Building2, PlusCircle, Search, Users } from 'lucide-react';
import Modal from '../../../components/hospital/Modal';
import { ToastContainer } from '../../../components/hospital/Toast';
import { useToast } from '../../../hooks/useToast';
import api from '../../../lib/api';

export default function DepartmentsManagement() {
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => { fetchDepts(); }, []);

  const fetchDepts = () => {
    api.get('/admin/departments').then(r => setDepartments(r.data)).catch(console.error);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/departments', form);
      addToast('تم إضافة القسم بنجاح ✓', 'success');
      setAddOpen(false);
      setForm({ name: '', description: '' });
      fetchDepts();
    } catch (err) {
      addToast(err.response?.data?.error || 'خطأ في إضافة القسم', 'error');
    }
  };

  const filtered = departments.filter(d => !search || d.name.includes(search));

  // ألوان الأقسام
  const deptColors = [
    '#8b5cf6', '#2563eb', '#14b8a6', '#f59e0b', '#ef4444',
    '#10b981', '#ec4899', '#6366f1', '#0ea5e9', '#84cc16'
  ];

  return (
    <div className="p-6 fade-in space-y-5">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="section-header mb-0">
          <div className="section-header-line" style={{ background: 'linear-gradient(180deg, #8b5cf6, #7c3aed)' }} />
          <div>
            <h3 className="text-xl font-bold">إدارة الأقسام</h3>
            <p className="text-slate-500 text-xs mt-0.5">{departments.length} قسم مسجل</p>
          </div>
        </div>
        <div className="flex gap-3 items-center flex-wrap">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="ابحث عن قسم..." value={search} onChange={e => setSearch(e.target.value)}
              className="px-4 py-2 pr-10 rounded-xl border border-slate-200 text-sm bg-white outline-none focus:border-purple-400 font-cairo w-52" />
          </div>
          <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-medium text-sm" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
            <PlusCircle className="w-4 h-4" />إضافة قسم
          </button>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((dept, i) => {
          const color = deptColors[i % deptColors.length];
          return (
            <div key={dept.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}20` }}>
                  <Building2 className="w-6 h-6" style={{ color }} />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white"
                  style={{ background: color }}>
                  <Users className="w-3 h-3" />
                  {dept._count?.doctors || 0} طبيب
                </div>
              </div>
              <h3 className="font-black text-slate-900 text-lg mb-1">{dept.name}</h3>
              <p className="text-slate-500 text-sm">{dept.description || 'لا يوجد وصف'}</p>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{
                    width: `${Math.min(((dept._count?.doctors || 0) / 5) * 100, 100)}%`,
                    background: color
                  }} />
                </div>
                <p className="text-xs text-slate-400 mt-1">طاقم طبي: {dept._count?.doctors || 0} / 5</p>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-16 text-slate-400">
            <Building2 className="w-12 h-12 mx-auto mb-3 text-slate-200" />
            <p>لا توجد أقسام مطابقة</p>
          </div>
        )}
      </div>

      {/* Add Department Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="إضافة قسم جديد" size="sm">
        <form className="p-6 space-y-4" onSubmit={handleAdd}>
          <div>
            <label className="block text-slate-600 text-sm font-semibold mb-1">اسم القسم</label>
            <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="مثال: قسم القلب، باطنة، أطفال..." className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:border-purple-400 font-cairo" />
          </div>
          <div>
            <label className="block text-slate-600 text-sm font-semibold mb-1">الوصف (اختياري)</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="وصف مختصر للقسم..." rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:border-purple-400 font-cairo resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setAddOpen(false)} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold font-cairo">إلغاء</button>
            <button type="submit" className="flex-1 py-3 rounded-xl text-white font-bold font-cairo" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>إضافة</button>
          </div>
        </form>
      </Modal>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}