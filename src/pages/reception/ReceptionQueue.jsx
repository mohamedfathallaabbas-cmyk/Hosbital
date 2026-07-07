import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Clock, AlertTriangle, CheckCircle, Phone, Bell, ChevronRight, Zap, User, RefreshCw } from 'lucide-react';
import { ToastContainer } from '../../components/hospital/Toast';
import { useToast } from '../../hooks/useToast';
import api from '../../lib/api';

const PRIORITY_CONFIG = {
  حرجة: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: '#fca5a5', label: 'حرجة', icon: '🔴', order: 1 },
  عاجلة: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: '#fcd34d', label: 'عاجلة', icon: '🟡', order: 2 },
  عادية: { color: '#14b8a6', bg: 'rgba(20,184,166,0.1)', border: '#5eead4', label: 'عادية', icon: '🟢', order: 3 },
};

function ElapsedTime({ arrivalTime }) {
  const [elapsed, setElapsed] = useState('');
  useEffect(() => {
    const calc = () => {
      if (!arrivalTime) return setElapsed('—');
      const [h, m] = arrivalTime.split(':').map(Number);
      const now = new Date();
      const arrival = new Date();
      arrival.setHours(h, m, 0);
      const diff = Math.max(0, Math.floor((now - arrival) / 60000));
      setElapsed(diff < 60 ? `${diff} دقيقة` : `${Math.floor(diff / 60)}س ${diff % 60}د`);
    };
    calc();
    const timer = setInterval(calc, 30000);
    return () => clearInterval(timer);
  }, [arrivalTime]);
  return <span>{elapsed}</span>;
}

