import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../lib/api';
import {
  LayoutDashboard, ClipboardList, Activity, Send,
  Upload, Calendar, LogOut, HeartPulse, CheckCircle, XCircle,
  Clock, Search, Menu, X, UserPlus, Eye, Stethoscope, Edit, Users, Receipt, Printer
} from 'lucide-react';
import PrintTemplate from '../../components/hospital/PrintTemplate';
import Topbar from '../../components/hospital/Topbar';
import StatCard from '../../components/hospital/StatCard';
import Modal from '../../components/hospital/Modal';
import { ToastContainer } from '../../components/hospital/Toast';
import { useToast } from '../../hooks/useToast';
import { BOOKINGS, EGYPTIAN_DOCTORS, DEPARTMENTS } from '../../lib/egyptianData';
import ReceptionQueue from './ReceptionQueue';

const sidebarLinks = [
  { icon: LayoutDashboard, label: 'لوحة التحكم', path: '/reception/dashboard' },
  { icon: ClipboardList, label: 'الحجوزات', path: '/reception/bookings' },
  { icon: Users, label: 'قائمة الانتظار', path: '/reception/queue' },
  { icon: UserPlus, label: 'مريض مباشر', path: '/reception/walkin' },
  { icon: Activity, label: 'العلامات الحيوية', path: '/reception/vitals' },
];

