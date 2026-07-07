import { useState } from 'react';
import { User, Mail, Phone, Shield, CheckCircle, RefreshCw, Key } from 'lucide-react';
import api from '../../lib/api';

const ROLE_MAP = {
  ADMIN: 'مدير النظام',
  FINANCIAL_MANAGER: 'المدير المالي',
  RECEPTION: 'موظف استقبال',
  PHARMACIST: 'صيدلي المستشفى',
  LAB_TECH: 'فني معمل تحاليل',
  DOCTOR: 'طبيب معالج',
  NURSE: 'ممرض',
  STAFF: 'موظف إداري',
};

export default function ProfilePage() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('hospitalUser') || '{}');
    } catch {
      return {};
    }
  });

  const [phone, setPhone] = useState(user.phone || '');
  const [updating, setUpdating] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const roleName = ROLE_MAP[user.role?.toUpperCase()] || user.role || 'موظف';

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMsg({ text: '', type: '' });
    setUpdating(true);
    try {
      const updatedUser = { ...user, phone };
      sessionStorage.setItem('hospitalUser', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setMsg({ text: 'تم تحديث بيانات الملف الشخصي بنجاح ✓', type: 'success' });
    } catch (err) {
      setMsg({ text: 'فشل تحديث البيانات، يرجى المحاولة لاحقاً', type: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto fade-in" dir="rtl">
      <div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-1 font-cairo">الملف الشخصي</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-cairo">عرض وإدارة معلومات حسابك الأساسية والمهنية</p>
      </div>

      {msg.text && (
        <div className={`p-4 rounded-xl border font-bold text-sm font-cairo ${
          msg.type === 'success' ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400'
        }`}>
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Card: Avatar + Main Stats */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 text-center shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-white text-3xl font-black mx-auto mb-4 shadow-xl"
            style={{ background: 'linear-gradient(135deg, #14b8a6, #2563eb)' }}>
            {user.name?.charAt(0) || 'م'}
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white font-cairo">{user.name || 'مستخدم غير معروف'}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-cairo mb-4">{roleName}</p>
          
          <div className="flex justify-center gap-2">
            <span className="badge-success flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-bold font-cairo">
              <CheckCircle className="w-3.5 h-3.5" />
              حساب نشط
            </span>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 mt-6 pt-6 text-right space-y-3">
            <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
              <Shield className="w-4 h-4 text-slate-400" />
              <span className="font-cairo">الصلاحيات:</span>
              <span className="font-bold text-slate-700 dark:text-slate-200 font-cairo">وصول مخصص للموظف</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
              <Key className="w-4 h-4 text-slate-400" />
              <span className="font-cairo">معرف المستخدم:</span>
              <span className="font-mono font-bold text-slate-700 dark:text-slate-200">#{user.id || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Right Card: Fields Edit Form */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <h4 className="font-bold text-slate-900 dark:text-white mb-6 font-cairo text-lg">البيانات الشخصية والمهنية</h4>
          
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Name */}
              <div>
                <label className="block text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1.5 font-cairo">الاسم الكامل</label>
                <div className="relative">
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"><User className="w-4 h-4" /></span>
                  <input type="text" disabled value={user.name || ''}
                    className="w-full pr-11 pl-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500 text-sm outline-none font-cairo cursor-not-allowed" />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1.5 font-cairo">البريد الإلكتروني</label>
                <div className="relative">
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"><Mail className="w-4 h-4" /></span>
                  <input type="email" disabled value={user.email || ''}
                    className="w-full pr-11 pl-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500 text-sm outline-none font-mono cursor-not-allowed" />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1.5 font-cairo">دور الحساب المهني</label>
                <div className="relative">
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"><Shield className="w-4 h-4" /></span>
                  <input type="text" disabled value={roleName}
                    className="w-full pr-11 pl-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500 text-sm outline-none font-cairo cursor-not-allowed" />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-slate-600 dark:text-slate-300 text-xs font-semibold mb-1.5 font-cairo">رقم الهاتف</label>
                <div className="relative">
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"><Phone className="w-4 h-4" /></span>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full pr-11 pl-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-all font-mono" />
                </div>
              </div>

            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
              <button type="submit" disabled={updating}
                className="px-6 py-3 rounded-xl text-white font-bold text-sm transition-all hover:scale-[1.02] flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #14b8a6, #2563eb)' }}>
                {updating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                <span className="font-cairo">حفظ التغييرات</span>
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
