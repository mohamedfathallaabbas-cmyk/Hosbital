import { useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, Stethoscope, Building2, Calendar,
  Bed, FileText, BookOpen, Activity, Settings, LogOut,
  HeartPulse, PlusCircle, Pencil, Trash2, Search,
  Menu, X, BarChart3, Eye, Phone, MapPin, CheckCircle,
  Clock, User, UserCog, Tag, Image, AlignLeft, Bell
} from 'lucide-react';
import Topbar from '../../components/hospital/Topbar';
import AdminHome from "./components/AdminHome";
import DoctorsManagement from "./components/DoctorsManagement";
import PatientsManagement from "./components/PatientsManagement";
import DepartmentsManagement from "./components/DepartmentsManagement";
import BedsManagement from "./components/BedsManagement";
import BlogManagement from "./components/BlogManagement";
import EmployeesManagement from "./components/EmployeesManagement";
import RequestsManagement from "./components/RequestsManagement";
import ProfilePage from "../../components/hospital/ProfilePage";

const sidebarLinks = [
  { icon: LayoutDashboard, label: 'لوحة التحكم', path: '/admin/dashboard' },
  { icon: Stethoscope, label: 'إدارة الأطباء', path: '/admin/doctors' },
  { icon: UserCog, label: 'إدارة الموظفين', path: '/admin/employees' },
  { icon: Building2, label: 'إدارة الأقسام', path: '/admin/departments' },
  { icon: Bed, label: 'إدارة الأسرة', path: '/admin/beds' },
  { icon: BookOpen, label: 'المدونة والمحتوى', path: '/admin/blog' },
  { icon: Bell, label: 'الطلبات والموافقات', path: '/admin/requests' },
];

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);
  const user = (() => { try { return JSON.parse(sessionStorage.getItem('hospitalUser') || '{}'); } catch { return {}; } })();
  const handleLogout = () => { sessionStorage.removeItem('hospitalUser'); sessionStorage.removeItem('staff_portal_authorized'); navigate('/'); };
  const currentPrefix = location.pathname.startsWith('/manager') ? '/manager' : '/admin';
  const isFinance = user.role === 'FINANCIAL_MANAGER';
  const filteredSidebarLinks = sidebarLinks.filter(link => {
    if (isFinance) {
      return ['/admin/dashboard', '/admin/doctors', '/admin/employees'].includes(link.path);
    }
    return true;
  });
  const links = [
    ...filteredSidebarLinks.map(link => ({
      ...link,
      path: link.path.replace('/admin', currentPrefix)
    })),
    { icon: User, label: 'الملف الشخصي', path: `${currentPrefix}/profile` }
  ];
  const currentTitle = links.find(l => l.path === location.pathname)?.label || 'لوحة التحكم';

  return (
    <div className="flex min-h-screen font-cairo" dir="rtl">
      <aside className="sidebar hidden md:flex flex-col" style={{ width: '260px' }}>
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}><HeartPulse className="w-5 h-5 text-white" /></div>
          <div><div className="text-white font-bold text-sm">مستشفى الشفاء</div><div className="text-slate-400 text-xs">الإدارة التشغيلية</div></div>
        </div>
        <div className="mx-4 mt-4 p-3 rounded-xl" style={{ background: 'rgba(139,92,246,0.15)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>{user.name?.charAt(0) || 'إ'}</div>
            <div><div className="text-white text-sm font-semibold truncate max-w-36">{user.name}</div><div className="text-purple-300 text-xs">{user.role === 'FINANCIAL_MANAGER' ? 'المدير المالي' : 'مسؤول النظام'}</div></div>
          </div>
        </div>
        <nav className="flex-1 p-3 mt-2">
          {links.map((item, i) => {
            const isActive = location.pathname === item.path;
            return <Link key={i} to={item.path} className={`sidebar-item ${isActive ? 'active' : ''}`} style={isActive ? { borderColor: '#8b5cf6' } : {}}><item.icon className="w-5 h-5" style={{ color: isActive ? '#8b5cf6' : undefined }} /><span>{item.label}</span></Link>;
          })}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout} className="sidebar-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"><LogOut className="w-5 h-5" /><span>خروج</span></button>
        </div>
      </aside>
      <button onClick={() => setMobileMenu(true)} className="fixed top-4 right-4 z-50 md:hidden w-11 h-11 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}><Menu className="w-5 h-5 text-white" /></button>
      <main className="flex-1 min-h-screen" style={{ background: 'linear-gradient(135deg, #faf5ff, #eff6ff, #f0fdfa)', marginRight: '260px' }} id="admin-main">
        <Topbar title={currentTitle} roleColor="#8b5cf6" />
        <Routes>
          <Route index element={<AdminHome />} />
          <Route path="dashboard" element={<AdminHome />} />
          <Route path="doctors" element={<DoctorsManagement />} />
          {!isFinance && (
            <>
              <Route path="departments" element={<DepartmentsManagement />} />
              <Route path="beds" element={<BedsManagement />} />
              <Route path="blog" element={<BlogManagement />} />
              <Route path="requests" element={<RequestsManagement />} />
            </>
          )}
          <Route path="employees" element={<EmployeesManagement />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="*" element={<AdminHome />} />
        </Routes>
      </main>
      <style>{`@media (max-width: 768px) { #admin-main { margin-right: 0 !important; } }`}</style>
    </div>
  );
}
