'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Eye, EyeOff, Shield, Lock, Cpu, Globe, Zap, Fingerprint } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { login as loginAction } from '@/lib/actions/auth';
import toast from 'react-hot-toast';

const translations = {
  ar: {
    title: 'سحاب ديجيتال',
    subtitle: 'بوابة الإدارة الرقمية المتكاملة 2026',
    welcome: 'مركز المصادقة المركزية',
    login: 'أدخل بيانات الاعتماد الوظيفية للوصول إلى المنصة الآمنة',
    employeeNumber: 'المعرف الوظيفي الرقمي',
    password: 'مفتاح التشفير الخاص',
    error: 'فشل في التحقق من الهوية الرقمية',
    loading: 'جاري فحص المفاتيح الرقمية...',
    submit: 'بدء جلسة العمل',
    identity: 'التحقق من الهوية',
  },
  en: {
    title: 'Sahab Digital',
    subtitle: 'Integrated Digital Management Hub 2026',
    welcome: 'Central Auth Center',
    login: 'Enter your operational credentials to access the secure node',
    employeeNumber: 'Digital Personnel ID',
    password: 'Private Encryption Key',
    error: 'Identity verification failed',
    loading: 'Scanning digital keys...',
    submit: 'Initialize Session',
    identity: 'Identity Check',
  }
};

export default function LoginPage() {
  const router = useRouter();
  const { language, setLanguage } = useUIStore();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [password, setPassword] = useState('');

  const t = translations[language as keyof typeof translations] || translations.en;
  const isRtl = language === 'ar';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await loginAction({ employeeNumber, password });
      if (result.success) {
        toast.success(isRtl ? 'تم التصريح بالدخول الموحد' : 'Unified Access Authorized');
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
    <div className={`min-h-screen flex items-center justify-center bg-white px-6 relative overflow-hidden font-sans`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Subtle Pattern Background */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1C93B2_1px,transparent_1px),linear-gradient(to_bottom,#1C93B2_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* Top Bar Navigation */}
      <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand/5 border border-brand/10 flex items-center justify-center backdrop-blur-md">
            <Cpu className="text-brand" size={20} />
          </div>
          <div className="hidden md:block">
            <p className="text-[10px] font-black text-brand/40 uppercase tracking-[0.4em]">Node Protocol 7.2</p>
            <p className="text-[11px] font-black text-slate-900 tracking-wider uppercase">Secure Access Layer</p>
          </div>
        </div>
        
        <button 
          onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
          className="group relative px-6 py-2.5 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden transition-all hover:border-brand/30 active:scale-95"
        >
          <span className="relative text-[11px] font-black text-slate-500 group-hover:text-brand transition-colors uppercase tracking-widest flex items-center gap-2">
            <Globe size={14} className="group-hover:rotate-180 transition-transform duration-700" />
            {language === 'ar' ? 'English' : 'العربية'}
          </span>
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[500px] z-10 py-20"
      >
        {/* Logo & Intro Section */}
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="relative inline-block mb-8"
          >
            <div className="absolute inset-0 bg-brand/10 blur-[60px] rounded-full" />
            <div className="relative p-2 flex items-center justify-center group">
               <img src="/logo.png" alt="Sahab Digital" className="relative max-w-[12rem] max-h-[12rem] object-contain transition-transform duration-500 group-hover:scale-105" />
               <div className="absolute top-0 left-0 w-full h-[2px] bg-brand/50 shadow-[0_0_15px_rgba(28,147,178,0.5)] animate-scan" />
            </div>
          </motion.div>
          <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter uppercase">
            {t.title}
          </h1>
          <p className="text-[11px] font-black text-brand uppercase tracking-[0.5em] flex items-center justify-center gap-3">
             <Zap size={12} /> {t.subtitle} <Zap size={12} />
          </p>
        </div>

        {/* Main Auth Card */}
        <div className="relative">
          <div className="relative bg-white border border-slate-100 rounded-[3rem] p-10 lg:p-14 shadow-[0_40px_80px_-20px_rgba(28,147,178,0.1)] overflow-hidden">
            
            <div className="mb-10 relative">
               <div className="flex items-center gap-3 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand animate-ping" />
                  <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">{t.welcome}</h2>
               </div>
               <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-relaxed max-w-[280px]">{t.login}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ID Input */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-1">{t.employeeNumber}</label>
                <div className="relative group/field">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-300 group-focus-within/field:text-brand transition-colors">
                    <LogIn size={18} />
                  </div>
                  <input 
                    type="text" 
                    required
                    placeholder="9:XX:XXXX"
                    className={`w-full bg-slate-50 border border-slate-100 rounded-2xl ${isRtl ? 'pr-6 pl-14' : 'pl-14 pr-6'} py-5 text-sm text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-brand/30 focus:shadow-[0_0_0_4px_rgba(28,147,178,0.05)] outline-none transition-all`}
                    value={employeeNumber}
                    onChange={(e) => setEmployeeNumber(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-1">{t.password}</label>
                <div className="relative group/field">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-300 group-focus-within/field:text-brand transition-colors">
                    <Lock size={18} />
                  </div>
                  <input 
                    type={showPass ? 'text' : 'password'} 
                    required
                    placeholder="••••••••"
                    className={`w-full bg-slate-50 border border-slate-100 rounded-2xl ${isRtl ? 'pr-6 pl-14' : 'pl-14 pr-6'} py-5 text-sm text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-brand/30 focus:shadow-[0_0_0_4px_rgba(28,147,178,0.05)] outline-none transition-all`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-brand transition-colors"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={loading}
                className="group relative w-full h-16 overflow-hidden rounded-2xl mt-8 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                <div className="absolute inset-0 bg-brand group-hover:bg-brand/90 transition-colors" />
                
                <span className="relative flex items-center justify-center gap-4 text-white font-black text-[12px] uppercase tracking-[0.4em]">
                  {loading ? (
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      {isRtl ? 'بدء الجلسة' : 'Initialize Session'}
                      <Zap size={14} />
                    </>
                  )}
                </span>
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.8em] mb-4">
             Authorized Personnel Only
           </p>
           <div className="flex justify-center gap-8">
              {['Encryption', 'Security', 'Privacy'].map(item => (
                <span key={item} className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{item}</span>
              ))}
           </div>
        </div>
      </motion.div>

      <style jsx global>{`
        @keyframes scan {
          0%, 100% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          50% { top: 100%; opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
