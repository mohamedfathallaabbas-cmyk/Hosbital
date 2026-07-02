import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays, CheckCircle, HeartPulse, LogOut, UserRound,
  Briefcase, Clock3, Wallet, MapPin, Phone, Plus, X,
  AlertTriangle, ChevronDown, FileText
} from 'lucide-react';
import api from '@/lib/api';
import Topbar from '@/components/hospital/Topbar';

const Field = ({ icon: Icon, label, value }) => (
  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
    <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </div>
    <div className="font-bold text-slate-800 dark:text-white">{value || 'غير مسجل'}</div>
  </div>
);

const LEAVE_TYPE_LABELS = {
  ANNUAL:    { label: 'سنوية', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  SICK:      { label: 'مرضية', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  UNPAID:    { label: 'بدون راتب', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  MATERNITY: { label: 'أمومة', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
};

const STATUS_LABELS = {
  PENDING:  { label: 'قيد المراجعة', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  APPROVED: { label: 'مقبولة',        color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  REJECTED: { label: 'مرفوضة',        color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
};

export default function StaffDashboard() {
  const [profile, setProfile]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [message, setMessage]     = useState('');
  const [activeTab, setActiveTab] = useState('info');

  // Leave state
  const [leaves, setLeaves]             = useState([]);
  const [leavesLoading, setLeavesLoading] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [leaveForm, setLeaveForm]       = useState({
    leaveType: 'ANNUAL',
    startDate: '',
    endDate:   '',
    reason:    ''
  });
  const [leaveError, setLeaveError]     = useState('');
  const [leaveSuccess, setLeaveSuccess] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    api.get('/staff/me')
      .then(res => setProfile(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));

    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    setLeavesLoading(true);
    try {
      const res = await api.get('/staff/me/leaves');
      setLeaves(res.data);
    } catch (e) { console.error(e); }
    finally { setLeavesLoading(false); }
  };

  const markAttendance = async (action) => {
    setMessage('');
    try {
      await api.post('/staff/me/attendance', { action });
      const res = await api.get('/staff/me');
      setProfile(res.data);
      setMessage(action === 'checkout' ? 'تم تسجيل الانصراف' : 'تم تسجيل الحضور');
    } catch (err) {
      setMessage(err.response?.data?.error || 'تعذر تسجيل الحضور والانصراف');
    }
  };

  const submitLeave = async () => {
    setLeaveError('');
    if (!leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason.trim()) {
      setLeaveError('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }
    if (new Date(leaveForm.endDate) < new Date(leaveForm.startDate)) {
      setLeaveError('تاريخ الانتهاء لا يمكن أن يكون قبل تاريخ البداية');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/staff/me/leaves', leaveForm);
      setLeaveSuccess('تم تقديم طلب الإجازة بنجاح، وسيتم مراجعته من المدير');
      setShowLeaveModal(false);
      setLeaveForm({ leaveType: 'ANNUAL', startDate: '', endDate: '', reason: '' });
      fetchLeaves();
      setTimeout(() => setLeaveSuccess(''), 5000);
    } catch (err) {
      setLeaveError(err.response?.data?.error || 'خطأ في تقديم الطلب');
    } finally { setSubmitting(false); }
  };

  const logout = () => {
    sessionStorage.removeItem('hospitalUser');
    sessionStorage.removeItem('staff_portal_authorized');
    navigate('/');
  };

  const payroll    = profile?.payroll    || {};
  const leave      = profile?.leave      || {};
  const attendance = profile?.attendance || [];

  const pendingCount = leaves.filter(l => l.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-cairo" dir="rtl">
      <Topbar title="صفحة الموظف" roleColor="#475569" />

      <main className="p-4 md:p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg"
              style={{ background: 'linear-gradient(135deg, #475569, #0f172a)' }}>
              <HeartPulse className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                {profile?.user?.name || 'بيانات الموظف'}
              </h1>
              <p className="text-slate-500 text-sm">{profile?.jobTitle || 'موظف'}</p>
            </div>
          </div>
          <button onClick={logout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100">
            <LogOut className="w-4 h-4" />خروج
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-2xl w-fit mb-6">
          {[
            { id: 'info',       label: 'بياناتي' },
            { id: 'finance',    label: 'المالية' },
            { id: 'attendance', label: 'الحضور' },
            { id: 'leaves',     label: `الإجازات${pendingCount > 0 ? ` (${pendingCount})` : ''}` },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === t.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-400">جاري تحميل بيانات الموظف...</div>
        ) : !profile ? (
          <div className="p-8 bg-white rounded-2xl border text-center text-slate-500">
            لم يتم العثور على ملف موظف لهذا الحساب.
          </div>
        ) : (
          <div className="space-y-6">
            {message && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-sm">
                {message}
              </div>
            )}
            {leaveSuccess && (
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />{leaveSuccess}
              </div>
            )}

            {/* ── Tab: Info ── */}
            {activeTab === 'info' && (
              <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field icon={UserRound}  label="المسمى الوظيفي" value={profile.jobTitle}    />
                  <Field icon={Briefcase}  label="الفئة"          value={profile.category}    />
                  <Field icon={Clock3}     label="الوردية"        value={profile.shift}       />
                  <Field icon={Phone}      label="الهاتف"         value={profile.user?.phone} />
                  <Field icon={MapPin}     label="العنوان"        value={profile.address}     />
                  <Field icon={Briefcase}  label="القسم"          value={profile.department}  />
                </div>
              </motion.section>
            )}

            {/* ── Tab: Finance ── */}
            {activeTab === 'finance' && (
              <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                <h2 className="font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-emerald-600" />البيانات المالية
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field icon={Wallet}      label="المرتب الأساسي"    value={`${Number(payroll.salary      || 0).toLocaleString()} ج.م`} />
                  <Field icon={Wallet}      label="البدلات"           value={`${Number(payroll.allowances  || 0).toLocaleString()} ج.م`} />
                  <Field icon={Wallet}      label="الخصومات"          value={`${Number(payroll.deductions  || 0).toLocaleString()} ج.م`} />
                  <Field icon={Wallet}      label="الصافي"            value={`${Number(payroll.netSalary   || 0).toLocaleString()} ج.م`} />
                  <Field icon={CheckCircle} label="حالة نزول المرتب"  value={payroll.isPaid ? 'تم الصرف' : 'لم يتم الصرف بعد'} />
                  <Field icon={CalendarDays} label="آخر صرف"          value={payroll.lastPaymentDate ? new Date(payroll.lastPaymentDate).toLocaleDateString('ar-EG') : 'غير مسجل'} />
                </div>
              </motion.section>
            )}

            {/* ── Tab: Attendance ── */}
            {activeTab === 'attendance' && (
              <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                  <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock3 className="w-5 h-5 text-blue-600" />الحضور والانصراف
                  </h2>
                  <div className="flex gap-2">
                    <button onClick={() => markAttendance('checkin')}
                      className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors">
                      تسجيل حضور
                    </button>
                    <button onClick={() => markAttendance('checkout')}
                      className="px-4 py-2 rounded-xl bg-slate-700 text-white font-bold text-sm hover:bg-slate-800 transition-colors">
                      تسجيل انصراف
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                  <Field icon={CalendarDays} label="رصيد الإجازات"    value={`${leave.balance   || 0} يوم`} />
                  <Field icon={CalendarDays} label="إجازات مستخدمة"  value={`${leave.used      || 0} يوم`} />
                  <Field icon={CalendarDays} label="إجازات متبقية"   value={`${leave.remaining || 0} يوم`} />
                </div>
                <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
                  <table className="hospital-table">
                    <thead><tr><th>التاريخ</th><th>الحضور</th><th>الانصراف</th><th>الحالة</th><th>ملاحظات</th></tr></thead>
                    <tbody>
                      {attendance.length === 0 ? (
                        <tr><td colSpan="5" className="text-center py-6 text-slate-400">لا توجد سجلات حضور بعد</td></tr>
                      ) : attendance.slice(0, 10).map(item => (
                        <tr key={item.id}>
                          <td>{new Date(item.date).toLocaleDateString('ar-EG')}</td>
                          <td>{item.checkIn  ? new Date(item.checkIn).toLocaleTimeString('ar-EG')  : '-'}</td>
                          <td>{item.checkOut ? new Date(item.checkOut).toLocaleTimeString('ar-EG') : '-'}</td>
                          <td><span className={item.status === 'PRESENT' ? 'badge-success' : item.status === 'LEAVE' ? 'badge-info' : 'badge-warning'}>{item.status}</span></td>
                          <td>{item.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.section>
            )}

            {/* ── Tab: Leaves ── */}
            {activeTab === 'leaves' && (
              <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="space-y-4">
                {/* Header + New Request btn */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-black text-slate-900 dark:text-white text-lg flex items-center gap-2">
                      <CalendarDays className="w-5 h-5 text-violet-600" />طلبات الإجازة
                    </h2>
                    <p className="text-slate-400 text-sm mt-0.5">يتم إرسال طلبك لمدير المستشفى مباشرةً للمراجعة</p>
                  </div>
                  <button onClick={() => { setShowLeaveModal(true); setLeaveError(''); }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm shadow-md hover:opacity-90 transition-all"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
                    <Plus className="w-4 h-4" />طلب إجازة جديدة
                  </button>
                </div>

                {/* Leave cards */}
                {leavesLoading ? (
                  <div className="py-12 text-center text-slate-400">جاري تحميل طلبات الإجازة...</div>
                ) : leaves.length === 0 ? (
                  <div className="py-16 text-center bg-white rounded-2xl border border-slate-100">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-slate-200" />
                    <p className="text-slate-400 font-medium">لا توجد طلبات إجازة بعد</p>
                    <p className="text-slate-300 text-sm mt-1">اضغط "طلب إجازة جديدة" لتقديم طلبك</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leaves.map((lv, i) => {
                      const type   = LEAVE_TYPE_LABELS[lv.leaveType] || LEAVE_TYPE_LABELS.ANNUAL;
                      const status = STATUS_LABELS[lv.status]        || STATUS_LABELS.PENDING;
                      const days   = Math.ceil((new Date(lv.endDate) - new Date(lv.startDate)) / (1000 * 60 * 60 * 24)) + 1;
                      return (
                        <motion.div key={lv.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all">
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                                style={{ background: type.bg, border: `1px solid ${type.border}` }}>
                                📅
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-slate-800 text-sm">{type.label}</span>
                                  <span className="text-slate-300">•</span>
                                  <span className="text-slate-500 text-sm">{days} يوم</span>
                                </div>
                                <div className="text-slate-400 text-xs mt-0.5">
                                  {new Date(lv.startDate).toLocaleDateString('ar-EG')} — {new Date(lv.endDate).toLocaleDateString('ar-EG')}
                                </div>
                                {lv.reason && (
                                  <p className="text-slate-500 text-xs mt-1 max-w-xs">📝 {lv.reason}</p>
                                )}
                              </div>
                            </div>
                            <span className="text-xs font-bold px-3 py-1.5 rounded-xl border"
                              style={{ color: status.color, background: status.bg, borderColor: status.border }}>
                              {status.label}
                            </span>
                          </div>
                          <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400">
                            <span>تاريخ الطلب: {new Date(lv.createdAt).toLocaleDateString('ar-EG')}</span>
                            {lv.reviewedAt && (
                              <span>تاريخ المراجعة: {new Date(lv.reviewedAt).toLocaleDateString('ar-EG')}</span>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.section>
            )}
          </div>
        )}
      </main>

      {/* ── Leave Request Modal ── */}
      <AnimatePresence>
        {showLeaveModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowLeaveModal(false)}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6"
              onClick={e => e.stopPropagation()}>

              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900">طلب إجازة جديدة</h2>
                  <p className="text-slate-400 text-xs mt-1">سيُرسَل طلبك لمدير المستشفى للمراجعة</p>
                </div>
                <button onClick={() => setShowLeaveModal(false)}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {leaveError && (
                <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />{leaveError}
                </div>
              )}

              <div className="space-y-4">
                {/* Leave Type */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">نوع الإجازة <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select value={leaveForm.leaveType}
                      onChange={e => setLeaveForm(f => ({ ...f, leaveType: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent">
                      <option value="ANNUAL">إجازة سنوية</option>
                      <option value="SICK">إجازة مرضية</option>
                      <option value="UNPAID">إجازة بدون راتب</option>
                      <option value="MATERNITY">إجازة أمومة</option>
                    </select>
                    <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">تاريخ البداية <span className="text-red-500">*</span></label>
                    <input type="date" value={leaveForm.startDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => setLeaveForm(f => ({ ...f, startDate: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">تاريخ الانتهاء <span className="text-red-500">*</span></label>
                    <input type="date" value={leaveForm.endDate}
                      min={leaveForm.startDate || new Date().toISOString().split('T')[0]}
                      onChange={e => setLeaveForm(f => ({ ...f, endDate: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent" />
                  </div>
                </div>

                {/* Days summary */}
                {leaveForm.startDate && leaveForm.endDate && new Date(leaveForm.endDate) >= new Date(leaveForm.startDate) && (
                  <div className="px-4 py-3 rounded-xl bg-violet-50 border border-violet-100 text-violet-700 text-sm font-medium text-center">
                    مدة الإجازة: {Math.ceil((new Date(leaveForm.endDate) - new Date(leaveForm.startDate)) / (1000*60*60*24)) + 1} يوم
                  </div>
                )}

                {/* Reason */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">سبب الإجازة <span className="text-red-500">*</span></label>
                  <textarea value={leaveForm.reason} rows={3}
                    onChange={e => setLeaveForm(f => ({ ...f, reason: e.target.value }))}
                    placeholder="اكتب سبب الإجازة بالتفصيل..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent" />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowLeaveModal(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">
                  إلغاء
                </button>
                <button onClick={submitLeave} disabled={submitting}
                  className="flex-1 py-3 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
                  {submitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
