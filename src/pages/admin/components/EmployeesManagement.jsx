import { useEffect, useState } from 'react';
import { Plus, Search, Save, Wallet, UserCog, ShieldCheck } from 'lucide-react';
import api from '@/lib/api';

const emptyForm = {
  name: '', email: '', phone: '', role: 'STAFF', category: 'ADMIN_STAFF',
  jobTitle: '', shift: 'صباحي', salary: '', allowances: '', nationalId: '',
  address: '', department: ''
};

export default function EmployeesManagement() {
  const [staff, setStaff] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [salaryDrafts, setSalaryDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const currentRole = (() => {
    try { return JSON.parse(sessionStorage.getItem('hospitalUser') || '{}').role?.toUpperCase(); } catch { return ''; }
  })();
  const canEditSalary = ['ADMIN', 'FINANCIAL_MANAGER'].includes(currentRole);
  const canCreate = currentRole === 'ADMIN';

  const loadStaff = () => {
    setLoading(true);
    api.get('/staff')
      .then((res) => setStaff(res.data))
      .catch((err) => setMessage(err.response?.data?.error || 'تعذر تحميل الموظفين'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadStaff(); }, []);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const createEmployee = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('/staff', form);
      setForm(emptyForm);
      setMessage('تم إضافة الموظف بنجاح');
      loadStaff();
    } catch (err) {
      setMessage(err.response?.data?.error || 'فشل إضافة الموظف');
    }
  };

  const saveSalary = async (employee) => {
    const draft = salaryDrafts[employee.id] || {};
    try {
      await api.patch(`/staff/${employee.id}/salary`, {
        salary: draft.salary ?? employee.salary ?? 0,
        allowances: draft.allowances ?? employee.allowances ?? 0
      });
      setMessage('تم تحديث المرتب');
      loadStaff();
    } catch (err) {
      setMessage(err.response?.data?.error || 'فشل تحديث المرتب');
    }
  };

  const filtered = staff.filter((employee) => {
    const text = `${employee.user?.name || ''} ${employee.jobTitle || ''} ${employee.department || ''}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="p-6 space-y-6 fade-in">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="section-header mb-0">
          <div className="section-header-line" style={{ background: 'linear-gradient(180deg, #6366f1, #4f46e5)' }} />
          <h3 className="text-xl font-bold">إدارة الموظفين</h3>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200">
          <Search className="w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="outline-none text-sm font-cairo" placeholder="بحث عن موظف..." />
        </div>
      </div>

      {message && <div className="p-3 rounded-xl bg-blue-50 text-blue-700 text-sm font-bold">{message}</div>}

      {canCreate && (
        <form onSubmit={createEmployee} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h4 className="font-black text-slate-900 mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-indigo-600" />إضافة موظف</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input required value={form.name} onChange={(e) => set('name', e.target.value)} className="px-3 py-2.5 rounded-xl border bg-slate-50 font-cairo" placeholder="الاسم" />
            <input required type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className="px-3 py-2.5 rounded-xl border bg-slate-50 font-cairo" placeholder="البريد الإلكتروني" />
            <input value={form.phone} onChange={(e) => set('phone', e.target.value)} className="px-3 py-2.5 rounded-xl border bg-slate-50 font-cairo" placeholder="الهاتف" />
            <select value={form.role} onChange={(e) => set('role', e.target.value)} className="px-3 py-2.5 rounded-xl border bg-slate-50 font-cairo">
              <option value="STAFF">موظف</option>
              <option value="NURSE">ممرض</option>
              <option value="RECEPTION">استقبال</option>
              <option value="PHARMACIST">صيدلي</option>
              <option value="LAB_TECH">فني مختبر</option>
              <option value="OPERATIONS_MANAGER">مدير تشغيل</option>
              <option value="FINANCIAL_MANAGER">مدير مالي</option>
            </select>
            <select value={form.category} onChange={(e) => set('category', e.target.value)} className="px-3 py-2.5 rounded-xl border bg-slate-50 font-cairo">
              <option value="ADMIN_STAFF">إداري</option>
              <option value="SECURITY">أمن</option>
              <option value="CLEANING">نظافة</option>
              <option value="MAINTENANCE">صيانة</option>
              <option value="MEDICAL">طبي</option>
            </select>
            <input required value={form.jobTitle} onChange={(e) => set('jobTitle', e.target.value)} className="px-3 py-2.5 rounded-xl border bg-slate-50 font-cairo" placeholder="المسمى الوظيفي" />
            <input value={form.department} onChange={(e) => set('department', e.target.value)} className="px-3 py-2.5 rounded-xl border bg-slate-50 font-cairo" placeholder="القسم" />
            <input value={form.shift} onChange={(e) => set('shift', e.target.value)} className="px-3 py-2.5 rounded-xl border bg-slate-50 font-cairo" placeholder="الوردية" />
            <input type="number" value={form.salary} onChange={(e) => set('salary', e.target.value)} className="px-3 py-2.5 rounded-xl border bg-slate-50 font-cairo" placeholder="المرتب" />
            <input type="number" value={form.allowances} onChange={(e) => set('allowances', e.target.value)} className="px-3 py-2.5 rounded-xl border bg-slate-50 font-cairo" placeholder="البدلات" />
            <input value={form.nationalId} onChange={(e) => set('nationalId', e.target.value)} className="px-3 py-2.5 rounded-xl border bg-slate-50 font-cairo" placeholder="الرقم القومي" />
            <input value={form.address} onChange={(e) => set('address', e.target.value)} className="px-3 py-2.5 rounded-xl border bg-slate-50 font-cairo" placeholder="العنوان" />
          </div>
          <button className="mt-4 px-5 py-3 rounded-xl bg-indigo-600 text-white font-bold flex items-center gap-2"><Plus className="w-4 h-4" />حفظ الموظف</button>
        </form>
      )}

      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
        <table className="hospital-table">
          <thead>
            <tr><th>الموظف</th><th>الدور</th><th>الوظيفة</th><th>القسم</th><th>المرتب</th><th>البدلات</th><th>إجراء</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="text-center py-8 text-slate-400">جاري التحميل...</td></tr>
            ) : filtered.map((employee) => (
              <tr key={employee.id}>
                <td>
                  <div className="font-bold text-slate-800">{employee.user?.name}</div>
                  <div className="text-xs text-slate-400">{employee.user?.email}</div>
                </td>
                <td><span className="badge-info"><ShieldCheck className="w-3 h-3 inline ml-1" />{employee.user?.role}</span></td>
                <td>{employee.jobTitle}</td>
                <td>{employee.department || '-'}</td>
                <td>
                  <input disabled={!canEditSalary} type="number" defaultValue={employee.salary || 0} onChange={(e) => setSalaryDrafts((p) => ({ ...p, [employee.id]: { ...p[employee.id], salary: e.target.value } }))} className="w-28 px-2 py-1.5 rounded-lg border bg-slate-50" />
                </td>
                <td>
                  <input disabled={!canEditSalary} type="number" defaultValue={employee.allowances || 0} onChange={(e) => setSalaryDrafts((p) => ({ ...p, [employee.id]: { ...p[employee.id], allowances: e.target.value } }))} className="w-28 px-2 py-1.5 rounded-lg border bg-slate-50" />
                </td>
                <td>
                  {canEditSalary && <button onClick={() => saveSalary(employee)} className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100" title="حفظ الراتب"><Save className="w-4 h-4" /></button>}
                  {!canEditSalary && <span className="text-xs text-slate-400 flex items-center gap-1"><Wallet className="w-3 h-3" />عرض فقط</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
