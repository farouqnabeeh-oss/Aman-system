'use client';

import { PageHeader } from '@/components/ui/States';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { Input } from '@/components/ui/Input';
import { Settings, User, Shield, Key } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { language, setLanguage } = useUIStore();

  return (
    <div className="space-y-8 max-w-4xl">
      <PageHeader title="System Settings" description="Manage your preferences and security config" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 text-white font-medium text-sm">
            <User size={16} /> Profile
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white font-medium text-sm transition-all">
            <Shield size={16} /> Security
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white font-medium text-sm transition-all">
            <Settings size={16} /> Preferences
          </button>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="glass-card p-8">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><User size={18} /> Personal Info</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Input label="First Name" value={user?.firstName || ''} readOnly />
                <Input label="Last Name" value={user?.lastName || ''} readOnly />
              </div>
              <Input label="Email Address" value={user?.email || ''} readOnly />
              <Input label="Role" value={user?.role || ''} readOnly />
            </div>
          </div>

          <div className="glass-card p-8">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Settings size={18} /> Interface Defaults</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Language</label>
                <div className="flex gap-4">
                  <button onClick={() => setLanguage('en')} className={`px-4 py-2 rounded-lg text-sm font-bold ${language === 'en' ? 'bg-white text-black' : 'bg-white/5 text-slate-400 hover:text-white'}`}>English</button>
                  <button onClick={() => setLanguage('ar')} className={`px-4 py-2 rounded-lg text-sm font-bold ${language === 'ar' ? 'bg-white text-black' : 'bg-white/5 text-slate-400 hover:text-white'}`}>العربية</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
