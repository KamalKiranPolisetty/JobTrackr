import { AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
}: ConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.15 }}
          className="relative z-10 w-full max-w-md bg-white dark:bg-[#242120] border border-gray-100 dark:border-[#3a3733] rounded-2xl shadow-xl p-6 overflow-hidden"
        >
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>

            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-900 dark:text-[#e8e3d9]">
                {title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-[#9c9891] mt-1.5 leading-relaxed">
                {message}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex justify-end gap-2.5 mt-5 pt-4 border-t border-gray-100 dark:border-[#3a3733]">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              {cancelText}
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              {confirmText}
            </Button>

          </div>
        </motion.div>

      </div>
    </AnimatePresence>
  );
};
