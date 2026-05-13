import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/api';
import {
  FileText, Pill, Activity, ChevronDown, ChevronUp,
  AlertTriangle, Heart, Droplets, Stethoscope, FlaskConical,
  Printer, Search, Calendar, User, CheckCircle,
  Thermometer, Wind, Zap, ShieldCheck, Scale, Microscope, Info,
  Upload, Trash2, Download, FolderOpen, ImageIcon, FileImage, X, Loader2, Eye
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const INSURANCE = {
  company: 'شركة AXA للتأمين الصحي',
  policyNum: 'AXA-2025-048832',
  cardNum: 'MEM-9921-4455',
  type: 'تأمين شامل',
  start: '1 يناير 2025',
  end: '31 ديسمبر 2025',
  maxCoverage: '500,000 ج.م',
  copay: '20%',
  status: 'active',
};

const FLAG_STYLE = {
  high: 'bg-red-50 text-red-600 border border-red-200',
  abnormal: 'bg-amber-50 text-amber-700 border border-amber-200',
  normal: 'bg-green-50 text-green-600 border border-green-200',
};
const FLAG_LABEL = { high: '↑ مرتفع', abnormal: '⚠ غير طبيعي', normal: '✓ طبيعي' };

const TYPE_STYLE = {
  'كشف': { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-400' },
  'متابعة': { bg: 'bg-teal-50', text: 'text-teal-600', dot: 'bg-teal-400' },
  'طوارئ': { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
};

function VisitCard({ visit, index }) {
  const [open, setOpen] = useState(false);
  const ts = TYPE_STYLE[visit.type] || TYPE_STYLE['كشف'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 p-5 text-right hover:bg-slate-50 transition-colors"
      >
        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${ts.dot}`} />
        <div className="w-28 flex-shrink-0">
          <p className="font-semibold text-slate-700 text-sm">{visit.date}</p>
          <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${ts.bg} ${ts.text}`}>{visit.type}</span>
        </div>
        <div className="flex-1 min-w-0 text-right">
          <p className="font-bold text-slate-900 truncate">{visit.diagnosis}</p>
          <p className="text-slate-400 text-sm">{visit.doctor} · {visit.specialty}</p>
        </div>
        <span className={`badge-${visit.statusColor} flex-shrink-0`}>{visit.status}</span>
        <div className="text-slate-400 flex-shrink-0">
          {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-100 p-5 space-y-5">
              <div className="p-4 rounded-xl bg-slate-50">
                <p className="text-xs font-bold text-slate-400 mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />الشكوى الرئيسية
                </p>
                <p className="text-slate-700 text-sm">{visit.complaint}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />العلامات الحيوية عند الزيارة
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'ضغط الدم', value: visit.vitals.bp, unit: 'mmHg', icon: Heart, color: '#ef4444' },
                    { label: 'نبضات القلب', value: visit.vitals.hr, unit: 'bpm', icon: Zap, color: '#f59e0b' },
                    { label: 'الحرارة', value: visit.vitals.temp, unit: '°C', icon: Thermometer, color: '#8b5cf6' },
                    { label: 'الأكسجين', value: visit.vitals.spo2, unit: '', icon: Wind, color: '#14b8a6' },
                  ].map((v, i) => (
                    <div key={i} className="bg-white rounded-xl border border-slate-100 p-3 text-center shadow-sm">
                      <v.icon className="w-4 h-4 mx-auto mb-1" style={{ color: v.color }} />
                      <p className="font-black text-slate-800 text-lg leading-none">{v.value}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{v.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5" />الأدوية الموصوفة
                </p>
                <div className="space-y-2">
                  {visit.medications.map((m, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
                      <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="font-semibold text-slate-800 text-sm">{m.name}</span>
                        <span className="text-slate-500 text-xs mr-2">{m.dose}</span>
                      </div>
                      <div className="text-slate-400 text-xs">{m.freq} · {m.duration}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1.5">
                  <FlaskConical className="w-3.5 h-3.5" />نتائج التحاليل والأشعة
                </p>
                <div className="space-y-2">
                  {visit.labs.map((lab, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                      <div className="flex-1">
                        <p className="text-slate-700 text-sm font-medium">{lab.test}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{lab.result}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-lg font-semibold ${FLAG_STYLE[lab.flag]}`}>
                        {FLAG_LABEL[lab.flag]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                  <p className="text-xs font-bold text-amber-600 mb-1 flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5" />ملاحظات الطبيب
                  </p>
                  <p className="text-slate-700 text-sm">{visit.notes}</p>
                </div>
                {visit.followUp && (
                  <div className="p-4 rounded-xl bg-teal-50 border border-teal-100">
                    <p className="text-xs font-bold text-teal-600 mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />موعد المتابعة
                    </p>
                    <p className="font-bold text-slate-800">{visit.followUp}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function MedicalHistory() {
  const [activeTab, setActiveTab] = useState('visits');
  const [records, setRecords] = useState([]);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [patientData, setPatientData] = useState({ weight: 75, height: 175, bloodType: 'A+' });

  // --- Files state ---
  const [files, setFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [fileCategory, setFileCategory] = useState('OTHER');
  const [fileDesc, setFileDesc] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  const formatBytes = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const CATEGORY_LABELS = {
    RADIOLOGY: { label: 'أشعة', color: '#8b5cf6', bg: 'bg-purple-50', border: 'border-purple-200' },
    LAB_RESULT: { label: 'تحاليل', color: '#2563eb', bg: 'bg-blue-50', border: 'border-blue-200' },
    REPORT:     { label: 'تقرير', color: '#14b8a6', bg: 'bg-teal-50', border: 'border-teal-200' },
    OTHER:      { label: 'أخرى', color: '#64748b', bg: 'bg-slate-50', border: 'border-slate-200' },
  };

  const FILE_ICONS = {
    pdf:  { Icon: FileText, color: '#ef4444' },
    jpg:  { Icon: ImageIcon, color: '#f59e0b' },
    jpeg: { Icon: ImageIcon, color: '#f59e0b' },
    png:  { Icon: ImageIcon, color: '#f59e0b' }
  };

  const user = (() => { try { return JSON.parse(sessionStorage.getItem('hospitalUser') || '{}'); } catch { return {}; } })();

  const fetchFiles = async () => {
    setFilesLoading(true);
    try {
      const res = await api.get('/patient-files');
      setFiles(res.data);
    } catch (e) { console.error(e); }
    finally { setFilesLoading(false); }
  };

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true); setUploadError(''); setUploadSuccess('');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', fileCategory);
    formData.append('description', fileDesc);
    try {
      await api.post('/patient-files', formData);
      setUploadSuccess('تم رفع الملف بنجاح ✔');
      setFileDesc('');
      fetchFiles();
      setTimeout(() => setUploadSuccess(''), 3000);
    } catch (e) {
      setUploadError(e?.response?.data?.error || 'حدث خطأ أثناء رفع الملف');
    } finally { setUploading(false); }
  };

  const handleDownload = async (id, fileName, isPreview = false) => {
    try {
      const res = await api.get(`/patient-files/${id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: res.headers['content-type'] }));
      if (isPreview) {
        setPreviewImage(url);
      } else {
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      }
    } catch (e) {
      alert('فشل جلب الملف. قد يكون غير موجود أو لا تملك صلاحية الوصول.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل تريد حذف هذا الملف نهائياً؟')) return;
    try {
      await api.delete(`/patient-files/${id}`);
      setFiles(f => f.filter(x => x.id !== id));
    } catch (e) { alert('خطأ في الحذف'); }
  };

  useEffect(() => {
    if (user.patientId) {
      setLoading(true);
      Promise.all([
        api.get(`/medical-records/patient/${user.patientId}`),
        api.get(`/labs/orders?patientId=${user.patientId}`)
      ])
        .then(([recRes, labRes]) => {
          setRecords(recRes.data);
          setLabs(labRes.data);
          if (recRes.data[0]?.appointment?.patient) {
            const p = recRes.data[0].appointment.patient;
            setPatientData({ 
              weight: p.weight || 75, 
              height: p.height || 175, 
              bloodType: p.bloodType || 'A+' 
            });
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));

      fetchFiles();
    }
  }, [user.patientId]);

  const VISITS = records.map(r => ({
    id: r.id,
    date: new Date(r.createdAt).toLocaleDateString('ar-EG'),
    type: r.appointment?.type || 'كشف',
    doctor: r.appointment?.doctor?.user?.name,
    specialty: r.appointment?.doctor?.specialty,
    diagnosis: r.diagnosis,
    status: 'مكتمل',
    statusColor: 'success',
    complaint: r.complaint,
    vitals: { 
      bp: r.appointment?.triage?.bloodPressure || '—', 
      hr: r.appointment?.triage?.heartRate || '—', 
      temp: r.appointment?.triage?.temperature || '—', 
      spo2: r.appointment?.triage?.oxygenLevel ? `${r.appointment.triage.oxygenLevel}%` : '—' 
    },
    medications: r.prescriptions?.[0]?.items?.map(i => ({
      name: i.medicine?.name,
      dose: i.dosage,
      freq: i.frequency,
      duration: i.duration
    })) || [],
    labs: [], 
    notes: r.notes,
    followUp: null
  }));

  const PATIENT = patientData;
  const BMI_VAL = +(PATIENT.weight / Math.pow(PATIENT.height / 100, 2)).toFixed(1);
  const BMI_INFO = BMI_VAL < 18.5
    ? { label: 'نقص الوزن', color: '#3b82f6', bg: 'bg-blue-50' }
    : BMI_VAL < 25
      ? { label: 'وزن طبيعي', color: '#14b8a6', bg: 'bg-teal-50' }
      : BMI_VAL < 30
        ? { label: 'وزن زائد', color: '#f59e0b', bg: 'bg-amber-50' }
        : { label: 'سمنة', color: '#ef4444', bg: 'bg-red-50' };

  const VITALS_TREND = VISITS.slice(0, 5).reverse().map(v => ({
    visit: v.date,
    bp: parseInt(v.vitals.bp) || 120,
    hr: parseInt(v.vitals.hr) || 80,
    weight: PATIENT.weight
  }));

  const CHRONIC_CONDITIONS = []; 
  const ALLERGIES = []; 
  const CURRENT_MEDS = VISITS[0]?.medications || [];

  const TABS = [
    { v: 'all', l: 'كل الزيارات', icon: FileText },
    { v: 'كشف', l: 'كشوفات', icon: Stethoscope },
    { v: 'متابعة', l: 'متابعات', icon: CheckCircle },
    { v: 'طوارئ', l: 'طوارئ', icon: AlertTriangle },
  ];

  const filtered = VISITS.filter(v =>
    (tab === 'all' || v.type === tab) &&
    (search === '' || v.diagnosis.includes(search) || v.doctor.includes(search))
  );

  const EmptyState = ({ msg }) => (
    <div className="text-center py-16 text-slate-300">
      <FileText className="w-12 h-12 mx-auto mb-3" />
      <p>{msg}</p>
    </div>
  );

  if (loading) return <div className="p-10 text-center animate-pulse">جاري تحميل السجل الطبي...</div>;

  return (
    <div className="p-6 fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div className="section-header mb-0">
          <div className="section-header-line" style={{ background: 'linear-gradient(180deg, #2563eb, #14b8a6)' }} />
          <h3 className="text-xl font-bold">السجل الطبي الكامل</h3>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors no-print">
            <Printer className="w-4 h-4" />طباعة
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="flex bg-slate-100 p-1 rounded-2xl w-fit">
            <button onClick={() => setActiveTab('visits')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'visits' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>زيارات العيادة</button>
            <button onClick={() => setActiveTab('labs')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'labs' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>التحاليل والأشعة</button>
            <button onClick={() => setActiveTab('files')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'files' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <span className="flex items-center gap-1.5"><Upload className="w-3.5 h-3.5" />ملفاتي
                {files.length > 0 && <span className="bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{files.length}</span>}
              </span>
            </button>
          </div>

          {activeTab === 'visits' && (
            <>
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white flex-1 min-w-48">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    className="text-sm outline-none font-cairo flex-1"
                    placeholder="بحث في التشخيصات أو الأطباء..." />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {TABS.map(t => (
                    <button key={t.v} onClick={() => setTab(t.v)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        tab === t.v ? 'text-white shadow' : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                      style={tab === t.v ? { background: 'linear-gradient(135deg, #2563eb, #14b8a6)' } : {}}>
                      <t.icon className="w-3.5 h-3.5" />{t.l}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-slate-400 text-sm">{filtered.length} زيارة</p>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <p className="text-xs font-bold text-slate-400 mb-4 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-500" />تطور العلامات الحيوية عبر الزيارات
                </p>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={VITALS_TREND}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="visit" tick={{ fontSize: 11, fontFamily: 'Cairo' }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontFamily: 'Cairo', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                    <Legend wrapperStyle={{ fontFamily: 'Cairo', fontSize: '12px' }} />
                    <Line type="monotone" dataKey="bp" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} name="ضغط الدم" />
                    <Line type="monotone" dataKey="hr" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} name="نبضات القلب" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="relative">
                <div className="absolute right-6 top-0 bottom-0 w-0.5 bg-slate-200 rounded-full" />
                <div className="space-y-4 pr-4">
                  {filtered.length === 0 ? <EmptyState msg="لا توجد زيارات مسجلة" /> : filtered.map((v, i) => <VisitCard key={v.id} visit={v} index={i} />)}
                </div>
              </div>
            </>
          )}

          {activeTab === 'labs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {labs.length === 0 ? <EmptyState msg="لا توجد نتائج تحاليل بعد" /> : labs.map((l, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <Microscope className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{l.testName}</h4>
                        <p className="text-slate-400 text-xs">{new Date(l.createdAt).toLocaleDateString('ar-EG')}</p>
                      </div>
                    </div>
                    <span className={l.status === 'COMPLETED' ? 'text-green-600 bg-green-50 px-2 py-1 rounded-lg text-xs' : 'text-amber-600 bg-amber-50 px-2 py-1 rounded-lg text-xs'}>
                      {l.status === 'COMPLETED' ? 'جاهزة' : 'قيد الفحص'}
                    </span>
                  </div>
                  {l.status === 'COMPLETED' ? (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-xs text-slate-400 mb-2 font-bold">النتيجة والتقرير:</p>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{l.result}</p>
                    </div>
                  ) : <p className="text-sm text-slate-400 italic">بانتظار صدور النتيجة من المختبر...</p>}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'files' && (
            <div className="space-y-5">
              {/* Upload Zone */}
              <div
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                  dragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50'
                }`}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleUpload(f); }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input ref={fileInputRef} type="file" className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={e => handleUpload(e.target.files[0])} />

                {uploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                    <p className="text-blue-600 font-semibold">جاري رفع الملف...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
                      <Upload className="w-7 h-7 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-700">اسحب وأفلت الملف هنا</p>
                      <p className="text-slate-400 text-sm mt-1">أو اضغط للاختيار</p>
                      <p className="text-slate-300 text-xs mt-2">PDF (10MB), JPG/PNG (5MB)</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Category + Description */}
              <div className="flex flex-wrap gap-3" onClick={e => e.stopPropagation()}>
                <select
                  value={fileCategory}
                  onChange={e => setFileCategory(e.target.value)}
                  className="input-hospital flex-1 min-w-40"
                >
                  <option value="RADIOLOGY">تصنيف: أشعة</option>
                  <option value="LAB_RESULT">تصنيف: تحاليل</option>
                  <option value="REPORT">تصنيف: تقرير</option>
                  <option value="OTHER">تصنيف: أخرى</option>
                </select>
                <input
                  value={fileDesc}
                  onChange={e => setFileDesc(e.target.value)}
                  placeholder="وصف اختياري (مثل: أشعة صدر 2025)"
                  className="input-hospital flex-[2] min-w-40"
                />
              </div>

              {/* Messages */}
              {uploadSuccess && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
                  <CheckCircle className="w-4 h-4" />{uploadSuccess}
                </div>
              )}
              {uploadError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                  <AlertTriangle className="w-4 h-4" />{uploadError}
                  <button onClick={() => setUploadError('')} className="mr-auto"><X className="w-4 h-4" /></button>
                </div>
              )}

              {/* Files List */}
              {filesLoading ? (
                <div className="text-center py-10 text-slate-400"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />جاري تحميل الملفات...</div>
              ) : files.length === 0 ? (
                <div className="text-center py-16 text-slate-300">
                  <FolderOpen className="w-14 h-14 mx-auto mb-3" />
                  <p className="font-medium">لا توجد ملفات طبية مرفوعة بعد</p>
                  <p className="text-sm mt-1">ارفع ملفات أشعتك وتحاليلك هنا</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-slate-400 text-sm">{files.length} ملف</p>
                  {files.map((f, i) => {
                    const ext = f.fileType?.toLowerCase() || 'pdf';
                    const { Icon, color } = FILE_ICONS[ext] || { Icon: FileText, color: '#64748b' };
                    const cat = CATEGORY_LABELS[f.category] || CATEGORY_LABELS.OTHER;
                    return (
                      <motion.div key={f.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}15` }}>
                          <Icon className="w-6 h-6" style={{ color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 truncate text-sm">{f.fileName}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded-lg font-medium border ${cat.bg} ${cat.border}`}
                              style={{ color: cat.color }}>{cat.label}</span>
                            {f.fileSize && <span className="text-slate-400 text-xs">{formatBytes(f.fileSize)}</span>}
                            {f.description && <span className="text-slate-400 text-xs truncate">{f.description}</span>}
                            <span className="text-slate-300 text-xs">{new Date(f.uploadedAt).toLocaleDateString('ar-EG')}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {['jpg', 'jpeg', 'png'].includes(ext) && (
                            <button onClick={() => handleDownload(f.id, f.fileName, true)}
                              className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-500 hover:bg-teal-100 transition-colors"
                              title="معاينة"><Eye className="w-4 h-4" /></button>
                          )}
                          <button onClick={() => handleDownload(f.id, f.fileName)}
                            className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 hover:bg-blue-100 transition-colors"
                            title="تحميل"><Download className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(f.id)}
                            className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 transition-colors"
                            title="حذف"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wide">ملخص صحي</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'فصيلة الدم', value: 'A+', icon: Droplets, color: '#ef4444' },
                { label: 'العمر', value: '35 سنة', icon: User, color: '#2563eb' },
                { label: 'الوزن', value: `${PATIENT.weight} كجم`, icon: Scale, color: '#14b8a6' },
                { label: 'الطول', value: `${PATIENT.height} سم`, icon: Activity, color: '#8b5cf6' },
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 text-center">
                  <item.icon className="w-4 h-4 mx-auto mb-1" style={{ color: item.color }} />
                  <p className="font-bold text-slate-800 text-sm">{item.value}</p>
                  <p className="text-slate-400 text-xs">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <p className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" />مؤشر كتلة الجسم (BMI)
            </p>
            <div className="text-center mb-3">
              <span className="text-4xl font-black" style={{ color: BMI_INFO.color }}>{BMI_VAL}</span>
              <span className="text-slate-400 text-sm mr-1">kg/m²</span>
              <p className={`mt-1 inline-block px-3 py-1 rounded-full text-sm font-bold ${BMI_INFO.bg}`}
                style={{ color: BMI_INFO.color }}>{BMI_INFO.label}</p>
            </div>
            {/* BMI scale bar */}
            <div className="relative h-3 rounded-full overflow-hidden" style={{ background: 'linear-gradient(to left, #ef4444 0%, #f59e0b 35%, #14b8a6 55%, #3b82f6 100%)' }}>
              <div className="absolute top-0 h-full w-1 bg-white rounded-full shadow"
                style={{ right: `${Math.min(Math.max(((BMI_VAL - 10) / 30) * 100, 2), 98)}%` }} />
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>نقص &lt;18.5</span><span>طبيعي</span><span>زائد &gt;25</span><span>سمنة &gt;30</span>
            </div>
          </div>

          {/* Current Medications */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <p className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-blue-400" />الأدوية الحالية الموحدة
            </p>
            <div className="space-y-2">
              {CURRENT_MEDS.map((m, i) => (
                <div key={i} className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-slate-800 text-sm">{m.name}</span>
                    <span className="text-xs font-semibold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-lg">{m.dose}</span>
                  </div>
                  <p className="text-slate-500 text-xs">{m.freq} · لـ {m.for}</p>
                  <p className="text-slate-400 text-xs mt-0.5">منذ {m.since}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Insurance Card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-green-500" />التأمين الصحي
              </p>
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-600 font-bold">● نشط</span>
            </div>
            <div className="p-3 rounded-xl mb-3" style={{ background: 'linear-gradient(135deg, #2563eb, #14b8a6)' }}>
              <p className="text-white text-xs opacity-80 mb-0.5">بطاقة التأمين</p>
              <p className="text-white font-black text-sm">{INSURANCE.company}</p>
              <p className="text-white/70 text-xs mt-1 font-mono">{INSURANCE.cardNum}</p>
            </div>
            <div className="space-y-1.5">
              {[
                { l: 'رقم البوليصة', v: INSURANCE.policyNum },
                { l: 'نوع التغطية', v: INSURANCE.type },
                { l: 'الحد الأقصى', v: INSURANCE.maxCoverage },
                { l: 'نسبة التحمّل', v: INSURANCE.copay },
                { l: 'الصلاحية', v: `${INSURANCE.start} — ${INSURANCE.end}` },
              ].map((f, i) => (
                <div key={i} className="flex justify-between text-xs py-1 border-b border-slate-50 last:border-0">
                  <span className="text-slate-400">{f.l}</span>
                  <span className="font-semibold text-slate-700">{f.v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chronic conditions */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <p className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-red-400" />الأمراض المزمنة
            </p>
            {CHRONIC_CONDITIONS.length === 0 ? (
              <p className="text-slate-300 text-sm text-center py-3">لا توجد أمراض مزمنة</p>
            ) : (
              <div className="space-y-2">
                {CHRONIC_CONDITIONS.map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-100">
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{c.name}</p>
                      <p className="text-slate-400 text-xs">منذ {c.since}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-lg font-semibold ${
                      c.controlled ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                      {c.controlled ? 'منضبط' : 'يحتاج متابعة'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Allergies */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <p className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />الحساسيات المعروفة
            </p>
            {ALLERGIES.length === 0 ? (
              <p className="text-slate-300 text-sm text-center py-3">لا توجد حساسيات</p>
            ) : (
              <div className="space-y-2">
                {ALLERGIES.map((a, i) => (
                  <div key={i} className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                    <div className="flex justify-between mb-1">
                      <span className="font-bold text-slate-800 text-sm">{a.substance}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-lg font-semibold ${
                        a.severity === 'شديدة' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                      }`}>{a.severity}</span>
                    </div>
                    <p className="text-slate-500 text-xs">{a.reaction}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <p className="text-xs font-bold text-slate-400 mb-3">إحصائيات الزيارات</p>
            {[
              { label: 'كشوفات عادية', count: VISITS.filter(v => v.type === 'كشف').length, color: '#2563eb' },
              { label: 'متابعات', count: VISITS.filter(v => v.type === 'متابعة').length, color: '#14b8a6' },
              { label: 'طوارئ', count: VISITS.filter(v => v.type === 'طوارئ').length, color: '#ef4444' },
            ].map((s, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">{s.label}</span>
                  <span className="font-bold" style={{ color: s.color }}>{s.count}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${(s.count / VISITS.length) * 100}%`, background: s.color }} />
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setPreviewImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh] w-full" onClick={e => e.stopPropagation()}>
              <button onClick={() => setPreviewImage(null)}
                className="absolute -top-12 right-0 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <img src={previewImage} alt="Preview" className="w-full h-full object-contain rounded-xl shadow-2xl" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@media print { .no-print { display: none !important; } }`}</style>
    </div>
  );
}
