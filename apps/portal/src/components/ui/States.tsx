'use client';

import { type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface ErrorStateProps { message?: string; onRetry?: () => void; }
interface EmptyStateProps { title?: string; description?: string; icon?: ReactNode; action?: ReactNode; }

export function ErrorState({ message = 'Something went wrong', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
        <AlertTriangle className="w-7 h-7 text-rose-400" />
      </div>
      <div>
        <p className="font-semibold text-white mb-1 tracking-tight">Something went wrong</p>
        <p className="text-sm text-slate-500 max-w-xs">{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5">
          <RefreshCw size={12} /> Retry Protocol
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title = 'No results', description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-600">
          {icon}
        </div>
      )}
      <div>
        <p className="font-semibold text-white mb-1 tracking-tight">{title}</p>
        {description && <p className="text-sm text-slate-500 max-w-xs mx-auto">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageHeader({
  title, description, action, badge
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  badge?: { label: string; color?: 'blue' | 'green' | 'yellow' | 'red' };
}) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black text-white uppercase tracking-tighter">{title}</h1>
          {badge && (
            <span className={clsx('text-[10px] font-black px-2.5 py-0.5 rounded-lg uppercase tracking-widest', {
              'text-blue-400 bg-blue-500/10 border border-blue-500/20': badge.color === 'blue' || !badge.color,
              'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20': badge.color === 'green',
              'text-amber-400 bg-amber-500/10 border border-amber-500/20': badge.color === 'yellow',
              'text-rose-400 bg-rose-500/10 border border-rose-500/20': badge.color === 'red',
            })}>
              {badge.label}
            </span>
          )}
        </div>
        {description && <p className="text-xs font-medium text-slate-500 max-w-lg">{description}</p>}
      </div>
      {action && <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto">{action}</div>}
    </div>
  );
}

export function StatCard({
  label, value, delta, icon, trend = 'neutral', description
}: {
  label: string;
  value: string | number;
  delta?: string;
  icon: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      className="glass-card group p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
          {icon}
        </div>
        {delta && (
          <div className={clsx(
            'flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest',
            trend === 'up' && 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/10',
            trend === 'down' && 'text-rose-400 bg-rose-500/10 border border-rose-500/10',
            trend === 'neutral' && 'text-slate-400 bg-white/5 border border-white/5',
          )}>
            {trend === 'up' && <TrendingUp size={11} />}
            {trend === 'down' && <TrendingDown size={11} />}
            {delta}
          </div>
        )}
      </div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-black text-white tracking-tighter">{value}</p>
      {description && <p className="text-[10px] font-bold text-slate-600 uppercase mt-2 tracking-widest">{description}</p>}
    </motion.div>
  );
}

export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-2', lg: 'w-12 h-12 border-[3px]' }[size];
  return (
    <div className={`${s} border-white/10 border-t-blue-500 rounded-full animate-spin`} />
  );
}

export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-xs font-black text-white uppercase tracking-widest">{title}</h2>
        {subtitle && <p className="text-[10px] font-bold text-slate-600 uppercase mt-1 tracking-widest">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
