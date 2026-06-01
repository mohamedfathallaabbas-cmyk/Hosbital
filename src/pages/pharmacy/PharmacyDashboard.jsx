import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { Pill, CheckCircle, Clock, Package, AlertTriangle, Menu, LogOut, Search, Droplets, SendHorizonal, Plus, X, ShoppingCart, ClipboardList } from 'lucide-react';
import Topbar from '../../components/hospital/Topbar';
import Modal from '../../components/hospital/Modal';
import { ToastContainer } from '../../components/hospital/Toast';
import { useToast } from '../../hooks/useToast';
import { motion } from 'framer-motion';

function PharmacyHome() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [restockModal, setRestockModal] = useState(false);
  const [restockForm, setRestockForm] = useState({ medicineId: '', medicineName: '', quantity: '', notes: '' });
  const [restockSending, setRestockSending] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    fetchPrescriptions();
    api.get('/pharmacy/inventory').then(r => setMedicines(Array.isArray(r.data) ? r.data : (r.data?.data || []))).catch(() => {});
  }, []);

  const fetchPrescriptions = () => {
    api.get('/pharmacy/prescriptions')
      .then(res => setPrescriptions(res.data))
      .catch(err => console.error(err));
  };

  const handleDispense = async (id) => {
    try {
      await api.patch(`/pharmacy/prescriptions/${id}/dispense`);
      addToast('تم صرف الأدوية بنجاح ✓', 'success');
      fetchPrescriptions();
    } catch (err) {
      addToast('خطأ في صرف الروشتة', 'error');
    }
  };

  const pendingCount = prescriptions.filter(p => p.status === 'PENDING').length;
  const dispensedCount = prescriptions.filter(p => p.status === 'DISPENSED').length;

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    if (!restockForm.quantity || parseInt(restockForm.quantity) <= 0) {
      addToast('يجب إدخال كمية صحيحة', 'error'); return;
    }
    if (!restockForm.medicineId && !restockForm.medicineName.trim()) {
      addToast('يجب اختيار دواء أو كتابة اسمه', 'error'); return;
    }
    setRestockSending(true);
    try {
      await api.post('/pharmacy/purchase-requests', {
        medicineId: restockForm.medicineId ? parseInt(restockForm.medicineId) : undefined,
        medicineName: restockForm.medicineName || undefined,
        quantity: parseInt(restockForm.quantity),
        notes: restockForm.notes,
      });
      addToast('تم إرسال طلب التزويد لمدير المستشفى بنجاح ✓', 'success');
      setRestockModal(false);
      setRestockForm({ medicineId: '', medicineName: '', quantity: '', notes: '' });
    } catch (err) {
      addToast(err.response?.data?.error || 'فشل إرسال الطلب', 'error');
    } finally {
      setRestockSending(false);
    }
  };

  return (
    <div className="p-6 space-y-8 fade-in">
      {/* Header: Stats + Restock Button */}
      <div className="flex flex-wrap gap-4 justify-between items-start">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm mb-1">روشتات في الانتظار</p>
              <h3 className="text-3xl font-black text-amber-500">{pendingCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-500" />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm mb-1">تم صرفها اليوم</p>
              <h3 className="text-3xl font-black text-teal-600">{dispensedCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-teal-600" />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm mb-1">أدوية منخفضة المخزون</p>
              <h3 className="text-3xl font-black text-red-500">{medicines.filter(m => m.stock < 10).length}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </div>

        {/* Restock Button */}
        <button
          onClick={() => setRestockModal(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all text-sm"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
        >
          <ShoppingCart className="w-5 h-5" />
          طلب تزويد بالأدوية
        </button>
      </div>

      {/* Prescriptions List */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-900 flex items-center gap-2"><Pill className="w-5 h-5 text-teal-500" />الروشتات الطبية</h3>
        </div>
        <div className="p-5 space-y-4">
          {prescriptions.length === 0 ? (
            <p className="text-center text-slate-400 py-10">لا توجد روشتات في النظام حالياً</p>
          ) : (
            prescriptions.map((p) => (
              <div key={p.id} className={`p-4 rounded-xl border ${p.status === 'PENDING' ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200 bg-white'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg mb-1">{p.medicalRecord?.appointment?.patient?.user?.name || 'مريض غير معروف'}</h4>
                    <p className="text-sm text-slate-500">الطبيب المعالج: د. {p.medicalRecord?.appointment?.doctor?.user?.name || 'غير معروف'} — {new Date(p.createdAt).toLocaleString('ar-EG')}</p>
                  </div>
                  <span className={p.status === 'PENDING' ? 'badge-warning' : 'badge-success'}>
                    {p.status === 'PENDING' ? 'قيد الانتظار' : 'تم الصرف'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {p.items.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                      <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0">
                        <Droplets className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{item.medicine?.name || item.medicineName || 'دواء خارجي'}</p>
                        <p className="text-xs text-slate-500">{item.dosage} — {item.frequency} لمدة {item.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {p.status === 'PENDING' && (
                  <div className="flex justify-end pt-2 border-t border-slate-100/50 mt-2">
                    <button onClick={() => handleDispense(p.id)} className="btn-primary-hospital px-6 py-2 text-sm flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />صرف الروشتة
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Restock Modal */}
      <Modal open={restockModal} onClose={() => setRestockModal(false)} title="طلب تزويد بالأدوية" size="md">
        <form onSubmit={handleRestockSubmit} className="p-6 space-y-5">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex gap-3 items-start">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">سيتم إرسال هذا الطلب مباشرة إلى <strong>مدير المستشفى</strong> للمراجعة والموافقة. بعد الموافقة سيتم تحديث المخزون تلقائياً.</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">اختر الدواء من المخزون</label>
            <select
              value={restockForm.medicineId}
              onChange={e => setRestockForm(p => ({ ...p, medicineId: e.target.value, medicineName: '' }))}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-amber-400 font-cairo text-sm"
            >
              <option value="">— اختر دواء —</option>
              {medicines.map(m => (
                <option key={m.id} value={m.id}>{m.name} (مخزون حالي: {m.stock} عبوة)</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">أو اكتب اسم الدواء يدوياً</label>
            <input
              value={restockForm.medicineName}
              onChange={e => setRestockForm(p => ({ ...p, medicineName: e.target.value, medicineId: '' }))}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-amber-400 font-cairo text-sm"
              placeholder="اكتب اسم الدواء إذا لم يكن في القائمة..."
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">الكمية المطلوبة (عبوة)</label>
            <input
              type="number" min="1"
              value={restockForm.quantity}
              onChange={e => setRestockForm(p => ({ ...p, quantity: e.target.value }))}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-amber-400 font-cairo text-sm"
              placeholder="أدخل الكمية المطلوبة..."
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">ملاحظات (اختياري)</label>
            <textarea
              value={restockForm.notes}
              onChange={e => setRestockForm(p => ({ ...p, notes: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-amber-400 font-cairo text-sm h-20 resize-none"
              placeholder="سبب الطلب، ملاحظات للمدير..."
            />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => setRestockModal(false)} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors">إلغاء</button>
            <button type="submit" disabled={restockSending} className="flex-1 py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
              {restockSending ? 'جاري الإرسال...' : <><SendHorizonal className="w-4 h-4" />إرسال الطلب للمدير</>}
            </button>
          </div>
        </form>
      </Modal>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

function PharmacyInventory() {
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const pageSize = 50;

  useEffect(() => {
    setLoading(true);
    api.get('/pharmacy/inventory')
      .then(res => { setMedicines(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // الكاتيجوريز المتاحة من البيانات الفعلية
  const categories = ['all', ...new Set(medicines.map(m => m.category).filter(Boolean))].slice(0, 12);

  const filtered = medicines.filter(m => {
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.genericName?.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'all' || m.category === categoryFilter;
    const matchStock = stockFilter === 'all' || (stockFilter === 'out' && m.stock === 0) || (stockFilter === 'low' && m.stock > 0 && m.stock < 10) || (stockFilter === 'ok' && m.stock >= 10);
    return matchSearch && matchCat && matchStock;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const totalMeds = medicines.length;
  const outOfStock = medicines.filter(m => m.stock === 0).length;
  const lowStock = medicines.filter(m => m.stock > 0 && m.stock < 10).length;

  return (
    <div className="p-6 fade-in space-y-5">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="section-header mb-0">
          <div className="section-header-line" style={{ background: 'linear-gradient(180deg, #10b981, #059669)' }} />
          <div>
            <h3 className="text-xl font-bold">جرد الأدوية</h3>
            <p className="text-slate-500 text-xs mt-0.5">إجمالي {totalMeds.toLocaleString('ar-EG')} دواء مسجل</p>
          </div>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="ابحث بالاسم التجاري أو العلمي..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 dark:text-white outline-none focus:border-emerald-500 font-cairo shadow-sm" />
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'إجمالي الأدوية', value: totalMeds.toLocaleString('ar-EG'), color: '#10b981', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'dark:border-emerald-500/30' },
          { label: 'قارب على النفاذ', value: lowStock, color: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'dark:border-amber-500/30' },
          { label: 'نفدت الكمية', value: outOfStock, color: '#ef4444', bg: 'bg-red-50 dark:bg-red-900/20', border: 'dark:border-red-500/30' },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} rounded-2xl p-4 flex items-center justify-between border ${s.border || 'border-slate-100 dark:border-slate-800'}`}>
            <p className="text-slate-600 dark:text-slate-300 text-sm font-medium">{s.label}</p>
            <span className="text-2xl font-black" style={{ color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <span className="text-sm text-slate-500 self-center">فلتر الصنف:</span>
        {categories.map(cat => (
          <button key={cat} onClick={() => { setCategoryFilter(cat); setPage(1); }}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${categoryFilter === cat ? 'text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            style={categoryFilter === cat ? { background: 'linear-gradient(135deg, #10b981, #059669)' } : {}}>
            {cat === 'all' ? 'الكل' : cat}
          </button>
        ))}
        <span className="text-sm text-slate-500 self-center mr-3">المخزون:</span>
        {[{ v: 'all', l: 'الكل' }, { v: 'ok', l: 'متوفر' }, { v: 'low', l: 'قارب النفاذ' }, { v: 'out', l: 'نفد' }].map(f => (
          <button key={f.v} onClick={() => { setStockFilter(f.v); setPage(1); }}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${stockFilter === f.v ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {f.l}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
        {loading ? (
          <div className="text-center py-16 text-slate-400">
            <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-3" />
            <p>جاري تحميل الأدوية...</p>
          </div>
        ) : (
          <table className="hospital-table">
            <thead>
              <tr><th>اسم الدواء</th><th>الاسم العلمي</th><th>الصنف</th><th>الرصيد</th><th>السعر</th><th>الحالة</th></tr>
            </thead>
            <tbody>
              {paginated.map((m, i) => (
                <tr key={i}>
                  <td className="font-bold text-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                        <Pill className="w-4 h-4 text-emerald-600" />
                      </div>
                      <span className="truncate max-w-52">{m.name}</span>
                    </div>
                  </td>
                  <td className="text-slate-400 text-xs truncate max-w-36">{m.genericName || '—'}</td>
                  <td><span className="badge-info text-xs">{m.category}</span></td>
                  <td><span className={`font-bold text-sm ${m.stock === 0 ? 'text-red-500' : m.stock < 10 ? 'text-amber-600' : 'text-slate-700'}`}>{m.stock} عبوة</span></td>
                  <td className="text-emerald-700 font-semibold">{m.price} ج.م</td>
                  <td>
                    {m.stock === 0 ? <span className="badge-danger">نفذت</span> :
                     m.stock < 10 ? <span className="badge-warning">منخفض</span> :
                     <span className="badge-success">متوفر</span>}
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan="6" className="text-center text-slate-400 py-12">لا توجد نتائج مطابقة</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">عرض {((page-1)*pageSize)+1}–{Math.min(page*pageSize, filtered.length)} من {filtered.length.toLocaleString('ar-EG')} نتيجة</p>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all">السابق</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = page <= 3 ? i+1 : page + i - 2;
              if (p < 1 || p > totalPages) return null;
              return (
                <button key={p} onClick={() => setPage(p)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${page === p ? 'text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  style={page === p ? { background: 'linear-gradient(135deg, #10b981, #059669)' } : {}}>
                  {p}
                </button>
              );
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all">التالي</button>
          </div>
        </div>
      )}
    </div>
  );
}

function PharmacyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    setLoading(true);
    api.get('/pharmacy/purchase-requests')
      .then(r => setRequests(Array.isArray(r.data) ? r.data : (r.data?.data || [])))
      .catch(() => addToast('تعذر تحميل الطلبات', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const statusMap = {
    PENDING:  { label: 'بانتظار الموافقة', cls: 'bg-amber-100 text-amber-700' },
    APPROVED: { label: 'تمت الموافقة ✓',   cls: 'bg-green-100 text-green-700' },
    REJECTED: { label: 'مرفوض',             cls: 'bg-red-100 text-red-600' },
  };

  return (
    <div className="p-6 fade-in space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-slate-800">طلبات التزويد المُرسَلة</h3>
          <p className="text-slate-500 text-sm mt-0.5">تتبع حالة طلباتك المرسلة لمدير المستشفى</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 animate-pulse">جاري التحميل...</div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardList className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">لا توجد طلبات تزويد مُرسَلة بعد</p>
            <p className="text-slate-300 text-xs mt-1">استخدم زر "طلب تزويد بالأدوية" من الصفحة الرئيسية</p>
          </div>
        ) : (
          <table className="hospital-table">
            <thead>
              <tr>
                <th>#</th>
                <th>الدواء</th>
                <th>الكمية</th>
                <th>ملاحظات</th>
                <th>تاريخ الطلب</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r, i) => {
                const st = statusMap[r.status] || { label: r.status, cls: 'bg-slate-100 text-slate-600' };
                return (
                  <tr key={r.id}>
                    <td className="text-slate-400 text-sm">{i + 1}</td>
                    <td className="font-bold text-slate-800">{r.medicine?.name || r.medicineName || '—'}</td>
                    <td><span className="font-bold text-emerald-700">{r.quantity} عبوة</span></td>
                    <td className="text-slate-500 text-sm max-w-48 truncate">{r.notes || '—'}</td>
                    <td className="text-slate-400 text-xs">{new Date(r.createdAt).toLocaleString('ar-EG')}</td>
                    <td><span className={`px-2 py-1 rounded-lg text-xs font-bold ${st.cls}`}>{st.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default function PharmacyDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);
  
  const user = (() => { try { return JSON.parse(sessionStorage.getItem('hospitalUser') || '{}'); } catch { return {}; } })();
  const handleLogout = () => { sessionStorage.removeItem('hospitalUser'); navigate('/role-select'); };

  const sidebarLinks = [
    { icon: Pill, label: 'صرف الروشتات', path: '/pharmacy/dashboard' },
    { icon: Package, label: 'جرد الأدوية', path: '/pharmacy/inventory' },
    { icon: ClipboardList, label: 'طلبات التزويد', path: '/pharmacy/requests' }
  ];

  return (
    <div className="flex min-h-screen font-cairo" dir="rtl">
      {/* Sidebar */}
      <aside className="sidebar hidden md:flex flex-col" style={{ width: '260px' }}>
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <Pill className="w-5 h-5 text-white" />
          </div>
          <div><div className="text-white font-bold text-sm">مستشفى الشفاء</div><div className="text-slate-400 text-xs">صيدلية المستشفى</div></div>
        </div>
        <div className="mx-4 mt-4 p-3 rounded-xl" style={{ background: 'rgba(16,185,129,0.15)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              ص
            </div>
            <div><div className="text-white text-sm font-semibold truncate max-w-36">{user.name || 'صيدلي'}</div><div className="text-emerald-300 text-xs">صيدلي</div></div>
          </div>
        </div>
        <nav className="flex-1 p-3 mt-2">
          {sidebarLinks.map((item, i) => {
            const isActive = location.pathname.includes(item.path);
            return (
              <Link key={i} to={item.path} className={`sidebar-item ${isActive ? 'active' : ''}`} style={isActive ? { borderColor: '#10b981' } : {}}>
                <item.icon className="w-5 h-5" style={{ color: isActive ? '#10b981' : undefined }} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout} className="sidebar-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
            <LogOut className="w-5 h-5" /><span>خروج</span>
          </button>
        </div>
      </aside>

      <button onClick={() => setMobileMenu(true)} className="fixed top-4 right-4 z-50 md:hidden w-11 h-11 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
        <Menu className="w-5 h-5 text-white" />
      </button>

      <main className="flex-1 min-h-screen" style={{ background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5, #f8fafc)', marginRight: '260px' }} id="phar-main">
        <Topbar title="الصيدلية المركزية" roleColor="#10b981" />
        <Routes>
          <Route index element={<PharmacyHome />} />
          <Route path="dashboard" element={<PharmacyHome />} />
          <Route path="inventory" element={<PharmacyInventory />} />
          <Route path="requests" element={<PharmacyRequests />} />
        </Routes>
      </main>
      <style>{`@media (max-width: 768px) { #phar-main { margin-right: 0 !important; } }`}</style>
    </div>
  );
}

