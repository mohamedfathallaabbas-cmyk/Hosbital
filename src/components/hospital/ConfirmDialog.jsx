import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'تأكيد الحذف', danger = true }) {
  return (
    <Modal open={open} onClose={onClose} title="" size="sm">
      <div className="p-6 text-center">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${danger ? 'bg-red-100 dark:bg-red-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
          <AlertTriangle className={`w-8 h-8 ${danger ? 'text-red-500 dark:text-red-400' : 'text-amber-500 dark:text-amber-400'}`} />
        </div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 font-cairo">{title}</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-cairo"
          >
            إلغاء
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="flex-1 py-3 rounded-xl text-white font-semibold transition-all font-cairo"
            style={{ background: danger ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #f59e0b, #d97706)' }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}