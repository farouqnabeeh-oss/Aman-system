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
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-brand text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-brand/10">
            <User size={16} /> Profile
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-brand font-black text-[10px] uppercase tracking-widest transition-all">
            <Shield size={16} /> Security
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-brand font-black text-[10px] uppercase tracking-widest transition-all">
            <Settings size={16} /> Preferences
          </button>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="glass-card p-8 bg-white border-slate-100 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 mb-8 flex items-center gap-3 uppercase tracking-tight">
                <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
                    <User size={18} />
                </div>
                Personal Identity
            </h3>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Input label="First Name" value={user?.firstName || ''} readOnly />
                <Input label="Last Name" value={user?.lastName || ''} readOnly />
              </div>
              <Input label="Email Address" value={user?.email || ''} readOnly />
              <Input label="Role" value={user?.role || ''} readOnly />
            </div>
          </div>

          <div className="glass-card p-8 bg-white border-slate-100 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 mb-8 flex items-center gap-3 uppercase tracking-tight">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
                    <Settings size={18} />
                </div>
                Interface Preferences
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Display Language</label>
                <div className="flex gap-4">
                  <button onClick={() => setLanguage('en')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${language === 'en' ? 'bg-brand text-white shadow-lg shadow-brand/10' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>English</button>
                  <button onClick={() => setLanguage('ar')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${language === 'ar' ? 'bg-brand text-white shadow-lg shadow-brand/10' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>العربية</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
