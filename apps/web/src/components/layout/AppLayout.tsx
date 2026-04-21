import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CommandPalette } from '../ui/CommandPalette';
import { useUIStore } from '../../store/ui.store';
import { motion, AnimatePresence } from 'framer-motion';

export function AppLayout() {
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed, language } = useUIStore();
  const location = useLocation();
  const isRtl = language === 'ar';
  const [cmdOpen, setCmdOpen] = useState(false);

  return (
    <div className="flex h-[100dvh] overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Ambient background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="mesh-orb w-[600px] h-[600px] top-[-200px] left-[-100px] bg-blue-900/30" />
        <div className="mesh-orb w-[400px] h-[400px] bottom-[-150px] right-[-80px] bg-indigo-900/20" />
        <div className="mesh-orb w-[300px] h-[300px] top-1/2 left-1/3 bg-teal-900/10" style={{ animation: 'none' }} />
      </div>

      {/* Grid overlay */}
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none z-0" />

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
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
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="p-5 lg:p-8 max-w-[1800px] mx-auto pb-20"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Command Palette */}
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}
