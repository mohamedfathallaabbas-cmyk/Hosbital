import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, CalendarDays, CheckCircle, XCircle,
  Clock, AlertTriangle, ChevronDown, X, User, Package,
  RefreshCw, FileText
} from 'lucide-react';
import api from '@/lib/api';

/* ─── Helpers ─── */
const LEAVE_TYPES = {
  ANNUAL:    'إجازة سنوية',
  SICK:      'إجازة مرضية',
  UNPAID:    'بدون راتب',
  MATERNITY: 'إجازة أمومة',
};
const STATUS_BADGE = {
  PENDING:  { label: 'بانتظار المراجعة', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  APPROVED: { label: 'تمت الموافقة ✓',   cls: 'bg-green-100 text-green-700 border-green-200' },
  REJECTED: { label: 'مرفوض',             cls: 'bg-red-100 text-red-600 border-red-200' },
};

/* ─── Rejection Modal ─── */
function RejectModal({ open, onClose, onConfirm, loading }) {
  const [reason, setReason] = useState('');
  if (!open) return null;
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}>
        <motion.div initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
          onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-black text-slate-800 text-lg">سبب الرفض</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200"><X className="w-4 h-4 text-slate-500" /></button>
          </div>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="اكتب سبب رفض الطلب بوضوح..."
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm h-28 resize-none outline-none focus:border-red-400 bg-slate-50 font-cairo"
          />
          <div className="flex gap-3 mt-4">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 text-sm">إلغاء</button>
            <button
              onClick={() => { if (reason.trim()) { onConfirm(reason); setReason(''); } }}
              disabled={!reason.trim() || loading}
              className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'جاري الرفض...' : <><XCircle className="w-4 h-4" />تأكيد الرفض</>}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─── Leave Requests Section ─── */
