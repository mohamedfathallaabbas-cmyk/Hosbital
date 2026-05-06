import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const colors = {
  success: 'linear-gradient(135deg, #059669, #14b8a6)',
  error: 'linear-gradient(135deg, #dc2626, #ef4444)',
  warning: 'linear-gradient(135deg, #d97706, #f59e0b)',
  info: 'linear-gradient(135deg, #2563eb, #3b82f6)',
};

export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-6 left-6 z-[200] flex flex-col gap-3 pointer-events-none" dir="rtl">
      <AnimatePresence>
        {toasts.map(t => {
          const Icon = icons[t.type] || Info;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: -60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -60, scale: 0.9 }}
              className="flex items-center gap-3 px-5 py-4 rounded-2xl text-white shadow-2xl pointer-events-all min-w-72"
              style={{ background: colors[t.type], backdropFilter: 'blur(10px)' }}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1 text-sm font-semibold font-cairo">{t.message}</span>
              <button onClick={() => removeToast(t.id)} className="opacity-70 hover:opacity-100">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = window.__toastState || [[], () => {}];

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  return { addToast };
}