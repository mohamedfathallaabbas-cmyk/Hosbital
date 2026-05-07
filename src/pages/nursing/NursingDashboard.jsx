import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bed, HeartPulse, LogOut, Save, Stethoscope, UserRound } from 'lucide-react';
import Topbar from '../../components/hospital/Topbar';
import api from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

export default function NursingDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState({ content: '', vitalSigns: '', weight: '', height: '', bloodType: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/nursing/assignments/my')
      .then((res) => setAssignments(res.data))
      .catch((err) => setMessage(err.response?.data?.error || 'تعذر تحميل غرف التمريض'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const activeAdmissions = assignments.flatMap((assignment) =>
    (assignment.bed?.admissions || []).map((admission) => ({ assignment, admission }))
  );

  const save = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setMessage('');
    try {
      if (note.weight || note.height || note.bloodType) {
        await api.patch(`/nursing/patients/${selected.admission.patientId}/vitals`, {
          weight: note.weight,
          height: note.height,
          bloodType: note.bloodType
        });
      }
      if (note.content || note.vitalSigns) {
        await api.post('/nursing/notes', {
          admissionId: selected.admission.id,
          content: note.content || 'متابعة تمريضية',
          vitalSigns: note.vitalSigns
        });
      }
      setMessage('تم حفظ تحديثات المريض بنجاح');
      setNote({ content: '', vitalSigns: '', weight: '', height: '', bloodType: '' });
      load();
    } catch (err) {
      setMessage(err.response?.data?.error || 'فشل حفظ تحديثات التمريض');
    }
  };

  const logout = () => {
    sessionStorage.removeItem('hospitalUser');
    navigate('/role-select');
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 font-cairo" dir="rtl">
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar title="لوحة التمريض" roleColor="#f43f5e" />
        <div className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">أهلا بك، {user?.name}</h2>
              <p className="text-slate-500 text-sm">مراجعة الغرف، تحديث البيانات الصحية، وتسجيل ما تم عمله للمريض.</p>
            </div>
            <button onClick={logout} className="px-4 py-2.5 rounded-xl bg-red-50 text-red-600 font-bold flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              خروج
            </button>
          </div>

          {message && <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 font-bold text-sm">{message}</div>}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <section className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 font-black flex items-center gap-2">
                <Bed className="w-5 h-5 text-rose-600" />
                الغرف والمرضى المسندين
              </div>
              <div className="p-4 space-y-3">
                {loading ? (
                  <div className="py-10 text-center text-slate-400">جاري التحميل...</div>
                ) : activeAdmissions.length === 0 ? (
                  <div className="py-10 text-center text-slate-400">لا توجد حالات منومة مسندة لك حاليا.</div>
                ) : activeAdmissions.map((item) => {
                  const patient = item.admission.patient;
                  const isActive = selected?.admission.id === item.admission.id;
                  return (
                    <button key={item.admission.id} onClick={() => setSelected(item)} className={`w-full text-right p-4 rounded-xl border transition-all ${isActive ? 'border-rose-400 bg-rose-50' : 'border-slate-100 bg-slate-50 hover:bg-slate-100'}`}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black">{patient?.user?.name?.charAt(0) || 'م'}</div>
                          <div>
                            <div className="font-black text-slate-900">{patient?.user?.name}</div>
                            <div className="text-xs text-slate-500">سرير {item.assignment.bed?.bedNumber} - غرفة {item.assignment.bed?.room?.roomNumber}</div>
                          </div>
                        </div>
                        <span className="badge-info">{item.assignment.shift}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-3 text-xs text-slate-500">
                        <span>فصيلة: {patient?.bloodType || '-'}</span>
                        <span>وزن: {patient?.weight || '-'}</span>
                        <span>طول: {patient?.height || '-'}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5">
              <h3 className="font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-rose-600" />
                تحديث المريض
              </h3>
              {!selected ? (
                <div className="py-12 text-center text-slate-400">
                  <UserRound className="w-12 h-12 mx-auto mb-3" />
                  اختر مريضا من القائمة
                </div>
              ) : (
                <form onSubmit={save} className="space-y-3">
                  <div className="p-3 rounded-xl bg-rose-50 text-rose-800 font-bold text-sm">
                    {selected.admission.patient?.user?.name}
                  </div>
                  <input value={note.vitalSigns} onChange={(e) => setNote((p) => ({ ...p, vitalSigns: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border bg-slate-50 font-cairo" placeholder="العلامات الحيوية: ضغط، نبض، حرارة..." />
                  <div className="grid grid-cols-3 gap-2">
                    <input value={note.weight} onChange={(e) => setNote((p) => ({ ...p, weight: e.target.value }))} className="px-3 py-2.5 rounded-xl border bg-slate-50 font-cairo" placeholder="الوزن" />
                    <input value={note.height} onChange={(e) => setNote((p) => ({ ...p, height: e.target.value }))} className="px-3 py-2.5 rounded-xl border bg-slate-50 font-cairo" placeholder="الطول" />
                    <select value={note.bloodType} onChange={(e) => setNote((p) => ({ ...p, bloodType: e.target.value }))} className="px-3 py-2.5 rounded-xl border bg-slate-50 font-cairo">
                      <option value="">الفصيلة</option>
                      {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map((b) => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <textarea value={note.content} onChange={(e) => setNote((p) => ({ ...p, content: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border bg-slate-50 font-cairo h-32 resize-none" placeholder="اكتب ما تم عمله للمريض..." />
                  <button className="w-full py-3 rounded-xl bg-rose-600 text-white font-black flex items-center justify-center gap-2">
                    <Save className="w-5 h-5" />
                    حفظ التحديث
                  </button>
                </form>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
