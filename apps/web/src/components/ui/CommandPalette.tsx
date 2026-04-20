import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, LayoutDashboard, Users, DollarSign, FolderKanban,
  CheckSquare, FileText, Bell, HeartPulse, CreditCard, ScrollText,
  ArrowRight, Command, Hash
} from 'lucide-react';
import { clsx } from 'clsx';
import { useUIStore } from '../../store/ui.store';

const PAGES = [
  { label: 'Dashboard',       labelAr: 'لوحة التحكم',       path: '/dashboard',     icon: LayoutDashboard, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { label: 'Team',             labelAr: 'الفريق',              path: '/users',         icon: Users,           color: 'text-violet-400', bg: 'bg-violet-500/10' },
  { label: 'Finance',          labelAr: 'المالية',             path: '/finance',       icon: DollarSign,      color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { label: 'Projects',         labelAr: 'المشاريع',            path: '/projects',      icon: FolderKanban,    color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { label: 'Tasks',            labelAr: 'المهام',              path: '/tasks',         icon: CheckSquare,     color: 'text-sky-400', bg: 'bg-sky-500/10' },
  { label: 'Files',            labelAr: 'الملفات',             path: '/files',         icon: FileText,        color: 'text-teal-400', bg: 'bg-teal-500/10' },
  { label: 'HR',               labelAr: 'الموارد البشرية',    path: '/hr',            icon: HeartPulse,      color: 'text-rose-400', bg: 'bg-rose-500/10' },
  { label: 'Payroll',          labelAr: 'الرواتب',             path: '/payroll',       icon: CreditCard,      color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { label: 'Notifications',    labelAr: 'التنبيهات',           path: '/notifications', icon: Bell,            color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { label: 'Audit Logs',       labelAr: 'السجلات',             path: '/audit-logs',    icon: ScrollText,      color: 'text-slate-400', bg: 'bg-slate-500/10' },
  { label: 'Profile',          labelAr: 'الملف الشخصي',       path: '/profile',       icon: Users,           color: 'text-pink-400', bg: 'bg-pink-500/10' },
];

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const { language } = useUIStore();
  const isRtl = language === 'ar';

  const filtered = PAGES.filter(p => {
    const q = query.toLowerCase();
    return p.label.toLowerCase().includes(q) || p.labelAr.includes(q) || p.path.includes(q);
  });

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelected(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
      if (e.key === 'Enter' && filtered[selected]) {
        navigate(filtered[selected].path);
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, filtered, selected, navigate, onClose]);

  const go = (path: string) => { navigate(path); onClose(); };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" dir={isRtl ? 'rtl' : 'ltr'}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="relative w-full max-w-lg mx-4 rounded-2xl overflow-hidden z-10"
            style={{
              background: 'linear-gradient(180deg, #111827 0%, #0d1421 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 40px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)',
            }}
          >
            {/* Glow top */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.07]">
              <Search size={16} className="text-slate-500 flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={isRtl ? 'ابحث عن صفحة أو خاصية...' : 'Search pages, features...'}
                className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
              />
              <kbd className="hidden sm:flex items-center h-6 px-2 rounded-lg text-[11px] text-slate-600 gap-1 font-mono flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto py-2 no-scrollbar">
              {filtered.length === 0 ? (
                <div className="py-10 text-center">
                  <Hash size={24} className="text-slate-700 mx-auto mb-2" />
                  <p className="text-sm text-slate-600">{isRtl ? 'لا توجد نتائج' : 'No results found'}</p>
                </div>
              ) : (
                filtered.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => go(item.path)}
                      onMouseEnter={() => setSelected(idx)}
                      className={clsx(
                        'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-100',
                        selected === idx ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'
                      )}
                    >
                      <div className={clsx('w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0', item.bg)}>
                        <Icon size={15} className={item.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{isRtl ? item.labelAr : item.label}</p>
                        <p className="text-xs text-slate-600 font-mono">{item.path}</p>
                      </div>
                      {selected === idx && (
                        <ArrowRight size={14} className="text-slate-500 flex-shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer tips */}
            <div className="flex items-center gap-4 px-4 py-2.5 border-t border-white/[0.05]"
              style={{ background: 'rgba(0,0,0,0.2)' }}>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                <kbd className="h-5 px-1.5 rounded font-mono text-[10px]"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>↑↓</kbd>
                {isRtl ? 'للتنقل' : 'Navigate'}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                <kbd className="h-5 px-1.5 rounded font-mono text-[10px]"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>↵</kbd>
                {isRtl ? 'للانتقال' : 'Go to page'}
              </div>
              <div className="ml-auto flex items-center gap-1 text-[11px] text-slate-600">
                <Command size={10} />K
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
