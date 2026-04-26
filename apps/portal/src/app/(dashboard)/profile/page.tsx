'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { User, Mail, Shield, Zap, Lock, Save, Camera, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/ui/States';
import { Input } from '@/components/ui/Input';
import { updateUser } from '@/lib/actions/users';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const { language } = useUIStore();
  const isRtl = language === 'ar';
  
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    password: '',
    confirmPassword: ''
  });

  if (!user) return null;

  const handleUpdate = async () => {
    if (form.password && form.password !== form.confirmPassword) {
        return toast.error(isRtl ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
    }
    
    setSaving(true);
    const res = await updateUser(user.id, {
        firstName: form.firstName,
        lastName: form.lastName,
        ...(form.password ? { password: form.password } : {})
    });
    
    if (res.success) {
        toast.success(isRtl ? 'تم تحديث الملف الشخصي' : 'Profile updated successfully');
        setUser({ ...user, firstName: form.firstName, lastName: form.lastName });
        setForm({ ...form, password: '', confirmPassword: '' });
    } else {
        toast.error(res.error || 'Update failed');
    }
    setSaving(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-8">
      <PageHeader 
        title={isRtl ? 'إدارة الهوية الرقمية' : 'Identity Management'} 
        description={isRtl ? 'تحكم في بياناتك الشخصية وإعدادات الأمان الخاصة بك' : 'Control your personal data and secure access protocols'}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Info Card */}
        <div className="lg:col-span-4 space-y-6">
            <div className="glass-card !p-10 flex flex-col items-center text-center border-white/5 bg-white/[0.02] relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-brand shadow-[0_0_15px_rgba(28,147,178,0.5)]" />
                
                <div className="relative mb-8">
                    <div className="w-28 h-28 rounded-[2.5rem] bg-white text-black flex items-center justify-center font-black text-4xl shadow-2xl group-hover:scale-105 transition-transform">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                    <button className="absolute bottom-0 right-0 w-10 h-10 rounded-2xl bg-brand text-white flex items-center justify-center border-4 border-[#0B0F1A] hover:bg-brand/90 transition-all">
                        <Camera size={16} />
                    </button>
                </div>

                <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">
                    {user.firstName} {user.lastName}
                </h2>
                
                <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black text-brand bg-brand/10 px-4 py-1.5 rounded-xl uppercase tracking-[0.2em] border border-brand/20">
                        {user.role?.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                        {user.position || 'Department Personnel'}
                    </span>
                </div>

                <div className="w-full grid grid-cols-2 gap-4 mt-10 pt-10 border-t border-white/5">
                    <div className={isRtl ? 'text-right' : 'text-left'}>
                        <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest mb-1">Status</p>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                            <span className="text-[10px] font-black text-white uppercase">{user.status}</span>
                        </div>
                    </div>
                    <div className={isRtl ? 'text-left' : 'text-right'}>
                        <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest mb-1">Emp ID</p>
                        <p className="text-[10px] font-black text-white uppercase">#{user.employeeNumber || '001'}</p>
                    </div>
                </div>
            </div>
            
            <div className="glass-card !p-8 border-white/5 bg-white/[0.01]">
                <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                    <Shield size={16} className="text-brand" /> System Privileges
                </h4>
                <div className="space-y-4">
                    {['Access Control', 'Data Entry', 'Financial Oversight', 'Personnel Mgmt'].map((p, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand/40" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{p}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Edit Form Card */}
        <div className="lg:col-span-8">
            <div className="glass-card !p-12 border-white/5 bg-white/[0.02]">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                            <Edit2 size={18} className="text-brand" /> {isRtl ? 'تعديل البيانات' : 'Profile Settings'}
                        </h3>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">Update your primary information and security cipher</p>
                    </div>
                </div>

                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Input 
                            label={isRtl ? 'الاسم الأول' : 'First Name'} 
                            value={form.firstName} 
                            onChange={(e: any) => setForm({...form, firstName: e.target.value})} 
                        />
                        <Input 
                            label={isRtl ? 'الاسم الأخير' : 'Last Name'} 
                            value={form.lastName} 
                            onChange={(e: any) => setForm({...form, lastName: e.target.value})} 
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="opacity-60 pointer-events-none">
                            <Input label={isRtl ? 'البريد الإلكتروني' : 'Command Email'} value={user.email} disabled />
                        </div>
                        <div className="opacity-60 pointer-events-none">
                            <Input label={isRtl ? 'المستوى الوظيفي' : 'Role Level'} value={user.role} disabled />
                        </div>
                    </div>

                    <div className="pt-10 border-t border-white/5">
                        <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                            <Lock size={16} /> Security Protocol
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Input 
                                label={isRtl ? 'كلمة المرور الجديدة' : 'New Access Cipher'} 
                                type="password" 
                                placeholder="••••••••" 
                                value={form.password}
                                onChange={(e: any) => setForm({...form, password: e.target.value})}
                            />
                            <Input 
                                label={isRtl ? 'تأكيد كلمة المرور' : 'Confirm Cipher'} 
                                type="password" 
                                placeholder="••••••••" 
                                value={form.confirmPassword}
                                onChange={(e: any) => setForm({...form, confirmPassword: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-10">
                        <button 
                            disabled={saving}
                            onClick={handleUpdate}
                            className="flex items-center gap-3 px-10 py-4 rounded-2xl bg-brand text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-brand/90 transition-all shadow-xl shadow-brand/20 disabled:opacity-50"
                        >
                            <Save size={18} /> {saving ? 'Syncing...' : (isRtl ? 'حفظ التغييرات' : 'Update Profile')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </motion.div>
  );
}
