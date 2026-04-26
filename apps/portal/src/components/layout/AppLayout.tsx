'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { motion, AnimatePresence } from 'framer-motion';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed, language } = useUIStore();
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const isRtl = language === 'ar';

  useEffect(() => {
    if (!user) {
      logout();
      router.push('/login');
    }
  }, [user, logout, router]);

  // Placeholder for command palette state
  const [cmdOpen, setCmdOpen] = useState(false);

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[#0B0F1A]" dir={isRtl ? 'rtl' : 'ltr'}>
      
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
        className={`relative flex flex-col flex-1 min-w-0 z-10 transition-all duration-350 ease-[cubic-bezier(0.4,0,0.2,1)] ${isRtl
          ? (sidebarCollapsed ? 'lg:mr-[72px]' : 'lg:mr-[256px]')
          : (sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[256px]')
          }`}
      >
        {/* Topbar */}
        <Topbar onOpenCommand={() => setCmdOpen(true)} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-[#0B0F1A]">
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

      {/* Command Palette Placeholder */}
      {cmdOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={() => setCmdOpen(false)}>
          <div className="w-full max-w-lg glass-card p-10 text-center" onClick={e => e.stopPropagation()}>
            <p className="text-white text-lg font-black uppercase tracking-tight">
               {isRtl ? 'البحث غير متوفر حالياً' : 'Search Unavailable'}
            </p>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-3">
              {isRtl ? 'سيتم تفعيل محرك البحث الشامل قريباً · اضغط ESC للإغلاق' : 'Global Search Engine will be activated soon · Press ESC to close'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
