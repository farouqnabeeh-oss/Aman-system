import { clsx } from 'clsx';
import { type ReactNode } from 'react';

// Badge maps to the CSS utility classes defined in index.css
const STATUS_MAP: Record<string, string> = {
  // User status
  ACTIVE: 'badge-green', INACTIVE: 'badge-slate', SUSPENDED: 'badge-rose',
  // Task / project
  DONE: 'badge-green', COMPLETED: 'badge-green',
  IN_PROGRESS: 'badge-blue', PLANNING: 'badge-slate',
  TODO: 'badge-slate', IN_REVIEW: 'badge-amber', ON_HOLD: 'badge-amber',
  BLOCKED: 'badge-rose',
  // Invoice / finance
  PAID: 'badge-green', SENT: 'badge-blue', DRAFT: 'badge-slate',
  OVERDUE: 'badge-rose', CANCELLED: 'badge-slate', PENDING: 'badge-amber',
  APPROVED: 'badge-green', REJECTED: 'badge-rose',
  // Transaction types
  INCOME: 'badge-green', EXPENSE: 'badge-rose', TRANSFER: 'badge-blue', REFUND: 'badge-amber',
  // Attendance
  PRESENT: 'badge-green', ABSENT: 'badge-rose', LATE: 'badge-amber',
  REMOTE: 'badge-blue', HALF_DAY: 'badge-amber',
  // Role
  SUPER_ADMIN: 'badge-indigo', ADMIN: 'badge-blue', MANAGER: 'badge-teal', EMPLOYEE: 'badge-slate',
  // Priority
  LOW: 'badge-slate', MEDIUM: 'badge-blue', HIGH: 'badge-amber', CRITICAL: 'badge-rose',
};

interface BadgeProps {
  children: ReactNode;
  className?: string;
  variant?: 'blue' | 'green' | 'teal' | 'rose' | 'amber' | 'slate' | 'indigo';
  dot?: boolean;
}

export function Badge({ children, className, variant = 'slate', dot }: BadgeProps) {
  return (
    <span className={clsx(`badge badge-${variant}`, className)}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export function roleBadge(role: string) {
  const cls = STATUS_MAP[role] ?? 'badge-slate';
  return <span className={clsx('badge', cls)}>{role.replace('_', ' ')}</span>;
}

export function statusBadge(status: string) {
  const cls = STATUS_MAP[status] ?? 'badge-slate';
  return <span className={clsx('badge', cls)}>{status.replace(/_/g, ' ')}</span>;
}

export function priorityBadge(priority: string) {
  const cls = STATUS_MAP[priority] ?? 'badge-slate';
  return <span className={clsx('badge', cls)}>{priority}</span>;
}
