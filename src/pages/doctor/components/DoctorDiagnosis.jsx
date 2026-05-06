import { useState, useEffect } from 'react';
import { ClipboardList, Search, Plus } from 'lucide-react';
import api from '@/lib/api';
import Modal from '@/components/hospital/Modal';

export default function DoctorDiagnosis() {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ diagnosis: '', medications: '', notes: '' });

  useEffect(() => {
    setLoading(true);
    api.get('/patients').then(res => setPatients(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filteredPatients = patients.filter(p => 
    p.user?.name.includes(searchTerm) || p.user?.phone.includes(searchTerm)
  );

  const handleSave = async () => {
    try {
      await api.post('/medical-records', {
        patientId: selectedPatient.id,
        diagnosis: form.diagnosis,
        notes: form.notes,
        prescriptions: form.medications ? [{ name: form.medications, dosage: 'حسب الحاجة', frequency: '-', duration: '-' }] : []
      });
      setSelectedPatient(null);
      setForm({ diagnosis: '', medications: '', notes: '' });
      alert('تم حفظ السجل الطبي بنجاح ✓');
    } catch (err) {
      alert('فشل في حفظ السجل');
    }
  };

  return (
    <div className="p-6 fade-in">
      <div className="section-header">
        <div className="section-header-line" style={{ background: 'linear-gradient(180deg, #14b8a6, #0d9488)' }} />
        <h3 className="text-xl font-bold">التشخيص والملاحظات</h3>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="ابحث عن مريض بالاسم أو رقم الهاتف..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-400 bg-white shadow-sm"
          />
        </div>
      </div>

      {loading ? <p className="text-center py-10">جاري التحميل...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map(patient => (
            <div key={patient.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold" style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}>
                  {patient.user?.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{patient.user?.name}</h4>
                  <p className="text-slate-500 text-sm">{patient.bloodType} • {patient.user?.phone}</p>
                </div>
              </div>
              
              <button 
                onClick={() => setSelectedPatient(patient)}
                className="w-full py-2.5 rounded-xl border border-teal-100 text-teal-600 font-semibold hover:bg-teal-50 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                إضافة تشخيص جديد
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!selectedPatient} onClose={() => setSelectedPatient(null)} title="تشخيص جديد" size="md">
        <div className="p-6">
          <div className="mb-4 p-4 rounded-xl bg-teal-50">
            <p className="font-bold text-slate-900">{selectedPatient?.user?.name}</p>
            <p className="text-slate-500 text-sm">{selectedPatient?.bloodType}</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-slate-700 text-sm font-semibold mb-2">التشخيص</label>
              <input type="text" value={form.diagnosis} onChange={e => setForm({...form, diagnosis: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-teal-400 bg-slate-50" placeholder="اكتب التشخيص هنا..." />
            </div>
            <div>
              <label className="block text-slate-700 text-sm font-semibold mb-2">الأدوية الموصوفة</label>
              <input type="text" value={form.medications} onChange={e => setForm({...form, medications: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-teal-400 bg-slate-50" placeholder="أسماء الأدوية والجرعات..." />
            </div>
            <div>
              <label className="block text-slate-700 text-sm font-semibold mb-2">ملاحظات إضافية</label>
              <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-teal-400 bg-slate-50 h-24 resize-none" placeholder="أي ملاحظات أخرى..." />
            </div>
            
            <div className="flex gap-3 pt-2">
              <button onClick={() => setSelectedPatient(null)} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold">إلغاء</button>
              <button onClick={handleSave} className="flex-1 py-3 rounded-xl text-white font-bold" style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}>حفظ السجل</button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
