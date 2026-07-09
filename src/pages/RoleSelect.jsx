import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  HeartPulse, User, Stethoscope, Building2,
  Settings, TrendingUp, Mail, Lock, Eye, EyeOff,
  ArrowRight, ChevronLeft, FlaskConical,
  KeyRound, AlertTriangle, CheckCircle2, ShieldCheck
} from 'lucide-react';

const roles = [
  { id: 'doctor', label: 'طبيب', sublabel: 'Doctor', icon: Stethoscope, color: '#14b8a6', bg: 'rgba(20,184,166,0.1)', gradient: 'linear-gradient(135deg, #14b8a6, #0d9488)', desc: 'إدارة المرضى والجداول', path: '/doctor/dashboard' },
  { id: 'nurse', label: 'ممرض', sublabel: 'Nurse', icon: HeartPulse, color: '#f43f5e', bg: 'rgba(244,63,94,0.1)', gradient: 'linear-gradient(135deg, #f43f5e, #e11d48)', desc: 'متابعة المرضى المنومين', path: '/nursing/dashboard' },
  { id: 'reception', label: 'استقبال', sublabel: 'Reception', icon: Building2, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', desc: 'الحجوزات والمرضى الجدد', path: '/reception/dashboard' },
  { id: 'pharmacist', label: 'صيدلي', sublabel: 'Pharmacy', icon: Stethoscope, color: '#10b981', bg: 'rgba(16,185,129,0.1)', gradient: 'linear-gradient(135deg, #10b981, #059669)', desc: 'صرف الأدوية والجرد', path: '/pharmacy/dashboard' },
  { id: 'lab_tech', label: 'فني مختبر', sublabel: 'Lab & Radiology', icon: FlaskConical, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)', desc: 'إدارة التحاليل والأشعة والنتائج', path: '/lab/dashboard' },
  { id: 'admin', label: 'مدير النظام', sublabel: 'Admin', icon: Settings, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', desc: 'إدارة تشغيلية للنظام', path: '/admin/dashboard' },
  { id: 'financial_manager', label: 'مدير مالي', sublabel: 'Finance', icon: TrendingUp, color: '#eab308', bg: 'rgba(234,179,8,0.1)', gradient: 'linear-gradient(135deg, #eab308, #ca8a04)', desc: 'الماليات والرواتب والفواتير', path: '/manager/dashboard' },
  { id: 'staff', label: 'موظف', sublabel: 'Staff', icon: User, color: '#475569', bg: 'rgba(71,85,105,0.1)', gradient: 'linear-gradient(135deg, #475569, #0f172a)', desc: 'بيانات الموظف والمرتب والحضور والإجازات', path: '/staff/dashboard' },
];

const credentials = {
  doctor: { email: 'magdy@alshifa.com', pass: '123456' },
  nurse: { email: 'nurse1@alshifa.com', pass: '123456' },
  reception: { email: 'reception1@alshifa.com', pass: '123456' },
  pharmacist: { email: 'pharmacist@alshifa.com', pass: '123456' },
  lab_tech: { email: 'lab@alshifa.com', pass: '123456' },
  admin: { email: 'admin@alshifa.com', pass: '123456' },
  financial_manager: { email: 'finance@alshifa.com', pass: '123456' },
  staff: { email: 'staff@alshifa.com', pass: '123456' },
};

const userNames = {
  patient: 'أحمد محمد السيد',
  doctor: 'د. سارة العمري',
  reception: 'نورا الخالدي',
  admin: 'عمر الإدريسي',
};

import { useAuth } from '@/lib/AuthContext';

export default function RoleSelect() {
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const isAuth = sessionStorage.getItem('staff_portal_authorized');
    if (isAuth !== 'true') {
      navigate('/', { replace: true });
    }
  }, [navigate]);
  const [step, setStep] = useState('role');
  const [selectedRole, setSelectedRole] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Forgot Password State ────────────────────────────────────────────────
  const [forgotStep, setForgotStep] = useState(''); // '' | 'email' | 'reset' | 'done'
  const [fpEmail, setFpEmail]       = useState('');
  const [fpNationalId, setFpNationalId] = useState('');
  const [fpNewPass, setFpNewPass]   = useState('');
  const [fpConfirm, setFpConfirm]   = useState('');
  const [fpHasNid, setFpHasNid]     = useState(false);
  const [fpLoading, setFpLoading]   = useState(false);
  const [fpError, setFpError]       = useState('');
  const [fpShowPass, setFpShowPass] = useState(false);

  const openForgot = () => {
    setFpEmail(email); setFpNationalId(''); setFpNewPass('');
    setFpConfirm(''); setFpError(''); setForgotStep('email');
  };
  const closeForgot = () => setForgotStep('');

  const handleFpStep1 = async () => {
    setFpError(''); setFpLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email: fpEmail });
      setFpHasNid(res.data.hasNationalId);
      setForgotStep('reset');
    } catch (err) {
      setFpError(err.response?.data?.error || 'حدث خطأ');
    } finally { setFpLoading(false); }
  };

  const handleFpReset = async () => {
    setFpError('');
    if (fpNewPass.length < 6) return setFpError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
    if (fpNewPass !== fpConfirm) return setFpError('كلمتا المرور غير متطابقتين');
    setFpLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/reset-password', {
        email: fpEmail,
        nationalId: fpNationalId || undefined,
        newPassword: fpNewPass,
      });
      setForgotStep('done');
    } catch (err) {
      setFpError(err.response?.data?.error || 'حدث خطأ');
    } finally { setFpLoading(false); }
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setEmail('');
    setPassword('');
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
      
      // التحقق من تطابق الدور الفعلي في قاعدة البيانات مع الدور المحدد بالواجهة لمنع التسلل
      if (selectedRole && user.role.toUpperCase() !== selectedRole.id.toUpperCase()) {
        setError(`هذا الحساب غير مصرح له بالدخول كـ ${selectedRole.label}. يرجى التحقق من الدور المختار.`);
        setLoading(false);
        return;
      }

      const normalizedRole = user.role.toLowerCase();

      // تحديد مسار التوجيه بناءً على الدور
      const rolePaths = {
        patient: '/patient/dashboard',
        doctor: '/doctor/dashboard',
        nurse: '/nursing/dashboard',
        reception: '/reception/dashboard',
        admin: '/admin/dashboard',
        financial_manager: '/manager/dashboard',

        pharmacist: '/pharmacy/dashboard',
        lab_tech: '/lab/dashboard',
        staff: '/staff/dashboard'
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
      const msg = err.response?.data?.message || err.response?.data?.error;
      if (err.response?.status === 401 || err.response?.status === 400) {
        setError(msg || 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
      } else if (!err.response) {
        setError('تعذر الاتصال بالخادم، تأكد من تشغيل الباك إند');
      } else {
        setError(msg || 'حدث خطأ، يرجى المحاولة مجدداً');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative font-cairo flex items-center justify-center overflow-hidden bg-slate-900" dir="rtl">
      <div className="absolute inset-0 z-0">
        <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1920&fit=crop" alt="Hospital Background" className="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/60 backdrop-blur-[2px]" />
      </div>
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-teal-600/30 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="relative z-10 w-full max-w-6xl px-4 py-12 mx-auto flex flex-col min-h-screen">
        <div className="text-center mb-12 pt-8">
          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200 }}
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl" style={{ background: 'linear-gradient(135deg, #2563eb, #14b8a6)' }}>
            <HeartPulse className="w-10 h-10 text-white" />
          </motion.div>
          <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-white mb-4">نظام مستشفى الشفاء الطبي</motion.h1>
          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-slate-300 text-lg md:text-xl font-medium">اختر بوابتك للدخول إلى النظام</motion.p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'role' ? (
            <motion.div key="roles-grid" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="flex-1 flex items-center justify-center">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6 w-full max-w-5xl mx-auto">
                {roles.map((role, i) => (
                  <motion.div key={role.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + (i * 0.05) }}
                    onClick={() => handleRoleSelect(role)} className="relative group cursor-pointer">
                    <div className="absolute inset-0 bg-white/5 rounded-3xl blur-xl group-hover:bg-white/10 transition-colors duration-300" />
                    <div className="relative h-full flex flex-col items-center text-center p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:border-white/20">
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300" style={{ background: role.gradient }} />
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" style={{ background: role.gradient }}>
                        <role.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-1">{role.label}</h3>
                      <p className="text-sm text-slate-400 mb-2">{role.sublabel}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="login-form" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
              className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 w-full shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-2 opacity-80" style={{ background: selectedRole?.gradient }} />
                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/10">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: selectedRole?.gradient }}>
                    {selectedRole && <selectedRole.icon className="w-7 h-7 text-white" />}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedRole?.label}</h2>
                    <p className="text-slate-400 text-sm">تسجيل الدخول للنظام</p>
                  </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="block text-slate-300 text-sm font-semibold mb-2">البريد الإلكتروني</label>
                    <div className="relative">
                      <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                        className="w-full px-4 py-3.5 pr-12 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all font-cairo"
                        placeholder="أدخل بريدك الإلكتروني" required dir="ltr" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-300 text-sm font-semibold mb-2">كلمة المرور</label>
                    <div className="relative">
                      <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                        className="w-full px-4 py-3.5 pr-12 pl-12 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all font-cairo"
                        placeholder="أدخل كلمة المرور" required dir="ltr" />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                        {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center font-medium">
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button type="submit" disabled={loading} className="w-full py-4 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
                    style={{ background: selectedRole?.gradient || 'linear-gradient(135deg, #2563eb, #14b8a6)' }}>
                    {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><ArrowRight className="w-5 h-5" />دخول النظام</>}
                  </button>
                </form>

                {selectedRole && credentials[selectedRole.id] && (
                  <div className="mt-4 text-center">
                    <button type="button" onClick={() => {
                      const cred = credentials[selectedRole.id];
                      setEmail(cred.email);
                      setPassword(cred.pass);
                    }} className="text-xs text-blue-400 hover:text-blue-300 underline font-medium font-cairo">
                      🔑 استخدام بيانات الحساب التجريبي للدخول السريع
                    </button>
                  </div>
                )}

                {selectedRole?.id === 'patient' && (
                  <div className="mt-5 text-center">
                    <button type="button" onClick={openForgot} className="text-blue-400 text-sm hover:text-blue-300 font-medium flex items-center gap-1 mx-auto">
                      <KeyRound className="w-4 h-4" />نسيت كلمة المرور؟
                    </button>
                  </div>
                )}
              </div>
              <button onClick={() => setStep('role')} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mt-8 transition-colors bg-white/5 px-6 py-2.5 rounded-full border border-white/10">
                <ArrowRight className="w-4 h-4 rotate-180" />العودة لاختيار الدور
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-auto pt-8 flex flex-col items-center justify-center gap-4 text-center text-slate-500 text-sm">
          <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm bg-white/5 hover:bg-white/10 px-6 py-2.5 rounded-full border border-white/10 transition-colors">
            العودة للصفحة الرئيسية
          </Link>
          <p>© {new Date().getFullYear()} مستشفى الشفاء. جميع الحقوق محفوظة.</p>
        </div>
      </div>
      
      <AnimatePresence>
        {forgotStep !== '' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md"
            onClick={closeForgot}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-800 border border-slate-700 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
              onClick={e => e.stopPropagation()}>
              <div className="p-6 pb-4 border-b border-slate-700" style={{ background: 'linear-gradient(135deg, #1e40af, #2563eb)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <KeyRound className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-white font-black text-lg">استعادة كلمة المرور</h2>
                      <p className="text-blue-200 text-xs">حسابات المرضى فقط</p>
                    </div>
                  </div>
                  <button onClick={closeForgot} className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">×</button>
                </div>
              </div>

              <div className="p-6 space-y-4" dir="rtl">
                {fpError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />{fpError}
                  </div>
                )}

                {forgotStep === 'email' && (
                  <>
                    <p className="text-slate-400 text-sm">أدخل البريد الإلكتروني المرتبط بحسابك كمريض.</p>
                    <div>
                      <label className="block text-sm font-bold text-slate-300 mb-1.5">البريد الإلكتروني</label>
                      <input type="email" value={fpEmail} onChange={e => setFpEmail(e.target.value)} dir="ltr"
                        className="w-full px-4 py-3 rounded-xl border border-slate-600 bg-slate-700/50 text-white focus:outline-none focus:border-blue-500" />
                    </div>
                    <button onClick={handleFpStep1} disabled={fpLoading || !fpEmail.trim()}
                      className="w-full py-3 rounded-xl text-white font-bold bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                      {fpLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'التحقق من الحساب'}
                    </button>
                  </>
                )}

                {forgotStep === 'reset' && (
                  <>
                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm">
                      ✅ تم التحقق من البريد الإلكتروني <strong>{fpEmail}</strong>
                    </div>
                    {fpHasNid && (
                      <div>
                        <label className="block text-sm font-bold text-slate-300 mb-1.5">الرقم القومي</label>
                        <input type="text" value={fpNationalId} onChange={e => setFpNationalId(e.target.value)} dir="ltr"
                          className="w-full px-4 py-3 rounded-xl border border-slate-600 bg-slate-700/50 text-white focus:outline-none focus:border-blue-500" />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-bold text-slate-300 mb-1.5">كلمة المرور الجديدة</label>
                      <input type={fpShowPass ? 'text' : 'password'} value={fpNewPass} onChange={e => setFpNewPass(e.target.value)} dir="ltr"
                        className="w-full px-4 py-3 rounded-xl border border-slate-600 bg-slate-700/50 text-white focus:outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-300 mb-1.5">تأكيد كلمة المرور</label>
                      <input type="password" value={fpConfirm} onChange={e => setFpConfirm(e.target.value)} dir="ltr"
                        className="w-full px-4 py-3 rounded-xl border border-slate-600 bg-slate-700/50 text-white focus:outline-none focus:border-blue-500" />
                    </div>
                    <button onClick={handleFpReset} disabled={fpLoading}
                      className="w-full py-3 rounded-xl text-white font-bold bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2">
                      {fpLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'تغيير كلمة المرور'}
                    </button>
                  </>
                )}

                {forgotStep === 'done' && (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-9 h-9 text-green-500" />
                    </div>
                    <h3 className="font-black text-white text-lg mb-2">تم التغيير بنجاح!</h3>
                    <button onClick={() => { closeForgot(); setPassword(''); }}
                      className="w-full py-3 rounded-xl text-white font-bold bg-green-600 hover:bg-green-700">
                      العودة لتسجيل الدخول
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
