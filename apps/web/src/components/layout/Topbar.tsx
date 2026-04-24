import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, Bell, Search, LogOut, User, ChevronDown, Languages, Command, Zap, Sun, Moon } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/ui.store';
import { useAuthStore } from '../../store/auth.store';
import api from '../../lib/axios';
import { clsx } from 'clsx';

const TRANSLATIONS = {
  ar: { search: 'بحث سريع...', profile: 'الملف الشخصي', logout: 'تسجل خروج', cmd: 'بحث' },
  en: { search: 'Quick search...', profile: 'Profile', logout: 'Sign Out', cmd: 'Search' }
};

export function Topbar({ onOpenCommand }: { onOpenCommand?: () => void }) {
  const { toggleSidebar, language, setLanguage, theme, toggleTheme } = useUIStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isRtl = language === 'ar';
  const t = TRANSLATIONS[language];

  const { data: notifData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => api.get<any>('/notifications/unread-count').then(r => r.data.data),
    refetchInterval: 30_000,
  });

  const logoutMutation = useMutation({
    mutationFn: () => api.post('/auth/logout'),
    onSettled: () => { logout(); navigate('/login'); },
  });

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); onOpenCommand?.(); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onOpenCommand]);

  const unread = notifData?.count ?? 0;

  return (
    <header className="relative h-16 flex items-center justify-between px-4 lg:px-6 flex-shrink-0 z-40 transition-all border-b border-[var(--border)]"
      style={{ background: 'var(--bg-topbar)', backdropFilter: 'blur(20px)' }}>

      <div className="flex items-center gap-3">
        <button onClick={toggleSidebar} className="lg:hidden btn-icon bg-[var(--bg-glass)] border-[var(--border)] text-[var(--text-2)] hover:text-brand">
          <Menu size={18} />
        </button>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-glass)] border border-[var(--border)] text-xs">
          <Zap size={12} className="text-brand" />
          <span className="capitalize text-[var(--text-3)] font-medium">
            {location.pathname.split('/').filter(Boolean).join(' / ') || 'dashboard'}
          </span>
        </div>
      </div>

      <button
        onClick={onOpenCommand}
        className="flex items-center gap-3 w-full max-w-xs mx-4 px-4 py-2.5 rounded-xl text-sm text-[var(--text-3)] cursor-pointer transition-all duration-200 hover:border-brand/30 bg-[var(--bg-glass)] border border-[var(--border)]"
      >
        <Search size={14} className="text-[var(--text-4)] flex-shrink-0" />
        <span className="flex-1 text-left text-xs font-medium">{t.search}</span>
        <div className="hidden sm:flex items-center gap-1">
          <kbd className="h-5 px-1.5 rounded-md text-[10px] font-mono text-[var(--text-4)] flex items-center gap-0.5 bg-[var(--bg-glass)] border border-[var(--border)]">
            <Command size={9} />K
          </kbd>
        </div>
      </button>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="btn-icon bg-[var(--bg-glass)] border-[var(--border)]"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-500" />}
        </button>

        <button
          onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
          className="btn-icon bg-[var(--bg-glass)] border-[var(--border)] text-[var(--text-2)] text-xs font-bold"
        >
          <Languages size={15} />
        </button>

        <Link to="/notifications" className="btn-icon relative bg-[var(--bg-glass)] border-[var(--border)] text-[var(--text-2)]">
          <Bell size={16} />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center px-0.5 border-2 border-[var(--bg-surface)]">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Link>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(o => !o)}
            className={clsx(
              'flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl transition-all duration-200',
              'border text-left',
              dropdownOpen
                ? 'bg-brand/10 border-brand/30'
                : 'bg-[var(--bg-glass)] border-[var(--border)] hover:border-brand/30'
            )}
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand to-brand-light flex items-center justify-center text-white font-bold text-xs shadow-md flex-shrink-0">
              {user?.firstName?.[0]}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-[var(--text-1)] leading-none">{user?.firstName}</p>
              <p className="text-[10px] text-[var(--text-3)] mt-0.5 uppercase tracking-wider font-medium">{user?.role?.replace('_', ' ')}</p>
            </div>
            <ChevronDown size={12} className={clsx('text-[var(--text-4)] transition-transform', dropdownOpen && 'rotate-180')} />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className={clsx(
                  'absolute top-full mt-2 w-56 rounded-2xl p-2 z-50 shadow-2xl bg-[var(--bg-surface)] border border-[var(--border)]',
                  isRtl ? 'left-0' : 'right-0'
                )}
              >
                <div className="px-3 py-2 mb-2 bg-[var(--bg-glass)] rounded-xl">
                  <p className="text-xs font-bold text-[var(--text-1)]">{user?.firstName} {user?.lastName}</p>
                  <p className="text-[10px] text-[var(--text-3)] mt-1 truncate font-medium">{user?.email}</p>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[var(--text-2)] hover:bg-brand/5 hover:text-brand transition-all text-sm font-medium"
                >
                  <User size={14} /> {t.profile}
                </Link>
                <button
                  onClick={() => logoutMutation.mutate()}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-500 hover:bg-rose-500/5 transition-all text-sm font-medium"
                >
                  <LogOut size={14} /> {t.logout}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
