import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  language: 'ar' | 'en';
  theme: 'dark' | 'light';
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  toggleCollapsed: () => void;
  setLanguage: (lang: 'ar' | 'en') => void;
  toggleTheme: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      sidebarCollapsed: false,
      language: 'ar',
      theme: 'dark',
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      toggleCollapsed: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setLanguage: (lang) => set({ language: lang }),
      toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.classList.toggle('light', newTheme === 'light');
        return { theme: newTheme };
      }),
    }),
    {
      name: 'ems-ui',
    }
  )
);
