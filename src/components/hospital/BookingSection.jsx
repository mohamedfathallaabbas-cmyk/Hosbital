import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, Calendar, CheckCircle, User, CreditCard, Stethoscope, ChevronDown } from 'lucide-react';
import api from '../../lib/api';

const timeSlots = ['08:00 ص', '08:30 ص', '09:00 ص', '09:30 ص', '10:00 ص', '10:30 ص', '11:00 ص', '11:30 ص', '12:00 م', '01:00 م', '02:00 م', '03:00 م', '04:00 م', '05:00 م'];
const visitTypes = ['كشف جديد', 'متابعة', 'استشارة', 'إجراء طبي'];

const contactInfo = [
  { icon: Phone, label: 'الهاتف', value: '19123', color: '#2563eb' },
  { icon: Mail, label: 'البريد الإلكتروني', value: 'info@alshifa-hospital.com', color: '#14b8a6' },
  { icon: MapPin, label: 'العنوان', value: 'العاصمة الادارية، مصر', color: '#f59e0b' },
  { icon: Clock, label: 'ساعات العمل', value: 'طوارئ: 24/7 | عيادات: 8ص - 8م', color: '#ef4444' },
];

export default function BookingSection({ onNeedLogin }) {
  const [form, setForm] = useState({ name: '', nationalId: '', phone: '', email: '', dob: '', gender: '', department: '', doctor: '', date: '', time: '', visitType: '', insurance: '', notes: '' });
  const [submitted, setSubmitted] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [errors, setErrors] = useState({});
  const [dbDepts, setDbDepts] = useState([]);
  const [dbDoctors, setDbDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/admin/departments')
      .then(res => setDbDepts(res.data || []))
      .catch(err => console.error('Failed to load departments:', err));
  }, []);

  useEffect(() => {
    if (form.department) {
      api.get('/admin/doctors')
        .then(res => {
          const list = res.data || [];
          const filtered = list.filter(d => d.departmentId === parseInt(form.department));
          setDbDoctors(filtered);
        })
        .catch(err => console.error('Failed to load doctors:', err));
    } else {
      setDbDoctors([]);
    }
  }, [form.department]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = true;
    if (!/^\d{14}$/.test(form.nationalId)) e.nationalId = true;
    if (!/^01[01259]\d{8}$/.test(form.phone)) e.phone = true;
    if (!form.gender) e.gender = true;
    if (!form.department) e.department = true;
    if (!form.date) e.date = true;
    if (!form.time) e.time = true;
    if (!form.visitType) e.visitType = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const storedUser = sessionStorage.getItem('hospitalUser');
    if (storedUser) {
      setLoading(true);
      try {
        const res = await api.post('/appointments', {
          departmentId: form.department,
          doctorId: form.doctor ? parseInt(form.doctor) : undefined,
          date: form.date,
          timeSlot: form.time,
          type: form.visitType === 'كشف جديد' ? 'CHECKUP' : 'FOLLOWUP'
        });
        const apptId = res.data?.appointment?.id || res.data?.id || Date.now().toString().slice(-6);
        setBookingRef(`HSP-${apptId}`);
        setSubmitted(true);
      } catch (err) {
        alert(err.response?.data?.error || 'حدث خطأ أثناء حجز الموعد. يرجى التحقق من المدخلات.');
      } finally {
        setLoading(false);
      }
    } else {
      // If patient is not logged in, store the booking as pending and prompt login
      localStorage.setItem('pending_booking', JSON.stringify(form));
      alert('يرجى تسجيل الدخول أو إنشاء حساب مريض أولاً لحفظ وتأكيد حجزك في النظام.');
      if (onNeedLogin) onNeedLogin();
    }
  };

  const handleReset = () => { setSubmitted(false); setForm({ name: '', nationalId: '', phone: '', email: '', dob: '', gender: '', department: '', doctor: '', date: '', time: '', visitType: '', insurance: '', notes: '' }); setErrors({}); };

  const today = new Date().toISOString().split('T')[0];

  return (
    <section id="contact" className="py-24 bg-hospital-gradient-soft">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-16">

        {/* Left info */}
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-4" style={{ background: 'rgba(37,99,235,0.1)', color: '#2563eb' }}>
            <Calendar className="w-4 h-4" /> حجز موعد
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-3">احجز موعدك الآن</h2>
          <p className="text-slate-500 mb-8 text-lg">أسرع وأسهل طريقة لحجز موعدك مع أفضل الأطباء</p>

          {contactInfo.map((item, i) => (
            <div key={i} className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}15` }}>
                <item.icon className="w-5 h-5" style={{ color: item.color }} />
              </div>
              <div>
                <div className="text-slate-500 text-xs">{item.label}</div>
                <div className="text-slate-800 font-semibold text-sm">{item.value}</div>
              </div>
            </div>
          ))}

          <div className="mt-8 p-5 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(20,184,166,0.08))', border: '1px solid rgba(37,99,235,0.12)' }}>
            <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><CheckCircle className="w-5 h-5 text-teal-500" />مميزات الحجز الإلكتروني</h4>
            <ul className="space-y-2 text-slate-600 text-sm">
              {['تأكيد فوري برقم مرجعي', 'تذكير قبل الموعد بـ 24 ساعة', 'إمكانية إلغاء أو تعديل الموعد', 'لا حاجة للانتظار في طابور الاستقبال'].map((t, i) => (
                <li key={i} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0" />{t}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right form */}
        <div className="glass-card rounded-3xl p-8 shadow-xl">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center py-8">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: 'linear-gradient(135deg, #059669, #14b8a6)' }}>
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">تم تأكيد الحجز! ✓</h3>
                <p className="text-slate-500 mb-4">رقمك المرجعي للحجز</p>
                <div className="text-3xl font-black mb-6 py-3 px-6 rounded-2xl inline-block" style={{ background: 'linear-gradient(135deg, #2563eb, #14b8a6)', color: 'white', letterSpacing: '2px' }}>{bookingRef}</div>
                <div className="bg-slate-50 rounded-2xl p-4 text-right mb-6 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">الاسم:</span><span className="font-semibold">{form.name}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">القسم:</span><span className="font-semibold">{dbDepts.find(d => String(d.id) === String(form.department))?.name || '—'}</span></div>
                  {form.doctor && <div className="flex justify-between"><span className="text-slate-500">الطبيب:</span><span className="font-semibold">{dbDoctors.find(d => String(d.id) === String(form.doctor))?.user?.name || '—'}</span></div>}
                  <div className="flex justify-between"><span className="text-slate-500">الموعد:</span><span className="font-semibold">{form.date} — {form.time}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">نوع الزيارة:</span><span className="font-semibold">{form.visitType}</span></div>
                </div>
                <p className="text-slate-400 text-xs mb-6">احتفظ بالرقم المرجعي لمتابعة حجزك</p>
                <button onClick={handleReset} className="btn-primary-hospital w-full py-3 flex items-center justify-center gap-2"><Calendar className="w-4 h-4" />حجز موعد جديد</button>
              </motion.div>
            ) : (
              <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-xl font-black text-slate-900 mb-5 flex items-center gap-2"><Calendar className="w-5 h-5 text-blue-600" />نموذج حجز موعد</h3>

                <div className="p-4 rounded-2xl bg-blue-50/50 space-y-3">
                  <p className="text-xs font-bold text-blue-700 flex items-center gap-1"><User className="w-3.5 h-3.5" />البيانات الشخصية</p>
                  <input className={`input-hospital ${errors.name ? 'border-red-400 bg-red-50' : ''}`} placeholder="الاسم رباعي *" value={form.name} onChange={e => set('name', e.target.value)} />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input className={`input-hospital ${errors.nationalId ? 'border-red-400 bg-red-50' : ''}`} placeholder="الرقم القومي (14 رقم) *" maxLength={14} value={form.nationalId} onChange={e => set('nationalId', e.target.value.replace(/\D/g, ''))} />
                      {errors.nationalId && <p className="text-red-500 text-xs mt-1">الرقم القومي يجب أن يكون 14 رقم</p>}
                    </div>
                    <div>
                      <input className={`input-hospital ${errors.phone ? 'border-red-400 bg-red-50' : ''}`} placeholder="رقم الهاتف *" maxLength={11} value={form.phone} onChange={e => set('phone', e.target.value.replace(/\D/g, ''))} />
                      {errors.phone && <p className="text-red-500 text-xs mt-1">رقم الهاتف غير صالح (يجب أن يبدأ بـ 01 ويتكون من 11 رقم)</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input className="input-hospital" placeholder="البريد الإلكتروني" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
                    <input className="input-hospital" placeholder="تاريخ الميلاد" type="date" value={form.dob} onChange={e => set('dob', e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <select className={`input-hospital ${errors.gender ? 'border-red-400 bg-red-50' : ''}`} value={form.gender} onChange={e => set('gender', e.target.value)}>
                      <option value="">الجنس *</option>
                      <option value="MALE">ذكر</option>
                      <option value="FEMALE">أنثى</option>
                    </select>
                    <input className="input-hospital" placeholder="رقم التأمين (اختياري)" value={form.insurance} onChange={e => set('insurance', e.target.value)} />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-teal-50/50 space-y-3">
                  <p className="text-xs font-bold text-teal-700 flex items-center gap-1"><Stethoscope className="w-3.5 h-3.5" />بيانات الموعد</p>
                  <select className={`input-hospital ${errors.department ? 'border-red-400 bg-red-50' : ''}`} value={form.department} onChange={e => { set('department', e.target.value); set('doctor', ''); }}>
                    <option value="">اختر القسم الطبي *</option>
                    {dbDepts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                  <select className="input-hospital" value={form.doctor} onChange={e => set('doctor', e.target.value)} disabled={!form.department}>
                    <option value="">اختر الطبيب (اختياري)</option>
                    {dbDoctors.map(d => <option key={d.id} value={d.id}>{d.user?.name}</option>)}
                  </select>
                  <div className="grid grid-cols-2 gap-3">
                    <select className={`input-hospital ${errors.visitType ? 'border-red-400 bg-red-50' : ''}`} value={form.visitType} onChange={e => set('visitType', e.target.value)}>
                      <option value="">نوع الزيارة *</option>
                      {visitTypes.map(v => <option key={v}>{v}</option>)}
                    </select>
                    <input className={`input-hospital ${errors.date ? 'border-red-400 bg-red-50' : ''}`} type="date" min={today} value={form.date} onChange={e => set('date', e.target.value)} />
                  </div>
                  <div className="relative">
                    <select className={`input-hospital ${errors.time ? 'border-red-400 bg-red-50' : ''}`} value={form.time} onChange={e => set('time', e.target.value)}>
                      <option value="">اختر وقت الموعد *</option>
                      {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <textarea className="input-hospital h-20 resize-none" placeholder="ملاحظات إضافية أو وصف الحالة (اختياري)" value={form.notes} onChange={e => set('notes', e.target.value)} />
                </div>

                {Object.keys(errors).length > 0 && (
                  <p className="text-red-500 text-sm text-center">يرجى تعبئة الحقول المطلوبة بشكل صحيح</p>
                )}

                <button type="submit" className="btn-primary-hospital w-full py-4 text-base flex items-center justify-center gap-2">
                  <Calendar className="w-5 h-5" />
                  تأكيد الحجز
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}