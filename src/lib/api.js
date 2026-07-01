/**
 * axios instance مع JWT interceptor
 * استخدم هذا الـ instance بدل axios المباشر في كل الصفحات
 */
import axios from 'axios';
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// إضافة التوكن تلقائياً لكل request من hospitalUser في sessionStorage
api.interceptors.request.use((config) => {
  try {
    const stored = sessionStorage.getItem('hospitalUser');
    if (stored) {
      const user = JSON.parse(stored);
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
  } catch {}
  return config;
});

// معالجة أخطاء انتهاء الصلاحية
api.interceptors.response.use(
  (response) => {
    // Unroll paginated arrays so frontend array methods (.map, .filter, .length) do not crash
    // but preserve pagination metadata attached to the array object.
    if (response.data && Array.isArray(response.data.data) && response.data.total !== undefined) {
      const originalData = response.data;
      response.data = originalData.data;
      response.data.total = originalData.total;
      response.data.page = originalData.page;
      response.data.limit = originalData.limit;
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('hospitalUser');
      window.location.href = '/role-select';
    }
    return Promise.reject(error);
  }
);

export default api;

