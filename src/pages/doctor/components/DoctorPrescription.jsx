import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, Plus, Trash2, Printer, CheckCircle, AlertTriangle, Search, X, Clock, Calendar, User } from 'lucide-react';
import { ToastContainer } from '../../../components/hospital/Toast';
import { useToast } from '../../../hooks/useToast';

const COMMON_DRUGS = [
  { name: 'أموكسيسيلين', nameEn: 'Amoxicillin', category: 'مضاد حيوي', doses: ['250mg', '500mg', '875mg'] },
  { name: 'باراسيتامول', nameEn: 'Paracetamol', category: 'مسكن', doses: ['325mg', '500mg', '1000mg'] },
  { name: 'إيبوبروفين', nameEn: 'Ibuprofen', category: 'مضاد التهاب', doses: ['200mg', '400mg', '600mg'] },
  { name: 'أتورفاستاتين', nameEn: 'Atorvastatin', category: 'كوليسترول', doses: ['10mg', '20mg', '40mg'] },
  { name: 'ميتفورمين', nameEn: 'Metformin', category: 'سكر', doses: ['500mg', '850mg', '1000mg'] },
  { name: 'أملوديبين', nameEn: 'Amlodipine', category: 'ضغط الدم', doses: ['5mg', '10mg'] },
  { name: 'أوميبرازول', nameEn: 'Omeprazole', category: 'معدة', doses: ['20mg', '40mg'] },
  { name: 'سيتيريزين', nameEn: 'Cetirizine', category: 'حساسية', doses: ['5mg', '10mg'] },
  { name: 'ليفوثيروكسين', nameEn: 'Levothyroxine', category: 'غدة درقية', doses: ['25mcg', '50mcg', '100mcg'] },
  { name: 'أزيثرومايسين', nameEn: 'Azithromycin', category: 'مضاد حيوي', doses: ['250mg', '500mg'] },
];

const FREQUENCIES = ['مرة يومياً', 'مرتان يومياً', '3 مرات يومياً', 'كل 8 ساعات', 'كل 6 ساعات', 'عند الحاجة', 'قبل النوم'];
const DURATIONS = ['3 أيام', '5 أيام', '7 أيام', '10 أيام', '14 أيام', '30 يوماً', '3 أشهر', 'مستمر'];
const ROUTES = ['فموي', 'حقن وريدي', 'حقن عضلي', 'موضعي', 'استنشاق', 'تحت اللسان'];

const SAVED_PRESCRIPTIONS = [
  {
    id: 'RX-001', patient: 'محمد أحمد السيد', date: '2025-04-20',
    drugs: [
      { name: 'أملوديبين', dose: '5mg', freq: 'مرة يومياً', duration: '30 يوماً' },
      { name: 'أتورفاستاتين', dose: '20mg', freq: 'قبل النوم', duration: '3 أشهر' },
    ]
  },
  {
    id: 'RX-002', patient: 'نورا عبدالله الرشيدي', date: '2025-04-21',
    drugs: [
      { name: 'إيبوبروفين', dose: '400mg', freq: '3 مرات يومياً', duration: '5 أيام' },
      { name: 'أوميبرازول', dose: '20mg', freq: 'مرة يومياً', duration: '5 أيام' },
    ]
  },
];