function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings'); // bookings, queue, billing
  const [printInv, setPrintInv] = useState(null);
  const [search, setSearch] = useState('');
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const [aptRes, invRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/finance/invoices')
      ]);
      const formatted = aptRes.data.map(apt => ({
        id: apt.id,
        patientId: apt.patientId,
        patient: apt.patient?.user?.name || 'مجهول',
        phone: apt.patient?.user?.phone || 'غير مسجل',
        doctor: apt.doctor?.user?.name || 'غير محدد',
        dept: apt.doctor?.department?.name || 'عام',
        date: new Date(apt.date).toISOString().split('T')[0],
        time: apt.timeSlot || '00:00',
        type: apt.type,
        status: apt.status === 'SCHEDULED' ? 'pending' : apt.status === 'CANCELLED' ? 'rejected' : 'approved'
      }));
      setBookings(formatted);
      setInvoices(invRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  const [viewB, setViewB] = useState(null);
  const [rejectB, setRejectB] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  
  // Reassign State
  const [reassignB, setReassignB] = useState(null);
  const [rDept, setRDept] = useState('');
  const [rDoc, setRDoc] = useState('');

  // Approve State
  const [approveB, setApproveB] = useState(null);
  const [aPriority, setAPriority] = useState('عادية');
  const [aPayment, setAPayment] = useState('نقدي');

  const { toasts, addToast, removeToast } = useToast();

  const filtered = bookings.filter(b => b.patient.includes(search) || b.doctor.includes(search) || search === '');

  const handleApproveConfirm = async () => {
    try {
      await api.patch(`/appointments/${approveB.id}/status`, { status: 'WAITING' });
      
      if (approveB.patientId) {
        await api.post('/finance/invoices', {
          patientId: approveB.patientId,
          items: [{ description: `رسوم ${approveB.type || 'كشف'}`, amount: 350 }],
          status: aPayment === 'نقدي' ? 'PAID' : 'UNPAID'
        });
      }

      setBookings(prev => prev.map(b => b.id === approveB.id ? { ...b, status: 'approved', priority: aPriority, payment: aPayment } : b));
      addToast(`تم تأكيد الحجز وإصدار الفاتورة بنجاح ✓`, 'success');
      setApproveB(null);
      setViewB(null);
    } catch (err) {
      addToast('فشل في تأكيد الحجز أو إصدار الفاتورة بالسيرفر', 'error');
    }
  };

  const handleReassignConfirm = () => {
    if (!rDept || !rDoc) return addToast('يرجى اختيار القسم والطبيب', 'error');
    setBookings(prev => prev.map(b => b.id === reassignB.id ? { ...b, dept: rDept, doctor: rDoc } : b));
    addToast(`تم تحويل المريض ${reassignB.patient} إلى د. ${rDoc} ✓`, 'success');
    setReassignB(null);
    setViewB(null);
  };

  const reject = async (id) => {
    if (!rejectReason.trim()) return addToast('يرجى كتابة سبب الرفض', 'error');
    try {
      await api.patch(`/appointments/${id}/reject`, { rejectionReason: rejectReason.trim() });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'rejected', rejectionReason: rejectReason.trim() } : b));
      setRejectReason('');
      setRejectB(null);
      addToast('تم رفض الحجز مع حفظ سبب الرفض', 'error');
    } catch (err) {
      addToast(err.response?.data?.error || 'فشل رفض الحجز', 'error');
    }
  };
  const sendToDoctor = async (b) => {
    try {
      await api.patch(`/appointments/${b.id}/status`, { status: 'IN_PROGRESS' });
      addToast(`تم إرسال ${b.patient} إلى قائمة د. ${b.doctor} ✓`, 'success');
      fetchData(); // Refresh list
    } catch (err) {
      addToast('فشل في إرسال المريض للطبيب', 'error');
    }
  };

  const handlePayInvoice = async (invId) => {
    try {
      await api.patch(`/finance/invoices/${invId}/status`, { status: 'PAID' });
      addToast('تم تحصيل الفاتورة وتحديث السجلات المالية ✓', 'success');
      fetchData();
    } catch (err) {
      addToast('فشل في عملية التحصيل', 'error');
    }
  };

  return (
    <div className="p-6 fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div className="section-header mb-0">
          <div className="section-header-line" style={{ background: 'linear-gradient(180deg, #f59e0b, #d97706)' }} />
          <h3 className="text-xl font-bold">إدارة الحجوزات</h3>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white">
          <Search className="w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="text-sm outline-none font-cairo w-40" placeholder="بحث عن مريض أو طبيب..." />
        </div>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-2xl w-fit mb-6">
        <button onClick={() => setActiveTab('bookings')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'bookings' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>طلبات الحجز</button>
        <button onClick={() => setActiveTab('queue')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'queue' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>قائمة الانتظار</button>
        <button onClick={() => setActiveTab('billing')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'billing' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>الفواتير والتحصيل</button>
      </div>

      {activeTab === 'bookings' && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'انتظار', count: bookings.filter(b => b.status === 'pending').length, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
              { label: 'مقبولة', count: bookings.filter(b => b.status === 'approved').length, color: '#14b8a6', bg: 'rgba(20,184,166,0.1)' },
              { label: 'مرفوضة', count: bookings.filter(b => b.status === 'rejected').length, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 text-center shadow-sm border border-slate-100">
                <div className="text-3xl font-black" style={{ color: s.color }}>{s.count}</div>
                <div className="text-slate-500 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
            <table className="hospital-table">
              <thead>
                <tr><th>رقم الحجز</th><th>المريض</th><th>الطبيب</th><th>القسم</th><th>التاريخ</th><th>النوع</th><th>الحالة</th><th>إجراءات</th></tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.id}>
                    <td className="text-slate-400 text-xs font-mono">{b.id}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>{b.patient.charAt(0)}</div>
                        <div>
                          <p className="font-medium text-slate-800 text-sm">{b.patient}</p>
                          <p className="text-slate-400 text-xs">{b.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-slate-600 text-sm">{b.doctor}</td>
                    <td><span className="badge-info">{b.dept}</span></td>
                    <td className="text-slate-500 text-sm">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{b.date}</span>
                      <span className="flex items-center gap-1 text-xs text-slate-400 mt-0.5"><Clock className="w-3 h-3" />{b.time}</span>
                    </td>
                    <td className="text-slate-600 text-sm">{b.type}</td>
                    <td>
                      <span className={b.status === 'approved' ? 'badge-success' : b.status === 'rejected' ? 'badge-danger' : 'badge-warning'}>
                        {b.status === 'approved' ? 'مقبول' : b.status === 'rejected' ? 'مرفوض' : 'انتظار'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button onClick={() => setViewB(b)} className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="عرض"><Eye className="w-5 h-5" /></button>
                        {b.status === 'pending' && (
                          <>
                            <button onClick={() => { setRDept(b.dept); setRDoc(b.doctor); setReassignB(b); }} className="p-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors" title="تحويل القسم"><Edit className="w-5 h-5" /></button>
                            <button onClick={() => setApproveB(b)} className="p-2 rounded-xl bg-green-100 text-green-600 hover:bg-green-200 transition-colors" title="قبول"><CheckCircle className="w-5 h-5" /></button>
                            <button onClick={() => setRejectB(b)} className="p-2 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-colors" title="رفض"><XCircle className="w-5 h-5" /></button>
                          </>
                        )}
                        {b.status === 'approved' && (
                          <button onClick={() => sendToDoctor(b)} className="p-2 rounded-xl bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors" title="إرسال للطبيب"><Send className="w-5 h-5" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'queue' && (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
          <table className="hospital-table">
            <thead>
              <tr><th>المريض</th><th>الطبيب</th><th>القسم</th><th>الحالة في الطابور</th><th>إجراء</th></tr>
            </thead>
            <tbody>
              {bookings.filter(b => b.status === 'approved').map(b => (
                <tr key={b.id}>
                  <td>{b.patient}</td>
                  <td>{b.doctor}</td>
                  <td><span className="badge-info">{b.dept}</span></td>
                  <td><span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> في انتظار الطبيب</span></td>
                  <td>
                    <button onClick={() => sendToDoctor(b)} className="px-3 py-1.5 rounded-lg bg-teal-50 text-teal-600 font-bold text-xs">إرسال للطبيب</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {invoices.length === 0 ? (
              <div className="col-span-full py-10 text-center text-slate-400">لا توجد فواتير معلقة</div>
            ) : invoices.map(inv => (
              <div key={inv.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-slate-800">{inv.patient?.user?.name}</h4>
                    <p className="text-xs text-slate-400">فاتورة رقم #{inv.id}</p>
                  </div>
                  <span className="text-lg font-black text-blue-600">{inv.totalAmount} ج.م</span>
                </div>
                <div className="space-y-2 mb-4">
                  {inv.items?.map((item, i) => (
                    <div key={i} className="flex justify-between text-xs text-slate-500">
                      <span>{item.description}</span>
                      <span>{item.amount} ج.م</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handlePayInvoice(inv.id)} className="flex-1 py-2.5 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 transition-all">تحصيل المبلغ</button>
                  <button onClick={() => setPrintInv(inv)} className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all"><Printer className="w-5 h-5" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal open={!!viewB} onClose={() => setViewB(null)} title="تفاصيل الحجز" size="sm">
        {viewB && (
          <div className="p-6 space-y-3">
            {[
              { l: 'رقم الحجز', v: viewB.id },
              { l: 'المريض', v: viewB.patient },
              { l: 'رقم الهاتف', v: viewB.phone },
              { l: 'الطبيب', v: viewB.doctor },
              { l: 'القسم', v: viewB.dept },
              { l: 'التاريخ', v: viewB.date },
              { l: 'الوقت', v: viewB.time },
              { l: 'نوع الزيارة', v: viewB.type },
            ].map((f, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-slate-50">
                <span className="text-slate-500 text-sm">{f.l}</span>
                <span className="font-semibold text-slate-800 text-sm">{f.v}</span>
              </div>
            ))}
            {viewB.status === 'pending' && (
              <div className="flex gap-2 pt-2">
                <button onClick={() => { setApproveB(viewB); setViewB(null); }} className="flex-1 py-3 rounded-xl text-white font-bold font-cairo" style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}>تأكيد الوصول</button>
                <button onClick={() => { setRDept(viewB.dept); setRDoc(viewB.doctor); setReassignB(viewB); setViewB(null); }} className="flex-1 py-3 rounded-xl text-white font-bold font-cairo" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>تحويل القسم</button>
                <button onClick={() => { setViewB(null); setRejectB(viewB); }} className="flex-1 py-3 rounded-xl text-white font-bold font-cairo" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>رفض الحجز</button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Approve / Triage + Billing Modal */}
      <Modal open={!!approveB} onClose={() => setApproveB(null)} title="تأكيد الوصول — الأولوية والفاتورة" size="sm">
        {approveB && (
          <div className="p-6 space-y-4">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
              <p className="font-semibold text-slate-800 text-sm">{approveB.patient}</p>
              <p className="text-slate-500 text-xs">{approveB.dept} · {approveB.doctor}</p>
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 text-sm font-semibold mb-1">أولوية الحالة (Triage)</label>
              <select value={aPriority} onChange={e => setAPriority(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 dark:bg-slate-800 outline-none font-cairo">
                <option value="عادية">عادية (Normal)</option>
                <option value="عاجلة">عاجلة (Urgent)</option>
                <option value="حرجة">حرجة (Emergency)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 text-sm font-semibold mb-1">حالة الدفع / التأمين</label>
              <select value={aPayment} onChange={e => setAPayment(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 dark:bg-slate-800 outline-none font-cairo">
                <option value="نقدي">دفع نقدي (Cash)</option>
                <option value="موافقة تأمين">موافقة تأمين (Insurance)</option>
                <option value="آجل">دفع آجل (Pending)</option>
              </select>
            </div>
            {/* Billing section */}
            <div className="border-t border-slate-100 pt-4">
              <p className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><Receipt className="w-4 h-4 text-amber-500" />تفاصيل الفاتورة</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 text-xs font-semibold mb-1">رسوم الكشف (ج.م)</label>
                  <input type="number" defaultValue="350" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:border-amber-400 font-cairo" />
                </div>
                <div>
                  <label className="block text-slate-500 text-xs font-semibold mb-1">خصم (%)</label>
                  <input type="number" defaultValue="0" min="0" max="100" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:border-amber-400 font-cairo" />
                </div>
              </div>
            </div>
            <button onClick={handleApproveConfirm} className="w-full mt-2 py-3 rounded-xl text-white font-bold font-cairo flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}>
              <Receipt className="w-4 h-4" />تأكيد الحجز وإصدار الفاتورة
            </button>
          </div>
        )}
      </Modal>

      {/* Reassign Modal */}
      <Modal open={!!reassignB} onClose={() => setReassignB(null)} title="تحويل المريض لقسم آخر" size="sm">
        {reassignB && (
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 text-sm font-semibold mb-1">القسم الجديد</label>
              <select value={rDept} onChange={e => setRDept(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 dark:bg-slate-800 outline-none font-cairo">
                {DEPARTMENTS.map(d => <option key={d.id} value={d.name.split(' ')[1]}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 text-sm font-semibold mb-1">الطبيب المعالج</label>
              <select value={rDoc} onChange={e => setRDoc(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 dark:bg-slate-800 outline-none font-cairo">
                <option value="">اختر الطبيب</option>
                {EGYPTIAN_DOCTORS.map(d => <option key={d.id} value={d.name}>{d.name} ({d.specialty})</option>)}
              </select>
            </div>
            <button onClick={handleReassignConfirm} className="w-full mt-4 py-3 rounded-xl text-white font-bold font-cairo" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>حفظ التعديل</button>
          </div>
        )}
      </Modal>

      <Modal open={!!rejectB} onClose={() => { setRejectB(null); setRejectReason(''); }} title="رفض الحجز" size="sm">
        {rejectB && (
          <div className="p-6 space-y-4">
            <div className="p-3 rounded-xl bg-red-50 border border-red-100">
              <p className="font-bold text-slate-800 text-sm">{rejectB.patient}</p>
              <p className="text-slate-500 text-xs">{rejectB.dept} - {rejectB.doctor}</p>
            </div>
            <div>
              <label className="block text-slate-600 text-sm font-semibold mb-2">سبب الرفض *</label>
              <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 h-28 resize-none font-cairo outline-none focus:border-red-400" placeholder="اكتب سبب رفض المريض أو الحجز..." />
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setRejectB(null); setRejectReason(''); }} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold font-cairo">إلغاء</button>
              <button onClick={() => reject(rejectB.id)} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold font-cairo">تأكيد الرفض</button>
            </div>
          </div>
        )}
      </Modal>
      
      {printInv && (
        <PrintTemplate 
          type="invoice" 
          data={{
            id: printInv.id,
            patientName: printInv.patient?.user?.name,
            items: printInv.items,
            totalAmount: printInv.totalAmount
          }} 
          onClose={() => setPrintInv(null)} 
        />
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

function VitalsPage() {
  const [saved, setSaved] = useState([
    { patient: 'محمد أحمد السيد', bp: '125/82', hr: '78', temp: '37.2', spo2: '97%', chronic: 'ضغط دم', allergies: 'لا يوجد', time: '9:15 ص' },
    { patient: 'نورا عبدالله الرشيدي', bp: '110/70', hr: '65', temp: '36.8', spo2: '99%', chronic: 'لا يوجد', allergies: 'بنسيلين', time: '9:45 ص' },
  ]);
  const [form, setForm] = useState({ patient: '', bp: '', hr: '', temp: '', spo2: '', chronic: '', allergies: '', notes: '' });
  const { toasts, addToast, removeToast } = useToast();
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.patient) return;
    setSaved(prev => [...prev, { ...form, time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) }]);
    setForm({ patient: '', bp: '', hr: '', temp: '', spo2: '', chronic: '', allergies: '', notes: '' });
    addToast(`تم حفظ التقييم الطبي لـ ${form.patient} ✓`, 'success');
  };

  return (
    <div className="p-6 fade-in">
      <div className="section-header"><div className="section-header-line" style={{ background: 'linear-gradient(180deg, #f59e0b, #d97706)' }} /><h3 className="text-xl font-bold">العلامات الحيوية والتاريخ المرضي</h3></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h4 className="font-bold text-slate-900 mb-5">إدخال جديد</h4>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-slate-600 text-sm font-semibold mb-1">اسم المريض</label>
              <input required value={form.patient} onChange={e => set('patient', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:border-amber-400 outline-none font-cairo" placeholder="اسم المريض" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { k: 'bp', l: 'ضغط الدم', u: 'mmHg', ph: '120/80' },
                { k: 'hr', l: 'ضربات القلب', u: 'bpm', ph: '72' },
                { k: 'temp', l: 'درجة الحرارة', u: '°C', ph: '37.0' },
                { k: 'spo2', l: 'نسبة الأكسجين', u: '%', ph: '98' },
              ].map(f => (
                <div key={f.k}>
                  <label className="block text-slate-600 text-xs font-semibold mb-1">{f.l} <span className="text-slate-400">({f.u})</span></label>
                  <input value={form[f.k]} onChange={e => set(f.k, e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:border-amber-400 outline-none font-cairo" placeholder={f.ph} />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="col-span-2">
                <label className="block text-slate-600 dark:text-slate-400 text-sm font-semibold mb-1">الأمراض المزمنة</label>
                <input value={form.chronic} onChange={e => set('chronic', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 dark:bg-slate-800 outline-none focus:border-amber-400 font-cairo" placeholder="مثال: سكري، ضغط..." />
              </div>
              <div className="col-span-2">
                <label className="block text-slate-600 dark:text-slate-400 text-sm font-semibold mb-1">الحساسية والأدوية الحالية</label>
                <input value={form.allergies} onChange={e => set('allergies', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 dark:bg-slate-800 outline-none focus:border-amber-400 font-cairo" placeholder="مثال: حساسية بنسيلين..." />
              </div>
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 text-sm font-semibold mb-1">ملاحظات عامة</label>
              <textarea value={form.notes} onChange={e => set('notes', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 dark:bg-slate-800 h-20 resize-none font-cairo focus:border-amber-400 outline-none" />
            </div>
            <button type="submit" className="w-full py-3 rounded-xl text-white font-bold font-cairo transition-all" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>حفظ التقييم الشامل</button>
          </form>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h4 className="font-bold text-slate-900 mb-4">آخر التسجيلات ({saved.length})</h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {saved.map((r, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-slate-50">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium text-slate-800">{r.patient}</span>
                  <span className="text-slate-400 text-xs">{r.time}</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[{ l: 'BP', v: r.bp }, { l: 'HR', v: r.hr }, { l: 'Temp', v: r.temp }, { l: 'SpO₂', v: r.spo2 }].map((item, j) => (
                    <div key={j} className="text-center p-2 bg-white rounded-lg shadow-sm">
                      <div className="text-xs text-slate-400">{item.l}</div>
                      <div className="font-bold text-slate-800 text-sm">{item.v}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

function WalkInPage() {
  const { toasts, addToast, removeToast } = useToast();
  const [form, setForm] = useState({ name: '', idNum: '', phone: '', dob: '', blood: 'A+', dept: '', complaint: '' });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const [registered, setRegistered] = useState([]);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // 1. تسجيل المريض
      const patientRes = await api.post('/patients', {
        name: form.name,
        nationalId: form.idNum,
        phone: form.phone,
        bloodType: form.blood,
        gender: 'غير محدد'
      });
      
      // 2. حجز الموعد
      const aptRes = await api.post('/appointments', {
        patientId: patientRes.data.patient.id,
        departmentName: form.dept, // نرسل اسم القسم بدلاً من طبيب وهمي
        date: new Date().toISOString(),
        type: 'كشف مباشر',
        timeSlot: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      });

      const ticket = 'WK-' + aptRes.data.appointment.id;
      setRegistered(prev => [...prev, { ...form, ticket, time: aptRes.data.appointment.timeSlot }]);
      
      setForm({ name: '', idNum: '', phone: '', dob: '', blood: 'A+', dept: '', complaint: '' });
      addToast(`تم تسجيل המريض ${form.name} بنجاح ✓`, 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'حدث خطأ أثناء التسجيل', 'error');
    }
  };

  return (
    <div className="p-6 fade-in">
      <div className="section-header"><div className="section-header-line" style={{ background: 'linear-gradient(180deg, #f59e0b, #d97706)' }} /><h3 className="text-xl font-bold">تسجيل مريض مباشر (Walk-in)</h3></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-slate-600 text-sm font-semibold mb-1">الاسم الكامل</label>
                <input required value={form.name} onChange={e => set('name', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:border-amber-400 font-cairo" />
              </div>
              <div>
                <label className="block text-slate-600 text-sm font-semibold mb-1">رقم الهوية</label>
                <input value={form.idNum} onChange={e => set('idNum', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:border-amber-400 font-cairo" />
              </div>
              <div>
                <label className="block text-slate-600 text-sm font-semibold mb-1">رقم الهاتف</label>
                <input value={form.phone} onChange={e => set('phone', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:border-amber-400 font-cairo" placeholder="01xxxxxxxxx" />
              </div>
              <div>
                <label className="block text-slate-600 text-sm font-semibold mb-1">فصيلة الدم</label>
                <select value={form.blood} onChange={e => set('blood', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 font-cairo outline-none">
                  {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-slate-600 text-sm font-semibold mb-1">القسم المطلوب</label>
                <select required value={form.dept} onChange={e => set('dept', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 font-cairo outline-none">
                  <option value="">اختر القسم</option>
                  {['طوارئ', 'قلب', 'أعصاب', 'عظام', 'أطفال', 'باطنة', 'نساء وتوليد'].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-slate-600 text-sm font-semibold mb-1">الشكوى الرئيسية</label>
                <textarea required value={form.complaint} onChange={e => set('complaint', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 h-24 resize-none font-cairo outline-none focus:border-amber-400" placeholder="وصف الشكوى..." />
              </div>
            </div>
            <button type="submit" className="w-full py-3 rounded-xl text-white font-bold font-cairo" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>تسجيل وإصدار تذكرة انتظار</button>
          </form>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h4 className="font-bold text-slate-900 mb-4">قائمة الانتظار ({registered.length})</h4>
          {registered.length === 0 ? (
            <div className="text-center py-12 text-slate-300"><UserPlus className="w-12 h-12 mx-auto mb-3" /><p>لا يوجد مرضى في الانتظار</p></div>
          ) : (
            <div className="space-y-3">
              {registered.map((r, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-100">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>{r.ticket}</div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{r.name}</p>
                    <p className="text-slate-500 text-xs">{r.dept} — {r.complaint.slice(0, 30)}...</p>
                  </div>
                  <span className="text-slate-400 text-xs">{r.time}</span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

function ReceptionHome() {
  const [bookings, setBookings] = useState([]);
  
  useEffect(() => {
    api.get('/appointments')
      .then(res => setBookings(res.data))
      .catch(err => console.error(err));
  }, []);
  return (
    <div className="p-6 space-y-8 fade-in">
      <div className="relative overflow-hidden rounded-3xl p-8" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
        <div className="absolute top-0 left-0 w-48 h-48 rounded-full blur-3xl opacity-20 -translate-x-1/4 -translate-y-1/4" style={{ background: 'white' }} />
        <div className="relative">
          <p className="text-amber-100 text-sm mb-1">مرحباً،</p>
          <h2 className="text-white text-3xl font-black mb-2">نورا الخالدي</h2>
          <p className="text-amber-100">{bookings.filter(b => b.status === 'pending').length} حجوزات بانتظار المراجعة اليوم</p>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'حجوزات اليوم', value: `${bookings.length}`, icon: Calendar, gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', trend: 'up', trendValue: '+3' },
          { title: 'انتظار الموافقة', value: `${bookings.filter(b => b.status === 'pending').length}`, icon: Clock, gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)' },
          { title: 'تمت الموافقة', value: `${bookings.filter(b => b.status === 'approved').length}`, icon: CheckCircle, gradient: 'linear-gradient(135deg, #14b8a6, #0d9488)' },
          { title: 'مرضى مباشرون', value: '4', icon: UserPlus, gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
        ].map((s, i) => <StatCard key={i} {...s} index={i} />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/reception/bookings" className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all cursor-pointer">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(245,158,11,0.1)' }}><ClipboardList className="w-6 h-6 text-amber-500" /></div>
          <h3 className="font-bold text-slate-900 mb-1">إدارة الحجوزات</h3>
          <p className="text-slate-400 text-sm">قبول ورفض الحجوزات</p>
        </Link>
        <Link to="/reception/walkin" className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all cursor-pointer">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(37,99,235,0.1)' }}><UserPlus className="w-6 h-6 text-blue-600" /></div>
          <h3 className="font-bold text-slate-900 mb-1">مريض مباشر</h3>
          <p className="text-slate-400 text-sm">تسجيل مريض جديد فورياً</p>
        </Link>
        <Link to="/reception/vitals" className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all cursor-pointer">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(20,184,166,0.1)' }}><Activity className="w-6 h-6 text-teal-500" /></div>
          <h3 className="font-bold text-slate-900 mb-1">العلامات الحيوية</h3>
          <p className="text-slate-400 text-sm">تسجيل الضغط والحرارة</p>
        </Link>
      </div>
    </div>
  );
}

export default function ReceptionDashboard() {
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
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}><HeartPulse className="w-5 h-5 text-white" /></div>
          <div><div className="text-white font-bold text-sm">مستشفى الشفاء</div><div className="text-slate-400 text-xs">الاستقبال</div></div>
        </div>
        <div className="mx-4 mt-4 p-3 rounded-xl" style={{ background: 'rgba(245,158,11,0.15)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>{user.name?.charAt(0) || 'ن'}</div>
            <div><div className="text-white text-sm font-semibold truncate max-w-36">{user.name}</div><div className="text-amber-300 text-xs">موظف استقبال</div></div>
          </div>
        </div>
        <nav className="flex-1 p-3 mt-2">
          {sidebarLinks.map((item, i) => {
            const isActive = location.pathname === item.path;
            return <Link key={i} to={item.path} className={`sidebar-item ${isActive ? 'active' : ''}`} style={isActive ? { borderColor: '#f59e0b' } : {}}><item.icon className="w-5 h-5" style={{ color: isActive ? '#f59e0b' : undefined }} /><span>{item.label}</span></Link>;
          })}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout} className="sidebar-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"><LogOut className="w-5 h-5" /><span>خروج</span></button>
        </div>
      </aside>
      <button onClick={() => setMobileMenu(true)} className="fixed top-4 right-4 z-50 md:hidden w-11 h-11 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}><Menu className="w-5 h-5 text-white" /></button>
      <main className="flex-1 min-h-screen" style={{ background: 'linear-gradient(135deg, #fffbeb, #f0fdfa, #f1f5f9)', marginRight: '260px' }} id="rec-main">
        <Topbar title={currentTitle} roleColor="#f59e0b" />
        <Routes>
          <Route index element={<ReceptionHome />} />
          <Route path="dashboard" element={<ReceptionHome />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="queue" element={<ReceptionQueue />} />
          <Route path="vitals" element={<VitalsPage />} />
          <Route path="walkin" element={<WalkInPage />} />
          <Route path="*" element={<ReceptionHome />} />
        </Routes>
      </main>
      <style>{`@media (max-width: 768px) { #rec-main { margin-right: 0 !important; } }`}</style>
    </div>
  );
}
