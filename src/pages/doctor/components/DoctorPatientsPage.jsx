import { useState, useEffect } from 'react';
import { Search, Filter, Eye, ChevronLeft, ChevronRight, User, Calendar, Activity, Pill, FlaskConical } from 'lucide-react';
import api from '../../../lib/api';
import Modal from '../../../components/hospital/Modal';

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  const [viewPatient, setViewPatient] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      // The backend enforces doctor ownership
      const res = await api.get(`/patients?page=${page}&limit=10&search=${search}`);
      setPatients(res.data.data);
      setTotalPages(Math.ceil(res.data.total / res.data.limit));
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [page, search]);

  const loadPatientDetails = async (pId) => {
    try {
      const [medRes, labRes] = await Promise.all([
        api.get(`/medical-records/patient/${pId}`),
        api.get(`/labs/orders?patientId=${pId}`)
      ]);
      setPatientDetails({
        records: medRes.data,
        labs: labRes.data
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleView = (p) => {
    setViewPatient(p);
    setPatientDetails(null);
    loadPatientDetails(p.id);
  };

  return (
    <div className="p-6 fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 mb-1">مرضاي</h2>
          <p className="text-slate-500 text-sm">عرض ومتابعة سجلات جميع مرضاك ({total} مريض)</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="ابحث بالاسم أو الهاتف..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-4 pr-10 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-500 font-cairo"
            />
          </div>
          <button className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 flex items-center justify-center">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">جاري التحميل...</div>
        ) : patients.length === 0 ? (
          <div className="p-8 text-center text-slate-400">لا يوجد مرضى مطابقين للبحث</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold">
                <tr>
                  <th className="p-4">المريض</th>
                  <th className="p-4">رقم الهاتف</th>
                  <th className="p-4">الرقم القومي</th>
                  <th className="p-4">فصيلة الدم</th>
                  <th className="p-4">تاريخ الإضافة</th>
                  <th className="p-4 text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {patients.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                          {p.user?.name?.charAt(0) || <User className="w-4 h-4"/>}
                        </div>
                        <span className="font-bold text-slate-800">{p.user?.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">{p.user?.phone || '—'}</td>
                    <td className="p-4 text-slate-600">{p.nationalId || '—'}</td>
                    <td className="p-4 text-slate-600 font-medium">
                      <span className="px-2 py-1 bg-red-50 text-red-600 rounded-md text-xs">{p.bloodType || 'غير محدد'}</span>
                    </td>
                    <td className="p-4 text-slate-500">{new Date(p.createdAt).toLocaleDateString('ar-EG')}</td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleView(p)}
                        className="px-3 py-1.5 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors text-xs font-semibold inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> عرض الملف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-sm text-slate-500">صفحة {page} من {totalPages}</span>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-white disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-white disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal open={!!viewPatient} onClose={() => setViewPatient(null)} title="الملف الطبي الشامل" size="lg">
        {viewPatient && (
          <div className="p-6" dir="rtl">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-black">
                {viewPatient.user?.name?.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">{viewPatient.user?.name}</h3>
                <p className="text-slate-500 text-sm mt-1">
                  {viewPatient.user?.phone} • {viewPatient.nationalId} • {viewPatient.bloodType}
                </p>
              </div>
            </div>

            {!patientDetails ? (
              <div className="py-8 text-center text-slate-400">جاري تحميل السجلات...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* التشخيصات والزيارات */}
                <div>
                  <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-teal-500" />
                    الزيارات والتشخيصات
                  </h4>
                  {patientDetails.records.length === 0 ? (
                    <p className="text-sm text-slate-400 bg-slate-50 p-4 rounded-xl text-center border border-slate-100">لا توجد سجلات طبية سابقة</p>
                  ) : (
                    <div className="space-y-3">
                      {patientDetails.records.map(r => (
                        <div key={r.id} className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-sm text-slate-800">{r.diagnosis}</span>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {new Date(r.appointment?.date || r.createdAt).toLocaleDateString('ar-EG')}
                            </span>
                          </div>
                          {r.notes && <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded-lg mt-2">{r.notes}</p>}
                          {r.prescriptions?.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-100">
                              <p className="text-xs font-semibold text-slate-500 flex items-center gap-1 mb-1">
                                <Pill className="w-3 h-3 text-blue-500" /> الروشتة
                              </p>
                              {r.prescriptions.map((px, i) => (
                                <p key={i} className="text-xs text-slate-700">• {px.name} ({px.dosage} - {px.frequency})</p>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* التحاليل والأشعة */}
                <div>
                  <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-purple-500" />
                    التحاليل والأشعة
                  </h4>
                  {patientDetails.labs.length === 0 ? (
                    <p className="text-sm text-slate-400 bg-slate-50 p-4 rounded-xl text-center border border-slate-100">لا توجد طلبات معملية</p>
                  ) : (
                    <div className="space-y-3">
                      {patientDetails.labs.map(l => (
                        <div key={l.id} className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-sm text-slate-800">{l.test?.name}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              l.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                              {l.status === 'COMPLETED' ? 'مكتمل' : 'قيد الانتظار'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mb-2">بواسطة: {l.doctor?.user?.name}</p>
                          {l.result && (
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                              <p className="text-xs font-semibold text-slate-700 mb-1">النتيجة:</p>
                              <p className="text-sm text-slate-600 line-clamp-3">{l.result}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="mt-6 pt-6 border-t border-slate-100 text-left">
              <button onClick={() => setViewPatient(null)} className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors">
                إغلاق
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
