import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../lib/api';
import {
  LayoutDashboard, Users, Calendar, FileText, ClipboardList,
  AlertTriangle, Bed, User, LogOut, HeartPulse,
  Stethoscope, Clock, TrendingUp, Menu, X, Eye, Pencil, CheckCircle, Pill, TestTube2, FlaskConical, Printer, Mic, Square, Loader2
} from 'lucide-react';
import PrintTemplate from '../../components/hospital/PrintTemplate';
import Topbar from '../../components/hospital/Topbar';
import StatCard from '../../components/hospital/StatCard';
import Modal from '../../components/hospital/Modal';
import { ToastContainer } from '../../components/hospital/Toast';
import { useToast } from '../../hooks/useToast';
import DoctorRisk from './components/DoctorRisk';
import DoctorPrescription from './components/DoctorPrescription';
import DoctorPatientsPage from './components/DoctorPatientsPage';

const sidebarLinks = [
  { icon: LayoutDashboard, label: 'لوحة التحكم', path: '/doctor/dashboard' },
  { icon: Users, label: 'مرضى اليوم', path: '/doctor/today-patients' },
  { icon: Calendar, label: 'الجدول الأسبوعي', path: '/doctor/schedule' },
  { icon: Users, label: 'مرضاي', path: '/doctor/patients' },
  { icon: Pill, label: 'الوصفة الإلكترونية', path: '/doctor/prescription' },
  { icon: AlertTriangle, label: 'مستوى الخطورة', path: '/doctor/risk' },
  { icon: Bed, label: 'الأسرة المتاحة', path: '/doctor/beds' },
  { icon: User, label: 'ملفي الشخصي', path: '/doctor/profile' },
];

const INITIAL_PATIENTS = [
  { id: 1, name: 'محمد أحمد السيد', age: 45, time: '9:00 ص', status: 'waiting', complaint: 'ألم في الصدر وضيق تنفس', risk: 'high', phone: '01001112233', blood: 'A+', address: 'حلوان، القاهرة' },
  { id: 2, name: 'نورا عبدالله الرشيدي', age: 32, time: '9:30 ص', status: 'in-progress', complaint: 'صداع نصفي مزمن', risk: 'medium', phone: '01122334455', blood: 'B+', address: 'مدينة نصر' },
  { id: 3, name: 'خالد عمر الدالي', age: 58, time: '10:00 ص', status: 'done', complaint: 'متابعة ضغط الدم', risk: 'low', phone: '01233445566', blood: 'O-', address: 'المعادي' },
  { id: 4, name: 'أميرة سعيد جمعة', age: 28, time: '10:30 ص', status: 'waiting', complaint: 'ألم في الظهر', risk: 'low', phone: '01344556677', blood: 'AB+', address: 'الزيتون' },
  { id: 5, name: 'عبدالرحمن حسين مكاوي', age: 67, time: '11:00 ص', status: 'waiting', complaint: 'ألم مفاصل وتورم', risk: 'medium', phone: '01455667788', blood: 'A-', address: 'شبرا الخيمة' },
];

const schedule = [
  { day: 'الأحد', date: '20 أبريل', slots: 8, booked: 7 },
  { day: 'الاثنين', date: '21 أبريل', slots: 10, booked: 6 },
  { day: 'الثلاثاء', date: '22 أبريل', slots: 8, booked: 8 },
  { day: 'الأربعاء', date: '23 أبريل', slots: 6, booked: 4 },
  { day: 'الخميس', date: '24 أبريل', slots: 10, booked: 9 },
];

const riskColor = { high: 'badge-danger', medium: 'badge-warning', low: 'badge-success' };
const riskLabel = { high: 'مرتفع', medium: 'متوسط', low: 'منخفض' };
const statusLabel = { waiting: 'انتظار', 'in-progress': 'جارٍ', done: 'انتهى' };
const statusBadge = { waiting: 'badge-warning', 'in-progress': 'badge-info', done: 'badge-success' };

