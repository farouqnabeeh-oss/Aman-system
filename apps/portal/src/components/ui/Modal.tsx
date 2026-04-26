'use client';

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
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className={clsx(
              'relative w-full flex flex-col max-h-[90vh] rounded-3xl overflow-hidden z-10 bg-white shadow-2xl border border-slate-100',
              sizes[size]
            )}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 flex-shrink-0">
                <div className="flex items-center gap-3">
                  {icon && (
                    <div className="w-9 h-9 rounded-xl bg-brand/5 border border-brand/10 flex items-center justify-center text-brand">
                      {icon}
                    </div>
                  )}
                  <div>
                    <h2 className="text-base font-black text-slate-900 leading-none uppercase tracking-tight">{title}</h2>
                    {subtitle && <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{subtitle}</p>}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-brand hover:bg-brand/5 transition-all"
                >
                  <X size={15} />
                </button>
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 flex-shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
