import { useState, useEffect } from 'react';
import { Users, PlusCircle, Pencil, Search, CheckCircle, X, Shield } from 'lucide-react';
import Modal from '../../../components/hospital/Modal';
import { ToastContainer } from '../../../components/hospital/Toast';
import { useToast } from '../../../hooks/useToast';
import api from '../../../lib/api';

const roleLabel = { PATIENT: 'مريض', DOCTOR: 'طبيب', RECEPTION: 'استقبال', ADMIN: 'إداري', MANAGER: 'مدير', PHARMACIST: 'صيدلي' };
const roleColor = { PATIENT: 'badge-info', DOCTOR: 'badge-success', RECEPTION: 'badge-warning', ADMIN: 'badge-danger', MANAGER: 'badge-danger', PHARMACIST: 'badge-success' };

export default function PatientsManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '123456', role: 'PATIENT', phone: '' });
  const [departments, setDepartments] = useState([]);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    fetchUsers();
    api.get('/admin/departments').then(r => setDepartments(r.data)).catch(console.error);
  }, []);

  const fetchUsers = () => {
    api.get('/admin/users').then(r => setUsers(r.data)).catch(console.error);
  };

  const filtered = users.filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.includes(search);
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', form);
      addToast('تم إنشاء المستخدم بنجاح ✓', 'success');
      setAddOpen(false);
      setForm({ name: '', email: '', password: '123456', role: 'PATIENT', phone: '' });
      fetchUsers();
    } catch (err) {
      addToast(err.response?.data?.error || 'خطأ في إنشاء المستخدم', 'error');
    }
  };

  const toggleStatus = async (user) => {
    try {
      await api.patch(`/admin/users/${user.id}/status`, { isActive: !user.isActive });
      addToast(user.isActive ? 'تم تعطيل الحساب' : 'تم تفعيل الحساب', 'info');
      fetchUsers();
    } catch { addToast('خطأ في تحديث الحالة', 'error'); }
  };

  return (
    <div className="p-6 fade-in space-y-5">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="section-header mb-0">
          <div className="section-header-line" style={{ background: 'linear-gradient(180deg, #8b5cf6, #7c3aed)' }} />
          <div>
            <h3 className="text-xl font-bold">إدارة المستخدمين</h3>
            <p className="text-slate-500 text-xs mt-0.5">{users.length} مستخدم مسجل</p>
          </div>
        </div>
        <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-medium text-sm" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
          <PlusCircle className="w-4 h-4" />إضافة مستخدم
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="ابحث بالاسم أو البريد..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full px-4 py-2 pr-10 rounded-xl border border-slate-200 text-sm bg-white outline-none focus:border-purple-400 font-cairo" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'DOCTOR', 'PATIENT', 'RECEPTION', 'PHARMACIST', 'ADMIN', 'MANAGER'].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${roleFilter === r ? 'text-white' : 'bg-slate-100 text-slate-600'}`}
              style={roleFilter === r ? { background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' } : {}}>
              {r === 'all' ? 'الكل' : roleLabel[r]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
        <table className="hospital-table">
          <thead><tr><th>المستخدم</th><th>البريد</th><th>الدور</th><th>التخصص/القسم</th><th>الحالة</th><th>إجراء</th></tr></thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id}>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>{u.name?.charAt(0)}</div>
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{u.name}</p>
                      <p className="text-slate-400 text-xs">{u.phone || '—'}</p>
                    </div>
                  </div>
                </td>
                <td className="text-slate-500 text-sm">{u.email}</td>
                <td><span className={roleColor[u.role] || 'badge-info'}>{roleLabel[u.role] || u.role}</span></td>
                <td className="text-slate-500 text-sm">{u.doctorProfile?.specialty || u.doctorProfile?.department?.name || '—'}</td>
                <td><span className={u.isActive ? 'badge-success' : 'badge-danger'}>{u.isActive ? 'نشط' : 'معطّل'}</span></td>
                <td>
                  <button onClick={() => toggleStatus(u)}
                    className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${u.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                    {u.isActive ? <X className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan="6" className="text-center text-slate-400 py-10">لا توجد نتائج</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="إضافة مستخدم جديد" size="sm">
        <form className="p-6 space-y-4" onSubmit={handleAdd}>
          {[
            { label: 'الاسم الكامل', key: 'name', type: 'text', placeholder: 'أدخل الاسم...', required: true },
            { label: 'البريد الإلكتروني', key: 'email', type: 'email', placeholder: 'example@alshifa.com', required: true },
            { label: 'كلمة المرور', key: 'password', type: 'password', placeholder: '123456', required: true },
            { label: 'رقم الهاتف', key: 'phone', type: 'tel', placeholder: '01xxxxxxxxx' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-slate-600 text-sm font-semibold mb-1">{f.label}</label>
              <input required={f.required} type={f.type} placeholder={f.placeholder} value={form[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:border-purple-400 font-cairo" />
            </div>
          ))}
          <div>
            <label className="block text-slate-600 text-sm font-semibold mb-1">الدور</label>
            <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none font-cairo">
              {Object.entries(roleLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          {form.role === 'DOCTOR' && (
            <>
              <div>
                <label className="block text-slate-600 text-sm font-semibold mb-1">التخصص</label>
                <input value={form.specialty || ''} onChange={e => setForm(p => ({ ...p, specialty: e.target.value }))}
                  placeholder="مثال: باطنة، قلب..." className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:border-purple-400 font-cairo" />
              </div>
              <div>
                <label className="block text-slate-600 text-sm font-semibold mb-1">القسم</label>
                <select value={form.departmentId || ''} onChange={e => setForm(p => ({ ...p, departmentId: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none font-cairo">
                  <option value="">اختر قسم...</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </>
          )}
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