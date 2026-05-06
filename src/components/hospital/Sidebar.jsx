import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { HeartPulse, LogOut, ChevronRight, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar({ items, role, roleName, roleColor, roleGradient, RoleIcon }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = (() => {
    try { return JSON.parse(sessionStorage.getItem('hospitalUser') || '{}'); } catch { return {}; }
  })();

  const handleLogout = () => {
    sessionStorage.removeItem('hospitalUser');
    navigate('/role-select');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #2563eb, #14b8a6)' }}>
            <HeartPulse className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <div className="text-white font-bold text-sm leading-tight">مستشفى الشفاء</div>
              <div className="text-slate-400 text-xs">Al-Shifa</div>
            </div>
          )}
        </div>
      </div>

      {/* Role Badge */}
      {!collapsed && (
        <div className="mx-4 mt-4 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: roleGradient }}>
              <RoleIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-white text-sm font-semibold">{user.name || 'المستخدم'}</div>
              <div className="text-xs" style={{ color: roleColor }}>{roleName}</div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3 mt-2 overflow-y-auto">
        {items.map((section, si) => (
          <div key={si} className="mb-4">
            {!collapsed && section.label && (
              <div className="text-xs font-semibold text-slate-500 px-3 mb-2 uppercase tracking-wider">
                {section.label}
              </div>
            )}
            {section.links.map((item, ii) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={ii} to={item.path}
                  className={`sidebar-item ${isActive ? 'active' : ''}`}
                  style={isActive ? { borderColor: roleColor } : {}}>
                  <item.icon className="w-5 h-5 flex-shrink-0"
                    style={{ color: isActive ? roleColor : undefined }} />
                  {!collapsed && <span>{item.label}</span>}
                  {!collapsed && item.badge && (
                    <span className="mr-auto px-2 py-0.5 rounded-full text-xs font-bold text-white"
                      style={{ background: roleGradient }}>{item.badge}</span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <button onClick={handleLogout}
          className="sidebar-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>تسجيل الخروج</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sidebar hidden md:flex flex-col" style={{ width: collapsed ? '80px' : '280px' }}>
        {/* Collapse Toggle */}
        <button onClick={() => setCollapsed(!collapsed)}
          className="absolute -left-3 top-6 w-6 h-6 rounded-full flex items-center justify-center z-50 shadow-lg border border-slate-700"
          style={{ background: '#1e293b' }}>
          <ChevronRight className={`w-3 h-3 text-slate-400 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
        <SidebarContent />
      </aside>

      {/* Mobile toggle */}
      <button onClick={() => setMobileOpen(true)}
        className="fixed top-4 right-4 z-50 md:hidden w-11 h-11 rounded-xl flex items-center justify-center shadow-lg"
        style={{ background: 'linear-gradient(135deg, #2563eb, #14b8a6)' }}>
        <Menu className="w-5 h-5 text-white" />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              onClick={() => setMobileOpen(false)} />
            <motion.aside initial={{ x: 300 }} animate={{ x: 0 }} exit={{ x: 300 }}
              className="sidebar fixed right-0 top-0 z-50 w-72 md:hidden flex flex-col"
              style={{ width: '280px' }}>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}