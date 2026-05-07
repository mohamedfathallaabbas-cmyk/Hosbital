import { Routes, Route } from 'react-router-dom';
import Topbar from '../../components/hospital/Topbar';
import { useAuth } from '@/lib/AuthContext';

export default function NursingDashboard() {
  const { user } = useAuth();
  
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 font-cairo" dir="rtl">
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar title="لوحة التمريض" roleColor="#f43f5e" />
        <div className="flex-1 overflow-auto p-6">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm text-center">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">أهلاً بك، {user?.name}</h2>
            <p className="text-slate-500">تم تسجيل دخولك كطاقم تمريض. جاري تجهيز واجهة متابعة المنومين قريباً.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
