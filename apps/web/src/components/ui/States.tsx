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
        <AlertTriangle className="w-7 h-7 text-rose-500" />
      </div>
      <div>
        <p className="font-bold text-[var(--text-1)] mb-1">Something went wrong</p>
        <p className="text-sm text-[var(--text-3)] max-w-xs">{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="btn-ghost mt-2 border-[var(--border)]">
          <RefreshCw size={14} /> Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title = 'No results', description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-[var(--bg-glass)] border border-[var(--border)] flex items-center justify-center text-[var(--text-4)]">
          {icon}
        </div>
      )}
      <div>
        <p className="font-bold text-[var(--text-1)] mb-1">{title}</p>
        {description && <p className="text-sm text-[var(--text-3)] max-w-xs mx-auto font-medium">{description}</p>}
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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-black text-[var(--text-1)] tracking-tight uppercase">{title}</h1>
          {badge && (
            <span className={clsx('px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border', {
              'bg-blue-500/10 border-blue-500/20 text-blue-500': badge.color === 'blue' || !badge.color,
              'bg-emerald-500/10 border-emerald-500/20 text-emerald-500': badge.color === 'green',
              'bg-amber-500/10 border-amber-500/20 text-amber-500': badge.color === 'yellow',
              'bg-rose-500/10 border-rose-500/20 text-rose-500': badge.color === 'red',
            })}>
              {badge.label}
            </span>
          )}
        </div>
        {description && <p className="text-sm text-[var(--text-3)] font-medium max-w-2xl">{description}</p>}
      </div>
      {action && <div className="flex items-center gap-3 flex-shrink-0">{action}</div>}
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
      whileHover={{ y: -3 }}
      className="stat-card"
    >
      <div className="flex items-start justify-between mb-5">
        <div className="w-11 h-11 rounded-2xl bg-[var(--bg-glass)] border border-[var(--border)] flex items-center justify-center text-brand">
          {icon}
        </div>
        {delta && (
          <div className={clsx(
            'flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-xl uppercase tracking-wider border',
            trend === 'up' && 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
            trend === 'down' && 'text-rose-500 bg-rose-500/10 border-rose-500/20',
            trend === 'neutral' && 'text-[var(--text-4)] bg-[var(--bg-glass)] border-[var(--border)]',
          )}>
            {trend === 'up' && <TrendingUp size={11} />}
            {trend === 'down' && <TrendingDown size={11} />}
            {delta}
          </div>
        )}
      </div>
      <p className="text-[10px] text-[var(--text-4)] font-black uppercase tracking-[0.2em] mb-1.5">{label}</p>
      <p className="text-3xl font-black text-[var(--text-1)] tracking-tight">{value}</p>
      {description && <p className="text-[11px] text-[var(--text-4)] mt-2 font-medium">{description}</p>}
    </motion.div>
  );
}

export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-2', lg: 'w-12 h-12 border-[3px]' }[size];
  return (
    <div className={`${s} border-[var(--border)] border-t-brand rounded-full animate-spin`} />
  );
}

export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-sm font-black text-[var(--text-1)] uppercase tracking-widest">{title}</h2>
        {subtitle && <p className="text-xs text-[var(--text-4)] mt-1 font-medium">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
