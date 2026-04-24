import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, Bell, Search, LogOut, User, ChevronDown, Languages, Command, Zap } from 'lucide-react';
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
  const { toggleSidebar, language, setLanguage } = useUIStore();
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

  // Close dropdown on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Keyboard shortcut
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); onOpenCommand?.(); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onOpenCommand]);

  const unread = notifData?.count ?? 0;

  return (
    <header className="relative h-16 flex items-center justify-between px-4 lg:px-6 flex-shrink-0 z-40"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(5,8,16,0.7)', backdropFilter: 'blur(20px)' }}>

      {/* Left: Mobile toggle + breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="lg:hidden btn-icon"
        >
          <Menu size={18} />
        </button>

        {/* Breadcrumb path pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.05] text-xs text-slate-500">
          <Zap size={12} className="text-blue-400" />
          <span className="capitalize text-slate-300 font-medium">
            {location.pathname.split('/').filter(Boolean).join(' / ') || 'dashboard'}
          </span>
        </div>
      </div>

      {/* Center: Search bar */}
      <button
        onClick={onOpenCommand}
        className="flex items-center gap-3 w-full max-w-xs mx-4 px-4 py-2.5 rounded-xl text-sm text-slate-500 cursor-pointer transition-all duration-200 hover:text-slate-300"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <Search size={14} className="text-slate-600 flex-shrink-0" />
        <span className="flex-1 text-left text-xs">{t.search}</span>
        <div className="hidden sm:flex items-center gap-1">
          <kbd className="h-5 px-1.5 rounded-md text-[10px] font-mono text-slate-600 flex items-center gap-0.5"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Command size={9} />K
          </kbd>
        </div>
      </button>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Language toggle */}
        <button
          onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
          className="btn-icon text-xs font-bold"
          title={language === 'ar' ? 'Switch to English' : 'تحويل للعربية'}
        >
          <Languages size={15} />
        </button>

        {/* Notifications */}
        <Link to="/notifications" className="btn-icon relative">
          <Bell size={16} />
          <AnimatePresence>
            {unread > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center px-0.5 border border-[#050810]"
              >
                {unread > 9 ? '9+' : unread}
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        {/* Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(o => !o)}
            className={clsx(
              'flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl transition-all duration-200',
              'border text-left',
              dropdownOpen
                ? 'bg-white/8 border-white/15'
                : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/6 hover:border-white/12'
            )}
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md flex-shrink-0">
              {user?.firstName?.[0]}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-white leading-none">{user?.firstName}</p>
              <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider">{user?.role?.replace('_', ' ')}</p>
            </div>
            <ChevronDown size={12} className={clsx('text-slate-500 transition-transform', dropdownOpen && 'rotate-180')} />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.97 }}
                transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                className={clsx(
                  'absolute top-full mt-2 w-52 rounded-xl p-1.5 z-50',
                  isRtl ? 'left-0' : 'right-0'
                )}
                style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
              >
                {/* User info header */}
                <div className="px-3 py-2 mb-1">
                  <p className="text-xs font-semibold text-white">{user?.firstName} {user?.lastName}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">{user?.email}</p>
                </div>
                <div className="divider mb-1" />

                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-all text-sm"
                >
                  <User size={14} /> {t.profile}
                </Link>
                <button
                  onClick={() => logoutMutation.mutate()}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-all text-sm"
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
