'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, LayoutDashboard, FolderKanban, CheckSquare, 
  DollarSign, Zap, HeartPulse, BarChart2, Users, FileText, Activity
} from 'lucide-react';
import { globalSearch } from '@/lib/actions/system';
import { getNotifications } from '@/lib/actions/notifications';
import { useQuery } from '@tanstack/react-query';
import { useRef } from 'react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed, language } = useUIStore();
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const isRtl = language === 'ar';
  const lastUnreadCount = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data: notifyData } = useQuery({
    queryKey: ['global-notifications-check'],
    queryFn: async () => {
      const res = await getNotifications();
      return res.data;
    },
    refetchInterval: 10000,
    enabled: !!user
  });

  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
  }, []);

  useEffect(() => {
    if (notifyData?.unreadCount !== undefined && notifyData.unreadCount > lastUnreadCount.current) {
      audioRef.current?.play().catch(() => {});
    }
    if (notifyData?.unreadCount !== undefined) {
      lastUnreadCount.current = notifyData.unreadCount;
    }
  }, [notifyData?.unreadCount]);

  const [isHydrated, setIsHydrated] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && !user) {
      logout();
      router.push('/login');
    }
  }, [user, logout, router, isHydrated]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setSearching(true);
        const res = await globalSearch(searchQuery);
        if (res.success) setSearchResults(res.data || []);
        setSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  if (!isHydrated) {
    return <div className="h-screen w-full flex items-center justify-center bg-white">
      <Activity className="animate-spin text-brand" size={40} />
    </div>;
  }

  const navigationItems = [
    { label: isRtl ? 'لوحة التحكم' : 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: isRtl ? 'المشاريع' : 'Projects', path: '/projects', icon: FolderKanban },
    { label: isRtl ? 'المهام' : 'Tasks', path: '/tasks', icon: CheckSquare },
    { label: isRtl ? 'الرواتب' : 'Payroll', path: '/payroll', icon: DollarSign },
    { label: isRtl ? 'الموارد البشرية' : 'HR', path: '/hr', icon: Users },
    { label: isRtl ? 'التقارير' : 'Reports', path: '/reports', icon: BarChart2 },
    { label: isRtl ? 'السجل العام' : 'Audit Logs', path: '/audit', icon: Activity },
  ];

  const filteredNav = navigationItems.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[#f8fafc]" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div
        className={`relative flex flex-col flex-1 min-w-0 z-20 transition-all duration-350 ease-[cubic-bezier(0.4,0,0.2,1)] ${isRtl
          ? (sidebarCollapsed ? 'lg:mr-[72px]' : 'lg:mr-[256px]')
          : (sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[256px]')
          }`}
      >
        {/* Topbar */}
        <Topbar onOpenCommand={() => setCmdOpen(true)} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-[#f8fafc]">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="p-5 lg:p-8 max-w-[1800px] mx-auto pb-20"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global Search Modal */}
      <AnimatePresence>
        {cmdOpen && (
          <div 
            className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[15vh] bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setCmdOpen(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
              onClick={e => e.stopPropagation()}
            >
              {/* Search Input */}
              <div className="relative flex items-center p-4 border-b border-slate-100">
                <Search size={20} className="text-slate-400 ml-2" />
                <input 
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isRtl ? 'ابحث عن أي شيء...' : 'Search for anything...'}
                  className="w-full px-4 py-2 bg-transparent text-slate-900 placeholder:text-slate-400 outline-none text-lg font-medium"
                />
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  ESC
                </div>
              </div>

              {/* Search Results / Suggestions */}
              <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar bg-white">
                <div className="space-y-6">
                  {/* Real Search Results */}
                  {searchResults.length > 0 && (
                    <div>
                      <h3 className="text-[10px] font-black text-brand uppercase tracking-[0.2em] mb-3 px-2">
                        {isRtl ? 'نتائج البحث' : 'Search Results'}
                      </h3>
                      <div className="space-y-1">
                        {searchResults.map((result) => (
                          <button
                            key={`${result.type}-${result.id}`}
                            onClick={() => { router.push(result.url); setCmdOpen(false); setSearchQuery(''); }}
                            className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-left group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand/10 group-hover:text-brand transition-all">
                                {result.type === 'USER' && <Users size={18} />}
                                {result.type === 'PROJECT' && <FolderKanban size={18} />}
                                {result.type === 'TASK' && <CheckSquare size={18} />}
                                {result.type === 'TRANSACTION' && <DollarSign size={18} />}
                              </div>
                              <div>
                                <p className="text-sm font-black text-slate-900 group-hover:text-brand transition-colors">{result.title}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{result.subtitle}</p>
                              </div>
                            </div>
                            <span className="px-2 py-1 rounded-lg bg-slate-100 text-[9px] font-black text-slate-500 uppercase tracking-tighter group-hover:bg-brand group-hover:text-white transition-all">
                              {result.type}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Navigation Section */}
                  <div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-2">
                      {isRtl ? 'التنقل السريع' : 'Quick Navigation'}
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {filteredNav.map((item) => (
                        <button
                          key={item.path}
                          onClick={() => { router.push(item.path); setCmdOpen(false); setSearchQuery(''); }}
                          className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-left group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-brand/5 flex items-center justify-center text-brand group-hover:bg-brand group-hover:text-white transition-all">
                            <item.icon size={16} />
                          </div>
                          <span className="text-xs font-bold text-slate-700">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recently Visited / Common Actions */}
                  <div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-2">
                      {isRtl ? 'إجراءات شائعة' : 'Common Actions'}
                    </h3>
                    <div className="space-y-1">
                      {[
                        { label: isRtl ? 'إضافة مهمة جديدة' : 'Add New Task', icon: Zap, path: '/tasks' },
                        { label: isRtl ? 'طلب إجازة جديدة' : 'New Leave Request', icon: HeartPulse, path: '/hr' },
                        { label: isRtl ? 'إضافة موظف' : 'Add Employee', icon: Users, path: '/users' },
                        { label: isRtl ? 'إنشاء فاتورة' : 'Create Invoice', icon: FileText, path: '/finance' },
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => { router.push(item.path); setCmdOpen(false); }}
                          className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-brand/5 border border-transparent hover:border-brand/10 transition-all text-left group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-brand transition-colors">
                            <item.icon size={16} />
                          </div>
                          <span className="text-xs font-bold text-slate-600 group-hover:text-brand">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                    <kbd className="px-1.5 py-0.5 rounded border border-slate-200 bg-white">↑↓</kbd> {isRtl ? 'للتنقل' : 'to navigate'}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                    <kbd className="px-1.5 py-0.5 rounded border border-slate-200 bg-white">↵</kbd> {isRtl ? 'للاختيار' : 'to select'}
                  </div>
                </div>
                <p className="text-[10px] font-black text-brand uppercase tracking-widest">Sahab Unified Node</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
