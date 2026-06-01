import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/api';
import {
  LayoutDashboard, DollarSign, TrendingUp, TrendingDown,
  FileText, CreditCard, BarChart3, PieChart, Printer,
  Download, LogOut, HeartPulse, Calendar, Building2,
  Stethoscope, Menu, X, ArrowUpRight, ArrowDownRight,
  Receipt, ShieldCheck, Clock, AlertCircle, CalendarDays,
  CheckCircle, XCircle, Loader2
} from 'lucide-react';
import Topbar from '../../components/hospital/Topbar';
import StatCard from '../../components/hospital/StatCard';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts';

const sidebarLinks = [
  { icon: LayoutDashboard, label: 'لوحة المدير',       path: '/manager/dashboard' },
  { icon: DollarSign,     label: 'تقرير الإيرادات',   path: '/manager/revenue' },
  { icon: TrendingDown,   label: 'تقرير المصروفات',   path: '/manager/expenses' },
  { icon: ShieldCheck,    label: 'تقرير التأمينات',   path: '/manager/insurance' },
  { icon: Receipt,        label: 'الفواتير المتأخرة', path: '/manager/outstanding' },
  { icon: CalendarDays,   label: 'طلبات الإجازات',    path: '/manager/leaves' },
];

const monthlyData = [
  { month: 'يناير', revenue: 420000, expenses: 280000, profit: 140000 },
  { month: 'فبراير', revenue: 380000, expenses: 260000, profit: 120000 },
  { month: 'مارس', revenue: 450000, expenses: 295000, profit: 155000 },
  { month: 'أبريل', revenue: 510000, expenses: 310000, profit: 200000 },
  { month: 'مايو', revenue: 480000, expenses: 300000, profit: 180000 },
  { month: 'يونيو', revenue: 560000, expenses: 330000, profit: 230000 },
  { month: 'يوليو', revenue: 530000, expenses: 320000, profit: 210000 },
  { month: 'أغسطس', revenue: 490000, expenses: 305000, profit: 185000 },
  { month: 'سبتمبر', revenue: 575000, expenses: 340000, profit: 235000 },
  { month: 'أكتوبر', revenue: 620000, expenses: 365000, profit: 255000 },
  { month: 'نوفمبر', revenue: 590000, expenses: 350000, profit: 240000 },
  { month: 'ديسمبر', revenue: 650000, expenses: 380000, profit: 270000 },
];

const deptRevenue = [
  { name: 'قسم القلب', revenue: 1250000, color: '#ef4444' },
  { name: 'الجراحة', revenue: 980000, color: '#2563eb' },
  { name: 'الأعصاب', revenue: 720000, color: '#8b5cf6' },
  { name: 'العظام', revenue: 650000, color: '#f59e0b' },
  { name: 'طب الأطفال', revenue: 540000, color: '#14b8a6' },
  { name: 'العيون', revenue: 320000, color: '#ec4899' },
];

const outstanding = [
  { patient: 'محمد العتيبي', amount: 12500, dueDate: '10 مارس 2025', days: 45, insurance: 'تأمين التعاونية' },
  { patient: 'نورة الشمري', amount: 8200, dueDate: '15 مارس 2025', days: 40, insurance: 'BUPA' },
  { patient: 'خالد الدوسري', amount: 22000, dueDate: '5 أبريل 2025', days: 20, insurance: 'لا يوجد' },
  { patient: 'سارة الغامدي', amount: 5600, dueDate: '18 أبريل 2025', days: 7, insurance: 'أنظمة الرعاية' },
];

const COLORS = ['#ef4444', '#2563eb', '#8b5cf6', '#f59e0b', '#14b8a6', '#ec4899'];

