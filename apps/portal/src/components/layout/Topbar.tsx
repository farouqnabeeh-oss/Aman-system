'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, Bell, Search, LogOut, User, ChevronDown, Languages, Command, Zap, HeartPulse, LogIn, CheckSquare } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { logout as logoutAction } from '@/lib/actions/auth';
import { getNotifications } from '@/lib/actions/notifications';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import { selfAttendance, getSelfAttendanceToday } from '@/lib/actions/hr';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const TRANSLATIONS = {
  ar: {
    search: 'بحث سريع...',
    profile: 'الملف الشخصي',
    logout: 'تسجيل خروج',
    cmd: 'بحث',
    checkIn: 'تسجيل الدخول',
    checkOut: 'تسجيل الخروج',
    leave: 'طلب إجازة',
    mandatoryCheckIn: 'تسجيل الحضور إلزامي',
    mandatoryDesc: 'الرجاء تسجيل حضورك للبدء في استخدام النظام اليوم.',
    checkedOut: 'تم الانصراف',
  },
  en: {
    search: 'Quick search...',
    profile: 'Profile',
    logout: 'Sign Out',
    cmd: 'Search',
    checkIn: 'Check In',
    checkOut: 'Check Out',
    leave: 'Request Leave',
    mandatoryCheckIn: 'Mandatory Check-in Required',
    mandatoryDesc: 'Please check in to start your work day and gain access to the system.',
    checkedOut: 'Checked Out',
  },
};

