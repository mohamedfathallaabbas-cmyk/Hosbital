import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, AlertCircle, Bed, Bell, CheckCircle, Clock,
  HeartPulse, LogOut, Pill, Plus, ShieldAlert, Stethoscope,
  UserRound, PlayCircle, RefreshCw, X, ChevronRight,
  Thermometer, Droplets, Wind, Scale, FileText
} from 'lucide-react';
import Topbar from '../../components/hospital/Topbar';
import Modal from '../../components/hospital/Modal';
import { ToastContainer } from '../../components/hospital/Toast';
import { useToast } from '../../hooks/useToast';
import api from '../../lib/api';
import { useAuth } from '@/lib/AuthContext';

export default function NursingDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();

  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [modalOpen, setModalOpen] = useState('');
  const [noteForm, setNoteForm] = useState({ bp: '', hr: '', temp: '', spo2: '', content: '' });
  const [saving, setSaving] = useState(false);
  const [historyPatient, setHistoryPatient] = useState(null);
  const [historyNotes, setHistoryNotes] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchAdmissions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admissions/active');
      const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setAdmissions(list);
    } catch (err) {
      console.error('Failed to fetch admissions:', err);
      addToast('تعذر تحميل بيانات المرضى المنومين', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmissions();
  }, []);

  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;
    setSaving(true);
    try {
      const vitalsStr = `BP: ${noteForm.bp || '-'}, HR: ${noteForm.hr || '-'}, Temp: ${noteForm.temp || '-'}°C, SpO2: ${noteForm.spo2 || '-'}%`;
      await api.post('/nursing/notes', {
        admissionId: selectedPatient.id,
        vitalSigns: vitalsStr,
        content: noteForm.content || 'متابعة تمريضية'
      });
      addToast('تم حفظ الملاحظة التمريضية بنجاح ✓', 'success');
      setModalOpen('');
      setNoteForm({ bp: '', hr: '', temp: '', spo2: '', content: '' });
      setSelectedPatient(null);
    } catch (err) {
      console.error('❌ Nursing note error:', err.response?.data || err.message);
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'فشل حفظ الملاحظة';
      addToast(errMsg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const openHistory = async (adm, patientName) => {
    setHistoryPatient({ ...adm, _name: patientName });
    setHistoryNotes([]);
    setHistoryLoading(true);
    setModalOpen('history');
    try {
      const res = await api.get(`/nursing/notes/admission/${adm.id}`);
      const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setHistoryNotes(list);
    } catch (err) {
      addToast('تعذر تحميل السجل الحيوي', 'error');
    } finally {
      setHistoryLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem('hospitalUser');
    sessionStorage.removeItem('staff_portal_authorized');
    navigate('/');
  };

  const [filterMode, setFilterMode] = useState('mine'); // 'mine' or 'all'

  // Derived stats
  const myPatients = admissions.filter(adm => adm.bed?.nursingAssignments?.some(nas => nas.nurseId === user?.staffId));
  const displayedAdmissions = (filterMode === 'mine' && user?.staffId && user?.role !== 'NURSE') ? myPatients : admissions;

  const totalPatients = displayedAdmissions.length;
  const criticalCount = displayedAdmissions.filter(a => a.condition === 'CRITICAL').length;

  // Time of day greeting
  const hour = new Date().getHours();
  const shift = hour < 12 ? 'شيفت صباحي' : hour < 20 ? 'شيفت مسائي' : 'شيفت ليلي';
  const greeting = hour < 12 ? 'صباح الخير' : hour < 18 ? 'مساء الخير' : 'مساء النور';

  return (
    <div className="flex h-screen bg-slate-50 font-cairo" dir="rtl">
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar title="لوحة التمريض" roleColor="#f43f5e" />

        <div className="flex-1 overflow-auto p-6 space-y-6">

          {/* Header */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-1">{greeting}، {user?.name}</h2>
              <p className="text-slate-500 text-sm flex items-center gap-2">
                <PlayCircle className="w-4 h-4 text-green-500" />
                {shift} — متابعة المرضى المنومين وتسجيل القياسات الحيوية
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchAdmissions}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition-all text-sm font-bold shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                تحديث
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 transition-colors shadow-sm"
              >
                <LogOut className="w-4 h-4" />
                خروج
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'مرضى منومون', value: totalPatients, icon: Bed, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
              { label: 'حالات حرجة', value: criticalCount, icon: HeartPulse, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
              { label: 'جرعات متبقية', value: totalPatients * 2, icon: Pill, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
              { label: 'ملاحظات اليوم', value: 0, icon: Activity, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100' },
            ].map((s, i) => (
              <div key={i} className={`bg-white rounded-2xl p-5 shadow-sm border ${s.border} flex items-center gap-4`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.bg} ${s.color}`}>
                  <s.icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-800">{loading ? '—' : s.value}</div>
                  <div className="text-slate-500 text-xs font-semibold">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Alert Banner - Critical */}
          {!loading && criticalCount > 0 && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
              <div>
                <p className="font-bold text-red-700">تنبيه: {criticalCount} حالة حرجة تحتاج متابعة فورية</p>
                <p className="text-xs text-red-600 mt-0.5">يرجى مراجعة الحالات الحرجة في الجدول أدناه</p>
              </div>
            </div>
          )}

          {/* Patients Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
              <h3 className="font-black text-slate-800 flex items-center gap-2">
                <UserRound className="w-5 h-5 text-rose-500" />
                المرضى المنومون حالياً ({totalPatients})
              </h3>
              {user?.role !== 'NURSE' && (
                <div className="flex bg-slate-200/60 p-1 rounded-xl">
                  <button
                    onClick={() => setFilterMode('mine')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold font-cairo transition-all ${
                      filterMode === 'mine'
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    مرضاي (التمريض الخاص بي)
                  </button>
                  <button
                    onClick={() => setFilterMode('all')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold font-cairo transition-all ${
                      filterMode === 'all'
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    كل المرضى المنومين
                  </button>
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-slate-50 text-slate-500 text-xs font-bold">
                  <tr>
                    <th className="p-4">المريض</th>
                    <th className="p-4">الغرفة / السرير</th>
                    <th className="p-4">الطبيب المعالج</th>
                    <th className="p-4">تاريخ الدخول</th>
                    <th className="p-4">الحالة</th>
                    <th className="p-4 text-center">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan="6" className="p-10 text-center text-slate-400 animate-pulse">جاري تحميل بيانات المرضى...</td></tr>
                  ) : displayedAdmissions.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-12 text-center">
                        <Bed className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                        <p className="text-slate-400 font-medium">لا يوجد مرضى منومون حالياً</p>
                        <p className="text-slate-300 text-xs mt-1">
                          {filterMode === 'mine' 
                            ? 'لا توجد حالات معينة لمتابعتك حالياً. يمكنك التحويل لوضع "كل المرضى" لمشاهدة الجميع.' 
                            : 'ستظهر هنا قائمة المرضى عند تنويمهم من قبل الاستقبال'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    displayedAdmissions.map((adm) => {
                      const patientName = adm.patient?.user?.name || adm.patientName || 'غير معروف';
                      const doctorName = adm.doctor?.user?.name || adm.doctorName || 'غير محدد';
                      const bedNumber = adm.bed?.bedNumber || adm.bedNumber || '—';
                      const roomName = adm.bed?.room?.name || adm.roomName || '—';
                      const isCritical = adm.condition === 'CRITICAL';
                      const admitDate = adm.admittedAt || adm.createdAt;

                      return (
                        <tr key={adm.id} className={`hover:bg-slate-50 transition-colors ${isCritical ? 'bg-red-50/30' : ''}`}>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm ${isCritical ? 'bg-red-500' : 'bg-gradient-to-br from-rose-400 to-rose-600'}`}>
                                {patientName.charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-slate-800">{patientName}</div>
                                {isCritical && <div className="text-xs text-red-500 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" />حرج</div>}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="font-semibold text-slate-700">{roomName}</span>
                            <span className="text-xs text-slate-400 block">سرير {bedNumber}</span>
                          </td>
                          <td className="p-4 text-slate-600 text-sm">د. {doctorName}</td>
                          <td className="p-4 text-slate-400 text-xs">
                            {admitDate ? new Date(admitDate).toLocaleDateString('ar-EG') : '—'}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${isCritical ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                              {isCritical ? 'حرج' : 'مستقر'}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedPatient({ ...adm, _name: patientName, _doctor: doctorName, _bed: `${roomName} / سرير ${bedNumber}` });
                                  setNoteForm({ bp: '', hr: '', temp: '', spo2: '', content: '' });
                                  setModalOpen('note');
                                }}
                                className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold hover:bg-rose-100 transition-colors flex items-center gap-1"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                تسجيل متابعة
                              </button>
                              <button
                                onClick={() => openHistory(adm, patientName)}
                                className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors flex items-center gap-1"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                السجل
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nursing Instructions */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <h3 className="font-black text-slate-800 mb-4 text-sm flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" />
                إرشادات الشيفت
              </h3>
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 flex gap-3 items-start">
                  <Clock className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-blue-700">قياسات حيوية كل 4 ساعات</p>
                    <p className="text-xs text-blue-600 mt-0.5">ضغط الدم، الحرارة، معدل ضربات القلب</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 flex gap-3 items-start">
                  <Pill className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-700">متابعة جرعات الدواء</p>
                    <p className="text-xs text-amber-600 mt-0.5">تأكد من صرف الأدوية حسب جدول الروشتات</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-teal-50 border border-teal-100 flex gap-3 items-start">
                  <Stethoscope className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-teal-700">تقرير تسليم الشيفت</p>
                    <p className="text-xs text-teal-600 mt-0.5">سجّل ملاحظاتك على كل مريض قبل انتهاء الشيفت</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Vitals Quick Reference */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <h3 className="font-black text-slate-800 mb-4 text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-500" />
                مرجع القياسات الطبيعية
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Droplets, label: 'ضغط الدم', normal: '120/80 mmHg', color: 'text-red-500 bg-red-50' },
                  { icon: HeartPulse, label: 'النبض', normal: '60-100 نبضة/دقيقة', color: 'text-rose-500 bg-rose-50' },
                  { icon: Thermometer, label: 'الحرارة', normal: '36.1–37.2 °C', color: 'text-orange-500 bg-orange-50' },
                  { icon: Wind, label: 'التنفس', normal: '12-20 نفس/دقيقة', color: 'text-blue-500 bg-blue-50' },
                ].map((v, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${v.color} mb-2`}>
                      <v.icon className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-xs font-bold text-slate-700">{v.label}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{v.normal}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nursing Note Modal */}
      <Modal
        open={modalOpen === 'note'}
        onClose={() => { setModalOpen(''); setSelectedPatient(null); }}
        title={`تسجيل متابعة تمريضية — ${selectedPatient?._name}`}
        size="md"
      >
        <form onSubmit={handleSaveNote} className="p-6 space-y-5">
          {/* Patient Info Summary */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-slate-400">المريض</p>
              <p className="font-bold text-slate-800 text-sm">{selectedPatient?._name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">الغرفة / السرير</p>
              <p className="font-bold text-slate-800 text-sm">{selectedPatient?._bed}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">الطبيب المعالج</p>
              <p className="font-bold text-slate-800 text-sm">د. {selectedPatient?._doctor}</p>
            </div>
          </div>

          {/* Vitals */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-500" />
              القياسات الحيوية
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30">
                <label className="block text-red-600 dark:text-red-400 text-xs font-bold mb-1">ضغط الدم (BP)</label>
                <input type="text" placeholder="120/80" value={noteForm.bp || ''} onChange={e => setNoteForm(p => ({...p, bp: e.target.value}))} className="w-full px-3 py-2 rounded-lg border border-red-200 dark:border-red-700 text-sm bg-white dark:bg-slate-800 dark:text-white outline-none focus:border-red-400 font-cairo" />
              </div>
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30">
                <label className="block text-blue-600 dark:text-blue-400 text-xs font-bold mb-1">النبض (HR)</label>
                <input type="number" min="40" max="200" placeholder="80" value={noteForm.hr || ''} onChange={e => setNoteForm(p => ({...p, hr: e.target.value}))} className="w-full px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-700 text-sm bg-white dark:bg-slate-800 dark:text-white outline-none focus:border-blue-400 font-cairo" />
              </div>
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30">
                <label className="block text-amber-600 dark:text-amber-400 text-xs font-bold mb-1">الحرارة (°C)</label>
                <input type="number" step="0.1" min="35" max="42" placeholder="37.0" value={noteForm.temp || ''} onChange={e => setNoteForm(p => ({...p, temp: e.target.value}))} className="w-full px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-700 text-sm bg-white dark:bg-slate-800 dark:text-white outline-none focus:border-amber-400 font-cairo" />
              </div>
              <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30">
                <label className="block text-green-600 dark:text-green-400 text-xs font-bold mb-1">تشبع الأكسجين (SpO2%)</label>
                <input type="number" min="50" max="100" placeholder="98" value={noteForm.spo2 || ''} onChange={e => setNoteForm(p => ({...p, spo2: e.target.value}))} className="w-full px-3 py-2 rounded-lg border border-green-200 dark:border-green-700 text-sm bg-white dark:bg-slate-800 dark:text-white outline-none focus:border-green-400 font-cairo" />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-rose-500" />
              ملاحظات التمريض
            </label>
            <textarea
              value={noteForm.content}
              onChange={e => setNoteForm(p => ({ ...p, content: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border bg-slate-50 border-slate-200 outline-none focus:border-rose-400 transition-colors h-28 resize-none text-sm font-cairo"
              placeholder="اكتب ما تم ملاحظته على المريض، الإجراءات التي تمت، أي تغيير في الحالة..."
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => setModalOpen('')}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition-colors flex items-center justify-center gap-2"
            >
              {saving ? 'جاري الحفظ...' : <><CheckCircle className="w-5 h-5" /> حفظ الملاحظة</>}
            </button>
          </div>
        </form>
      </Modal>

      {/* History Modal */}
      <Modal
        open={modalOpen === 'history'}
        onClose={() => { setModalOpen(''); setHistoryPatient(null); }}
        title={`السجل الحيوي — ${historyPatient?._name}`}
        size="lg"
      >
        <div className="p-6">
          {historyLoading ? (
            <div className="text-center py-10 text-slate-400 animate-pulse">جاري تحميل السجل...</div>
          ) : historyNotes.length === 0 ? (
            <div className="text-center py-10">
              <Activity className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">لا توجد ملاحظات تمريضية مسجلة لهذا المريض</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {historyNotes.map((note, i) => (
                <div key={note.id || i} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {note.createdAt ? new Date(note.createdAt).toLocaleString('ar-EG') : '—'}
                    </span>
                    {note.nurse?.user?.name && (
                      <span className="text-xs text-slate-400">بواسطة: {note.nurse.user.name}</span>
                    )}
                  </div>
                  {note.vitalSigns && (
                    <div className="p-2 rounded-lg bg-rose-50 border border-rose-100 mb-2">
                      <p className="text-xs font-bold text-rose-600 flex items-center gap-1">
                        <HeartPulse className="w-3 h-3" />
                        {note.vitalSigns}
                      </p>
                    </div>
                  )}
                  {note.content && (
                    <p className="text-sm text-slate-700">{note.content}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
