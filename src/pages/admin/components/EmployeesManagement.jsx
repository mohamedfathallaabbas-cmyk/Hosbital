import { useEffect, useState } from 'react';
import { Plus, Search, Save, Wallet, UserCog, ShieldCheck, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import api from '../../../lib/api';
import { ToastContainer } from '../../../components/hospital/Toast';
import { useToast } from '../../../hooks/useToast';

const emptyForm = {
  name: '', email: '', password: '', phone: '', role: 'STAFF', category: 'ADMIN_STAFF',
  jobTitle: '', shift: 'صباحي', nationalId: '', address: ''
};

export default function EmployeesManagement() {
  const [staff, setStaff] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [form, setForm] = useState(emptyForm);
  const [salaryDrafts, setSalaryDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const { toasts, addToast, removeToast } = useToast();

  const currentRole = (() => {
    try { return JSON.parse(sessionStorage.getItem('hospitalUser') || '{}').role?.toUpperCase(); } catch { return ''; }
  })();
  const isFinance = currentRole === 'FINANCIAL_MANAGER';
  const isAdmin = currentRole === 'ADMIN';

  const loadStaff = () => {
    setLoading(true);
    api.get('/staff')
      .then((res) => setStaff(res.data))
      .catch(() => addToast('تعذر تحميل بيانات الموظفين', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadStaff(); }, []);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const createEmployee = async (e) => {
    e.preventDefault();
    try {
      await api.post('/staff', {
        ...form,
        salary: 0,
        allowances: 0
      });
      setForm(emptyForm);
      addToast('تم إضافة الموظف بنجاح ✓', 'success');
      loadStaff();
    } catch (err) {
      addToast(err.response?.data?.error || 'فشل إضافة الموظف', 'error');
    }
  };

  const saveSalary = async (employee) => {
    const draft = salaryDrafts[employee.id] || {};
    const newSalary = draft.salary ?? employee.salary ?? 0;
    const newAllowances = draft.allowances ?? employee.allowances ?? 0;
    try {
      await api.patch(`/staff/${employee.id}/salary`, {
        salary: parseFloat(newSalary) || 0,
        allowances: parseFloat(newAllowances) || 0
      });
      addToast('تم تحديث الراتب والبدلات للموظف بنجاح ✓', 'success');
      loadStaff();
    } catch (err) {
      addToast('فشل تحديث المرتب', 'error');
    }
  };

  const toggleStatus = async (employee) => {
    if (!employee.userId) return;
    try {
      const newStatus = !employee.user?.isActive;
      await api.patch(`/admin/users/${employee.userId}/status`, { isActive: newStatus });
      addToast(newStatus ? 'تم تفعيل حساب الموظف بنجاح' : 'تم تعطيل حساب الموظف بنجاح', 'info');
      loadStaff();
    } catch {
      addToast('خطأ في تعديل حالة الموظف', 'error');
    }
  };

  const handleDelete = async (employee) => {
    if (!employee.userId) return;
    try {
      await api.delete(`/admin/users/${employee.userId}`);
      addToast('تم حذف الموظف من النظام بنجاح', 'success');
      loadStaff();
    } catch {
      addToast('خطأ في حذف الموظف', 'error');
    }
  };

  const filtered = staff.filter((employee) => {
    const text = `${employee.user?.name || ''} ${employee.jobTitle || ''}`.toLowerCase();
    const matchesSearch = text.includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || employee.user?.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-6 space-y-6 fade-in font-cairo">
      
      {/* Top Section */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="section-header mb-0">
          <div className="section-header-line" style={{ background: 'linear-gradient(180deg, #8b5cf6, #7c3aed)' }} />
          <h3 className="text-xl font-bold">{isFinance ? 'إدارة رواتب الموظفين' : 'إدارة الموظفين'}</h3>
        </div>
        
        <div className="flex items-center gap-3">
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-cairo outline-none focus:border-purple-400">
            <option value="ALL">كل الأدوار</option>
            <option value="ADMIN">مدير النظام</option>
            <option value="DOCTOR">طبيب</option>
            <option value="STAFF">موظف إداري</option>
            <option value="PHARMACIST">صيدلي</option>
            <option value="LAB_TECH">فني معمل</option>
            <option value="RECEPTION">موظف استقبال</option>
            <option value="NURSE">ممرض</option>
            <option value="FINANCIAL_MANAGER">مدير مالي</option>
          </select>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white">
            <Search className="w-4 h-4 text-slate-400" />
            <input type="text" placeholder="بحث باسم الموظف..." value={search} onChange={e => setSearch(e.target.value)}
              className="text-sm outline-none w-40" />
          </div>
        </div>
      </div>

      {/* Add Employee Form (Only for Admin) */}
      {isAdmin && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h4 className="font-bold text-slate-800 flex items-center gap-2">
            <Plus className="w-5 h-5 text-purple-600" />إضافة موظف جديد بالنظام
          </h4>
          <form onSubmit={createEmployee} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input required value={form.name} onChange={(e) => set('name', e.target.value)} className="px-3 py-2.5 rounded-xl border bg-slate-50 focus:bg-white focus:border-purple-400 outline-none font-cairo" placeholder="الاسم الكامل" />
            <input required type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className="px-3 py-2.5 rounded-xl border bg-slate-50 font-mono focus:bg-white focus:border-purple-400 outline-none" placeholder="البريد الإلكتروني" />
            <input required type="password" value={form.password} onChange={(e) => set('password', e.target.value)} className="px-3 py-2.5 rounded-xl border bg-slate-50 focus:bg-white focus:border-purple-400 outline-none" placeholder="كلمة المرور" />
            <input value={form.phone} onChange={(e) => set('phone', e.target.value)} className="px-3 py-2.5 rounded-xl border bg-slate-50 font-mono focus:bg-white focus:border-purple-400 outline-none" placeholder="الهاتف" />
            <input value={form.nationalId} onChange={(e) => set('nationalId', e.target.value)} className="px-3 py-2.5 rounded-xl border bg-slate-50 font-mono focus:bg-white focus:border-purple-400 outline-none" placeholder="الرقم القومي" />
            <input value={form.jobTitle} onChange={(e) => set('jobTitle', e.target.value)} className="px-3 py-2.5 rounded-xl border bg-slate-50 focus:bg-white focus:border-purple-400 outline-none font-cairo" placeholder="المسمى الوظيفي (أمين مخزن...)" />
            <select value={form.role} onChange={(e) => set('role', e.target.value)} className="px-3 py-2.5 rounded-xl border bg-slate-50 outline-none font-cairo">
              <option value="STAFF">موظف إداري</option>
              <option value="DOCTOR">طبيب</option>
              <option value="ADMIN">مدير النظام</option>
              <option value="PHARMACIST">صيدلي</option>
              <option value="LAB_TECH">فني معمل</option>
              <option value="RECEPTION">موظف استقبال</option>
              <option value="NURSE">ممرض</option>
              <option value="FINANCIAL_MANAGER">مدير مالي</option>
            </select>
            <button type="submit" className="px-4 py-2.5 rounded-xl text-white font-bold hover:scale-[1.02] transition-all font-cairo" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>إضافة الموظف</button>
          </form>
        </div>
      )}

      {/* Employees Table */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
        <table className="hospital-table">
          <thead>
            <tr>
              <th>الموظف</th>
              <th>الدور بالسيستم</th>
              <th>المسمى الوظيفي</th>
              
              {/* Financial columns: Only visible to Finance Manager */}
              {isFinance && (
                <>
                  <th>المرتب الأساسي</th>
                  <th>البدلات</th>
                  <th>حفظ</th>
                </>
              )}

              {/* Status column: Only visible/manageable by System Admin */}
              {isAdmin && (
                <>
                  <th>الحالة الحالية</th>
                  <th>إجراءات الحساب</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={isFinance ? "6" : "5"} className="text-center py-8 text-slate-400 animate-pulse">جاري التحميل...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={isFinance ? "6" : "5"} className="text-center py-8 text-slate-400">لا توجد نتائج مطابقة للبحث</td></tr>
            ) : filtered.map((employee) => (
              <tr key={employee.id}>
                <td>
                  <div className="font-bold text-slate-800">{employee.user?.name}</div>
                  <div className="text-xs text-slate-400 font-mono">{employee.user?.email}</div>
                </td>
                <td><span className="badge-purple"><ShieldCheck className="w-3.5 h-3.5 inline ml-1" />{employee.user?.role}</span></td>
                <td className="text-slate-600 text-sm">{employee.jobTitle || '—'}</td>
                
                {/* Financial columns for Finance Manager */}
                {isFinance && (
                  <>
                    <td>
                      <input type="number" defaultValue={employee.salary || 0} onChange={(e) => setSalaryDrafts((p) => ({ ...p, [employee.id]: { ...p[employee.id], salary: e.target.value } }))} className="w-28 px-3 py-1.5 rounded-xl border bg-slate-50 focus:bg-white focus:border-purple-400 outline-none" />
                    </td>
                    <td>
                      <input type="number" defaultValue={employee.allowances || 0} onChange={(e) => setSalaryDrafts((p) => ({ ...p, [employee.id]: { ...p[employee.id], allowances: e.target.value } }))} className="w-28 px-3 py-1.5 rounded-xl border bg-slate-50 focus:bg-white focus:border-purple-400 outline-none" />
                    </td>
                    <td>
                      <button onClick={() => saveSalary(employee)} className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors" title="حفظ الراتب"><Save className="w-4 h-4" /></button>
                    </td>
                  </>
                )}

                {/* Account disabling features for Admin */}
                {isAdmin && (
                  <>
                    <td>
                      <span className={employee.user?.isActive ? 'badge-success' : 'badge-danger'}>
                        {employee.user?.isActive ? 'حساب نشط' : 'حساب معطل'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button onClick={() => toggleStatus(employee)} className={`p-1.5 rounded-lg transition-colors ${employee.user?.isActive ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`} title={employee.user?.isActive ? 'تعطيل الحساب' : 'تفعيل الحساب'}>
                          {employee.user?.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        </button>
                        <button onClick={() => handleDelete(employee)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors" title="حذف بالكامل">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
