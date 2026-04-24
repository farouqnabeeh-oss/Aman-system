import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { clsx } from 'clsx';

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T, index: number) => ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyFn: (row: T, index: number) => string | number;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export function Table<T>({ columns, data, keyFn, onRowClick, loading, emptyMessage = 'No records found' }: TableProps<T>) {
  if (loading) {
    return (
      <div className="w-full">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="flex gap-4 px-5 py-4 border-b border-[var(--border)] animate-pulse">
            <div className="h-4 w-1/4 bg-[var(--bg-glass)] rounded-lg" />
            <div className="h-4 w-1/3 bg-[var(--bg-glass)] rounded-lg" />
            <div className="h-4 w-1/5 bg-[var(--bg-glass)] rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="py-16 text-center">
        <p className="text-[var(--text-3)] text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--border)]">
            {columns.map(col => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className={clsx(
                  'px-5 py-3 text-left text-[11px] font-bold text-[var(--text-3)] uppercase tracking-wider whitespace-nowrap',
                  col.align === 'center' && 'text-center',
                  col.align === 'right' && 'text-right',
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {data.map((row, idx) => (
            <motion.tr
              key={keyFn(row, idx)}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03, duration: 0.2 }}
              onClick={() => onRowClick?.(row)}
              className={clsx(
                'group transition-colors duration-150',
                onRowClick && 'cursor-pointer hover:bg-[var(--bg-glass)]',
              )}
            >
              {columns.map(col => (
                <td
                  key={col.key}
                  className={clsx(
                    'px-5 py-3.5 text-sm text-[var(--text-2)] whitespace-nowrap group-hover:text-[var(--text-1)] transition-colors',
                    col.align === 'center' && 'text-center',
                    col.align === 'right' && 'text-right',
                  )}
                >
                  {col.render ? col.render(row, idx) : (row as any)[col.key] ?? '—'}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Pagination ───────────────────────────────────────────────────
interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPage: (p: number) => void;
}

export function Pagination({ page, totalPages, total, limit, onPage }: PaginationProps) {
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const pages = () => {
    const arr: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) arr.push(i);
    } else {
      arr.push(1);
      if (page > 3) arr.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) arr.push(i);
      if (page < totalPages - 2) arr.push('...');
      arr.push(totalPages);
    }
    return arr;
  };

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--border)] bg-[var(--bg-glass)]">
      <p className="text-xs text-[var(--text-4)] font-medium">
        Showing <span className="text-[var(--text-2)] font-bold">{from}–{to}</span> of <span className="text-[var(--text-2)] font-bold">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPage(1)} disabled={page === 1} className="btn-icon disabled:opacity-20 disabled:cursor-not-allowed w-8 h-8 border-[var(--border)]">
          <ChevronsLeft size={13} />
        </button>
        <button onClick={() => onPage(page - 1)} disabled={page === 1} className="btn-icon disabled:opacity-20 disabled:cursor-not-allowed w-8 h-8 border-[var(--border)]">
          <ChevronLeft size={13} />
        </button>
        {pages().map((p, i) => (
          p === '...'
            ? <span key={`dot-${i}`} className="px-1 text-[var(--text-4)] text-xs">…</span>
            : <button
                key={p}
                onClick={() => onPage(p)}
                className={clsx(
                  'w-8 h-8 rounded-lg text-xs font-bold transition-all',
                  page === p
                    ? 'bg-brand text-white shadow-lg shadow-brand/20'
                    : 'text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-[var(--bg-glass)]'
                )}
              >
                {p}
              </button>
        ))}
        <button onClick={() => onPage(page + 1)} disabled={page === totalPages} className="btn-icon disabled:opacity-20 disabled:cursor-not-allowed w-8 h-8 border-[var(--border)]">
          <ChevronRight size={13} />
        </button>
        <button onClick={() => onPage(totalPages)} disabled={page === totalPages} className="btn-icon disabled:opacity-20 disabled:cursor-not-allowed w-8 h-8 border-[var(--border)]">
          <ChevronsRight size={13} />
        </button>
      </div>
    </div>
  );
}