function PatientViewModal({ patient, onClose }) {
  const [medHistory, setMedHistory] = useState([]);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [printData, setPrintData] = useState(null);

  useEffect(() => {
    if (patient.patientId) {
      Promise.all([
        api.get(`/medical-records/patient/${patient.patientId}`),
        api.get(`/labs/orders?patientId=${patient.patientId}`)
      ]).then(([medRes, labRes]) => {
        setMedHistory(medRes.data.map(r => ({
          date: new Date(r.appointment.date).toLocaleDateString('ar-EG'),
          diagnosis: r.diagnosis,
          treatment: r.prescriptions?.[0]?.name || 'متابعة',
          result: 'مستقر'
        })));
        setLabs(labRes.data);
      }).catch(console.error).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [patient]);

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-5">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-black" style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}>{patient.name.charAt(0)}</div>
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">{patient.name}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{patient.age} سنة • {patient.blood} • {patient.phone}</p>
          <p className="text-slate-400 dark:text-slate-500 text-xs">{patient.address}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50"><p className="text-slate-400 text-xs mb-1">الشكوى</p><p className="text-slate-800 dark:text-slate-200 font-medium text-sm">{patient.complaint}</p></div>
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50"><p className="text-slate-400 text-xs mb-1">مستوى الخطورة</p><span className={riskColor[patient.risk]}>{riskLabel[patient.risk]}</span></div>
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50"><p className="text-slate-400 text-xs mb-1">موعد اليوم</p><p className="text-slate-800 dark:text-slate-200 font-medium text-sm">{patient.time}</p></div>
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50"><p className="text-slate-400 text-xs mb-1">الحالة</p><span className={statusBadge[patient.status]}>{statusLabel[patient.status]}</span></div>
      </div>
      <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
        <FlaskConical className="w-4 h-4 text-blue-500" />التحاليل والأشعة
      </h4>
      <div className="space-y-2 mb-5 max-h-40 overflow-y-auto">
        {labs.length === 0 ? (
          <p className="text-xs text-slate-400 italic">لا توجد تحاليل مسجلة</p>
        ) : labs.map((l, i) => (
          <div key={i} className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30">
            <div className="flex justify-between items-start mb-1">
              <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">{l.test?.name}</p>
              <span className={l.status === 'COMPLETED' ? 'badge-success text-[10px]' : 'badge-warning text-[10px]'}>
                {l.status === 'COMPLETED' ? 'مكتمل' : 'قيد الفحص'}
              </span>
            </div>
            {l.result && <p className="text-slate-600 dark:text-slate-400 text-[11px] line-clamp-2">{l.result}</p>}
            <p className="text-[10px] text-slate-400 mt-1">{new Date(l.orderedAt).toLocaleDateString('ar-EG')}</p>
          </div>
        ))}
      </div>

      <h4 className="font-bold text-slate-900 dark:text-white mb-3">السجل الطبي السابق</h4>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {medHistory.length === 0 ? (
          <p className="text-xs text-slate-400 italic">لا يوجد سجل طبي سابق</p>
        ) : medHistory.map((h, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-teal-50 dark:bg-teal-900/20 border border-transparent dark:border-teal-800/30">
            <div className="w-2 h-2 rounded-full flex-shrink-0 bg-teal-400" />
            <div className="flex-1">
              <p className="font-medium text-slate-800 dark:text-slate-200 text-sm">{h.diagnosis}</p>
              <p className="text-slate-400 dark:text-slate-500 text-xs">{h.date} — {h.treatment}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setPrintData({
                patientName: patient.name,
                diagnosis: h.diagnosis,
                items: [{ name: h.treatment, dosage: 'حسب التعليمات', frequency: '-', duration: '-' }]
              })} className="p-1.5 rounded-lg hover:bg-teal-100 text-teal-600 transition-all no-print" title="طباعة الروشتة">
                <Printer className="w-4 h-4" />
              </button>
              <span className="badge-success text-xs">{h.result}</span>
            </div>
          </div>
        ))}
      </div>
      
      {printData && (
        <PrintTemplate 
          type="prescription" 
          data={printData} 
          onClose={() => setPrintData(null)} 
        />
      )}
      <button onClick={onClose} className="mt-5 w-full py-3 rounded-xl text-white font-bold font-cairo" style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}>إغلاق</button>
    </div>
  );
}

