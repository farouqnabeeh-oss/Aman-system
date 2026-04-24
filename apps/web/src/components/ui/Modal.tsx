import { useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: ReactNode;
  icon?: ReactNode;
}

const sizes = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-2xl', xl: 'max-w-4xl' };

export function Modal({ open, onClose, title, subtitle, children, size = 'md', footer, icon }: ModalProps) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-8">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className={clsx(
              'relative w-full flex flex-col max-h-[90vh] rounded-3xl overflow-hidden z-10 border border-[var(--border)] shadow-2xl',
              sizes[size]
            )}
            style={{
              background: 'var(--bg-surface)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)] flex-shrink-0 bg-[var(--bg-glass)]">
                <div className="flex items-center gap-4">
                  {icon && (
                    <div className="w-10 h-10 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
                      {icon}
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-bold text-[var(--text-1)] leading-none">{title}</h2>
                    {subtitle && <p className="text-xs text-[var(--text-4)] mt-1.5 font-medium">{subtitle}</p>}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="btn-icon w-9 h-9 bg-[var(--bg-glass)] border-[var(--border)]"
                >
                  <X size={15} />
                </button>
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 no-scrollbar bg-[var(--bg-surface)]">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-[var(--border)] flex-shrink-0 bg-[var(--bg-glass)]">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
