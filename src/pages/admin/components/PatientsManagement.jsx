import { useState, useEffect } from 'react';
import { Users, PlusCircle, Search, CheckCircle, X, Trash2 } from 'lucide-react';
import Modal from '../../../components/hospital/Modal';
import { ToastContainer } from '../../../components/hospital/Toast';
import { useToast } from '../../../hooks/useToast';
import api from '../../../lib/api';

export default function PatientsManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '123456', role: 'PATIENT', phone: '' });
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    api.get('/admin/users').then(r => setUsers(r.data)).catch(console.error);
  };

  const filtered = users.filter(u => {
    const matchSearch = !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.includes(search) || u.phone?.includes(search);
    const matchRole = u.role === 'PATIENT';
    return matchSearch && matchRole;
  });

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', { ...form, role: 'PATIENT' });
      addToast('تم إنشاء حساب المريض بنجاح ✓', 'success');
      setAddOpen(false);
      setForm({ name: '', email: '', password: '123456', role: 'PATIENT', phone: '' });
      fetchUsers();
    } catch (err) {
      addToast(err.response?.data?.error || 'خطأ في إنشاء حساب المريض', 'error');
    }
  };

  const toggleStatus = async (user) => {
    try {
      await api.patch(`/admin/users/${user.id}/status`, { isActive: !user.isActive });
      addToast(user.isActive ? 'تم تعطيل حساب المريض' : 'تم تفعيل حساب المريض', 'info');
      fetchUsers();
    } catch { 
      addToast('خطأ في تحديث حالة الحساب', 'error'); 
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`هل أنت متأكد من حذف حساب المريض (${user.name}) نهائياً من النظام؟ سيتم حذف جميع بياناته المرتبطة بالكامل.`)) return;
    try {
      await api.delete(`/admin/users/${user.id}`);
      addToast('تم حذف حساب المريض بنجاح ✓', 'success');
      fetchUsers();
    } catch (err) {
      addToast('خطأ في حذف الحساب', 'error');
    }
  };

  return (
    <div className="p-6 fade-in space-y-5 font-cairo" dir="rtl">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="section-header mb-0">
          <div className="section-header-line" style={{ background: 'linear-gradient(180deg, #8b5cf6, #7c3aed)' }} />
          <div>
            <h3 className="text-xl font-bold">إدارة حسابات المرضى</h3>
            <p className="text-slate-500 text-xs mt-0.5">{filtered.length} مريض مسجل</p>
          </div>
        </div>
      </div>

      {/* Search Filter */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="ابحث باسم المريض، البريد، أو الهاتف..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-200 text-sm bg-white outline-none focus:border-purple-400 font-cairo" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
        <table className="hospital-table w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-600 text-sm">
              <th className="p-4 font-bold text-right">المريض</th>
              <th className="p-4 font-bold text-right">البريد الإلكتروني</th>
              <th className="p-4 font-bold text-right">الهاتف</th>
              <th className="p-4 font-bold text-right">الحالة</th>
              <th className="p-4 font-bold text-right">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                <td className="p-4 text-right">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                      {u.name?.charAt(0) || 'م'}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{u.name}</p>
                      <span className="text-slate-400 text-xs font-mono">{u.role === 'PATIENT' ? 'حساب مريض' : u.role}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-slate-600 text-sm font-mono text-right">{u.email}</td>
                <td className="p-4 text-slate-600 text-sm font-mono text-right">{u.phone || '—'}</td>
                <td className="p-4 text-right">
                  <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${u.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {u.isActive ? 'نشط' : 'معطّل'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex gap-2">
                    <button onClick={() => toggleStatus(u)}
                      title={u.isActive ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                      className={`p-2 rounded-xl text-xs font-medium transition-all ${u.isActive ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}>
                      {u.isActive ? <X className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    </button>
                    <button onClick={() => handleDelete(u)}
                      title="حذف الحساب نهائياً"
                      className="p-2 rounded-xl text-xs font-medium transition-all bg-rose-50 text-rose-600 hover:bg-rose-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center text-slate-400 py-10">
                  لا توجد حسابات مرضى تطابق البحث
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Patient Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="إضافة مريض جديد" size="sm">
        <form className="p-6 space-y-4" onSubmit={handleAdd}>
          {[
            { label: 'الاسم الكامل للمريض', key: 'name', type: 'text', placeholder: 'أدخل الاسم الثلاثي...', required: true },
            { label: 'البريد الإلكتروني', key: 'email', type: 'email', placeholder: 'patient@alshifa.com', required: true },
            { label: 'كلمة المرور الافتراضية', key: 'password', type: 'password', placeholder: '123456', required: true },
            { label: 'رقم الهاتف', key: 'phone', type: 'tel', placeholder: '01xxxxxxxxx' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-slate-600 text-sm font-semibold mb-1">{f.label}</label>
              <input required={f.required} type={f.type} placeholder={f.placeholder} value={form[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:bg-white focus:border-purple-400 font-cairo" />
            </div>
          ))}
          <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
            <button type="button" onClick={() => setAddOpen(false)} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold font-cairo text-sm hover:bg-slate-50">إلغاء</button>
            <button type="submit" className="flex-1 py-3 rounded-xl text-white font-bold font-cairo text-sm hover:scale-[1.02] transition-all" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>حفظ المريض</button>
          </div>
        </form>
      </Modal>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}