'use client';

import { motion } from 'framer-motion';
import { ShieldOff } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';

interface RestrictedAccessProps {
  /** Required roles (any one of these allows access) */
  roles?: string[];
  /** Required positions (any one of these allows access) */
  positions?: string[];
  /** Required departments (any one of these allows access) */
  departments?: string[];
  /** The page content to show when access is granted */
  children: React.ReactNode;
}

/**
 * Wrap any page with this component to enforce role/position/department-based access.
 * SUPER_ADMIN, ADMIN, MANAGER always bypass the restriction.
 */
export function RestrictedAccess({ roles = [], positions = [], departments = [], children }: RestrictedAccessProps) {
  const user = useAuthStore((s) => s.user);
  const { language } = useUIStore();
  const router = useRouter();
  const isRtl = language === 'ar';

  // Admins always have access
  const isPrivileged = user?.role && ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role);
  if (isPrivileged) return <>{children}</>;

  // Check role match
  const roleOk = roles.length === 0 || (user?.role && roles.includes(user.role));
  // Check position match
  const posOk = positions.length === 0 || (user?.position && positions.some((p) => p.toLowerCase() === user.position?.toLowerCase()));
  // Check department match
  const deptOk = departments.length === 0 || (user?.department && departments.includes(user.department));

  if (roleOk && posOk && deptOk) return <>{children}</>;

  // ── Access Denied Screen ──────────────────────────────────────────────────
  return (
    <div
      className="relative flex items-center justify-center min-h-[70vh] overflow-hidden"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Ambient glow blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-rose-500/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-violet-500/5 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative max-w-md w-full mx-auto text-center"
      >
        {/* Lock icon with pulsing ring */}
        <div className="relative inline-flex items-center justify-center mb-8">
          <motion.div
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
            className="absolute w-28 h-28 rounded-full bg-rose-500/10 border border-rose-500/20"
          />
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-50 to-rose-100/60 border border-rose-200/60 flex items-center justify-center shadow-xl shadow-rose-500/10">
            <ShieldOff size={36} className="text-rose-400" strokeWidth={1.5} />
          </div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-[9px] font-black uppercase tracking-[0.2em] mb-6 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          {isRtl ? 'وصول مقيّد' : 'Restricted Access'}
        </div>

        {/* Main heading */}
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-3">
          {isRtl ? 'غير مصرح بالدخول' : 'Access Denied'}
        </h1>

        {/* Subtext */}
        <p className="text-sm text-slate-500 font-medium leading-relaxed mb-2">
          {isRtl
            ? 'هذه الصفحة مخصصة للموظفين ذوي الأدوار الوظيفية المحددة فقط.'
            : 'This workspace is restricted to employees with specific roles or positions.'}
        </p>
        <p className="text-[11px] text-slate-400 font-semibold leading-relaxed mb-10">
          {isRtl
            ? `منصبك الحالي: ${user?.position || 'غير محدد'} · إذا كنت تعتقد أن هذا خطأ، تواصل مع مديرك.`
            : `Your current position: ${user?.position || 'Unassigned'} · If you believe this is an error, contact your manager.`}
        </p>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-10" />

        {/* Action */}
        <button
          onClick={() => router.push('/dashboard')}
          className="inline-flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.15em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 hover:shadow-slate-900/30 hover:-translate-y-0.5"
        >
          {isRtl ? '← العودة للوحة التحكم' : '← Back to Dashboard'}
        </button>
      </motion.div>
    </div>
  );
}
