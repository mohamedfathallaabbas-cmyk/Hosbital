import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  HeartPulse, User, Stethoscope, Building2,
  Settings, TrendingUp, Mail, Lock, Eye, EyeOff,
  ArrowRight, ChevronLeft, FlaskConical
} from 'lucide-react';

const roles = [
  {
    id: 'patient',
    label: 'مريض',
    sublabel: 'Patient',
    icon: User,
    color: '#2563eb',
    bg: 'rgba(37,99,235,0.1)',
    gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)',
    desc: 'عرض المواعيد والسجل الطبي',
    path: '/patient/dashboard',
  },
  {
    id: 'doctor',
    label: 'طبيب',
    sublabel: 'Doctor',
    icon: Stethoscope,
    color: '#14b8a6',
    bg: 'rgba(20,184,166,0.1)',
    gradient: 'linear-gradient(135deg, #14b8a6, #0d9488)',
    desc: 'إدارة المرضى والجداول',
    path: '/doctor/dashboard',
  },
  {
    id: 'reception',
    label: 'استقبال',
    sublabel: 'Reception',
    icon: Building2,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.1)',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    desc: 'الحجوزات والمرضى الجدد',
    path: '/reception/dashboard',
  },
  {
    id: 'pharmacist',
    label: 'صيدلي',
    sublabel: 'Pharmacy',
    icon: Stethoscope, // Using an available icon
    color: '#10b981',
    bg: 'rgba(16,185,129,0.1)',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    desc: 'صرف الأدوية والجرد',
    path: '/pharmacy/dashboard',
  },
  {
    id: 'admin',
    label: 'إدارة تشغيلية',
    sublabel: 'Admin',
    icon: Settings,
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.1)',
    gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    desc: 'إدارة تشغيلية للنظام',
    path: '/admin/dashboard',
  },
  {
    id: 'manager',
    label: 'مدير مالي',
    sublabel: 'Manager',
    icon: TrendingUp,
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.1)',
    gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
    desc: 'الماليات والتقارير العليا',
    path: '/manager/dashboard',
  },
  {
    id: 'lab',
    label: 'فني مختبر',
    sublabel: 'Lab & Radiology',
    icon: FlaskConical,
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.1)',
    gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    desc: 'إدارة التحاليل والأشعة والنتائج',
    path: '/lab/dashboard',
  },
];

const credentials = {
  patient: { email: 'patient@alshifa.com', pass: '123456' },
  doctor: { email: 'doctor@alshifa.com', pass: '123456' },
  reception: { email: 'reception@alshifa.com', pass: '123456' },
  pharmacist: { email: 'pharmacy@alshifa.com', pass: '123456' },
  admin: { email: 'admin@alshifa.com', pass: '123456' },
  manager: { email: 'manager@alshifa.com', pass: '123456' },
  lab: { email: 'lab@alshifa.com', pass: '123456' },
};

const userNames = {
  patient: 'أحمد محمد السيد',
  doctor: 'د. سارة العمري',
  reception: 'نورا الخالدي',
  admin: 'عمر الإدريسي',
  manager: 'خالد المنصور',
};

import { useAuth } from '@/lib/AuthContext';

