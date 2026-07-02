import { useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

const DefaultFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
  </div>
);

// Map route prefixes to authorized roles
const PATH_ROLE_MAP = {
  '/patient': ['PATIENT'],
  '/doctor': ['DOCTOR'],
  '/reception': ['RECEPTION'],
  '/admin': ['ADMIN'],
  '/manager': ['MANAGER', 'FINANCIAL_MANAGER'],
  '/pharmacy': ['PHARMACIST'],
  '/lab': ['LAB_TECH'],
  '/nursing': ['NURSE'],
  '/staff': ['STAFF']
};

export default function ProtectedRoute({ fallback = <DefaultFallback /> }) {
  const { isAuthenticated, user, isLoadingAuth, authChecked, checkUserAuth } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!authChecked && !isLoadingAuth) {
      checkUserAuth();
    }
  }, [authChecked, isLoadingAuth, checkUserAuth]);

  if (isLoadingAuth || !authChecked) {
    return fallback;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  // Check role matching for the dashboard prefix
  const currentPath = location.pathname;
  const matchedPrefix = Object.keys(PATH_ROLE_MAP).find(prefix => currentPath.startsWith(prefix));

  if (matchedPrefix) {
    const allowedRoles = PATH_ROLE_MAP[matchedPrefix];
    const userRole = (user.role || '').toUpperCase();
    if (!allowedRoles.includes(userRole)) {
      // Direct unauthorized cross-role requests to their appropriate dashboard
      const roleDashboards = {
        'PATIENT': '/patient/dashboard',
        'DOCTOR': '/doctor/dashboard',
        'RECEPTION': '/reception/dashboard',
        'ADMIN': '/admin/dashboard',
        'MANAGER': '/manager/dashboard',
        'FINANCIAL_MANAGER': '/manager/dashboard',
        'PHARMACIST': '/pharmacy/dashboard',
        'LAB_TECH': '/lab/dashboard',
        'NURSE': '/nursing/dashboard',
        'STAFF': '/staff/dashboard'
      };
      const redirectPath = roleDashboards[userRole] || '/';
      return <Navigate to={redirectPath} replace />;
    }
  }

  return <Outlet />;
}