function DrugRow({ drug, index, onChange, onRemove }) {
  const [search, setSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestions = search.length > 1
    ? COMMON_DRUGS.filter(d => d.name.includes(search) || d.nameEn.toLowerCase().includes(search.toLowerCase()))
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-slate-50 rounded-2xl p-4 border border-slate-200 relative"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-lg">دواء #{index + 1}</span>
        <button onClick={() => onRemove(index)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Drug name with autocomplete */}
        <div className="relative md:col-span-2 lg:col-span-1">
          <label className="block text-slate-500 text-xs font-semibold mb-1">اسم الدواء</label>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              value={drug.name || search}
              onChange={e => { setSearch(e.target.value); onChange(index, 'name', e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              className="w-full pr-8 pl-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-teal-400 font-cairo"
              placeholder="ابحث عن دواء..."
            />
          </div>
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="absolute top-full right-0 left-0 z-20 bg-white rounded-xl shadow-xl border border-slate-100 mt-1 max-h-44 overflow-y-auto">
                {suggestions.map((s, i) => (
                  <button key={i} onMouseDown={() => { onChange(index, 'name', s.name); onChange(index, 'dose', s.doses[0]); setSearch(s.name); setShowSuggestions(false); }}
                    className="w-full text-right px-3 py-2.5 hover:bg-teal-50 transition-colors border-b border-slate-50 last:border-0">
                    <div className="font-semibold text-slate-800 text-sm">{s.name}</div>
                    <div className="text-slate-400 text-xs">{s.nameEn} · {s.category}</div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dose */}
        <div>
          <label className="block text-slate-500 text-xs font-semibold mb-1">الجرعة</label>
          <input value={drug.dose} onChange={e => onChange(index, 'dose', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-teal-400 font-cairo"
            placeholder="مثال: 500mg" />
        </div>

        {/* Frequency */}
        <div>
          <label className="block text-slate-500 text-xs font-semibold mb-1">التكرار</label>
          <select value={drug.freq} onChange={e => onChange(index, 'freq', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none font-cairo">
            <option value="">اختر التكرار</option>
            {FREQUENCIES.map(f => <option key={f}>{f}</option>)}
          </select>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-slate-500 text-xs font-semibold mb-1">المدة</label>
          <select value={drug.duration} onChange={e => onChange(index, 'duration', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none font-cairo">
            <option value="">اختر المدة</option>
            {DURATIONS.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>

        {/* Route */}
        <div>
          <label className="block text-slate-500 text-xs font-semibold mb-1">طريقة الإعطاء</label>
          <select value={drug.route} onChange={e => onChange(index, 'route', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none font-cairo">
            <option value="">اختر الطريقة</option>
            {ROUTES.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>

        {/* Notes */}
        <div className="md:col-span-1 lg:col-span-3">
          <label className="block text-slate-500 text-xs font-semibold mb-1">ملاحظات</label>
          <input value={drug.notes} onChange={e => onChange(index, 'notes', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-teal-400 font-cairo"
            placeholder="مثال: تؤخذ بعد الطعام، تجنب مع الحليب..." />
        </div>
      </div>
    </motion.div>
  );
}

export default function DoctorPrescription() {
  const { toasts, addToast, removeToast } = useToast();
  const [prescriptions, setPrescriptions] = useState(SAVED_PRESCRIPTIONS);
  const [tab, setTab] = useState('new'); // 'new' | 'history'

  const emptyDrug = () => ({ name: '', dose: '', freq: '', duration: '', route: 'فموي', notes: '' });
  const [form, setForm] = useState({
    patient: '', age: '', diagnosis: '', notes: '', followUp: '',
    drugs: [emptyDrug()],
  });

  const updateDrug = (i, key, val) => {
    setForm(prev => {
      const drugs = [...prev.drugs];
      drugs[i] = { ...drugs[i], [key]: val };
      return { ...prev, drugs };
    });
  };
  const addDrug = () => setForm(prev => ({ ...prev, drugs: [...prev.drugs, emptyDrug()] }));
  const removeDrug = (i) => setForm(prev => ({ ...prev, drugs: prev.drugs.filter((_, idx) => idx !== i) }));

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.patient) return addToast('يرجى تحديد اسم المريض', 'error');
    if (form.drugs.some(d => !d.name)) return addToast('يرجى إدخال اسم الدواء لكل صف', 'error');

    const newRx = {
      id: `RX-${String(prescriptions.length + 1).padStart(3, '0')}`,
      patient: form.patient,
      date: new Date().toISOString().split('T')[0],
      drugs: form.drugs,
    };
    setPrescriptions(prev => [newRx, ...prev]);
    setForm({ patient: '', age: '', diagnosis: '', notes: '', followUp: '', drugs: [emptyDrug()] });
    addToast(`تم حفظ الوصفة ${newRx.id} بنجاح ✓`, 'success');
    setTab('history');
  };

  const handlePrint = () => window.print();

  return (
    <div className="p-6 fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div className="section-header mb-0">
          <div className="section-header-line" style={{ background: 'linear-gradient(180deg, #14b8a6, #0d9488)' }} />
          <h3 className="text-xl font-bold">الوصفة الطبية الإلكترونية</h3>
        </div>
        <div className="flex gap-2">
          {['new', 'history'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t ? 'text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}
              style={tab === t ? { background: 'linear-gradient(135deg, #14b8a6, #0d9488)' } : {}}>
              {t === 'new' ? '+ وصفة جديدة' : `السجل (${prescriptions.length})`}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'new' ? (
          <motion.div key="new" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <form onSubmit={handleSave} className="space-y-5">
              {/* Patient info */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-teal-500" />بيانات المريض
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-500 text-sm font-semibold mb-1">اسم المريض *</label>
                    <input required value={form.patient} onChange={e => setForm(p => ({ ...p, patient: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:border-teal-400 font-cairo"
                      placeholder="الاسم الكامل" />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-sm font-semibold mb-1">العمر</label>
                    <input type="number" value={form.age} onChange={e => setForm(p => ({ ...p, age: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:border-teal-400 font-cairo"
                      placeholder="السنة" min={1} max={120} />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-sm font-semibold mb-1">التشخيص</label>
                    <input value={form.diagnosis} onChange={e => setForm(p => ({ ...p, diagnosis: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:border-teal-400 font-cairo"
                      placeholder="التشخيص الطبي" />
                  </div>
                </div>
              </div>

              {/* Drug rows */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    <Pill className="w-4 h-4 text-teal-500" />الأدوية الموصوفة
                  </h4>
                  <button type="button" onClick={addDrug}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}>
                    <Plus className="w-4 h-4" />إضافة دواء
                  </button>
                </div>
                <AnimatePresence>
                  {form.drugs.map((drug, i) => (
                    <DrugRow key={i} drug={drug} index={i} onChange={updateDrug} onRemove={removeDrug} />
                  ))}
                </AnimatePresence>
              </div>

              {/* Interaction warning */}
              {form.drugs.length >= 3 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-800 text-sm">تحذير: تعدد الأدوية</p>
                    <p className="text-amber-600 text-xs mt-0.5">عند وصف 3 أدوية أو أكثر، تأكد من عدم وجود تفاعلات دوائية خطيرة. سيتم التحقق تلقائياً في النظام الحي.</p>
                  </div>
                </motion.div>
              )}

              {/* Notes & Follow-up */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-500 text-sm font-semibold mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />موعد المتابعة
                    </label>
                    <input type="date" value={form.followUp} onChange={e => setForm(p => ({ ...p, followUp: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:border-teal-400 font-cairo" />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-sm font-semibold mb-1">تعليمات للمريض</label>
                    <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 h-24 resize-none font-cairo outline-none focus:border-teal-400"
                      placeholder="تعليمات خاصة، تنبيهات غذائية، احتياطات..." />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button type="submit" className="flex-1 py-3 rounded-xl text-white font-bold font-cairo flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}>
                  <CheckCircle className="w-5 h-5" />حفظ الوصفة الطبية
                </button>
                <button type="button" onClick={handlePrint}
                  className="px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold font-cairo flex items-center gap-2 hover:bg-slate-50 transition-colors no-print">
                  <Printer className="w-4 h-4" />طباعة
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-4">
            {prescriptions.length === 0 ? (
              <div className="text-center py-16 text-slate-300">
                <Pill className="w-14 h-14 mx-auto mb-3" />
                <p>لا توجد وصفات محفوظة بعد</p>
              </div>
            ) : prescriptions.map((rx, i) => (
              <motion.div key={rx.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                      style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}>
                      <Pill className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{rx.patient}</p>
                      <p className="text-slate-400 text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" />{rx.date} · {rx.id}
                      </p>
                    </div>
                  </div>
                  <button onClick={handlePrint} className="p-2 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors">
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {rx.drugs.map((d, j) => (
                    <div key={j} className="flex items-center gap-3 p-3 rounded-xl bg-teal-50">
                      <div className="w-2 h-2 rounded-full bg-teal-400 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="font-semibold text-slate-800 text-sm">{d.name}</span>
                        <span className="text-slate-500 text-xs mr-2">{d.dose}</span>
                      </div>
                      <div className="text-slate-400 text-xs text-left">{d.freq} · {d.duration}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <style>{`@media print { .no-print { display:none!important; } }`}</style>
    </div>
  );
}
