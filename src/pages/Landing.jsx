import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Phone, Mail, MapPin, Star, ChevronLeft, ChevronRight,
  Activity, Users, Stethoscope, Calendar, Award, Clock,
  Shield, Zap, CheckCircle, ArrowLeft, Menu, X,
  Microscope, Brain, Bone, Eye, Baby, HeartPulse, Building2, Layers
} from 'lucide-react';
import BlogScroll from '../components/hospital/BlogScroll';
import BookingSection from '../components/hospital/BookingSection';

const departments = [
  { icon: Heart, name: 'قسم القلب', desc: 'رعاية متكاملة لأمراض القلب والأوعية الدموية', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  { icon: Brain, name: 'الأعصاب', desc: 'تشخيص وعلاج أمراض الجهاز العصبي', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  { icon: Bone, name: 'العظام والمفاصل', desc: 'جراحة العظام وعلاج الإصابات', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  { icon: Eye, name: 'طب العيون', desc: 'فحص وعلاج أمراض العيون والبصريات', color: '#14b8a6', bg: 'rgba(20,184,166,0.1)' },
  { icon: Baby, name: 'طب الأطفال', desc: 'رعاية شاملة لصحة الأطفال والمواليد', color: '#ec4899', bg: 'rgba(236,72,153,0.1)' },
  { icon: Microscope, name: 'المختبرات', desc: 'تحاليل دقيقة بأحدث الأجهزة التشخيصية', color: '#2563eb', bg: 'rgba(37,99,235,0.1)' },
];

const doctors = [
  { name: 'د. أحمد السيد', specialty: 'استشاري قلب وأوعية دموية', rating: 4.9, patients: 1250, img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face' },
  { name: 'د. سارة العمري', specialty: 'استشارية أعصاب', rating: 4.8, patients: 980, img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face' },
  { name: 'د. محمد الحارثي', specialty: 'استشاري جراحة عظام', rating: 4.9, patients: 1450, img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&h=300&fit=crop&crop=face' },
  { name: 'د. فاطمة الزهراء', specialty: 'استشارية طب أطفال', rating: 5.0, patients: 2100, img: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=300&h=300&fit=crop&crop=face' },
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
  { title: 'تمارين يومية لتقوية العظام والمفاصل', category: 'رياضة وصحة', date: '8 أبريل 2025', img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop', readTime: '4 دقائق' },
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
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeReview, setActiveReview] = useState(0);

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
            <Link to="/role-select" className="text-white/90 hover:text-white px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-white/10">
              تسجيل الدخول
            </Link>
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
              <div className="flex gap-3 pt-2">
                <Link to="/role-select" className="flex-1 text-center text-white border border-white/30 py-2 rounded-xl text-sm">دخول</Link>
                <a href="#contact" className="flex-1 text-center btn-primary-hospital text-sm">احجز الآن</a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero */}
      <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-dark-gradient" />
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: `url(https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=1920&fit=crop)`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
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
              <img src="https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=600&h=700&fit=crop" alt="Medical Team" className="w-full object-cover" />
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
      <BookingSection />

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
              { title: 'تواصل', links: ['+966 11 234 5678', 'info@alshifa.com', 'الرياض، السعودية'] },
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
            <div className="flex gap-4">
              <Link to="/role-select" className="btn-primary-hospital text-sm py-2 px-6">دخول النظام</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}