export default function RoleSelect() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState('role');
  const [selectedRole, setSelectedRole] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    const cred = credentials[role.id];
    setEmail(cred.email);
    setPassword(cred.pass);
    setError('');
    setStep('form');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // الاتصال بالباك إند الحقيقي
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      const { token, user } = response.data;
      const normalizedRole = user.role.toLowerCase();

      // تحديد مسار التوجيه بناءً على الدور
      const rolePaths = {
        patient: '/patient/dashboard',
        doctor: '/doctor/dashboard',
        reception: '/reception/dashboard',
        admin: '/admin/dashboard',
        manager: '/manager/dashboard',
        pharmacist: '/pharmacy/dashboard',
        lab: '/lab/dashboard'
      };

      login({
        id: user.id,
        role: normalizedRole,
        name: user.name,
        email: user.email,
        token: token,
        patientId: user.patientId,
        doctorId: user.doctorId
      });

      navigate(rolePaths[normalizedRole]);
      
    } catch (err) {
      setError(err.response?.data?.error || 'تعذر الاتصال بخادم المستشفى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-cairo flex" dir="rtl">
      {/* Left visual panel */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)' }}>
        <div className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&fit=crop)`,
            backgroundSize: 'cover', backgroundPosition: 'center'
          }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.85), rgba(30,41,59,0.9))' }} />

        <div className="absolute top-24 right-24 w-72 h-72 rounded-full blur-3xl opacity-25"
          style={{ background: 'radial-gradient(circle, #2563eb, transparent)' }} />
        <div className="absolute bottom-24 left-24 w-56 h-56 rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, #14b8a6, transparent)' }} />

        <div className="relative z-10 text-center px-12">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
            className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl"
            style={{ background: 'linear-gradient(135deg, #2563eb, #14b8a6)' }}>
            <HeartPulse className="w-12 h-12 text-white" />
          </motion.div>
          <h1 className="text-5xl font-black text-white mb-3">مستشفى الشفاء</h1>
          <p className="text-slate-400 text-xl">نظام الإدارة الطبية المتكامل</p>
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-900">
        <div className="w-full max-w-lg">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 mb-10 justify-center lg:hidden">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl"
              style={{ background: 'linear-gradient(135deg, #2563eb, #14b8a6)' }}>
              <HeartPulse className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="font-black text-xl text-slate-900">مستشفى الشفاء</div>
              <div className="text-slate-500 text-xs">نظام الإدارة الطبية</div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 'role' ? (
              <motion.div key="role-step" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-black text-slate-900 mb-2">أهلاً بك</h2>
                  <p className="text-slate-500">اختر دورك للدخول إلى النظام</p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {roles.map((role, i) => (
                    <motion.div key={role.id}
                      initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-200 group bg-white dark:bg-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.05)] border-2 border-transparent"
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = role.color;
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = `0 12px 30px ${role.color}25`;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'transparent';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)';
                      }}
                      onClick={() => handleRoleSelect(role)}>
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ background: role.gradient }}>
                        <role.icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">{role.label}</span>
                          <span className="text-slate-500 dark:text-slate-300 text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">{role.sublabel}</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{role.desc}</p>
                      </div>
                      <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:text-slate-700 transition-colors" />
                    </motion.div>
                  ))}
                </div>
                <div className="text-center mt-6">
                  <Link to="/" className="text-slate-400 text-sm hover:text-slate-600 transition-colors flex items-center justify-center gap-1">
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    العودة للموقع الرئيسي
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div key="form-step" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-black text-slate-900 mb-2">تسجيل الدخول</h2>
                  <p className="text-slate-500">أدخل بياناتك للوصول إلى النظام</p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-slate-700">
                  {/* Selected role badge */}
                  {selectedRole && (
                    <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl" style={{ background: selectedRole.bg }}>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ background: selectedRole.gradient }}>
                        <selectedRole.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-900">{selectedRole.label}</div>
                        <div className="text-slate-600 text-xs">{selectedRole.desc}</div>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                      <label className="block text-slate-700 text-sm font-semibold mb-2">البريد الإلكتروني</label>
                      <div className="relative">
                        <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                          className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all font-cairo"
                          placeholder="أدخل بريدك الإلكتروني" required />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 text-sm font-semibold mb-2">كلمة المرور</label>
                      <div className="relative">
                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type={showPass ? 'text' : 'password'} value={password}
                          onChange={e => setPassword(e.target.value)}
                          className="w-full px-4 py-3 pr-12 pl-12 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all font-cairo"
                          placeholder="أدخل كلمة المرور" required />
                        <button type="button" onClick={() => setShowPass(!showPass)}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm text-center font-medium">
                        {error}
                      </div>
                    )}

                    <button type="submit" disabled={loading}
                      className="w-full py-4 rounded-xl text-white font-bold text-base flex items-center justify-center gap-2 transition-all"
                      style={{
                        background: loading ? '#94a3b8' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                        boxShadow: loading ? 'none' : '0 4px 20px rgba(37,99,235,0.35)',
                      }}>
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <ArrowRight className="w-5 h-5" />
                          دخول النظام
                        </>
                      )}
                    </button>
                  </form>

                  <div className="mt-5 p-3 rounded-xl bg-slate-50 text-center">
                    <p className="text-slate-400 text-xs">بيانات تجريبية — تم تعبئتها تلقائياً</p>
                  </div>
                </div>

                <button onClick={() => setStep('role')}
                  className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm mt-5 mx-auto transition-colors">
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  تغيير الدور
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}