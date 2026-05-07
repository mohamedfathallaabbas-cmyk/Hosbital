import { useEffect, useMemo, useState } from 'react';
import { CheckCircle, Plus, Printer, Search, Trash2, User, Pill } from 'lucide-react';
import api from '@/lib/api';

const emptyDrug = () => ({ medicineId: '', name: '', dosage: '', frequency: '', duration: '', quantity: 1 });

export default function DoctorPrescription() {
  const [patients, setPatients] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    patientId: '',
    diagnosis: '',
    notes: '',
    followUp: '',
    prescriptions: [emptyDrug()]
  });

  useEffect(() => {
    Promise.all([
      api.get('/patients'),
      api.get('/pharmacy/inventory'),
      api.get('/pharmacy/prescriptions')
    ]).then(([patientRes, medicineRes, rxRes]) => {
      setPatients(patientRes.data);
      setMedicines(medicineRes.data);
      setHistory(rxRes.data);
    }).catch(console.error);
  }, []);

  const filteredPatients = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return patients.slice(0, 8);
    return patients.filter((p) => {
      const name = p.user?.name?.toLowerCase() || '';
      const phone = p.user?.phone || '';
      const nationalId = p.nationalId || '';
      return name.includes(term) || phone.includes(term) || nationalId.includes(term);
    }).slice(0, 8);
  }, [patients, search]);

  const selectedPatient = patients.find((p) => String(p.id) === String(form.patientId));

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const updateDrug = (index, key, value) => {
    setForm((prev) => {
      const prescriptions = [...prev.prescriptions];
      prescriptions[index] = { ...prescriptions[index], [key]: value };
      return { ...prev, prescriptions };
    });
  };

  const chooseMedicine = (index, value) => {
    const med = medicines.find((m) => String(m.id) === String(value));
    updateDrug(index, 'medicineId', value);
    if (med) updateDrug(index, 'name', med.name);
  };

  const save = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!form.patientId) return setMessage('اختيار المريض إجباري');
    if (form.prescriptions.some((drug) => !drug.name && !drug.medicineId)) return setMessage('كل صف دواء يحتاج اسم دواء');

    setSaving(true);
    try {
      await api.post('/medical-records/prescriptions', {
        patientId: form.patientId,
        diagnosis: form.diagnosis,
        notes: form.notes,
        treatmentPlan: form.followUp ? `متابعة بتاريخ ${form.followUp}` : undefined,
        prescriptions: form.prescriptions
      });
      const rxRes = await api.get('/pharmacy/prescriptions');
      setHistory(rxRes.data);
      setForm({ patientId: '', diagnosis: '', notes: '', followUp: '', prescriptions: [emptyDrug()] });
      setSearch('');
      setMessage('تم حفظ الروشتة وإرسالها للصيدلية بنجاح');
    } catch (err) {
      setMessage(err.response?.data?.error || 'فشل حفظ الروشتة');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div className="section-header mb-0">
          <div className="section-header-line" style={{ background: 'linear-gradient(180deg, #14b8a6, #0d9488)' }} />
          <h3 className="text-xl font-bold">الروشتة الطبية الإلكترونية</h3>
        </div>
        <button onClick={() => window.print()} className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 flex items-center gap-2 font-bold text-sm">
          <Printer className="w-4 h-4" />
          طباعة
        </button>
      </div>

      {message && <div className="mb-4 p-3 rounded-xl bg-teal-50 text-teal-700 font-bold text-sm">{message}</div>}

      <form onSubmit={save} className="space-y-5">
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h4 className="font-black text-slate-900 mb-4 flex items-center gap-2"><User className="w-5 h-5 text-teal-600" />اختيار المريض من قاعدة البيانات</h4>
          <div className="relative">
            <Search className="absolute right-3 top-3.5 w-4 h-4 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pr-10 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-teal-400 font-cairo" placeholder="ابحث باسم المريض أو الهاتف أو الرقم القومي..." />
            {search && (
              <div className="absolute z-20 mt-2 right-0 left-0 bg-white border border-slate-100 rounded-xl shadow-xl max-h-64 overflow-auto">
                {filteredPatients.map((patient) => (
                  <button type="button" key={patient.id} onClick={() => { set('patientId', patient.id); setSearch(patient.user?.name || ''); }} className="w-full text-right px-4 py-3 hover:bg-teal-50 border-b border-slate-50 last:border-0">
                    <div className="font-bold text-slate-800">{patient.user?.name}</div>
                    <div className="text-xs text-slate-400">{patient.user?.phone || 'بدون هاتف'} - {patient.bloodType || 'فصيلة غير مسجلة'}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
          {selectedPatient && (
            <div className="mt-3 p-3 rounded-xl bg-teal-50 text-teal-800 text-sm font-bold">
              تم اختيار: {selectedPatient.user?.name}
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input value={form.diagnosis} onChange={(e) => set('diagnosis', e.target.value)} className="px-4 py-3 rounded-xl border bg-slate-50 font-cairo" placeholder="التشخيص" />
            <input type="date" value={form.followUp} onChange={(e) => set('followUp', e.target.value)} className="px-4 py-3 rounded-xl border bg-slate-50 font-cairo" />
            <input value={form.notes} onChange={(e) => set('notes', e.target.value)} className="px-4 py-3 rounded-xl border bg-slate-50 font-cairo" placeholder="تعليمات للمريض" />
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-slate-900 flex items-center gap-2"><Pill className="w-5 h-5 text-teal-600" />الأدوية الموصوفة</h4>
            <button type="button" onClick={() => set('prescriptions', [...form.prescriptions, emptyDrug()])} className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" />
              إضافة دواء
            </button>
          </div>

          {form.prescriptions.map((drug, index) => (
            <div key={index} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-6 gap-3">
              <select value={drug.medicineId} onChange={(e) => chooseMedicine(index, e.target.value)} className="px-3 py-2.5 rounded-xl border bg-slate-50 font-cairo">
                <option value="">دواء غير موجود بالصيدلية</option>
                {medicines.map((med) => <option key={med.id} value={med.id}>{med.name} - مخزون {med.stock}</option>)}
              </select>
              <input value={drug.name} onChange={(e) => updateDrug(index, 'name', e.target.value)} className="px-3 py-2.5 rounded-xl border bg-slate-50 font-cairo" placeholder="اسم الدواء" />
              <input value={drug.dosage} onChange={(e) => updateDrug(index, 'dosage', e.target.value)} className="px-3 py-2.5 rounded-xl border bg-slate-50 font-cairo" placeholder="الجرعة" />
              <input value={drug.frequency} onChange={(e) => updateDrug(index, 'frequency', e.target.value)} className="px-3 py-2.5 rounded-xl border bg-slate-50 font-cairo" placeholder="التكرار" />
              <input value={drug.duration} onChange={(e) => updateDrug(index, 'duration', e.target.value)} className="px-3 py-2.5 rounded-xl border bg-slate-50 font-cairo" placeholder="المدة" />
              <div className="flex gap-2">
                <input type="number" min="1" value={drug.quantity} onChange={(e) => updateDrug(index, 'quantity', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border bg-slate-50 font-cairo" placeholder="الكمية" />
                <button type="button" onClick={() => set('prescriptions', form.prescriptions.filter((_, i) => i !== index))} className="p-2.5 rounded-xl bg-red-50 text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </section>

        <button disabled={saving} className="w-full py-3 rounded-xl bg-teal-600 text-white font-black flex items-center justify-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {saving ? 'جاري الحفظ...' : 'حفظ وإرسال الروشتة للصيدلية'}
        </button>
      </form>

      <section className="mt-8 bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h4 className="font-black text-slate-900 mb-4">آخر الروشتات المرسلة للصيدلية</h4>
        <div className="space-y-3">
          {history.slice(0, 6).map((rx) => (
            <div key={rx.id} className="p-3 rounded-xl bg-slate-50 flex justify-between gap-3">
              <div>
                <div className="font-bold text-slate-800">{rx.medicalRecord?.appointment?.patient?.user?.name}</div>
                <div className="text-xs text-slate-400">{rx.items?.map((item) => item.medicine?.name || item.medicineName).join('، ')}</div>
              </div>
              <span className={rx.status === 'DISPENSED' ? 'badge-success' : 'badge-warning'}>{rx.status}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
