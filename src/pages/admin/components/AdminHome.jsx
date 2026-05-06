import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Stethoscope, Building2, Calendar, Bed, Activity,
  DollarSign, Pill, Clock, CheckCircle, AlertTriangle, TrendingUp
} from 'lucide-react';
import StatCard from '../../../components/hospital/StatCard';
import api from '../../../lib/api';

export default function AdminHome() {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const user = (() => { try { return JSON.parse(sessionStorage.getItem('hospitalUser') || '{}'); } catch { return {}; } })();

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).catch(console.error);
    api.get('/admin/activity').then(r => setActivity(r.data)).catch(console.error);
  }, []);

  return (
    <div className="p-6 space-y-8 fade-in">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
        <div className="absolute top-0 left-0 w-48 h-48 rounded-full blur-3xl opacity-20 -translate-x-1/4 -translate-y-1/4" style={{ background: 'white' }} />
        <div className="relative">
          <p className="text-purple-100 text-sm mb-1">لوحة الإدارة التشغيلية</p>
          <h2 className="text-white text-3xl font-black mb-2">{user.name || 'المسؤول'}</h2>
          <p className="text-purple-100">
            {stats ? `${stats.users} مستخدم مسجل — ${stats.appointments.total} موعد إجمالي` : 'جاري تحميل الإحصائيات...'}
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            {stats && [
              { label: 'مواعيد انتظار', count: stats.appointments.pending, color: 'rgba(245,158,11,0.3)' },
              { label: 'مواعيد مكتملة', count: stats.appointments.completed, color: 'rgba(16,185,129,0.3)' },
              { label: 'روشتات معلقة', count: stats.pendingPrescriptions, color: 'rgba(239,68,68,0.3)' },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white" style={{ background: s.color }}>
                <span className="text-lg font-black">{s.count}</span><span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'إجمالي المرضى', value: stats?.patients?.toString() || '...', icon: Users, gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
          { title: 'عدد الأطباء', value: stats?.doctors?.toString() || '...', icon: Stethoscope, gradient: 'linear-gradient(135deg, #14b8a6, #0d9488)' },
          { title: 'الإيرادات الكلية', value: stats ? `${stats.revenue.toLocaleString()} ج.م` : '...', icon: DollarSign, gradient: 'linear-gradient(135deg, #10b981, #059669)' },
          { title: 'أدوية منخفضة', value: stats?.medicines?.lowStock?.toString() || '...', icon: Pill, gradient: 'linear-gradient(135deg, #ef4444, #dc2626)' },
        ].map((s, i) => <StatCard key={i} {...s} index={i} />)}
      </div>

      {/* Quick Links + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Links */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 text-lg">الإدارة السريعة</h3>
          {[
            { to: '/admin/doctors', icon: Stethoscope, label: 'إدارة الأطباء', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
            { to: '/admin/patients', icon: Users, label: 'إدارة المرضى', color: '#2563eb', bg: 'rgba(37,99,235,0.1)' },
            { to: '/admin/departments', icon: Building2, label: 'إدارة الأقسام', color: '#14b8a6', bg: 'rgba(20,184,166,0.1)' },
            { to: '/admin/appointments', icon: Calendar, label: 'إدارة المواعيد', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
            { to: '/admin/beds', icon: Bed, label: 'إدارة الأسرة', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
          ].map((item, i) => (
            <Link key={i} to={item.to}
              className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: item.bg }}>
                <item.icon className="w-5 h-5" style={{ color: item.color }} />
              </div>
              <span className="font-semibold text-slate-800">{item.label}</span>
              <span className="mr-auto text-slate-300">←</span>
            </Link>
          ))}
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="p-5 border-b border-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-500" />
            <h3 className="font-bold text-slate-900">آخر النشاطات (Live)</h3>
          </div>
          <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
            {activity.length === 0 ? (
              <p className="text-center text-slate-400 py-8">لا توجد نشاطات حديثة</p>
            ) : activity.map((a, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: a.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{a.action}</p>
                  <p className="text-xs text-slate-400 truncate">{a.detail}</p>
                </div>
                <span className="text-xs text-slate-400 flex-shrink-0">
                  {new Date(a.time).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}