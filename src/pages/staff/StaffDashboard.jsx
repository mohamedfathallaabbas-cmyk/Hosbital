import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, CheckCircle, HeartPulse, LogOut, UserRound, Briefcase, Clock3, Wallet, MapPin, Phone } from 'lucide-react';
import api from '@/lib/api';
import Topbar from '@/components/hospital/Topbar';

const Field = ({ icon: Icon, label, value }) => (
  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
    <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </div>
    <div className="font-bold text-slate-800 dark:text-white">{value || 'غير مسجل'}</div>
  </div>
);

export default function StaffDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/staff/me')
      .then((res) => setProfile(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const markAttendance = async (action) => {
    setMessage('');
    try {
      await api.post('/staff/me/attendance', { action });
      const res = await api.get('/staff/me');
      setProfile(res.data);
      setMessage(action === 'checkout' ? 'تم تسجيل الانصراف' : 'تم تسجيل الحضور');
    } catch (err) {
      setMessage(err.response?.data?.error || 'تعذر تسجيل الحضور والانصراف');
    }
  };

  const logout = () => {
    sessionStorage.removeItem('hospitalUser');
    navigate('/role-select');
  };

  const payroll = profile?.payroll || {};
  const leave = profile?.leave || {};
  const attendance = profile?.attendance || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-cairo" dir="rtl">
      <Topbar title="صفحة الموظف" roleColor="#475569" />
      <main className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #475569, #0f172a)' }}>
              <HeartPulse className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">{profile?.user?.name || 'بيانات الموظف'}</h1>
              <p className="text-slate-500 text-sm">بياناتك تظهر للإدارة المالية والإدارة التشغيلية حسب الصلاحيات.</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100">
            <LogOut className="w-4 h-4" />
            خروج
          </button>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-400">جاري تحميل بيانات الموظف...</div>
        ) : !profile ? (
          <div className="p-8 bg-white rounded-2xl border text-center text-slate-500">لم يتم العثور على ملف موظف لهذا الحساب.</div>
        ) : (
          <div className="space-y-6">
            {message && <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-sm">{message}</div>}
            <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field icon={UserRound} label="المسمى الوظيفي" value={profile.jobTitle} />
                <Field icon={Briefcase} label="الفئة" value={profile.category} />
                <Field icon={Clock3} label="الوردية" value={profile.shift} />
                <Field icon={Phone} label="الهاتف" value={profile.user?.phone} />
                <Field icon={MapPin} label="العنوان" value={profile.address} />
                <Field icon={Briefcase} label="القسم" value={profile.department} />
              </div>
            </section>

            <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <h2 className="font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-600" />
                البيانات المالية
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field icon={Wallet} label="المرتب الأساسي" value={`${Number(payroll.salary || 0).toLocaleString()} ج.م`} />
                <Field icon={Wallet} label="البدلات" value={`${Number(payroll.allowances || 0).toLocaleString()} ج.م`} />
                <Field icon={Wallet} label="الخصومات" value={`${Number(payroll.deductions || 0).toLocaleString()} ج.م`} />
                <Field icon={Wallet} label="الصافي" value={`${Number(payroll.netSalary || 0).toLocaleString()} ج.م`} />
                <Field icon={CheckCircle} label="حالة نزول المرتب" value={payroll.isPaid ? 'تم الصرف' : 'لم يتم الصرف بعد'} />
                <Field icon={CalendarDays} label="آخر صرف" value={payroll.lastPaymentDate ? new Date(payroll.lastPaymentDate).toLocaleDateString('ar-EG') : 'غير مسجل'} />
              </div>
            </section>

            <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock3 className="w-5 h-5 text-blue-600" />
                  الحضور والانصراف والإجازات
                </h2>
                <div className="flex gap-2">
                  <button onClick={() => markAttendance('checkin')} className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-sm">تسجيل حضور</button>
                  <button onClick={() => markAttendance('checkout')} className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold text-sm">تسجيل انصراف</button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                <Field icon={CalendarDays} label="رصيد الإجازات" value={`${leave.balance || 0} يوم`} />
                <Field icon={CalendarDays} label="إجازات مستخدمة" value={`${leave.used || 0} يوم`} />
                <Field icon={CalendarDays} label="إجازات متبقية" value={`${leave.remaining || 0} يوم`} />
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
                <table className="hospital-table">
                  <thead><tr><th>التاريخ</th><th>الحضور</th><th>الانصراف</th><th>الحالة</th><th>ملاحظات</th></tr></thead>
                  <tbody>
                    {attendance.length === 0 ? (
                      <tr><td colSpan="5" className="text-center py-6 text-slate-400">لا توجد سجلات حضور بعد</td></tr>
                    ) : attendance.slice(0, 10).map((item) => (
                      <tr key={item.id}>
                        <td>{new Date(item.date).toLocaleDateString('ar-EG')}</td>
                        <td>{item.checkIn ? new Date(item.checkIn).toLocaleTimeString('ar-EG') : '-'}</td>
                        <td>{item.checkOut ? new Date(item.checkOut).toLocaleTimeString('ar-EG') : '-'}</td>
                        <td><span className={item.status === 'PRESENT' ? 'badge-success' : item.status === 'LEAVE' ? 'badge-info' : 'badge-warning'}>{item.status}</span></td>
                        <td>{item.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