function DiagnosisModal({ patient, onSave, onClose }) {
  const [form, setForm] = useState({ diagnosis: '', medications: '', notes: '', risk: 'medium', nextVisit: '', labTestId: '', audioBase64: null });
  const [catalog, setCatalog] = useState([]);
  
  // Voice Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    api.get('/labs/catalog').then(res => setCatalog(res.data)).catch(console.error);
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        
        setIsProcessing(true);
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          set('audioBase64', reader.result);
        };
        
        // Mock Whisper API 
        setTimeout(() => {
          const transcript = "المريض يعاني من أعراض واضحة تستدعي المتابعة. تم تسجيل هذه الملاحظة صوتيا عبر النظام الذكي.";
          set('notes', (prev) => prev ? prev + '\n' + transcript : transcript);
          setIsProcessing(false);
        }, 1500);
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      alert('الرجاء السماح بالوصول للميكروفون');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      mediaRecorder.stream.getTracks().forEach(t => t.stop());
    }
  };

  return (
    <form className="p-6 space-y-4" onSubmit={e => { e.preventDefault(); onSave(form); }}>
      <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800/50 mb-2">
        <p className="font-semibold text-slate-800 dark:text-slate-200">{patient?.name}</p>
        <p className="text-slate-500 dark:text-slate-400 text-sm">{patient?.complaint}</p>
      </div>
      <div>
        <label className="block text-slate-600 dark:text-slate-400 text-sm font-semibold mb-1">التشخيص</label>
        <input required value={form.diagnosis} onChange={e => set('diagnosis', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-slate-50 dark:bg-slate-800/50 dark:text-white outline-none focus:border-teal-400 dark:focus:border-teal-500 font-cairo" placeholder="أدخل التشخيص الطبي..." />
      </div>
      <div>
        <label className="block text-slate-600 dark:text-slate-400 text-sm font-semibold mb-1">الأدوية الموصوفة</label>
        <input value={form.medications} onChange={e => set('medications', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-slate-50 dark:bg-slate-800/50 dark:text-white outline-none focus:border-teal-400 dark:focus:border-teal-500 font-cairo" placeholder="اسم الدواء، الجرعة، المدة..." />
      </div>
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-slate-600 dark:text-slate-400 text-sm font-semibold">ملاحظات الطبيب</label>
          <button type="button" onClick={isRecording ? stopRecording : startRecording} disabled={isProcessing} className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors font-bold ${isRecording ? 'bg-red-100 text-red-600 hover:bg-red-200 animate-pulse' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}>
            {isProcessing ? <><Loader2 className="w-3.5 h-3.5 animate-spin"/>جاري التحليل...</> : isRecording ? <><Square className="w-3.5 h-3.5 fill-current"/>إيقاف</> : <><Mic className="w-3.5 h-3.5"/>تحدث ليتم الكتابة</>}
          </button>
        </div>
        <textarea value={form.notes} onChange={e => set('notes', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-slate-50 dark:bg-slate-800/50 dark:text-white h-24 resize-none font-cairo outline-none focus:border-teal-400 dark:focus:border-teal-500" placeholder="ملاحظات إضافية، يمكن استخدام الإملاء الصوتي..." />
        {form.audioBase64 && (
          <div className="mt-2">
            <audio src={form.audioBase64} controls className="w-full h-8" />
          </div>
        )}
      </div>
      <div>
        <label className="block text-slate-600 dark:text-slate-400 text-sm font-semibold mb-1 flex items-center gap-2">
          <TestTube2 className="w-4 h-4 text-blue-500" />طلب تحاليل / أشعة
        </label>
        <select value={form.labTestId} onChange={e => set('labTestId', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-slate-50 dark:bg-slate-800/50 dark:text-white font-cairo outline-none">
          <option value="">لا يوجد طلب</option>
          {catalog.map(t => (
            <option key={t.id} value={t.id}>{t.name} ({t.type})</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-slate-600 dark:text-slate-400 text-sm font-semibold mb-1">مستوى الخطورة</label>
          <select value={form.risk} onChange={e => set('risk', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-slate-50 dark:bg-slate-800/50 dark:text-white font-cairo outline-none">
            <option value="low">منخفض</option><option value="medium">متوسط</option><option value="high">مرتفع</option>
          </select>
        </div>
        <div>
          <label className="block text-slate-600 dark:text-slate-400 text-sm font-semibold mb-1">موعد المتابعة</label>
          <input type="date" value={form.nextVisit} onChange={e => set('nextVisit', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-slate-50 dark:bg-slate-800/50 dark:text-white font-cairo outline-none focus:border-teal-400 dark:focus:border-teal-500" />
        </div>
      </div>
      <div className="flex gap-3">
        <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold font-cairo">إلغاء</button>
        <button type="submit" className="flex-1 py-3 rounded-xl text-white font-bold font-cairo" style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}>حفظ التشخيص</button>
      </div>
    </form>
  );
}

function TodayPatients() {
  const [patients, setPatients] = useState([]);
  const [viewP, setViewP] = useState(null);
  const [diagP, setDiagP] = useState(null);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    api.get('/appointments')
      .then(res => {
        const formatted = res.data
          .filter(apt => apt.status !== 'SCHEDULED' && apt.status !== 'CANCELLED')
          .map(apt => ({
            id: apt.id,
            patientId: apt.patientId,
            name: apt.patient?.user?.name || 'مجهول',
            age: 35,
            time: apt.timeSlot || 'غير محدد',
            status: apt.status === 'WAITING' ? 'waiting' : apt.status === 'IN_PROGRESS' ? 'in-progress' : 'done',
            complaint: apt.type || 'كشف',
            risk: 'medium',
            phone: apt.patient?.user?.phone,
            blood: apt.patient?.bloodType,
            address: 'غير مسجل'
          }));
        setPatients(formatted);
      })
      .catch(err => console.error(err));
  }, []);

  const changeStatus = async (id, status) => {
    try {
      const backendStatus = status === 'in-progress' ? 'IN_PROGRESS' : 'COMPLETED';
      await api.patch(`/appointments/${id}/status`, { status: backendStatus });
      setPatients(prev => prev.map(p => p.id === id ? { ...p, status } : p));
      const labels = { 'in-progress': 'جارٍ الفحص', done: 'اكتمل الفحص' };
      addToast(`تم تحديث الحالة: ${labels[status] || status}`, 'info');
    } catch (err) {
      addToast('خطأ في الاتصال بالخادم', 'error');
    }
  };

  const saveDiagnosis = async (form) => {
    try {
      await api.post('/medical-records', {
        appointmentId: diagP.id,
        complaint: diagP.complaint,
        diagnosis: form.diagnosis,
        notes: form.notes,
        prescriptions: form.medications ? [{ name: form.medications, dosage: 'حبة', frequency: 'مرتين', duration: 'اسبوع' }] : []
      });

      if (form.labTestId) {
        await api.post('/labs/orders', {
          appointmentId: diagP.id,
          patientId: diagP.patientId || 1, // سنحتاج للتأكد من وجود ID المريض
          testId: form.labTestId,
          notes: 'طلب فحص من الطبيب'
        });
      }
      
      // Save voice attachment if recorded
      if (form.audioBase64) {
        // Normally we'd send to an attachment endpoint, but we just log it or pass it.
        console.log("Voice attachment recorded with length:", form.audioBase64.length);
      }

      setPatients(prev => prev.map(p => p.id === diagP.id ? { ...p, status: 'done', risk: form.risk } : p));
      setDiagP(null);
      addToast('تم حفظ التشخيص وإرسال طلب المعمل بنجاح ✓', 'success');
    } catch (err) {
      addToast('فشل في حفظ السجل الطبي', 'error');
    }
  };

  return (
    <div className="p-6 fade-in">
      <div className="section-header"><div className="section-header-line" style={{ background: 'linear-gradient(180deg, #14b8a6, #0d9488)' }} /><h3 className="text-xl font-bold">مرضى اليوم</h3></div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { l: 'انتظار', c: patients.filter(p => p.status === 'waiting').length, color: '#f59e0b' },
          { l: 'جارٍ الفحص', c: patients.filter(p => p.status === 'in-progress').length, color: '#2563eb' },
          { l: 'انتهى', c: patients.filter(p => p.status === 'done').length, color: '#14b8a6' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 text-center shadow-sm border border-slate-100">
            <div className="text-3xl font-black" style={{ color: s.color }}>{s.c}</div>
            <div className="text-slate-500 text-sm mt-1">{s.l}</div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
        <table className="hospital-table">
          <thead><tr><th>المريض</th><th>العمر</th><th>الموعد</th><th>الشكوى</th><th>الخطورة</th><th>الحالة</th><th>إجراء</th></tr></thead>
          <tbody>
            {patients.map(p => (
              <tr key={p.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}>{p.name.charAt(0)}</div>
                    <span className="font-medium text-slate-800">{p.name}</span>
                  </div>
                </td>
                <td className="text-slate-600">{p.age} سنة</td>
                <td><span className="flex items-center gap-1 text-slate-500 text-sm"><Clock className="w-3 h-3" />{p.time}</span></td>
                <td className="text-slate-600 text-sm max-w-32 truncate">{p.complaint}</td>
                <td><span className={riskColor[p.risk]}>{riskLabel[p.risk]}</span></td>
                <td><span className={statusBadge[p.status]}>{statusLabel[p.status]}</span></td>
                <td>
                  <div className="flex gap-1">
                    <button onClick={() => setViewP(p)} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100" title="عرض الملف"><Eye className="w-3.5 h-3.5" /></button>
                    {p.status === 'waiting' && <button onClick={() => changeStatus(p.id, 'in-progress')} className="p-1.5 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100" title="بدء الفحص"><Stethoscope className="w-3.5 h-3.5" /></button>}
                    {p.status === 'in-progress' && <button onClick={() => setDiagP(p)} className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100" title="إضافة تشخيص"><CheckCircle className="w-3.5 h-3.5" /></button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!viewP} onClose={() => setViewP(null)} title="ملف المريض" size="md">
        {viewP && <PatientViewModal patient={viewP} onClose={() => setViewP(null)} />}
      </Modal>
      <Modal open={!!diagP} onClose={() => setDiagP(null)} title="تسجيل التشخيص والعلاج" size="md">
        {diagP && <DiagnosisModal patient={diagP} onSave={saveDiagnosis} onClose={() => setDiagP(null)} />}
      </Modal>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

function DoctorHome() {
  const [stats, setStats] = useState(null);
  const user = (() => { try { return JSON.parse(sessionStorage.getItem('hospitalUser') || '{}'); } catch { return {}; } })();

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).catch(console.error);
  }, []);

  return (
    <div className="p-6 space-y-8 fade-in">
      <div className="relative overflow-hidden rounded-3xl p-8" style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}>
        <div className="absolute top-0 left-0 w-48 h-48 rounded-full blur-3xl opacity-20 -translate-x-1/4 -translate-y-1/4" style={{ background: 'white' }} />
        <div className="relative">
          <p className="text-teal-100 text-sm mb-1">مرحباً،</p>
          <h2 className="text-white text-3xl font-black mb-2">{user.name || 'الطبيب'}</h2>
          <p className="text-teal-100">
            {stats ? `${stats.appointments.pending} مريض في الانتظار — ${stats.appointments.completed} حالة مكتملة` : 'جاري التحميل...'}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'إجمالي المرضى', value: stats?.patients?.toString() || '...', icon: Users, gradient: 'linear-gradient(135deg, #14b8a6, #0d9488)' },
          { title: 'مواعيد اليوم', value: stats?.appointments?.total?.toString() || '...', icon: Calendar, gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)' },
          { title: 'حالات انتظار', value: stats?.appointments?.pending?.toString() || '...', icon: AlertTriangle, gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
          { title: 'روشتات معلقة', value: stats?.pendingPrescriptions?.toString() || '...', icon: Bed, gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
        ].map((s, i) => <StatCard key={i} {...s} index={i} />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/doctor/today-patients" className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all cursor-pointer">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(20,184,166,0.1)' }}><Users className="w-6 h-6 text-teal-500" /></div>
          <h3 className="font-bold text-slate-900 mb-1">مرضى اليوم</h3>
          <p className="text-slate-400 text-sm">فحص وتشخيص وتحديث الحالات</p>
        </Link>
        <Link to="/doctor/patients" className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all cursor-pointer">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(37,99,235,0.1)' }}><Users className="w-6 h-6 text-blue-600" /></div>
          <h3 className="font-bold text-slate-900 mb-1">مرضاي</h3>
          <p className="text-slate-400 text-sm">عرض ملفات وسجلات المرضى</p>
        </Link>
      </div>
    </div>
  );
}

export default function DoctorDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);
  const user = (() => { try { return JSON.parse(sessionStorage.getItem('hospitalUser') || '{}'); } catch { return {}; } })();
  const handleLogout = () => { sessionStorage.removeItem('hospitalUser'); navigate('/role-select'); };
  const currentTitle = sidebarLinks.find(l => l.path === location.pathname)?.label || 'لوحة التحكم';

  return (
    <div className="flex min-h-screen font-cairo" dir="rtl">
      <aside className="sidebar hidden md:flex flex-col" style={{ width: '260px' }}>
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}><HeartPulse className="w-5 h-5 text-white" /></div>
          <div><div className="text-white font-bold text-sm">مستشفى الشفاء</div><div className="text-slate-400 text-xs">بوابة الطبيب</div></div>
        </div>
        <div className="mx-4 mt-4 p-3 rounded-xl" style={{ background: 'rgba(20,184,166,0.15)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold" style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}>{user.name?.charAt(0) || 'ط'}</div>
            <div><div className="text-white text-sm font-semibold truncate max-w-36">{user.name}</div><div className="text-teal-300 text-xs">طبيب</div></div>
          </div>
        </div>
        <nav className="flex-1 p-3 mt-2">
          {sidebarLinks.map((item, i) => {
            const isActive = location.pathname === item.path;
            return <Link key={i} to={item.path} className={`sidebar-item ${isActive ? 'active' : ''}`} style={isActive ? { borderColor: '#14b8a6' } : {}}><item.icon className="w-5 h-5" style={{ color: isActive ? '#14b8a6' : undefined }} /><span>{item.label}</span></Link>;
          })}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout} className="sidebar-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"><LogOut className="w-5 h-5" /><span>خروج</span></button>
        </div>
      </aside>
      <button onClick={() => setMobileMenu(true)} className="fixed top-4 right-4 z-50 md:hidden w-11 h-11 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}><Menu className="w-5 h-5 text-white" /></button>
      <main className="flex-1 min-h-screen" style={{ background: 'linear-gradient(135deg, #f0fdfa, #e8f4fd, #f1f5f9)', marginRight: '260px' }} id="doc-main">
        <Topbar title={currentTitle} roleColor="#14b8a6" />
        <Routes>
          <Route index element={<DoctorHome />} />
          <Route path="dashboard" element={<DoctorHome />} />
          <Route path="today-patients" element={<TodayPatients />} />
          <Route path="patients" element={<DoctorPatientsPage />} />
          <Route path="prescription" element={<DoctorPrescription />} />
          <Route path="schedule" element={
            <div className="p-6">
              <div className="section-header"><div className="section-header-line" style={{ background: 'linear-gradient(180deg, #14b8a6, #0d9488)' }} /><h3 className="text-xl font-bold">الجدول الأسبوعي</h3></div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {schedule.map((day, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                    <div className="text-center mb-4"><div className="font-black text-slate-900">{day.day}</div><div className="text-slate-400 text-xs">{day.date}</div></div>
                    <div className="text-center"><div className="text-3xl font-black mb-1" style={{ color: '#14b8a6' }}>{day.booked}/{day.slots}</div><div className="text-slate-400 text-xs">محجوز</div></div>
                    <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${(day.booked / day.slots) * 100}%`, background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }} /></div>
                  </div>
                ))}
              </div>
            </div>
          } />
          <Route path="beds" element={
            <div className="p-6">
              <div className="section-header"><div className="section-header-line" style={{ background: 'linear-gradient(180deg, #14b8a6, #0d9488)' }} /><h3 className="text-xl font-bold">الأسرة المتاحة</h3></div>
              <div className="flex gap-4 mb-6 flex-wrap">
                {[{ label: 'مشغولة', count: 14, color: '#ef4444' }, { label: 'متاحة', count: 4, color: '#14b8a6' }, { label: 'صيانة', count: 2, color: '#f59e0b' }].map((s, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white rounded-xl px-5 py-4 shadow-sm border border-slate-100"><div className="w-4 h-4 rounded-full" style={{ background: s.color }} /><span className="text-slate-700 font-medium text-sm">{s.label}</span><span className="text-2xl font-black text-slate-900">{s.count}</span></div>
                ))}
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3">
                {Array.from({ length: 20 }, (_, i) => ({ number: i + 1, status: i < 14 ? 'occupied' : i < 18 ? 'available' : 'maintenance' })).map(bed => (
                  <div key={bed.number} className="aspect-square rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 shadow-sm text-white font-bold text-sm"
                    style={{ background: bed.status === 'occupied' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : bed.status === 'available' ? 'linear-gradient(135deg, #14b8a6, #0d9488)' : 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                    <Bed className="w-4 h-4 mb-1 opacity-80" />{bed.number}
                  </div>
                ))}
              </div>
            </div>
          } />
          <Route path="risk" element={<DoctorRisk />} />
          <Route path="profile" element={
            <div className="p-6">
              <div className="section-header"><div className="section-header-line" style={{ background: 'linear-gradient(180deg, #14b8a6, #0d9488)' }} /><h3 className="text-xl font-bold">ملفي الشخصي</h3></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-slate-100">
                  <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-white text-3xl font-black mx-auto mb-4 shadow-xl" style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}>س</div>
                  <h3 className="text-xl font-black text-slate-900">د. سارة خالد الشافعي</h3>
                  <p className="text-slate-500 text-sm mb-4">استشارية أمراض الأعصاب</p>
                  <div className="flex justify-center gap-2"><span className="badge-success">نشطة</span><span className="badge-info">متاحة</span></div>
                </div>
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <h4 className="font-bold text-slate-900 mb-4">البيانات المهنية</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'الاسم', value: 'د. سارة خالد الشافعي' },
                      { label: 'التخصص', value: 'أمراض الأعصاب' },
                      { label: 'رقم الترخيص', value: 'EG-HEA-1892' },
                      { label: 'سنوات الخبرة', value: '12 سنة' },
                      { label: 'العيادة', value: 'عيادة الأعصاب 3' },
                      { label: 'الجدول', value: 'الأحد - الثلاثاء - الخميس' },
                      { label: 'رقم الهاتف', value: '01112345678' },
                      { label: 'سعر الكشف', value: '450 ج.م' },
                    ].map((f, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-50"><p className="text-slate-400 text-xs mb-1">{f.label}</p><p className="text-slate-800 font-medium text-sm">{f.value}</p></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          } />
        </Routes>
      </main>
      <style>{`@media (max-width: 768px) { #doc-main { margin-right: 0 !important; } }`}</style>
    </div>
  );
}