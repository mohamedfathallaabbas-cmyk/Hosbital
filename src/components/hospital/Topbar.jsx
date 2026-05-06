import { useState, useEffect } from 'react';
import { Bell, Search, Sun, Moon } from 'lucide-react';

export default function Topbar({ title, subtitle, roleColor }) {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  const user = (() => {
    try { return JSON.parse(sessionStorage.getItem('hospitalUser') || '{}'); } catch { return {}; }
  })();

  const notifications = [
    { text: 'موعد جديد تم تأكيده', time: 'منذ 5 دقائق', unread: true },
    { text: 'تقرير يومي جاهز للمراجعة', time: 'منذ 30 دقيقة', unread: true },
    { text: 'تم تحديث بيانات المريض', time: 'منذ ساعة', unread: false },
  ];

  return (
    <header className="topbar px-6 py-4 flex items-center justify-between gap-4">
      <div>
        <h1 className="text-xl font-black text-slate-900">{title}</h1>
        {subtitle && <p className="text-slate-500 text-sm mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-400 text-sm min-w-56">
          <Search className="w-4 h-4 flex-shrink-0" />
          <span>بحث...</span>
        </div>

        {/* Dark mode */}
        <button onClick={() => setDarkMode(!darkMode)}
          className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 hover:bg-slate-200 transition-colors text-slate-600">
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button onClick={() => setNotifOpen(!notifOpen)}
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 hover:bg-slate-200 transition-colors text-slate-600 relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />
          </button>

          {notifOpen && (
            <div className="absolute left-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-slate-900">الإشعارات</span>
                <span className="badge-info">2 جديد</span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.map((n, i) => (
                  <div key={i} className={`px-5 py-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${n.unread ? 'bg-blue-50/50' : ''}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.unread ? 'bg-blue-500' : 'bg-slate-300'}`} />
                      <div>
                        <p className="text-slate-700 text-sm font-medium">{n.text}</p>
                        <p className="text-slate-400 text-xs mt-1">{n.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 text-center">
                <button className="text-blue-600 text-sm font-semibold hover:underline">عرض كل الإشعارات</button>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-2 cursor-pointer group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md"
            style={{ background: roleColor ? `linear-gradient(135deg, ${roleColor}, ${roleColor}cc)` : 'linear-gradient(135deg, #2563eb, #14b8a6)' }}>
            {user.name ? user.name.charAt(0) : 'م'}
          </div>
          <div className="hidden md:block">
            <div className="text-slate-900 text-sm font-semibold">{user.name || 'المستخدم'}</div>
          </div>
        </div>
      </div>
    </header>
  );
}