export function Topbar({ onOpenCommand }: { onOpenCommand?: () => void }) {
  const { toggleSidebar, language, setLanguage } = useUIStore();
  const { user, logout: clearStore } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isRtl = language === 'ar';
  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;

  const { data: notifyData } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: async () => {
      const res = await getNotifications();
      return res.data;
    },
    refetchInterval: 10000,
    enabled: !!user,
  });

  const { data: attendanceData, isLoading: attLoading } = useQuery({
    queryKey: ['self-attendance-today', user?.id],
    queryFn: async () => {
      const res = await getSelfAttendanceToday();
      return res.data ?? null;
    },
    enabled: !!user,
    refetchInterval: 60000, // refresh every minute
  });

  const unread = notifyData?.unreadCount || 0;
  const queryClient = useQueryClient();

  const attendanceMutation = useMutation({
    mutationFn: (action: 'IN' | 'OUT') => selfAttendance(action),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['self-attendance-today'] });
        queryClient.invalidateQueries({ queryKey: ['attendance'] });
        toast.success(isRtl ? 'تم تسجيل العملية بنجاح' : 'Attendance updated');
      } else {
        toast.error(res.error || 'Failed');
      }
    },
  });

  const handleLogout = async () => {
    try {
      const result = await logoutAction();
      if (result.success) {
        clearStore();
        toast.success(isRtl ? 'تم تسجيل الخروج بنجاح' : 'Logged out successfully');
        router.push('/login');
      }
    } catch (err) {
      toast.error('Identity node error during disconnect');
    }
  };

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenCommand?.();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onOpenCommand]);

  const hasCheckedIn = !!attendanceData?.checkIn;
  const hasCheckedOut = !!attendanceData?.checkOut;
  const showMandatoryOverlay = !attLoading && !hasCheckedIn && !!user;

  return (
    <>
      {/* ── Mandatory Check-in Full-screen Overlay ── */}
      <AnimatePresence>
        {showMandatoryOverlay && (
          <motion.div
            key="checkin-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl border border-slate-100"
            >
              {/* Icon */}
              <div className="w-20 h-20 bg-brand/10 text-brand rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-brand/5">
                <LogIn size={34} />
              </div>

              {/* Greeting */}
              <p className="text-[10px] font-black text-brand uppercase tracking-[0.3em] mb-1">
                {isRtl ? `مرحباً، ${user?.firstName}` : `Welcome, ${user?.firstName}`}
              </p>
              <h2 className="text-2xl font-black text-slate-900 mb-3 uppercase tracking-tight leading-tight">
                {t.mandatoryCheckIn}
              </h2>
              <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">
                {t.mandatoryDesc}
              </p>

              {/* Check-in button */}
              <button
                onClick={() => attendanceMutation.mutate('IN')}
                disabled={attendanceMutation.isPending}
                className="w-full py-4 rounded-xl bg-brand text-white text-sm font-black uppercase tracking-widest hover:bg-brand/90 active:scale-[0.98] transition-all shadow-lg shadow-brand/20 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {attendanceMutation.isPending ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  <>
                    <Zap size={16} />
                    {t.checkIn}
                  </>
                )}
              </button>

              {/* Logout fallback */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-all"
                >
                  {t.logout}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Topbar ── */}
      <header className="relative h-16 flex items-center justify-between px-4 lg:px-6 flex-shrink-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">

        {/* Left: Mobile toggle + breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-brand"
          >
            <Menu size={18} />
          </button>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-500">
            <Zap size={12} className="text-brand" />
            <span className="capitalize font-black tracking-tight uppercase text-slate-700">
              {(pathname || '').split('/').filter(Boolean).join(' / ') || 'dashboard'}
            </span>
          </div>
        </div>

        {/* Center: Search bar */}
        <button
          onClick={onOpenCommand}
          className="flex items-center gap-3 w-full max-w-xs mx-4 px-4 py-2.5 rounded-xl text-slate-500 cursor-pointer transition-all duration-200 hover:text-brand hover:bg-slate-50 border border-slate-200 group"
        >
          <Search size={14} className="text-slate-400 flex-shrink-0 group-hover:text-brand" />
          <span className="flex-1 text-left text-[10px] font-black uppercase tracking-widest">{t.search}</span>
          <div className="hidden sm:flex items-center gap-1">
            <kbd className="h-5 px-1.5 rounded-md text-[9px] font-mono text-slate-400 flex items-center gap-0.5 border border-slate-200 bg-slate-50">
              <Command size={9} />K
            </kbd>
          </div>
        </button>

        {/* Attendance & Leave Quick Access */}
        <div className="hidden md:flex items-center gap-2">
          {!hasCheckedIn ? (
            <button
              onClick={() => attendanceMutation.mutate('IN')}
              disabled={attendanceMutation.isPending}
              className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all flex items-center gap-2"
            >
              <Zap size={12} /> {t.checkIn}
            </button>
          ) : !hasCheckedOut ? (
            <button
              onClick={() => attendanceMutation.mutate('OUT')}
              disabled={attendanceMutation.isPending}
              className="px-4 py-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 text-[10px] font-black uppercase tracking-widest hover:bg-amber-100 transition-all flex items-center gap-2"
            >
              <LogOut size={12} /> {t.checkOut}
            </button>
          ) : (
            <span className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <CheckSquare size={12} /> {t.checkedOut}
            </span>
          )}

          <button
            onClick={() => router.push('/hr')}
            className="px-4 py-2 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all flex items-center gap-2"
          >
            <HeartPulse size={12} /> {t.leave}
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <button
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-brand transition-all"
            title={language === 'ar' ? 'Switch to English' : 'تحويل للعربية'}
          >
            <Languages size={15} />
          </button>

          {/* Notifications */}
          <Link href="/notifications" className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-brand transition-all">
            <Bell size={16} />
            <AnimatePresence>
              {unread > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center px-0.5 border-2 border-white"
                >
                  {unread > 9 ? '9+' : unread}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {/* Profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className={clsx(
                'flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl transition-all duration-200 border text-left',
                dropdownOpen
                  ? 'bg-brand/5 border-brand/20'
                  : 'bg-slate-50 border-slate-200 hover:border-brand/20'
              )}
            >
              <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center text-white font-black text-xs shadow-md shadow-brand/10 flex-shrink-0">
                {user?.firstName?.[0]}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-black text-slate-900 leading-none uppercase tracking-tight">{user?.firstName}</p>
                <p className="text-[9px] font-black text-slate-400 mt-0.5 uppercase tracking-widest">{user?.role?.replace('_', ' ')}</p>
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
                    'absolute top-full mt-2 w-52 rounded-2xl p-2 z-50 bg-white border border-slate-200 shadow-2xl',
                    isRtl ? 'left-0' : 'right-0'
                  )}
                >
                  <div className="px-3 py-2 mb-1">
                    <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{user?.firstName} {user?.lastName}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5 truncate uppercase tracking-widest">{user?.email}</p>
                  </div>

                  <div className="h-px bg-slate-100 mb-1" />

                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-500 hover:bg-brand/5 hover:text-brand transition-all text-xs font-black uppercase tracking-widest"
                  >
                    <User size={14} /> {t.profile}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all text-xs font-black uppercase tracking-widest"
                  >
                    <LogOut size={14} /> {t.logout}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>
    </>
  );
}
