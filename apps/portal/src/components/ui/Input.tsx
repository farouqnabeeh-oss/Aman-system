'use client';

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';
import { ChevronDown, Search } from 'lucide-react';

// ── Shared Label ────────────────────────────────────────────────
const FieldLabel = ({ id, children, icon: Icon }: { id?: string; children: string; icon?: any }) => (
  <div className="flex items-center gap-1.5 mb-2">
    {Icon && <Icon size={12} className="text-brand flex-shrink-0" />}
    <label htmlFor={id} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
      {children}
    </label>
  </div>
);

// ── Input ────────────────────────────────────────────────────────
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: any;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full">
        {label && <FieldLabel id={inputId} icon={icon}>{label}</FieldLabel>}
        <div className="relative group">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-focus-within:text-brand transition-colors">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              'w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl px-5 py-3.5 text-sm text-white placeholder:text-slate-600 outline-none transition-all',
              'focus:border-brand/50 focus:bg-white/[0.05] focus:shadow-[0_0_0_4px_rgba(28,147,178,0.1)]',
              leftIcon && 'pl-12',
              rightIcon && 'pr-12',
              error && '!border-rose-500/50 focus:!border-rose-500/80 focus:!shadow-[0_0_0_4px_rgba(244,63,94,0.1)]',
              className,
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-focus-within:text-brand transition-colors">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-[10px] font-black text-rose-500 mt-2 flex items-center gap-1.5 uppercase tracking-widest animate-in fade-in slide-in-from-top-1">⚠ {error}</p>}
        {hint && !error && <p className="text-[10px] font-black text-slate-500 mt-2 uppercase tracking-widest">{hint}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';

// ── Textarea ─────────────────────────────────────────────────────
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: any;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, icon, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full">
        {label && <FieldLabel id={inputId} icon={icon}>{label}</FieldLabel>}
        <textarea
          ref={ref}
          id={inputId}
          rows={4}
          className={clsx(
            'w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl px-5 py-4 text-sm text-white placeholder:text-slate-600 outline-none resize-none leading-relaxed transition-all',
            'focus:border-brand/50 focus:bg-white/[0.05] focus:shadow-[0_0_0_4px_rgba(28,147,178,0.1)]',
            error && '!border-rose-500/50',
            className
          )}
          {...props}
        />
        {error && <p className="text-[10px] font-black text-rose-500 mt-2 uppercase tracking-widest">⚠ {error}</p>}
        {hint && !error && <p className="text-[10px] font-black text-slate-500 mt-2 uppercase tracking-widest">{hint}</p>}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';

// ── Select ───────────────────────────────────────────────────────
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  icon?: any;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder, icon, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full">
        {label && <FieldLabel id={inputId} icon={icon}>{label}</FieldLabel>}
        <div className="relative group">
          <select
            ref={ref}
            id={inputId}
            className={clsx(
              'w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl px-5 py-3.5 text-sm text-white outline-none appearance-none pr-10 cursor-pointer transition-all',
              'focus:border-brand/50 focus:bg-white/[0.05] focus:shadow-[0_0_0_4px_rgba(28,147,178,0.1)]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && '!border-rose-500/50',
              className
            )}
            {...props}
          >
            {placeholder && <option value="" className="bg-slate-900">{placeholder}</option>}
            {options.map(o => (
              <option key={o.value} value={o.value} className="bg-slate-900">{o.label}</option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-focus-within:text-brand transition-colors">
            <ChevronDown size={14} />
          </div>
        </div>
        {error && <p className="text-[10px] font-black text-rose-500 mt-2 uppercase tracking-widest">⚠ {error}</p>}
        {hint && !error && <p className="text-[10px] font-black text-slate-500 mt-2 uppercase tracking-widest">{hint}</p>}
      </div>
    );
  },
);
Select.displayName = 'Select';

// ── Search Input ─────────────────────────────────────────────────
export function SearchInput({
  value, onChange, placeholder = 'Search...', className
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={clsx('relative group', className)}>
      <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-focus-within:text-brand transition-colors" />
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl pl-12 pr-5 py-3.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-brand/50 focus:bg-white/[0.05] focus:shadow-[0_0_0_4px_rgba(28,147,178,0.1)] transition-all"
      />
    </div>
  );
}