function LeaveRequestsSection() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null); // id being acted on
  const [rejectModal, setRejectModal] = useState(null); // { id, type }
  const [msg, setMsg] = useState('');
  const [filter, setFilter] = useState('PENDING');

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/staff/leaves?status=${filter}`);
      setLeaves(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    } catch { setMsg('تعذر تحميل طلبات الإجازة'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLeaves(); }, [filter]);

  const handleApprove = async (id) => {
    setActing(id);
    try {
      await api.patch(`/staff/leaves/${id}/status`, { status: 'APPROVED' });
      setMsg('تمت الموافقة على الإجازة ✓');
      fetchLeaves();
    } catch (e) { setMsg(e.response?.data?.error || 'خطأ في الموافقة'); }
    finally { setActing(null); }
  };

  const handleReject = async (id, reason) => {
    setActing(id);
    try {
      await api.patch(`/staff/leaves/${id}/status`, { status: 'REJECTED', rejectionReason: reason });
      setMsg('تم رفض الطلب');
      setRejectModal(null);
      fetchLeaves();
    } catch (e) { setMsg(e.response?.data?.error || 'خطأ في الرفض'); }
    finally { setActing(null); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-violet-600" />طلبات الإجازة
        </h3>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white outline-none focus:border-violet-400 font-cairo"
          >
            <option value="">الكل</option>
            <option value="PENDING">بانتظار المراجعة</option>
            <option value="APPROVED">مقبولة</option>
            <option value="REJECTED">مرفوضة</option>
          </select>
          <button onClick={fetchLeaves} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50">
            <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {msg && (
        <div className={`p-3 rounded-xl text-sm font-bold border ${msg.includes('✓') ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
          {msg}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400 animate-pulse">جاري تحميل الطلبات...</div>
        ) : leaves.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">لا توجد طلبات إجازة {filter === 'PENDING' ? 'معلقة' : ''}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {leaves.map(lv => {
              const badge = STATUS_BADGE[lv.status] || STATUS_BADGE.PENDING;
              const days = Math.ceil((new Date(lv.endDate) - new Date(lv.startDate)) / 86400000) + 1;
              const isPending = lv.status === 'PENDING';
              return (
                <div key={lv.id} className="p-5 flex flex-col sm:flex-row gap-4 items-start justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 font-bold text-sm flex-shrink-0">
                      {lv.employee?.user?.name?.charAt(0) || '؟'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-800">{lv.employee?.user?.name || 'موظف'}</span>
                        <span className="text-xs text-slate-400">{lv.employee?.user?.phone || ''}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-lg">
                          {LEAVE_TYPES[lv.leaveType] || lv.leaveType}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(lv.startDate).toLocaleDateString('ar-EG')} — {new Date(lv.endDate).toLocaleDateString('ar-EG')} ({days} يوم)
                        </span>
                      </div>
                      {lv.reason && <p className="text-xs text-slate-500 mt-1 max-w-sm">📝 {lv.reason}</p>}
                      <p className="text-xs text-slate-300 mt-1">طُلب في: {new Date(lv.createdAt).toLocaleDateString('ar-EG')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${badge.cls}`}>{badge.label}</span>
                    {isPending && (
                      <>
                        <button
                          onClick={() => handleApprove(lv.id)}
                          disabled={acting === lv.id}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-700 disabled:opacity-50"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />موافقة
                        </button>
                        <button
                          onClick={() => setRejectModal(lv.id)}
                          disabled={acting === lv.id}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />رفض
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <RejectModal
        open={rejectModal !== null}
        onClose={() => setRejectModal(null)}
        onConfirm={(reason) => handleReject(rejectModal, reason)}
        loading={acting === rejectModal}
      />
    </div>
  );
}

/* ─── Purchase Requests Section ─── */
function PurchaseRequestsSection() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [msg, setMsg] = useState('');
  const [filter, setFilter] = useState('PENDING');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/pharmacy/purchase-requests?status=${filter}`);
      setRequests(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    } catch { setMsg('تعذر تحميل طلبات الأدوية'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRequests(); }, [filter]);

  const handleApprove = async (id) => {
    setActing(id);
    try {
      await api.patch(`/pharmacy/purchase-requests/${id}/status`, { status: 'APPROVED' });
      setMsg('تمت الموافقة وتم تحديث المخزون ✓');
      fetchRequests();
    } catch (e) { setMsg(e.response?.data?.error || 'خطأ في الموافقة'); }
    finally { setActing(null); }
  };

  const handleReject = async (id, reason) => {
    setActing(id);
    try {
      await api.patch(`/pharmacy/purchase-requests/${id}/status`, { status: 'REJECTED', rejectionReason: reason });
      setMsg('تم رفض طلب الأدوية');
      setRejectModal(null);
      fetchRequests();
    } catch (e) { setMsg(e.response?.data?.error || 'خطأ في الرفض'); }
    finally { setActing(null); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-amber-600" />طلبات تزويد الأدوية (من الصيدلية)
        </h3>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white outline-none focus:border-amber-400 font-cairo"
          >
            <option value="">الكل</option>
            <option value="PENDING">بانتظار الموافقة</option>
            <option value="APPROVED">مُعتمد</option>
            <option value="REJECTED">مرفوض</option>
          </select>
          <button onClick={fetchRequests} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50">
            <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {msg && (
        <div className={`p-3 rounded-xl text-sm font-bold border ${msg.includes('✓') ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
          {msg}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400 animate-pulse">جاري تحميل الطلبات...</div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">لا توجد طلبات أدوية {filter === 'PENDING' ? 'معلقة' : ''}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {requests.map(r => {
              const badge = STATUS_BADGE[r.status] || STATUS_BADGE.PENDING;
              const isPending = r.status === 'PENDING';
              return (
                <div key={r.id} className="p-5 flex flex-col sm:flex-row gap-4 items-start justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">{r.medicine?.name || r.medicineName || 'دواء غير محدد'}</div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-slate-500">
                        <span className="font-semibold text-amber-600">{r.quantity} عبوة مطلوبة</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{r.pharmacist?.name || 'صيدلي'}</span>
                        <span>•</span>
                        <span>{new Date(r.createdAt).toLocaleDateString('ar-EG')}</span>
                      </div>
                      {r.notes && <p className="text-xs text-slate-500 mt-1">📝 {r.notes}</p>}
                      {r.rejectionReason && (
                        <p className="text-xs text-red-500 mt-1 font-semibold">❌ سبب الرفض: {r.rejectionReason}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${badge.cls}`}>{badge.label}</span>
                    {isPending && (
                      <>
                        <button
                          onClick={() => handleApprove(r.id)}
                          disabled={acting === r.id}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-700 disabled:opacity-50"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />موافقة
                        </button>
                        <button
                          onClick={() => setRejectModal(r.id)}
                          disabled={acting === r.id}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />رفض
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <RejectModal
        open={rejectModal !== null}
        onClose={() => setRejectModal(null)}
        onConfirm={(reason) => handleReject(rejectModal, reason)}
        loading={acting === rejectModal}
      />
    </div>
  );
}

/* ─── Main Export ─── */
export default function RequestsManagement() {
  const [activeTab, setActiveTab] = useState('leaves');

  return (
    <div className="p-6 space-y-6 fade-in" dir="rtl">
      <div>
        <h2 className="text-2xl font-black text-slate-900 mb-1">إدارة الطلبات والموافقات</h2>
        <p className="text-slate-500 text-sm">مراجعة وقبول أو رفض طلبات الإجازة وتزويد الأدوية</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl w-fit">
        {[
          { id: 'leaves',    label: 'طلبات الإجازة',          icon: CalendarDays },
          { id: 'pharmacy',  label: 'طلبات تزويد الأدوية',    icon: ShoppingCart },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'leaves'   && <LeaveRequestsSection />}
      {activeTab === 'pharmacy' && <PurchaseRequestsSection />}
    </div>
  );
}
