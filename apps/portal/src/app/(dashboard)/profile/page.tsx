'use client';

import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { User, Mail, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const { language } = useUIStore();
  const isRtl = language === 'ar';

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
          {isRtl ? 'الملف الشخصي' : 'User Profile'}
        </h1>
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">
          {isRtl ? 'إدارة الهوية الرقمية والصلاحيات' : 'Manage Digital Identity and Permissions'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-1 glass-card p-6 flex flex-col items-center text-center"
        >
          <div className="w-24 h-24 rounded-3xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand font-black text-3xl mb-4 shadow-inner">
            {user.firstName?.[0]}{user.lastName?.[0]}
          </div>
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
            {user.firstName} {user.lastName}
          </h2>
          <div className="flex items-center gap-1.5 mt-2 px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg">
            <Shield size={12} className="text-brand" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              {user.role?.replace('_', ' ')}
            </span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="col-span-1 md:col-span-2 glass-card p-8"
        >
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Zap size={16} className="text-brand" />
            {isRtl ? 'بيانات الاعتماد' : 'Credentials'}
          </h3>

          <div className="space-y-6">
            <div className="flex items-start gap-4 pb-6 border-b border-slate-50">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 flex-shrink-0">
                <User size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  {isRtl ? 'المعرف الوظيفي' : 'Employee ID'}
                </p>
                <p className="text-sm font-bold text-slate-900">{user.id || 'EMP-001'}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 pb-6 border-b border-slate-50">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 flex-shrink-0">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  {isRtl ? 'البريد الإلكتروني' : 'Email Address'}
                </p>
                <p className="text-sm font-bold text-slate-900">{user.email}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 flex-shrink-0">
                <Shield size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  {isRtl ? 'حالة الحساب' : 'Account Status'}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">{user.status}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