function ManagerHome() {
  const [period, setPeriod] = useState('yearly');
  const [liveStats, setLiveStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/finance/summary')
      .then(res => setLiveStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10 text-center animate-pulse text-slate-400">جاري تحميل التقارير المالية...</div>;

  const chartData = liveStats?.monthlyData || monthlyData;
  const deptData = liveStats?.revenueByDept || deptRevenue;
  
  const totalRev = liveStats ? liveStats.revenue : 0;
  const totalProfit = liveStats ? liveStats.profit : 0;

  return (
    <div className="p-6 space-y-8 fade-in">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl p-8"
        style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full blur-3xl opacity-20 -translate-x-1/4 -translate-y-1/4" style={{ background: 'white' }} />
        <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-10" style={{ background: 'white' }} />
        <div className="relative">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-red-100 text-sm mb-1">لوحة المدير المالي والإداري</p>
              <h2 className="text-white text-3xl font-black mb-2">خالد المنصور</h2>
              <p className="text-red-100">صلاحيات التقارير المالية الكاملة</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button onClick={() => window.print()}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-white font-semibold text-sm bg-white/20 hover:bg-white/30 transition-all no-print">
                <Printer className="w-4 h-4" />طباعة التقرير
              </button>
              <button onClick={() => window.print()}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-white font-semibold text-sm bg-white/20 hover:bg-white/30 transition-all no-print">
                <Download className="w-4 h-4" />تصدير PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: 'إجمالي الإيرادات (مباشر)', value: liveStats ? `${liveStats.revenue.toLocaleString()} ج.م` : 'جاري التحميل...', icon: DollarSign, gradient: 'linear-gradient(135deg, #14b8a6, #0d9488)', trend: 'up', trendValue: '+18%' },
          { title: 'الأرباح (صافي)', value: liveStats ? `${liveStats.profit.toLocaleString()} ج.م` : 'جاري التحميل...', icon: TrendingUp, gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)', trend: 'up', trendValue: '+12%' },
          { title: 'عدد الفواتير', value: liveStats ? liveStats.stats.invoices : '...', icon: Receipt, gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', trend: 'up', trendValue: '+234' },
          { title: 'المدفوعات المتأخرة', value: '48.3K ج.م', icon: AlertCircle, gradient: 'linear-gradient(135deg, #ef4444, #dc2626)', trend: 'down', trendValue: '-8%' },
          { title: 'المرضى المسجلين', value: liveStats ? liveStats.stats.patients : '...', icon: ShieldCheck, gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', trend: 'up', trendValue: '+5%' },
          { title: 'المواعيد والحجوزات', value: liveStats ? liveStats.stats.appointments : '...', icon: Calendar, gradient: 'linear-gradient(135deg, #14b8a6, #2563eb)', trend: 'up', trendValue: '+3.2%' },
        ].map((s, i) => <StatCard key={i} {...s} index={i} />)}
      </div>

      {/* Revenue Chart */}
      <div className="chart-container">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="section-header mb-0">
            <div className="section-header-line" style={{ background: 'linear-gradient(180deg, #ef4444, #dc2626)' }} />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">الإيرادات والأرباح</h3>
          </div>
          <div className="flex gap-2">
            {[{ v: 'q1', l: 'الربع الأول' }, { v: 'q2', l: 'الربع الثاني' }, { v: 'half', l: 'نصف سنة' }, { v: 'yearly', l: 'سنة كاملة' }].map(p => (
              <button key={p.v} onClick={() => setPeriod(p.v)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${period === p.v ? 'text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`} style={period === p.v ? { background: 'linear-gradient(135deg, #ef4444, #dc2626)' } : {}}>{p.l}</button>
            ))}
          </div>
        </div>
        <div className="flex gap-6 mb-4 text-sm dark:text-slate-300">
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500" />إيرادات: <strong className="dark:text-white">{(totalRev/1000).toFixed(0)}K ج.م</strong></span>
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-teal-500" />أرباح: <strong className="dark:text-white">{(totalProfit/1000).toFixed(0)}K ج.م</strong></span>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="profit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: 'Cairo' }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
            <Tooltip formatter={v => `${v.toLocaleString()} ج.م`} contentStyle={{ backgroundColor: '#1e293b', color: '#f8fafc', fontFamily: 'Cairo', borderRadius: '12px', border: '1px solid #334155', boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }} itemStyle={{ color: '#e2e8f0' }} />
            <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2.5} fill="url(#revenue)" name="الإيرادات" dot={{ r: 4, fill: '#2563eb' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Dept Revenue + Outstanding */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="section-header mb-4">
            <div className="section-header-line" style={{ background: 'linear-gradient(180deg, #14b8a6, #2563eb)' }} />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">الإيرادات حسب القسم</h3>
          </div>
          <div className="space-y-4">
            {deptData.map((d, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">{d.name}</span>
                  <span className="text-slate-900 dark:text-white font-bold">{d.revenue.toLocaleString()} ج.م</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(d.revenue / Math.max(...deptData.map(x => x.revenue)) * 100)}%`, backgroundColor: d.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="section-header mb-4">
            <div className="section-header-line" style={{ background: 'linear-gradient(180deg, #ef4444, #dc2626)' }} />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">المدفوعات المتأخرة</h3>
          </div>
          <div className="space-y-3">
            {outstanding.map((o, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between">
                  <span className="font-medium text-slate-800 dark:text-white text-sm">{o.patient}</span>
                  <span className="font-bold text-red-600 dark:text-red-400 text-sm">{o.amount.toLocaleString()} ج.م</span>
                </div>
                <div className="flex gap-3 mt-1">
                  <span className="text-slate-400 text-xs">{o.insurance}</span>
                  <span className={`text-xs font-medium ${o.days > 30 ? 'text-red-500' : 'text-amber-500'}`}>{o.days} يوم تأخير</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RevenuePage() {
  return (
    <div className="p-6 fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div className="section-header mb-0">
          <div className="section-header-line" style={{ background: 'linear-gradient(180deg, #ef4444, #dc2626)' }} />
          <h3 className="text-xl font-bold">تقرير الإيرادات التفصيلي</h3>
        </div>
        <div className="flex gap-3 no-print">
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium"
            style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
            <Printer className="w-4 h-4" />طباعة
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Download className="w-4 h-4" />تصدير PDF
          </button>
        </div>
      </div>

      {/* Print header - hidden on screen */}
      <div className="hidden print-header text-center mb-8">
        <h1 className="text-3xl font-black">مستشفى الشفاء</h1>
        <h2 className="text-xl font-bold mt-2">تقرير الإيرادات الشهري</h2>
        <p className="text-gray-500 mt-1">التاريخ: {new Date().toLocaleDateString('ar-SA')}</p>
      </div>

      <div className="chart-container mb-6">
        <h4 className="font-bold text-slate-900 mb-4">الإيرادات الشهرية مقارنة</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: 'Cairo' }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
            <Tooltip formatter={v => `${v.toLocaleString()} ج.م`} contentStyle={{ backgroundColor: '#1e293b', color: '#f8fafc', fontFamily: 'Cairo', borderRadius: '12px', border: '1px solid #334155' }} itemStyle={{ color: '#e2e8f0' }} />
            <Bar dataKey="revenue" fill="#14b8a6" radius={[6, 6, 0, 0]} name="الإيرادات" />
            <Bar dataKey="expenses" fill="#ef4444" radius={[6, 6, 0, 0]} name="المصروفات" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
        <table className="hospital-table">
          <thead><tr><th>الشهر</th><th>الإيرادات</th><th>المصروفات</th><th>الأرباح</th><th>هامش الربح</th></tr></thead>
          <tbody>
            {monthlyData.map((m, i) => (
              <tr key={i}>
                <td className="font-medium text-slate-800">{m.month}</td>
                <td className="text-green-600 dark:text-green-400 font-semibold">{m.revenue.toLocaleString()} ج.م</td>
                <td className="text-red-500 dark:text-red-400 font-semibold">{m.expenses.toLocaleString()} ج.م</td>
                <td className="text-blue-600 dark:text-blue-400 font-bold">{m.profit.toLocaleString()} ج.م</td>
                <td>
                  <span className="badge-success">{((m.profit / m.revenue) * 100).toFixed(1)}%</span>
                </td>
              </tr>
            ))}
            <tr className="bg-slate-50 font-black">
              <td className="font-black text-slate-900">الإجمالي</td>
              <td className="text-green-700 font-black">SAR {monthlyData.reduce((s, m) => s + m.revenue, 0).toLocaleString()}</td>
              <td className="text-red-600 font-black">SAR {monthlyData.reduce((s, m) => s + m.expenses, 0).toLocaleString()}</td>
              <td className="text-blue-700 font-black">SAR {monthlyData.reduce((s, m) => s + m.profit, 0).toLocaleString()}</td>
              <td><span className="badge-success font-black">34.5%</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-5 rounded-2xl border-t-4 no-print bg-red-50 dark:bg-red-900/10 border-red-500">
        <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
          هذا التقرير سري للغاية ومخصص للمدير المالي فقط — {new Date().toLocaleDateString('ar-SA')}
        </p>
      </div>
    </div>
  );
}

function InsurancePage() {
  const insuranceData = [
    { company: 'التعاونية للتأمين', claims: 245, approved: 218, pending: 27, amount: 458000 },
    { company: 'BUPA Arabia', claims: 180, approved: 165, pending: 15, amount: 324000 },
    { company: 'أنظمة الرعاية الصحية', claims: 156, approved: 140, pending: 16, amount: 289000 },
    { company: 'MedGulf', claims: 98, approved: 88, pending: 10, amount: 176000 },
    { company: 'AXA Cooperative', claims: 75, approved: 68, pending: 7, amount: 134000 },
  ];
  return (
    <div className="p-6 fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div className="section-header mb-0">
          <div className="section-header-line" style={{ background: 'linear-gradient(180deg, #ef4444, #dc2626)' }} />
          <h3 className="text-xl font-bold">تقرير التأمينات</h3>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium no-print"
          style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
          <Printer className="w-4 h-4" />طباعة
        </button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'إجمالي المطالبات', value: '754', color: '#2563eb' },
          { label: 'المطالبات المعتمدة', value: '679', color: '#14b8a6' },
          { label: 'قيد المراجعة', value: '75', color: '#f59e0b' },
          { label: 'إجمالي قيمة التأمين', value: '1.38M ج.م', color: '#ef4444' },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 text-center">
            <div className="text-2xl font-black mb-1" style={{ color: s.color }}>{s.value}</div>
            <div className="text-slate-500 dark:text-slate-400 text-sm">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
        <table className="hospital-table">
          <thead><tr><th>شركة التأمين</th><th>المطالبات</th><th>معتمدة</th><th>قيد المراجعة</th><th>القيمة الإجمالية</th><th>نسبة الاعتماد</th></tr></thead>
          <tbody>
            {insuranceData.map((ins, i) => (
              <tr key={i}>
                <td className="font-medium text-slate-800">{ins.company}</td>
                <td>{ins.claims}</td>
                <td><span className="badge-success">{ins.approved}</span></td>
                <td><span className="badge-warning">{ins.pending}</span></td>
                <td className="font-semibold text-green-600 dark:text-green-400">{ins.amount.toLocaleString()} ج.م</td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(ins.approved / ins.claims * 100).toFixed(0)}%`, background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }} />
                    </div>
                    <span className="text-xs font-semibold text-teal-600">{(ins.approved / ins.claims * 100).toFixed(0)}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const LEAVE_TYPE_LABELS = {
  ANNUAL:    { label: 'سنوية',        color: '#2563eb' },
  SICK:      { label: 'مرضية',        color: '#dc2626' },
  UNPAID:    { label: 'بدون راتب',    color: '#d97706' },
  MATERNITY: { label: 'أمومة',        color: '#7c3aed' },
};

const STATUS_STYLES = {
  PENDING:  { label: 'قيد المراجعة', bg: '#fffbeb', border: '#fde68a', color: '#d97706' },
  APPROVED: { label: 'مقبولة',        bg: '#f0fdf4', border: '#bbf7d0', color: '#16a34a' },
  REJECTED: { label: 'مرفوضة',        bg: '#fef2f2', border: '#fecaca', color: '#dc2626' },
};

function LeavesPage() {
  const [leaves, setLeaves]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('PENDING');
  const [processing, setProcessing] = useState(null);
  const [toast, setToast]         = useState('');

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await api.get('/staff/leaves');
      setLeaves(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLeaves(); }, []);

  const handleStatus = async (id, status) => {
    setProcessing(id);
    try {
      await api.patch(`/staff/leaves/${id}/status`, { status });
      setLeaves(prev => prev.map(l =>
        l.id === id ? { ...l, status } : l
      ));
      setToast(status === 'APPROVED' ? '✅ تم قبول الإجازة' : '❌ تم رفض الإجازة');
      setTimeout(() => setToast(''), 3000);
    } catch (e) {
      setToast('حدث خطأ، حاول مرة أخرى');
      setTimeout(() => setToast(''), 3000);
    } finally { setProcessing(null); }
  };

  const filtered = leaves.filter(l => filter === 'ALL' ? true : l.status === filter);
  const pendingCount = leaves.filter(l => l.status === 'PENDING').length;

  return (
    <div className="p-6 fade-in">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold text-sm shadow-2xl">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <div className="section-header mb-1">
            <div className="section-header-line" style={{ background: 'linear-gradient(180deg, #ef4444, #dc2626)' }} />
            <h3 className="text-xl font-bold">طلبات الإجازة</h3>
          </div>
          <p className="text-slate-400 text-sm">مراجعة وقبول أو رفض طلبات إجازة الموظفين</p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 font-bold text-sm">
            <AlertCircle className="w-4 h-4" />
            {pendingCount} طلب قيد المراجعة
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl w-fit mb-6">
        {[
          { v: 'PENDING',  l: `قيد المراجعة (${pendingCount})` },
          { v: 'APPROVED', l: 'مقبولة' },
          { v: 'REJECTED', l: 'مرفوضة' },
          { v: 'ALL',      l: `الكل (${leaves.length})` },
        ].map(f => (
          <button key={f.v} onClick={() => setFilter(f.v)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              filter === f.v ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>
            {f.l}
          </button>
        ))}
      </div>

      {/* Leave Cards */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
          جاري تحميل طلبات الإجازة...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 text-slate-300">
          <CalendarDays className="w-14 h-14 mx-auto mb-3" />
          <p className="font-medium">لا توجد طلبات إجازة في هذا التصنيف</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((lv, i) => {
            const type    = LEAVE_TYPE_LABELS[lv.leaveType] || { label: lv.leaveType, color: '#475569' };
            const status  = STATUS_STYLES[lv.status]        || STATUS_STYLES.PENDING;
            const days    = Math.ceil((new Date(lv.endDate) - new Date(lv.startDate)) / (1000*60*60*24)) + 1;
            const isPending = lv.status === 'PENDING';
            return (
              <motion.div key={lv.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`bg-white rounded-2xl p-5 border shadow-sm transition-all ${
                  isPending ? 'border-amber-200 ring-1 ring-amber-100' : 'border-slate-100'
                }`}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  {/* Employee info */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black text-white flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #475569, #1e293b)' }}>
                      {lv.employee?.user?.name?.charAt(0) || '؟'}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{lv.employee?.user?.name || 'موظف'}</div>
                      <div className="text-slate-400 text-xs">{lv.employee?.jobTitle || ''} — {lv.employee?.department || ''}</div>
                      <div className="text-slate-400 text-xs">{lv.employee?.user?.phone || ''}</div>
                    </div>
                  </div>

                  {/* Status badge */}
                  <span className="text-xs font-bold px-3 py-1.5 rounded-xl border"
                    style={{ color: status.color, background: status.bg, borderColor: status.border }}>
                    {status.label}
                  </span>
                </div>

                {/* Leave details */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <div className="text-xs text-slate-400 mb-1">نوع الإجازة</div>
                    <div className="font-bold text-sm" style={{ color: type.color }}>{type.label}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <div className="text-xs text-slate-400 mb-1">عدد الأيام</div>
                    <div className="font-bold text-slate-800">{days} يوم</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <div className="text-xs text-slate-400 mb-1">من</div>
                    <div className="font-bold text-slate-800 text-xs">{new Date(lv.startDate).toLocaleDateString('ar-EG')}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <div className="text-xs text-slate-400 mb-1">إلى</div>
                    <div className="font-bold text-slate-800 text-xs">{new Date(lv.endDate).toLocaleDateString('ar-EG')}</div>
                  </div>
                </div>

                {/* Reason */}
                {lv.reason && (
                  <div className="mt-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
                    <span className="text-xs text-blue-400 font-bold">سبب الإجازة: </span>
                    <span className="text-sm text-blue-700">{lv.reason}</span>
                  </div>
                )}

                {/* Action buttons (only for PENDING) */}
                {isPending && (
                  <div className="mt-4 flex gap-3 justify-end">
                    <button
                      onClick={() => handleStatus(lv.id, 'REJECTED')}
                      disabled={processing === lv.id}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 font-bold text-sm hover:bg-red-100 transition-colors disabled:opacity-50">
                      {processing === lv.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                      رفض
                    </button>
                    <button
                      onClick={() => handleStatus(lv.id, 'APPROVED')}
                      disabled={processing === lv.id}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)' }}>
                      {processing === lv.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      قبول
                    </button>
                  </div>
                )}

                {/* Reviewer info */}
                {lv.reviewedAt && (
                  <div className="mt-3 pt-3 border-t border-slate-50 text-xs text-slate-400 text-left">
                    تمت المراجعة في {new Date(lv.reviewedAt).toLocaleDateString('ar-EG')}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ManagerDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);
  const user = (() => { try { return JSON.parse(sessionStorage.getItem('hospitalUser') || '{}'); } catch { return {}; } })();
  const handleLogout = () => { sessionStorage.removeItem('hospitalUser'); navigate('/role-select'); };
  const currentTitle = sidebarLinks.find(l => l.path === location.pathname)?.label || 'لوحة التحكم';

  return (
    <div className="flex min-h-screen font-cairo" dir="rtl">
      {/* Sidebar */}
      <aside className="sidebar hidden md:flex flex-col no-print" style={{ width: '260px' }}>
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
            <HeartPulse className="w-5 h-5 text-white" />
          </div>
          <div><div className="text-white font-bold text-sm">مستشفى الشفاء</div><div className="text-slate-400 text-xs">المدير المالي</div></div>
        </div>
        <div className="mx-4 mt-4 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.15)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
              {user.name?.charAt(0) || 'م'}
            </div>
            <div><div className="text-white text-sm font-semibold truncate max-w-36">{user.name}</div><div className="text-red-300 text-xs">مدير مالي وإداري</div></div>
          </div>
        </div>
        <nav className="flex-1 p-3 mt-2">
          {sidebarLinks.map((item, i) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={i} to={item.path} className={`sidebar-item ${isActive ? 'active' : ''}`}
                style={isActive ? { borderColor: '#ef4444' } : {}}>
                <item.icon className="w-5 h-5" style={{ color: isActive ? '#ef4444' : undefined }} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout} className="sidebar-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
            <LogOut className="w-5 h-5" /><span>خروج</span>
          </button>
        </div>
      </aside>

      <button onClick={() => setMobileMenu(true)} className="fixed top-4 right-4 z-50 md:hidden w-11 h-11 rounded-xl flex items-center justify-center shadow-lg no-print"
        style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
        <Menu className="w-5 h-5 text-white" />
      </button>

      <main className="flex-1 min-h-screen" style={{ background: 'linear-gradient(135deg, #fff1f2, #eff6ff, #f0fdfa)', marginRight: '260px' }} id="mgr-main">
        <div className="no-print">
          <Topbar title={currentTitle} roleColor="#ef4444" />
        </div>

        {/* Print Hospital Header */}
        <div className="hidden print-header">
          <div style={{ fontFamily: 'Cairo, sans-serif', textAlign: 'center', borderBottom: '3px solid #ef4444', paddingBottom: '20px', marginBottom: '30px' }}>
            <div style={{ fontSize: '28px', fontWeight: 900 }}>مستشفى الشفاء</div>
            <div style={{ fontSize: '16px', color: '#666', marginTop: '5px' }}>تقرير مالي — سري للغاية</div>
            <div style={{ fontSize: '13px', color: '#999', marginTop: '5px' }}>التاريخ: {new Date().toLocaleDateString('ar-SA')} | المدير المالي: خالد المنصور</div>
          </div>
        </div>

        <Routes>
          <Route index element={<ManagerHome />} />
          <Route path="dashboard" element={<ManagerHome />} />
          <Route path="revenue" element={<RevenuePage />} />
          <Route path="insurance" element={<InsurancePage />} />
          <Route path="leaves" element={<LeavesPage />} />
          <Route path="expenses" element={
            <div className="p-6">
              <div className="section-header">
                <div className="section-header-line" style={{ background: 'linear-gradient(180deg, #ef4444, #dc2626)' }} />
                <h3 className="text-xl font-bold">تقرير المصروفات</h3>
              </div>
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <table className="hospital-table">
                  <thead><tr><th>الشهر</th><th>الرواتب</th><th>المستلزمات</th><th>الصيانة</th><th>الإجمالي</th></tr></thead>
                  <tbody>
                    {monthlyData.slice(0, 6).map((m, i) => (
                      <tr key={i}>
                        <td className="font-medium">{m.month}</td>
                        <td className="text-slate-600 dark:text-slate-300">{Math.round(m.expenses * 0.55).toLocaleString()} ج.م</td>
                        <td className="text-slate-600 dark:text-slate-300">{Math.round(m.expenses * 0.30).toLocaleString()} ج.م</td>
                        <td className="text-slate-600 dark:text-slate-300">{Math.round(m.expenses * 0.15).toLocaleString()} ج.م</td>
                        <td className="font-bold text-red-600 dark:text-red-400">{m.expenses.toLocaleString()} ج.م</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          } />
          <Route path="outstanding" element={
            <div className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                <div className="section-header mb-0">
                  <div className="section-header-line" style={{ background: 'linear-gradient(180deg, #ef4444, #dc2626)' }} />
                  <h3 className="text-xl font-bold">الفواتير المتأخرة</h3>
                </div>
                <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium no-print"
                  style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                  <Printer className="w-4 h-4" />طباعة
                </button>
              </div>
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <table className="hospital-table">
                  <thead><tr><th>المريض</th><th>المبلغ</th><th>تاريخ الاستحقاق</th><th>أيام التأخير</th><th>التأمين</th><th>إجراء</th></tr></thead>
                  <tbody>
                    {outstanding.map((o, i) => (
                      <tr key={i}>
                        <td className="font-medium">{o.patient}</td>
                        <td className="font-bold text-red-600 dark:text-red-400">{o.amount.toLocaleString()} ج.م</td>
                        <td className="text-slate-500">{o.dueDate}</td>
                        <td><span className={o.days > 30 ? 'badge-danger' : 'badge-warning'}>{o.days} يوم</span></td>
                        <td className="text-slate-600 text-sm">{o.insurance}</td>
                        <td>
                          <button className="btn-secondary-hospital text-xs py-1.5 px-3">إرسال تذكير</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          } />
          <Route path="*" element={<ManagerHome />} />
        </Routes>
      </main>

      <style>{`
        @media (max-width: 768px) { #mgr-main { margin-right: 0 !important; } }
        @media print {
          .no-print, .sidebar { display: none !important; }
          #mgr-main { margin-right: 0 !important; background: white !important; }
          .print-header { display: block !important; }
          body { direction: rtl; font-family: Cairo, sans-serif; }
        }
      `}</style>
    </div>
  );
}
