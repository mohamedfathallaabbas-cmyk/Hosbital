import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../lib/api';
import {
  LayoutDashboard, TestTube2, FileCheck2, Clock, 
  Search, LogOut, HeartPulse, ClipboardCheck,
  User, Microscope, AlertCircle, CheckCircle2, Printer
} from 'lucide-react';
import PrintTemplate from '../../components/hospital/PrintTemplate';
import Topbar from '../../components/hospital/Topbar';
import StatCard from '../../components/hospital/StatCard';
import Modal from '../../components/hospital/Modal';
import { ToastContainer } from '../../components/hospital/Toast';
import { useToast } from '../../hooks/useToast';

function LabDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [resultText, setResultText] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [printData, setPrintData] = useState(null);
  const { toasts, addToast, removeToast } = useToast();
  const navigate = useNavigate();

  const user = (() => {
    try { return JSON.parse(sessionStorage.getItem('hospitalUser') || '{}'); } catch { return {}; }
  })();

  const fetchOrders = () => {
    setLoading(true);
    api.get('/labs/orders')
      .then(res => setOrders(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (selectedOrder) {
      setResultText(selectedOrder.result || '');
      setBloodType(selectedOrder.patient?.bloodType || '');
    } else {
      setResultText('');
      setBloodType('');
    }
  }, [selectedOrder]);

  const handleUpdateResult = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/labs/orders/${selectedOrder.id}`, { result: resultText });
      if (selectedOrder.patient?.id && bloodType) {
        await api.patch(`/patients/${selectedOrder.patient.id}`, { bloodType });
      }
      addToast('تم حفظ نتيجة التحليل وتحديث فصيلة الدم بنجاح ✓', 'success');
      setSelectedOrder(null);
      fetchOrders();
    } catch (error) {
      addToast('فشل في تحديث النتيجة', 'error');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('hospitalUser');
    sessionStorage.removeItem('staff_portal_authorized');
    navigate('/');
  };

  return (
    <div className="flex min-h-screen font-cairo" dir="rtl">
      {/* Sidebar */}
      <aside className="sidebar hidden md:flex flex-col" style={{ width: '260px' }}>
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #14b8a6, #2563eb)' }}>
            <Microscope className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-sm">مستشفى الشفاء</div>
            <div className="text-slate-400 text-xs">قسم المختبر والأشعة</div>
          </div>
        </div>

        <div className="mx-4 mt-4 p-3 rounded-xl" style={{ background: 'rgba(20,184,166,0.15)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold" style={{ background: 'linear-gradient(135deg, #14b8a6, #2563eb)' }}>
              {user.name?.charAt(0) || 'ف'}
            </div>
            <div>
              <div className="text-white text-sm font-semibold truncate max-w-36">{user.name}</div>
              <div className="text-teal-300 text-xs">فني مختبر</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 mt-2">
          <div className="sidebar-item active">
            <LayoutDashboard className="w-5 h-5" />
            <span>طلبات التحاليل</span>
          </div>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout} className="sidebar-item w-full text-red-400 hover:text-red-300">
            <LogOut className="w-5 h-5" /><span>خروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen bg-slate-50" style={{ marginRight: '260px' }}>
        <Topbar title="إدارة التحاليل والأشعة" roleColor="#14b8a6" />

        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard title="طلبات معلقة" value={orders.filter(o => o.status === 'PENDING').length.toString()} icon={Clock} gradient="linear-gradient(135deg, #f59e0b, #d97706)" />
            <StatCard title="تحاليل مكتملة" value={orders.filter(o => o.status === 'COMPLETED').length.toString()} icon={CheckCircle2} gradient="linear-gradient(135deg, #14b8a6, #0d9488)" />
            <StatCard title="إجمالي اليوم" value={orders.length.toString()} icon={ClipboardCheck} gradient="linear-gradient(135deg, #2563eb, #1d4ed8)" />
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">قائمة الفحوصات المطلوبة</h3>
              <button onClick={fetchOrders} className="text-blue-600 text-sm hover:underline">تحديث</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="hospital-table">
                <thead>
                  <tr>
                    <th>المريض</th>
                    <th>نوع الفحص</th>
                    <th>الطبيب المعالج</th>
                    <th>الحالة</th>
                    <th>التاريخ</th>
                    <th>إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="6" className="text-center py-10 animate-pulse text-slate-400">جاري التحميل...</td></tr>
                  ) : orders.length === 0 ? (
                    <tr><td colSpan="6" className="text-center py-10 text-slate-400">لا توجد طلبات حالياً</td></tr>
                  ) : orders.map(order => (
                    <tr key={order.id}>
                      <td className="font-medium">{order.patient?.user?.name}</td>
                      <td>
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold">
                          {order.test?.name || 'فحص عام'}
                        </span>
                      </td>
                      <td className="text-sm text-slate-600">{order.doctor?.user?.name}</td>
                      <td>
                        <span className={order.status === 'PENDING' ? 'badge-warning' : 'badge-success'}>
                          {order.status === 'PENDING' ? 'قيد الانتظار' : 'مكتمل'}
                        </span>
                      </td>
                      <td className="text-xs text-slate-400">{new Date(order.orderedAt).toLocaleString('ar-EG')}</td>
                      <td>
                        <div className="flex gap-2">
                          {order.status === 'PENDING' ? (
                            <button 
                              onClick={() => setSelectedOrder(order)}
                              className="btn-primary-hospital text-xs px-3 py-1.5"
                            >
                              إدخال النتيجة
                            </button>
                          ) : (
                            <>
                              <button 
                                onClick={() => { setSelectedOrder(order); setResultText(order.result); }}
                                className="btn-secondary-hospital text-xs px-3 py-1.5"
                              >
                                عرض
                              </button>
                              <button 
                                onClick={() => setPrintData(order)}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-blue-600 transition-all"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Result Modal */}
      <Modal 
        open={!!selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
        title={selectedOrder?.status === 'COMPLETED' ? "تفاصيل التحليل" : "إدخال نتيجة التحليل"}
      >
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs text-slate-400 mb-1">المريض</p>
            <p className="font-bold text-slate-800">{selectedOrder?.patient?.user?.name}</p>
            <p className="text-xs text-blue-600 mt-2 font-bold">{selectedOrder?.test?.name}</p>
          </div>

          <form onSubmit={handleUpdateResult} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">فصيلة دم المريض</label>
              <select
                disabled={selectedOrder?.status === 'COMPLETED'}
                value={bloodType}
                onChange={e => setBloodType(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 font-cairo outline-none focus:border-teal-400"
              >
                <option value="">اختر فصيلة الدم...</option>
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bt => (
                  <option key={bt} value={bt}>{bt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">النتيجة والتقرير الطبي</label>
              <textarea
                required
                disabled={selectedOrder?.status === 'COMPLETED'}
                value={resultText}
                onChange={e => setResultText(e.target.value)}
                className="w-full h-40 p-4 rounded-xl border border-slate-200 outline-none focus:border-blue-400 resize-none font-cairo text-sm"
                placeholder="اكتب تفاصيل النتيجة هنا..."
              />
            </div>

            {selectedOrder?.status === 'PENDING' && (
              <div className="flex gap-3">
                <button type="button" onClick={() => setSelectedOrder(null)} className="flex-1 py-3 rounded-xl border border-slate-200 font-bold">إلغاء</button>
                <button type="submit" className="flex-1 py-3 rounded-xl text-white font-bold" style={{ background: 'linear-gradient(135deg, #14b8a6, #2563eb)' }}>حفظ وإرسال للطبيب</button>
              </div>
            )}
          </form>
        </div>
      </Modal>

      {printData && (
        <PrintTemplate 
          type="lab" 
          data={{
            id: printData.id,
            patientName: printData.patient?.user?.name,
            testName: printData.test?.name,
            result: printData.result
          }} 
          onClose={() => setPrintData(null)} 
        />
      )}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <style>{`@media (max-width: 768px) { main { margin-right: 0 !important; } }`}</style>
    </div>
  );
}

export default LabDashboard;
