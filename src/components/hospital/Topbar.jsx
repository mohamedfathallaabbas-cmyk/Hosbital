import { useState, useEffect } from 'react';
import { Search, Sun, Moon } from 'lucide-react';

export default function Topbar({ title, subtitle, roleColor }) {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

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


  return (
    <header className="topbar px-6 py-4 flex items-center justify-between gap-4">
      <div>
        <h1 className="text-xl font-black text-slate-900">{title}</h1>
        {subtitle && <p className="text-slate-500 text-sm mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">


        {/* Dark mode */}
        <button onClick={() => setDarkMode(!darkMode)}
          className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 hover:bg-slate-200 transition-colors text-slate-600">
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>


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