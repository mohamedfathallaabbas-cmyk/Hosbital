import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

// Hospital Pages
import Landing from './pages/Landing';
import RoleSelect from './pages/RoleSelect';
import PatientDashboard from './pages/patient/PatientDashboard';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import ReceptionDashboard from './pages/reception/ReceptionDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import PharmacyDashboard from './pages/pharmacy/PharmacyDashboard';
import LabDashboard from './pages/lab/LabDashboard';


const AuthenticatedApp = () => {
  const { isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl"
            style={{ background: 'linear-gradient(135deg, #2563eb, #14b8a6)' }}>
            <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin"
              style={{ borderWidth: '3px' }} />
          </div>
          <p className="text-slate-500 text-sm font-cairo">جاري تحميل النظام...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Landing & Auth */}
      <Route path="/" element={<Landing />} />
      <Route path="/role-select" element={<RoleSelect />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        {/* Patient Routes */}
        <Route path="/patient/*" element={<PatientDashboard />} />

        {/* Doctor Routes */}
        <Route path="/doctor/*" element={<DoctorDashboard />} />

        {/* Reception Routes */}
        <Route path="/reception/*" element={<ReceptionDashboard />} />

        {/* Admin Routes */}
        <Route path="/admin/*" element={<AdminDashboard />} />

        {/* Manager Routes */}
        <Route path="/manager/*" element={<ManagerDashboard />} />

        {/* Pharmacy Routes */}
        <Route path="/pharmacy/*" element={<PharmacyDashboard />} />

        {/* Lab Routes */}
        <Route path="/lab/*" element={<LabDashboard />} />

      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  useEffect(() => {
    if (localStorage.getItem('darkMode') === 'true') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App