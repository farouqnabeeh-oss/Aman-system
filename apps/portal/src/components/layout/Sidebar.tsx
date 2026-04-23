'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, DollarSign, FolderKanban,
  CheckSquare, FileText, Bell, HeartPulse, CreditCard,
  ScrollText, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { clsx } from 'clsx';
import { useQuery } from '@tanstack/react-query';

const TRANSLATIONS = {
  ar: {
    dashboard: 'لوحة التحكم', users: 'الفريق', finance: 'المالية',
    projects: 'المشاريع', tasks: 'المهام', files: 'الملفات',
    hr: 'الموارد البشرية', payroll: 'الرواتب',
    notifications: 'التنبيهات', auditLogs: 'السجلات', brand: 'نظام أمان',
  },
  en: {
    dashboard: 'Dashboard', users: 'Team', finance: 'Finance',
    projects: 'Projects', tasks: 'Tasks', files: 'Files',
    hr: 'Human Resources', payroll: 'Payroll',
    notifications: 'Notifications', auditLogs: 'Audit Logs', brand: 'AMAN System',
  }
};

const NAV_ITEMS = (t: any) => [
  { path: '/dashboard', label: t.dashboard, icon: LayoutDashboard, color: 'text-blue-400', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE'] },
  { path: '/users', label: t.users, icon: Users, color: 'text-violet-400', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] },
  { path: '/finance', label: t.finance, icon: DollarSign, color: 'text-emerald-400', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] },
  { path: '/projects', label: t.projects, icon: FolderKanban, color: 'text-amber-400', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE'] },
  { path: '/tasks', label: t.tasks, icon: CheckSquare, color: 'text-sky-400', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE'] },
  { path: '/files', label: t.files, icon: FileText, color: 'text-teal-400', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE'] },
  { path: '/hr', label: t.hr, icon: HeartPulse, color: 'text-rose-400', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE'] },
  { path: '/payroll', label: t.payroll, icon: CreditCard, color: 'text-indigo-400', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] },
  { path: '/notifications', label: t.notifications, icon: Bell, color: 'text-orange-400', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE'] },
  { path: '/audit-logs', label: t.auditLogs, icon: ScrollText, color: 'text-slate-400', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] },
];

export function Sidebar() {
  const { sidebarOpen, sidebarCollapsed, setSidebarOpen, toggleCollapsed, language } = useUIStore();
  const user = useAuthStore((s) => s.user);
  const pathname = usePathname();
  const isRtl = language === 'ar';
  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;
  
  const items = NAV_ITEMS(t).filter(item => {
    if (!user) return false;
    return item.roles.includes(user.role);
  });

  // Placeholder for unread count, we can integrate the API once routes are ported
  const unreadByQuery = 0; 
  const unread = unreadByQuery;

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 72 : 256 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      className={clsx(
        'fixed top-0 bottom-0 z-50 flex flex-col',
        'border-white/[0.06]',
        isRtl ? 'right-0 border-l' : 'left-0 border-r',
        'transition-transform duration-300 lg:translate-x-0',
        isRtl
          ? (sidebarOpen ? 'translate-x-0' : 'translate-x-full')
          : (sidebarOpen ? 'translate-x-0' : '-translate-x-full'),
      )}
      style={{ background: 'linear-gradient(180deg, #0a0e1a 0%, #060810 100%)' }}
    >
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />

      {/* Top ambient */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none" />

      {/* Brand */}
      <div className={clsx(
        'relative flex items-center h-16 px-4 border-b border-white/[0.05] flex-shrink-0',
        sidebarCollapsed ? 'justify-center' : 'gap-3'
      )}>
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-xl overflow-hidden ring-1 ring-white/10">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -inset-1 bg-blue-500/20 blur-md rounded-xl -z-10" />
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-sm font-bold text-white tracking-tight leading-none">{t.brand}</p>
              <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-widest">Unified Node v1.0</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 px-3 py-4 space-y-0.5 overflow-y-auto no-scrollbar">
        {items.map((item, idx) => {
          const active = pathname.startsWith(item.path);
          const Icon = item.icon;
          const isNotif = item.path === '/notifications';

          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
            >
              <Link
                href={item.path}
                onClick={() => setSidebarOpen(false)}
                title={sidebarCollapsed ? item.label : undefined}
                className={clsx(
                  'nav-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-slate-500 hover:text-slate-200 cursor-pointer',
                  active && 'bg-white/5 border border-white/5 text-white',
                  sidebarCollapsed && 'justify-center px-0'
                )}
              >
                <span className={clsx('nav-icon flex-shrink-0 transition-colors', active ? item.color : 'text-slate-600 group-hover:text-slate-400')}>
                  <Icon size={18} />
                </span>
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 text-sm truncate"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {/* Notification badge */}
                {isNotif && unread > 0 && (
                  <AnimatePresence>
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={clsx(
                        'flex-shrink-0 h-5 min-w-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center px-1',
                        sidebarCollapsed && 'absolute top-1 right-1 h-4 min-w-4 text-[8px]'
                      )}
                    >
                      {unread > 9 ? '9+' : unread}
                    </motion.span>
                  </AnimatePresence>
                )}
                {/* Active indicator */}
                {active && !sidebarCollapsed && (
                  <div className={clsx(
                    'absolute flex-shrink-0 w-1 h-6 rounded-full',
                    isRtl ? 'left-0' : 'right-0',
                    'bg-gradient-to-b from-sky-400 to-blue-600'
                  )} />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Profile footer */}
      <div className="relative border-t border-white/[0.05] p-3 flex-shrink-0">
        <Link
          href="/profile"
          className={clsx(
            'flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all group',
            sidebarCollapsed && 'justify-center'
          )}
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/30 to-indigo-600/30 border border-white/10 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-xs font-semibold text-white truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-[10px] text-slate-500 truncate uppercase tracking-wider">{user?.role?.replace('_', ' ')}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleCollapsed}
        className={clsx(
          'hidden lg:flex absolute top-[60px] w-5 h-5 rounded-full items-center justify-center z-10',
          'bg-slate-800 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all',
          isRtl ? 'left-[-10px]' : 'right-[-10px]'
        )}
      >
        {sidebarCollapsed
          ? (isRtl ? <ChevronLeft size={10} /> : <ChevronRight size={10} />)
          : (isRtl ? <ChevronRight size={10} /> : <ChevronLeft size={10} />)
        }
      </button>
    </motion.aside>
  );
}
