'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogIn, Eye, EyeOff, Shield, Lock } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { login as loginAction } from '@/lib/actions/auth';
import toast from 'react-hot-toast';

const translations = {
  ar: {
    title: 'نظام أمان',
    subtitle: 'نظام الإدارة المؤسسي المتكامل الموحد',
    welcome: 'بوابة الدخول الآمن',
    login: 'الرجاء إدخال بيانات الاعتماد للوصول إلى النظام الموحد',
    email: 'البريد الإلكتروني التجاري',
    password: 'مفتاح المرور المشفر',
    error: 'بيانات الاعتماد غير صالحة أو النظام غير متاح',
    loading: 'جاري المصادقة الرقمية...',
    submit: 'تسجيل الدخول للنظام',
  },
  en: {
    title: 'Aman System',
    subtitle: 'Unified Enterprise Management Node',
    welcome: 'Secure Portal Access',
    login: 'Please enter your credentials to access the unified system',
    email: 'Command Email',
    password: 'Secure Encryption Key',
    error: 'Invalid digital credentials or node unreachable',
    loading: 'Authenticating Identity...',
    submit: 'Access Command Center',
  }
};

export default function LoginPage() {
  const router = useRouter();
  const { language, setLanguage } = useUIStore();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const t = translations[language as keyof typeof translations] || translations.en;
  const isRtl = language === 'ar';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await loginAction({ email, password });
      
      if (result.success) {
        // In a real scenario, the action might return user data. 
        // For now we'll simulate or fetch 'me' later.
        // Assuming the action handled cookies, we just need to update client state if needed
        toast.success(isRtl ? 'تم التصريح بالدخول' : 'Access Authorized');
        router.push('/dashboard');
      } else {
        toast.error(result.message || t.error);
      }
    } catch (err) {
      toast.error('Identity node connection reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-[#06080F] px-6 selection:bg-white/20 relative overflow-hidden`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/[0.02] rounded-full blur-[120px]" />
      </div>

      {/* Modern Top Header */}
      <div className="absolute top-12 left-6 right-6 sm:left-12 sm:right-12 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center">
              <Shield className="text-white/20" size={18} />
           </div>
           <div className="hidden sm:block text-left">
              <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Next-Gen Layer</p>
              <p className="text-[10px] font-bold text-white/40">Unified Node 2.0</p>
           </div>
        </div>
        <button 
          onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
          className="px-6 py-2.5 rounded-full bg-white/5 border border-white/5 text-[11px] font-black text-white/40 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest"
        >
          {language === 'ar' ? 'Switch to English' : 'تحويل للعربية'}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
        className="w-full max-w-[480px] z-10"
      >
        <div className="text-center mb-12">
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }} 
             animate={{ opacity: 1, scale: 1 }} 
             transition={{ duration: 0.8 }}
             className="relative inline-block mb-10"
           >
              <div className="absolute inset-0 bg-white/20 blur-[40px] rounded-full scale-125" />
              <img src="/logo.png" alt="Aman" className="relative w-28 h-28 object-contain rounded-[2.5rem]" />
           </motion.div>
           <h1 className="text-4xl font-black text-white mb-3 tracking-tighter uppercase">{t.title}</h1>
           <p className="text-xs font-black text-slate-700 uppercase tracking-[0.4em]">{t.subtitle}</p>
        </div>

        <div className="bg-[#0B0F1A]/80 backdrop-blur-3xl border border-white/5 rounded-[3.5rem] p-12 shadow-[0_50px_100px_rgba(0,0,0,0.6)]">
           <div className="mb-10 text-center sm:text-left">
              <h2 className="text-xl font-black text-white mb-2">{t.welcome}</h2>
              <p className="text-xs font-medium text-slate-500">{t.login}</p>
           </div>

           <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.25em] block px-1">{t.email}</label>
                 <div className="relative group">
                    <LogIn size={16} className={`absolute ${isRtl ? 'right-5' : 'left-5'} top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-white transition-colors`} />
                    <input 
                      type="email" 
                      required
                      placeholder="identity@aman.local"
                      className={`w-full bg-white/[0.02] border border-white/[0.05] rounded-[1.5rem] ${isRtl ? 'pr-14 pl-6' : 'pl-14 pr-6'} py-4 text-sm text-white placeholder:text-slate-700 focus:bg-white/[0.05] focus:border-white/10 outline-none transition-all`}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                 </div>
              </div>

              <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.25em] block px-1">{t.password}</label>
                 <div className="relative group">
                    <Lock size={16} className={`absolute ${isRtl ? 'right-5' : 'left-5'} top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-white transition-colors`} />
                    <input 
                      type={showPass ? 'text' : 'password'} 
                      required
                      placeholder="••••••••"
                      className={`w-full bg-white/[0.02] border border-white/[0.05] rounded-[1.5rem] ${isRtl ? 'pr-14 pl-14' : 'pl-14 pr-14'} py-4 text-sm text-white placeholder:text-slate-700 focus:bg-white/[0.05] focus:border-white/10 outline-none transition-all`}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className={`absolute ${isRtl ? 'left-5' : 'right-5'} top-1/2 -translate-y-1/2 text-slate-700 hover:text-white transition-colors`}
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                 </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full h-16 bg-white text-black rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-slate-200 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
              >
                {loading ? <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" /> : <>{isRtl ? 'ولوج للنظام' : 'Access System'} <LogIn size={14} /></>}
              </button>
           </form>
        </div>

        <div className="mt-12 flex justify-center items-center gap-4">
           <div className="h-px flex-1 bg-white/5" />
           <p className="text-[9px] font-black text-slate-800 uppercase tracking-[0.5em]">
             &copy; 2024 AMAN UNIFIED CORE
           </p>
           <div className="h-px flex-1 bg-white/5" />
        </div>
      </motion.div>
    </div>
  );
}
