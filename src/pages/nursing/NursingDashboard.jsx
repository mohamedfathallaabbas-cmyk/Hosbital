import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Activity, AlertCircle, Bed, Bell, CheckCircle, Clock, 
  HeartPulse, LogOut, Pill, Plus, ShieldAlert, Stethoscope, 
  UserRound, PlayCircle
} from 'lucide-react';
import Topbar from '../../components/hospital/Topbar';
import api from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/hooks/useToast';
import Modal from '@/components/hospital/Modal';

import { ToastContainer } from '@/components/hospital/Toast';

export default function NursingDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toasts, addToast, removeToast } = useToast();

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [modalOpen, setModalOpen] = useState('');
  const [noteForm, setNoteForm] = useState({ vitals: '', content: '' });

  const { data: stats, isLoading } = useQuery({
    queryKey: ['nursing-stats'],
    queryFn: async () => {
      const res = await api.get('/nursing/dashboard-stats');
      return res.data;
    }
  });

  const saveNoteMutation = useMutation({
    mutationFn: async (data) => {
      return api.post('/nursing/notes', data);
    },
    onSuccess: () => {
      addToast('تم حفظ الملاحظة بنجاح', 'success');
      setModalOpen('');
      setNoteForm({ vitals: '', content: '' });
      queryClient.invalidateQueries(['nursing-stats']);
    },
    onError: (err) => {
      addToast(err.response?.data?.error || 'فشل الحفظ', 'error');
    }
  });

  const handleSaveNote = (e) => {
    e.preventDefault();
    if (!selectedPatient) return;
    saveNoteMutation.mutate({
      admissionId: selectedPatient.id,
      vitalSigns: noteForm.vitals,
      content: noteForm.content || 'متابعة تمريضية'
    });
  };

  const logout = () => {
    sessionStorage.removeItem('hospitalUser');
    navigate('/role-select');
  };

  return (
    <div className="flex h-screen bg-slate-50 font-cairo" dir="rtl">
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar title="لوحة التمريض" roleColor="#f43f5e" />
        <div className="flex-1 overflow-auto p-6 space-y-6">
          
          {/* Header & Profile Card */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <h2 className="text-2xl font-black text-slate-900 mb-2">مرحباً بك، {user?.name}</h2>
              <p className="text-slate-500 text-sm">متابعة الحالات، تسجيل القياسات الحيوية، وإدارة المهام.</p>
            </div>
            
            {/* Profile Card */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4 min-w-72">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-lg">
                {user?.name?.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="font-bold text-slate-800">{user?.name}</div>
                <div className="text-xs text-slate-500">ممرض مسجل</div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                  <PlayCircle className="w-3.5 h-3.5" />
                  On Duty
                </div>
                <div className="text-xs text-slate-400 mt-1">شيفت صباحي</div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'المرضى الحاليين', value: stats?.currentPatients || 0, icon: Bed, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'الحالات الحرجة', value: stats?.criticalCases || 0, icon: HeartPulse, color: 'text-rose-600', bg: 'bg-rose-50' },
              { label: 'مهام متبقية', value: stats?.remainingTasks || 0, icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'أدوية أُعطيت', value: stats?.medsGivenToday || 0, icon: Pill, color: 'text-teal-600', bg: 'bg-teal-50' }
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.bg} ${s.color}`}>
                  <s.icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-800">{isLoading ? '-' : s.value}</div>
                  <div className="text-slate-500 text-xs font-semibold">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Patients Table */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-black text-slate-800 flex items-center gap-2">
                    <UserRound className="w-5 h-5 text-rose-500" />
                    المرضى المسندين ({stats?.patients?.length || 0})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-right">
                    <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase">
                      <tr>
                        <th className="p-4">المريض</th>
                        <th className="p-4">السرير</th>
                        <th className="p-4">الحالة</th>
                        <th className="p-4">آخر قياسات</th>
                        <th className="p-4 text-center">إجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {isLoading ? (
                        <tr><td colSpan="5" className="p-8 text-center text-slate-400">جاري التحميل...</td></tr>
                      ) : stats?.patients?.length === 0 ? (
                        <tr><td colSpan="5" className="p-8 text-center text-slate-400">لا يوجد مرضى مسندين حالياً.</td></tr>
                      ) : (
                        stats?.patients?.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4">
                              <div className="font-bold text-slate-800">{p.name}</div>
                              <div className="text-xs text-slate-500">{p.doctorName}</div>
                            </td>
                            <td className="p-4 font-semibold text-slate-700">{p.room}</td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                                p.status === 'حرج' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                              }`}>{p.status}</span>
                            </td>
                            <td className="p-4 text-slate-600 text-xs">{p.lastVitals}</td>
                            <td className="p-4 text-center">
                              <button onClick={() => { setSelectedPatient(p); setModalOpen('actions'); }} 
                                className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold hover:bg-rose-100 transition-colors">
                                إدارة
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Sidebar Alerts & Quick Actions */}
            <div className="space-y-6">
              
              {/* Quick Actions (General) */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <h3 className="font-black text-slate-800 mb-4 text-sm uppercase">إجراءات سريعة</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button className="p-3 rounded-xl border border-slate-100 bg-slate-50 hover:border-blue-200 hover:bg-blue-50 transition-all text-center group">
                    <Activity className="w-5 h-5 mx-auto mb-2 text-blue-500 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-slate-600">تسجيل حيوي</span>
                  </button>
                  <button className="p-3 rounded-xl border border-slate-100 bg-slate-50 hover:border-teal-200 hover:bg-teal-50 transition-all text-center group">
                    <Pill className="w-5 h-5 mx-auto mb-2 text-teal-500 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-slate-600">تأكيد دواء</span>
                  </button>
                  <button className="p-3 rounded-xl border border-slate-100 bg-slate-50 hover:border-amber-200 hover:bg-amber-50 transition-all text-center group">
                    <Plus className="w-5 h-5 mx-auto mb-2 text-amber-500 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-slate-600">ملاحظة جديدة</span>
                  </button>
                  <button className="p-3 rounded-xl border border-rose-100 bg-rose-50 hover:bg-rose-100 transition-all text-center group">
                    <ShieldAlert className="w-5 h-5 mx-auto mb-2 text-rose-600 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-rose-700">طلب مساعدة</span>
                  </button>
                </div>
              </div>

              {/* Simple Alerts */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <h3 className="font-black text-slate-800 mb-4 text-sm uppercase flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-500" />
                  التنبيهات
                </h3>
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-red-50 border border-red-100 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-bold text-red-700">مريض حالته حرجة</div>
                      <div className="text-xs text-red-600 mt-0.5">غرفة 204 تحتاج متابعة فورية للأكسجين.</div>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 flex gap-3">
                    <Clock className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-bold text-amber-700">دواء متأخر</div>
                      <div className="text-xs text-amber-600 mt-0.5">مريض أحمد بانتظار جرعة المضاد الحيوي.</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Patient Actions Modal */}
      <Modal open={modalOpen === 'actions'} onClose={() => { setModalOpen(''); setSelectedPatient(null); }} title={`إجراءات المريض: ${selectedPatient?.name}`} size="md">
        <form onSubmit={handleSaveNote} className="p-6 space-y-5">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-400">السرير</p>
              <p className="font-bold text-slate-800">{selectedPatient?.room}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">الطبيب</p>
              <p className="font-bold text-slate-800">{selectedPatient?.doctorName}</p>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">العلامات الحيوية الجديدة</label>
            <input 
              value={noteForm.vitals} 
              onChange={e => setNoteForm(p => ({...p, vitals: e.target.value}))}
              className="w-full px-4 py-3 rounded-xl border bg-slate-50 border-slate-200 outline-none focus:border-rose-400 transition-colors text-sm" 
              placeholder="مثال: ضغط 120/80، حرارة 37.2، نبض 80"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">ملاحظات التمريض</label>
            <textarea 
              value={noteForm.content}
              onChange={e => setNoteForm(p => ({...p, content: e.target.value}))}
              className="w-full px-4 py-3 rounded-xl border bg-slate-50 border-slate-200 outline-none focus:border-rose-400 transition-colors h-28 resize-none text-sm"
              placeholder="اكتب ما تم ملاحظته على المريض أو الإجراءات التي تمت..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen('')} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors">
              إلغاء
            </button>
            <button type="submit" disabled={saveNoteMutation.isPending} className="flex-1 py-3 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition-colors flex items-center justify-center gap-2">
              {saveNoteMutation.isPending ? 'جاري الحفظ...' : (
                <><CheckCircle className="w-5 h-5" /> حفظ الملاحظة</>
              )}
            </button>
          </div>
        </form>
      </Modal>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
