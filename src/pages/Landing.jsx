import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Phone, Mail, MapPin, Star, ChevronLeft, ChevronRight,
  Activity, Users, Stethoscope, Calendar, Award, Clock,
  Shield, Zap, CheckCircle, ArrowLeft, Menu, X,
  Microscope, Brain, Bone, Baby, HeartPulse, Building2, Layers,
  UserPlus, AlertTriangle, Eye, EyeOff, ChevronDown, Eye as EyeIcon, Sun, Moon
} from 'lucide-react';
import BlogScroll from '../components/hospital/BlogScroll';
import BookingSection from '../components/hospital/BookingSection';
import api from '../lib/api';

const departments = [
  { icon: Heart, name: 'أمراض القلب', desc: 'رعاية متكاملة لأمراض القلب والأوعية الدموية', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  { icon: Layers, name: 'الباطنة العامة', desc: 'تشخيص وعلاج الأمراض الباطنية والجهاز الهضمي', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  { icon: Baby, name: 'طب الأطفال', desc: 'رعاية شاملة لصحة الأطفال والمواليد', color: '#ec4899', bg: 'rgba(236,72,153,0.1)' },
  { icon: Bone, name: 'جراحة العظام', desc: 'جراحة العظام وعلاج الكسور والإصابات الرياضية', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  { icon: Eye, name: 'طب العيون', desc: 'فحص وعلاج أمراض العيون والبصريات', color: '#14b8a6', bg: 'rgba(20,184,166,0.1)' },
  { icon: Brain, name: 'المخ والأعصاب', desc: 'تشخيص وعلاج أمراض الجهاز العصبي والصرع', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
];

const doctors = [
  { name: 'د. أحمد السيد', specialty: 'استشاري قلب وأوعية دموية', rating: 4.9, patients: 1250, img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face' },
  { name: 'د. سارة العمري', specialty: 'استشارية أعصاب', rating: 4.8, patients: 980, img: '/doctor_hijab_sara.png' },
  { name: 'د. محمد الحارثي', specialty: 'استشاري جراحة عظام', rating: 4.9, patients: 1450, img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&h=300&fit=crop&crop=face' },
  { name: 'د. فاطمة الزهراء', specialty: 'استشارية طب أطفال', rating: 5.0, patients: 2100, img: '/doctor_hijab_fatima.png' },
];

const reviews = [
  { name: 'عبدالله المنصور', text: 'تجربة رائعة، الأطباء متميزون والخدمة ممتازة. شفيت بسرعة وأنصح الجميع بهذا المستشفى.', rating: 5, date: 'منذ أسبوع' },
  { name: 'نورة الرشيد', text: 'أفضل مستشفى تعاملت معه. نظافة عالية، أطباء محترفون، وخدمة استثنائية في كل مرحلة.', rating: 5, date: 'منذ أسبوعين' },
  { name: 'خالد العتيبي', text: 'خدمة ممتازة وسريعة. الأطباء يعطون الوقت الكافي لكل مريض والشرح واضح.', rating: 4, date: 'منذ شهر' },
];

const blogs = [
  { title: 'كيف تحافظ على صحة قلبك في 10 خطوات', category: 'صحة القلب', date: '15 أبريل 2025', img: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=250&fit=crop', readTime: '5 دقائق' },
  { title: 'أهمية الفحص الدوري المبكر للكشف عن السرطان', category: 'الوقاية', date: '12 أبريل 2025', img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=250&fit=crop', readTime: '7 دقائق' },
  { title: 'التغذية السليمة لمرضى السكري: دليل شامل', category: 'تغذية', date: '10 أبريل 2025', img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=250&fit=crop', readTime: '8 دقائق' },
  { title: 'تمارين يومية لتقوية العظام والمفاصل', category: 'رياضة وصحة', date: '8 أبريل 2025', img: '/hijab_exercise.png', readTime: '4 دقائق' },
  { title: 'الصحة النفسية: كيف تتعامل مع الضغوط اليومية', category: 'الصحة النفسية', date: '5 أبريل 2025', img: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=250&fit=crop', readTime: '6 دقائق' },
  { title: 'نوم صحي: أسرار النوم المريح والعميق', category: 'نمط الحياة', date: '2 أبريل 2025', img: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&h=250&fit=crop', readTime: '5 دقائق' },
];

const stats = [
  { value: '15,000+', label: 'مريض سنوياً', icon: Users },
  { value: '120+', label: 'طبيب متخصص', icon: Stethoscope },
  { value: '25+', label: 'قسم طبي', icon: Activity },
  { value: '98%', label: 'رضا المرضى', icon: Award },
];

export default function Landing() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const [activeReview, setActiveReview] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  // ── Auth Context & New Auth Modals ───────────────────────────────────────
  const { login } = useAuth();
  const [showPatientLogin, setShowPatientLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  const [showStaffPassModal, setShowStaffPassModal] = useState(false);
  const [staffPassword, setStaffPassword] = useState('');
  const [staffPassError, setStaffPassError] = useState('');

  const handlePatientLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    if (!loginEmail.trim() || !loginPassword) {
      return setLoginError('البريد الإلكتروني وكلمة المرور مطلوبان');
    }
    setLoginSubmitting(true);
    try {
      const res = await api.post('/auth/login', {
        email: loginEmail.trim().toLowerCase(),
        password: loginPassword
      });

      const { token, user } = res.data;
      if ((user.role || '').toUpperCase() !== 'PATIENT') {
        return setLoginError('هذا الحساب غير مخصص للمرضى. يرجى تسجيل الدخول من بوابة الموظفين.');
      }

      login({
        id: user.id,
        role: 'patient',
        name: user.name,
        email: user.email,
        token: token,
        patientId: user.patientId
      });

      setShowPatientLogin(false);
      navigate('/patient/dashboard');
    } catch (err) {
      setLoginError(err.response?.data?.message || err.response?.data?.error || 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleStaffSubmit = (e) => {
    e.preventDefault();
    setStaffPassError('');
    if (staffPassword === 'shifa-staff-2026') {
      sessionStorage.setItem('staff_portal_authorized', 'true');
      setShowStaffPassModal(false);
      setStaffPassword('');
      navigate('/role-select');
    } else {
      setStaffPassError('رمز الدخول الموحد غير صحيح!');
    }
  };

  // ── Sign Up Modal State ───────────────────────────────────────────────────
  const [showSignUp, setShowSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [signUpError, setSignUpError] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    nationalId: '', dateOfBirth: '', gender: ''
  });

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSignUp = async () => {
    setSignUpError('');
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      return setSignUpError('الاسم والبريد الإلكتروني وكلمة المرور مطلوبة');
    }
    if (form.password.length < 6) {
      return setSignUpError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
    }
    if (form.password !== form.confirmPassword) {
      return setSignUpError('كلمتا المرور غير متطابقتين');
    }
    setSubmitting(true);
    try {
      const res = await api.post('/auth/register-patient', {
        name:        form.name.trim(),
        email:       form.email.trim().toLowerCase(),
        phone:       form.phone || undefined,
        password:    form.password,
        nationalId:  form.nationalId || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        gender:      form.gender || undefined,
      });
      
      const { token, user } = res.data;
      login({
        id: user.id,
        role: 'patient',
        name: user.name,
        email: user.email,
        token: token,
        patientId: user.patientId
      });

      setShowSignUp(false);
      navigate('/patient/dashboard');
    } catch (err) {
      setSignUpError(err.response?.data?.message || err.response?.data?.error || 'حدث خطأ، يرجى المحاولة مرة أخرى');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveReview(prev => (prev + 1) % reviews.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="font-cairo" dir="rtl">
      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'landing-nav py-3' : 'py-5 bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-hospital-gradient flex items-center justify-center">
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-lg leading-tight">مستشفى الشفاء</div>
              <div className="text-blue-300 text-xs">Al-Shifa Hospital</div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-white/90 text-sm font-medium">
            {['الرئيسية', 'الأقسام', 'أطباؤنا', 'المدونة', 'تواصل معنا'].map((item, i) => (
              <a key={i} href={`#${['home','departments','doctors','blog','contact'][i]}`}
                className="hover:text-white transition-colors relative group">
                {item}
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-400 scale-x-0 group-hover:scale-x-100 transition-transform" />
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all flex items-center justify-center"
              title={darkMode ? 'الوضع المضيء' : 'الوضع الداكن'}>
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={() => { setShowPatientLogin(true); setLoginError(''); }}
              className="text-white/90 hover:text-white px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-white/10">
              تسجيل دخول
            </button>
            <button onClick={() => { setShowSignUp(true); setSignUpError(''); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-white/30 text-white hover:bg-white/10 transition-all">
              <UserPlus className="w-4 h-4" />إنشاء حساب
            </button>
            <button onClick={() => { setShowStaffPassModal(true); setStaffPassError(''); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-amber-600 hover:bg-amber-700 text-white font-bold transition-all shadow-md">
              بوابة الموظفين
            </button>
            <a href="#contact" className="btn-primary-hospital text-sm">
              احجز الآن
            </a>
          </div>

          <button className="md:hidden text-white" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenu && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="md:hidden bg-slate-900/98 backdrop-blur-xl border-t border-white/10 px-4 py-4 flex flex-col gap-3">
              {['الرئيسية', 'الأقسام', 'أطباؤنا', 'المدونة', 'تواصل معنا'].map((item, i) => (
                <a key={i} href="#" className="text-white/90 py-2 text-sm font-medium border-b border-white/10">{item}</a>
              ))}
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-white/90 text-sm font-medium font-cairo">مظهر التطبيق</span>
                <button onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all flex items-center gap-2 text-xs font-semibold font-cairo">
                  {darkMode ? <><Sun className="w-4 h-4" /> الوضع المضيء</> : <><Moon className="w-4 h-4" /> الوضع الداكن</>}
                </button>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <div className="flex gap-2">
                  <button onClick={() => { setMobileMenu(false); setShowPatientLogin(true); setLoginError(''); }}
                    className="flex-1 text-center text-white border border-white/30 py-2 rounded-xl text-sm font-cairo">
                    تسجيل دخول
                  </button>
                  <button onClick={() => { setMobileMenu(false); setShowSignUp(true); }}
                    className="flex-1 text-center bg-white/10 text-white py-2 rounded-xl text-sm border border-white/20 font-cairo">
                    إنشاء حساب
                  </button>
                </div>
                <button onClick={() => { setMobileMenu(false); setShowStaffPassModal(true); setStaffPassError(''); }}
                  className="w-full text-center bg-amber-600 text-white py-2 rounded-xl text-sm font-bold font-cairo shadow-md">
                  بوابة الموظفين
                </button>
                <a href="#contact" className="w-full text-center btn-primary-hospital py-2 text-sm font-cairo">احجز الآن</a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero */}
      <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-dark-gradient" />
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: `url(https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=1920&q=80&fit=crop)`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-900" />

        {/* Animated blobs */}
        <div className="absolute top-20 right-20 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ background: 'radial-gradient(circle, #2563eb, transparent)' }} />
        <div className="absolute bottom-20 left-20 w-80 h-80 rounded-full opacity-15 blur-3xl animate-pulse"
          style={{ background: 'radial-gradient(circle, #14b8a6, transparent)', animationDelay: '1s' }} />

        <div className="relative max-w-7xl mx-auto px-4 py-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-6"
              style={{ background: 'rgba(37,99,235,0.2)', color: '#93c5fd', border: '1px solid rgba(37,99,235,0.3)' }}>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              متاح 24/7 — رعاية لا تتوقف
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
              صحتك أمانة
              <br />
              <span className="gradient-text">في أيدٍ أمينة</span>
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed mb-8 max-w-xl">
              مستشفى الشفاء — نقدم رعاية طبية استثنائية بأحدث التقنيات وأمهر الأطباء المتخصصين. صحتك هي أولويتنا الأولى والأخيرة.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#contact" className="btn-primary-hospital flex items-center gap-2 text-base px-8 py-4">
                <Calendar className="w-5 h-5" />
                احجز موعدك الآن
              </a>
              <button onClick={() => { setShowSignUp(true); setSignUpError(''); }}
                className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-all"
                style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)' }}>
                <UserPlus className="w-5 h-5" />
                إنشاء حساب مريض
              </button>
              <a href="#departments" className="flex items-center gap-2 px-8 py-4 rounded-xl text-white border border-white/20 hover:bg-white/10 transition-all text-base font-semibold">
                <Activity className="w-5 h-5" />
                اكتشف خدماتنا
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-6 mt-10 pt-10 border-t border-white/10">
              {stats.map((s, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl font-black text-white">{s.value}</div>
                  <div className="text-slate-400 text-xs mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:block relative">
            <div className="relative rounded-3xl overflow-hidden" style={{ boxShadow: '0 30px 80px rgba(37,99,235,0.3)' }}>
              <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&h=700&fit=crop" alt="Medical Team" className="w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
            </div>
            {/* Float cards */}
            <div className="absolute -right-6 top-1/3 glass-card-dark rounded-2xl p-4 w-52">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(20,184,166,0.2)' }}>
                  <CheckCircle className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <div className="text-white text-xs font-semibold">موعد مؤكد</div>
                  <div className="text-slate-400 text-xs">اليوم 10:30 ص</div>
                </div>
              </div>
            </div>
            <div className="absolute -left-6 bottom-1/3 glass-card-dark rounded-2xl p-4 w-52">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.2)' }}>
                  <Star className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="text-white text-xs font-semibold">تقييم الأطباء</div>
                  <div className="text-slate-400 text-xs">4.9/5 من 2000+ مريض</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Departments */}
      <section id="departments" className="py-24 bg-hospital-gradient-soft">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-4"
              style={{ background: 'rgba(37,99,235,0.1)', color: '#2563eb' }}>
              خدماتنا الطبية
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-4">أقسامنا المتخصصة</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">نوفر رعاية شاملة في جميع التخصصات الطبية بأحدث التقنيات وأكفأ الأطباء</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {departments.map((dept, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="dept-card">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: dept.bg }}>
                  <dept.icon className="w-8 h-8" style={{ color: dept.color }} />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-2">{dept.name}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{dept.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-6" style={{ background: 'rgba(37,99,235,0.1)', color: '#2563eb' }}>من نحن</div>
            <h2 className="text-4xl font-black text-slate-900 mb-6 leading-tight">25 عاماً من<br /><span className="gradient-text">التميز الطبي</span></h2>
            <p className="text-slate-600 leading-relaxed mb-6">منذ عام 2000، يقدم مستشفى الشفاء خدمات طبية متكاملة على أعلى مستوى. نفخر بفريق طبي متخصص يضم أكثر من 120 طبيباً واستشارياً في مختلف التخصصات الطبية الدقيقة.</p>

            {/* Key Numbers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 p-5 rounded-2xl" style={{ background: 'linear-gradient(135deg, #eff6ff, #f0fdfa)' }}>
              {[
                { value: '35+', label: 'عيادة متخصصة', icon: Building2, color: '#2563eb' },
                { value: '120+', label: 'طبيب متخصص', icon: Stethoscope, color: '#14b8a6' },
                { value: '50K+', label: 'مريض سنوياً', icon: Users, color: '#f59e0b' },
                { value: '25+', label: 'تخصص طبي', icon: Layers, color: '#8b5cf6' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: `${s.color}15` }}>
                    <s.icon className="w-5 h-5" style={{ color: s.color }} />
                  </div>
                  <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-slate-500 text-xs mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { icon: Shield, text: 'اعتماد JCI العالمي', color: '#2563eb' },
                { icon: Award, text: 'جائزة التميز الطبي 2024', color: '#14b8a6' },
                { icon: Zap, text: 'تقنيات تشخيصية حديثة', color: '#f59e0b' },
                { icon: Clock, text: 'طوارئ 24/7', color: '#ef4444' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'rgba(241,245,249,0.8)' }}>
                  <item.icon className="w-5 h-5 flex-shrink-0" style={{ color: item.color }} />
                  <span className="text-slate-700 text-sm font-medium">{item.text}</span>
                </div>
              ))}
            </div>
            <a href="#contact" className="btn-primary-hospital inline-flex items-center gap-2"><Calendar className="w-4 h-4" />احجز موعدك الآن</a>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl">
              <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&h=500&fit=crop" alt="Hospital" className="w-full object-cover" />
            </div>
            <div className="absolute -bottom-6 -right-6 glass-card rounded-2xl p-5 shadow-xl">
              <div className="text-3xl font-black text-hospital-primary">98%</div>
              <div className="text-slate-600 text-sm mt-1">رضا المرضى</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Doctors */}
      <section id="doctors" className="py-24 bg-hospital-gradient-soft">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4">نخبة أطبائنا</h2>
            <p className="text-slate-500 text-lg">فريق من أفضل الأطباء المتخصصين في المنطقة</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {doctors.map((doc, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="doctor-card">
                <div className="relative">
                  <img src={doc.img} alt={doc.name} className="w-full h-64 object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
                  <div className="absolute bottom-4 right-4 left-4 text-white">
                    <h3 className="font-bold text-lg">{doc.name}</h3>
                    <p className="text-sm text-slate-300">{doc.specialty}</p>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className={`w-4 h-4 ${j < Math.floor(doc.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                    ))}
                    <span className="text-slate-600 text-xs mr-1">{doc.rating}</span>
                  </div>
                  <span className="text-slate-500 text-xs">{doc.patients.toLocaleString()} مريض</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog - Horizontal Scroll */}
      <BlogScroll />

      {/* Reviews */}
      <section className="py-24 bg-dark-gradient relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #2563eb, transparent), radial-gradient(circle at 70% 50%, #14b8a6, transparent)' }} />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-black text-white mb-4">ماذا يقول مرضانا</h2>
          <p className="text-slate-400 mb-12">آراء حقيقية من مرضى مررنا بتجربتهم</p>

          <AnimatePresence mode="wait">
            <motion.div key={activeReview} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }} className="glass-card-dark rounded-3xl p-8 mb-8">
              <div className="flex justify-center gap-1 mb-4">
                {[...Array(reviews[activeReview].rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-slate-200 text-lg leading-relaxed mb-6 italic">"{reviews[activeReview].text}"</p>
              <div className="font-bold text-white">{reviews[activeReview].name}</div>
              <div className="text-slate-400 text-sm">{reviews[activeReview].date}</div>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center gap-2">
            {reviews.map((_, i) => (
              <button key={i} onClick={() => setActiveReview(i)}
                className={`w-3 h-3 rounded-full transition-all ${i === activeReview ? 'bg-blue-500 w-8' : 'bg-slate-600'}`} />
            ))}
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <BookingSection onNeedLogin={() => { setShowPatientLogin(true); setLoginError(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />

      {/* Footer */}
      <footer className="bg-dark-gradient py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-hospital-gradient flex items-center justify-center">
                  <HeartPulse className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-bold">مستشفى الشفاء</div>
                  <div className="text-slate-400 text-xs">Al-Shifa Hospital</div>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">نقدم رعاية طبية متكاملة بأعلى معايير الجودة العالمية.</p>
            </div>
            {[
              { title: 'روابط سريعة', links: ['الرئيسية', 'الأقسام', 'أطباؤنا', 'المدونة'] },
              { title: 'خدماتنا', links: ['طوارئ 24/7', 'العيادات الخارجية', 'الجراحة', 'المختبرات'] },
              { title: 'تواصل', links: ['100 1549 150 20+', 'info@alshifa.com', 'مصر , شبين الكوم'] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="text-white font-semibold mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link, j) => (
                    <li key={j}><a href="#" className="text-slate-400 text-sm hover:text-white transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">© 2025 مستشفى الشفاء. جميع الحقوق محفوظة.</p>
            <div className="flex items-center gap-3">
              <button onClick={() => { setShowPatientLogin(true); setLoginError(''); }} className="text-slate-400 hover:text-white text-sm font-medium transition-all font-cairo">
                تسجيل دخول
              </button>
              <span className="text-white/20 text-xs">|</span>
              <button onClick={() => { setShowStaffPassModal(true); setStaffPassError(''); }} className="text-slate-400 hover:text-amber-400 text-sm font-medium transition-all font-cairo">
                بوابة الموظفين
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* ══════════════════════════════════════════════
           Sign Up Modal
         ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {showSignUp && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowSignUp(false)}>

            <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }} transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}>

              {/* Modal Header */}
              <div className="relative p-6 pb-4" style={{ background: 'linear-gradient(135deg, #1e3a5f, #2563eb)' }}>
                <div className="absolute top-0 left-0 right-0 bottom-0 rounded-t-3xl overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-20" style={{ background: '#60a5fa' }} />
                  <div className="absolute -bottom-5 -left-5 w-32 h-32 rounded-full blur-2xl opacity-20" style={{ background: '#14b8a6' }} />
                </div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center">
                      <UserPlus className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-white font-black text-xl">إنشاء حساب مريض</h2>
                      <p className="text-blue-200 text-xs mt-0.5">مستشفى الشفاء — Al-Shifa Hospital</p>
                    </div>
                  </div>
                  <button onClick={() => setShowSignUp(false)}
                    className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4" dir="rtl">

                {/* Error Banner */}
                <AnimatePresence>
                  {signUpError && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />{signUpError}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ─ Required Fields ─ */}
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">البيانات الأساسية *</p>

                {/* Name */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">الاسم الكامل <span className="text-red-500">*</span></label>
                  <input type="text" value={form.name} onChange={e => setField('name', e.target.value)}
                    placeholder="محمد أحمد"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all" />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">البريد الإلكتروني <span className="text-red-500">*</span></label>
                  <input type="email" value={form.email} onChange={e => setField('email', e.target.value)}
                    placeholder="example@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all" dir="ltr" />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">رقم الهاتف</label>
                  <input type="tel" value={form.phone} onChange={e => setField('phone', e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all" dir="ltr" />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">كلمة المرور <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={form.password}
                      onChange={e => setField('password', e.target.value)}
                      placeholder="6 أحرف على الأقل"
                      className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all" dir="ltr" />
                    <button type="button" onClick={() => setShowPassword(p => !p)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Password strength bar */}
                  {form.password && (
                    <div className="mt-2 flex gap-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="flex-1 h-1 rounded-full transition-all"
                          style={{ background: form.password.length >= i*2 ? (form.password.length >= 8 ? '#16a34a' : '#f59e0b') : '#e2e8f0' }} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">تأكيد كلمة المرور <span className="text-red-500">*</span></label>
                  <input type="password" value={form.confirmPassword}
                    onChange={e => setField('confirmPassword', e.target.value)}
                    placeholder="أعد كتابة كلمة المرور"
                    className={`w-full px-4 py-3 rounded-xl border bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all ${
                      form.confirmPassword && form.confirmPassword !== form.password ? 'border-red-300 ring-1 ring-red-300' : 'border-slate-200'
                    }`} dir="ltr" />
                  {form.confirmPassword && form.confirmPassword !== form.password && (
                    <p className="text-red-500 text-xs mt-1">كلمتا المرور غير متطابقتين</p>
                  )}
                </div>

                {/* ─ Optional Medical Fields ─ */}
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide pt-2">بيانات إضافية (اختياري)</p>

                <div className="grid grid-cols-2 gap-3">
                  {/* National ID */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">الرقم القومي</label>
                    <input type="text" value={form.nationalId} onChange={e => setField('nationalId', e.target.value)}
                      placeholder="14 رقم"
                      className="w-full px-3 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent" dir="ltr" />
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">تاريخ الميلاد</label>
                    <input type="date" value={form.dateOfBirth} onChange={e => setField('dateOfBirth', e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent" />
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">الجنس</label>
                  <div className="relative">
                    <select value={form.gender} onChange={e => setField('gender', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent">
                      <option value="">اختر الجنس</option>
                      <option value="MALE">ذكر</option>
                      <option value="FEMALE">أنثى</option>
                    </select>
                    <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Terms note */}
                <p className="text-slate-400 text-xs text-center pt-1">
                  بإنشاء حسابك توافق على سياسة الخصوصية وشروط الاستخدام
                </p>

                {/* Submit Button */}
                <button onClick={handleSignUp} disabled={submitting}
                  className="w-full py-4 rounded-2xl text-white font-black text-base transition-all disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #1e40af, #2563eb, #0ea5e9)' }}>
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      جاري إنشاء الحساب...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <UserPlus className="w-5 h-5" />إنشاء حسابي الآن
                    </span>
                  )}
                </button>

                {/* Login link */}
                <p className="text-center text-slate-500 text-sm font-cairo">
                  لديك حساب بالفعل؟{' '}
                  <button type="button" onClick={() => { setShowSignUp(false); setShowPatientLogin(true); setLoginError(''); }}
                    className="text-blue-600 font-bold hover:underline">سجّل دخولك هنا</button>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Patient Login Modal */}
        {showPatientLogin && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800">
              
              {/* Modal Header */}
              <div className="relative p-6 pb-4 bg-slate-900 border-b border-white/10 overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-20" style={{ background: '#2563eb' }} />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center">
                      <HeartPulse className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-white font-black text-xl">تسجيل دخول المرضى</h2>
                      <p className="text-blue-200 text-xs mt-0.5 font-cairo">مستشفى الشفاء — Al-Shifa Hospital</p>
                    </div>
                  </div>
                  <button onClick={() => setShowPatientLogin(false)}
                    className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <form onSubmit={handlePatientLogin} className="p-6 space-y-4" dir="rtl">
                
                {/* Error Banner */}
                {loginError && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm font-medium">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="font-cairo text-xs">{loginError}</span>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 font-cairo">البريد الإلكتروني</label>
                  <input type="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                    placeholder="example@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all" dir="ltr" />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 font-cairo">كلمة المرور</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} required value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all" dir="ltr" />
                    <button type="button" onClick={() => setShowPassword(p => !p)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button type="submit" disabled={loginSubmitting}
                  className="w-full py-4 rounded-2xl text-white font-black text-base transition-all disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden font-cairo"
                  style={{ background: 'linear-gradient(135deg, #1e40af, #2563eb, #0ea5e9)' }}>
                  {loginSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      جاري الدخول...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      تسجيل دخول
                    </span>
                  )}
                </button>

                {/* Register Link */}
                <p className="text-center text-slate-500 text-sm pt-2 font-cairo">
                  ليس لديك حساب مريض؟{' '}
                  <button type="button" onClick={() => { setShowPatientLogin(false); setShowSignUp(true); }}
                    className="text-blue-600 font-bold hover:underline">أنشئ حساباً الآن</button>
                </p>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Staff Password Modal */}
        {showStaffPassModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800">
              
              {/* Modal Header */}
              <div className="relative p-6 pb-4 bg-slate-900 border-b border-white/10 overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-20" style={{ background: '#d97706' }} />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-white font-black text-xl font-cairo">بوابة الموظفين — الدخول الآمن</h2>
                      <p className="text-amber-200 text-xs mt-0.5 font-cairo">خاص بالطاقم الطبي والإداري للمستشفى</p>
                    </div>
                  </div>
                  <button onClick={() => setShowStaffPassModal(false)}
                    className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleStaffSubmit} className="p-6 space-y-4" dir="rtl">
                
                {/* Error Banner */}
                {staffPassError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span className="font-cairo text-xs">{staffPassError}</span>
                  </div>
                )}

                {/* Password Input */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 font-cairo">رمز الدخول الموحد للموظفين (Unified Staff Access Code)</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} required value={staffPassword} onChange={e => setStaffPassword(e.target.value)}
                      placeholder="أدخل رمز الدخول الموحد"
                      className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" dir="ltr" />
                    <button type="button" onClick={() => setShowPassword(p => !p)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button type="submit"
                  className="w-full py-4 rounded-2xl text-white font-black text-base transition-all relative overflow-hidden font-cairo"
                  style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}>
                  التحقق والدخول للبوابة
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}