const calculateAge = (dob) => {
  if (!dob) return 30;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export default function ReceptionQueue() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const { toasts, addToast, removeToast } = useToast();

  const loadQueue = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/appointments');
      const list = response.data?.data || response.data || [];
      const todayStr = new Date().toISOString().split('T')[0];

      const mapped = list
        .filter(apt => {
          const aptDateStr = new Date(apt.date).toISOString().split('T')[0];
          const isToday = aptDateStr === todayStr;
          return (
            (apt.status === 'WAITING' || apt.status === 'IN_PROGRESS') ||
            (apt.status === 'COMPLETED' && isToday)
          );
        })
        .map(apt => {
          let timeFormatted = '09:00';
          if (apt.timeSlot) {
            const match = apt.timeSlot.match(/(\d+):(\d+)\s*(ص|م)/);
            if (match) {
              let hh = parseInt(match[1]);
              const mm = match[2];
              const period = match[3];
              if (period === 'م' && hh < 12) hh += 12;
              if (period === 'ص' && hh === 12) hh = 0;
              timeFormatted = `${hh.toString().padStart(2, '0')}:${mm}`;
            }
          } else {
            const dateObj = new Date(apt.createdAt);
            timeFormatted = `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
          }

          return {
            id: apt.id,
            name: apt.patient?.user?.name || 'مريض مجهول',
            age: calculateAge(apt.patient?.dateOfBirth),
            complaint: apt.triage?.notes || 'كشف روتيني وسجل العلامات الحيوية',
            priority: apt.triage?.priorityLevel || 'عادية',
            dept: apt.doctor?.department?.name || 'عام',
            doctor: apt.doctor?.user?.name || 'غير محدد',
            arrivalTime: timeFormatted,
            status: apt.status === 'WAITING' ? 'waiting' : apt.status === 'IN_PROGRESS' ? 'called' : 'done',
            ticket: `T-${apt.id.toString().padStart(3, '0')}`,
            phone: apt.patient?.user?.phone || 'غير مسجل'
          };
        });

      setQueue(mapped);
    } catch (err) {
      console.error(err);
      addToast('فشل في تحميل قائمة الانتظار من الخادم', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 15000); // refresh every 15 seconds
    return () => clearInterval(interval);
  }, [loadQueue]);

  const changeStatus = async (id, newStatus) => {
    const dbStatus = newStatus === 'called' ? 'IN_PROGRESS' : newStatus === 'done' ? 'COMPLETED' : 'WAITING';
    try {
      await api.patch(`/appointments/${id}/status`, { status: dbStatus });
      addToast(
        newStatus === 'called' ? 'تم استدعاء المريض بنجاح ✓' : 'تم إنهاء فحص المريض ✓',
        'success'
      );
      loadQueue();
    } catch (err) {
      addToast('فشل في تحديث حالة الحجز بالسيرفر', 'error');
    }
  };

  const callNext = async () => {
    const sorted = [...queue]
      .filter(p => filter === 'all' ? p.status !== 'done' : p.status === filter)
      .filter(p => deptFilter === 'all' || p.dept === deptFilter)
      .sort((a, b) => {
        const orderA = PRIORITY_CONFIG[a.priority]?.order || 3;
        const orderB = PRIORITY_CONFIG[b.priority]?.order || 3;
        return orderA - orderB;
      });

    const next = sorted.find(p => p.status === 'waiting');
    if (!next) return addToast('لا يوجد مرضى في الانتظار', 'info');
    await changeStatus(next.id, 'called');
  };

  const depts = ['all', ...new Set(queue.map(p => p.dept))];
  const sorted = [...queue]
    .filter(p => filter === 'all' ? p.status !== 'done' : p.status === filter)
    .filter(p => deptFilter === 'all' || p.dept === deptFilter)
    .sort((a, b) => {
      const orderA = PRIORITY_CONFIG[a.priority]?.order || 3;
      const orderB = PRIORITY_CONFIG[b.priority]?.order || 3;
      return orderA - orderB;
    });

  const stats = {
    waiting: queue.filter(p => p.status === 'waiting').length,
    called: queue.filter(p => p.status === 'called').length,
    done: queue.filter(p => p.status === 'done').length,
    critical: queue.filter(p => p.priority === 'حرجة' && p.status === 'waiting').length,
  };

  return (
    <div className="p-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div className="section-header mb-0">
          <div className="section-header-line" style={{ background: 'linear-gradient(180deg, #f59e0b, #d97706)' }} />
          <h3 className="text-xl font-bold">قائمة الانتظار الحية (اليوم)</h3>
        </div>
        <div className="flex gap-2">
          <button onClick={loadQueue} disabled={loading}
            className="p-3 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={callNext}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-white font-bold font-cairo shadow-lg hover:shadow-xl transition-all"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
            <Bell className="w-5 h-5" />استدعاء التالي
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'في الانتظار', count: stats.waiting, color: '#f59e0b', icon: '⏳' },
          { label: 'تم استدعاؤهم', count: stats.called, color: '#2563eb', icon: '📢' },
          { label: 'تم الفحص', count: stats.done, color: '#14b8a6', icon: '✅' },
          { label: 'حالات حرجة', count: stats.critical, color: '#ef4444', icon: '🚨' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bg-white rounded-2xl p-4 text-center shadow-sm border border-slate-100">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-3xl font-black" style={{ color: s.color }}>{s.count}</div>
            <div className="text-slate-500 text-xs mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        <div className="flex gap-2">
          {[{ v: 'all', l: 'الكل' }, { v: 'waiting', l: 'انتظار' }, { v: 'called', l: 'مستدعون' }].map(f => (
            <button key={f.v} onClick={() => setFilter(f.v)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${filter === f.v ? 'text-white shadow' : 'bg-white text-slate-600 border border-slate-200'}`}
              style={filter === f.v ? { background: 'linear-gradient(135deg, #f59e0b, #d97706)' } : {}}>
              {f.l}
            </button>
          ))}
        </div>
        <div className="flex gap-2 border-r border-slate-200 pr-2">
          {depts.map(d => (
            <button key={d} onClick={() => setDeptFilter(d)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${deptFilter === d ? 'text-white shadow' : 'bg-white text-slate-600 border border-slate-200'}`}
              style={deptFilter === d ? { background: 'linear-gradient(135deg, #2563eb, #3b82f6)' } : {}}>
              {d === 'all' ? 'كل الأقسام' : d}
            </button>
          ))}
        </div>
      </div>

      {/* Queue Cards */}
      <div className="space-y-3">
        <AnimatePresence>
          {sorted.map((patient, i) => {
            const pc = PRIORITY_CONFIG[patient.priority] || PRIORITY_CONFIG['عادية'];
            return (
              <motion.div key={patient.id}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl border shadow-sm overflow-hidden"
                style={{ borderColor: patient.status === 'called' ? pc.color : '#e2e8f0' }}>
                {patient.status === 'called' && (
                  <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${pc.color}, transparent)` }} />
                )}
                <div className="p-4 flex items-center gap-4 flex-wrap">
                  {/* Ticket */}
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${pc.color}, ${pc.color}cc)` }}>
                    {patient.ticket}
                  </div>

                  {/* Patient info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-slate-900">{patient.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-lg font-semibold"
                        style={{ background: pc.bg, color: pc.color }}>{pc.icon} {pc.label}</span>
                      {patient.status === 'called' && (
                        <span className="text-xs px-2 py-0.5 rounded-lg bg-blue-50 text-blue-600 font-semibold animate-pulse">📢 يتم الكشف</span>
                      )}
                    </div>
                    <p className="text-slate-500 text-sm truncate">{patient.complaint}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{patient.age} سنة</span>
                      <span>{patient.dept} · {patient.doctor}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />وقت الحجز {patient.arrivalTime}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <a href={`tel:${patient.phone}`}
                      className="p-2 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors" title="اتصل بالمريض">
                      <Phone className="w-4 h-4" />
                    </a>
                    {patient.status === 'waiting' && (
                      <button onClick={() => changeStatus(patient.id, 'called')}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-sm font-semibold"
                        style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)' }}>
                        <Bell className="w-4 h-4" />استدعاء
                      </button>
                    )}
                    {patient.status === 'called' && (
                      <button onClick={() => changeStatus(patient.id, 'done')}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-sm font-semibold"
                        style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}>
                        <CheckCircle className="w-4 h-4" />انتهى
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {sorted.length === 0 && (
          <div className="text-center py-16 text-slate-300">
            <Users className="w-14 h-14 mx-auto mb-3" />
            <p className="font-medium">لا يوجد مرضى في الانتظار حالياً</p>
          </div>
        )}
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
