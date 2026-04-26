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
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              'w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all',
              'focus:border-brand/40 focus:bg-white focus:shadow-[0_0_0_3px_rgba(28,147,178,0.05)]',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && '!border-rose-300 focus:!border-rose-400 focus:!shadow-[0_0_0_3px_rgba(244,63,94,0.05)]',
              className,
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-[11px] font-bold text-rose-500 mt-1.5 flex items-center gap-1 uppercase tracking-widest">⚠ {error}</p>}
        {hint && !error && <p className="text-[11px] font-bold text-slate-400 mt-1.5 uppercase tracking-widest">{hint}</p>}
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
          rows={3}
          className={clsx(
            'w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none resize-none leading-relaxed transition-all',
            'focus:border-brand/40 focus:bg-white',
            error && '!border-rose-300',
            className
          )}
          {...props}
        />
        {error && <p className="text-[11px] font-bold text-rose-500 mt-1.5 uppercase tracking-widest">⚠ {error}</p>}
        {hint && !error && <p className="text-[11px] font-bold text-slate-400 mt-1.5 uppercase tracking-widest">{hint}</p>}
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
              'w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none appearance-none pr-9 cursor-pointer transition-all',
              'focus:border-brand/40 focus:bg-white',
              error && '!border-rose-300',
              className
            )}
            {...props}
          >
            {placeholder && <option value="" className="text-slate-400">{placeholder}</option>}
            {options.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDown size={14} className="text-slate-400" />
          </div>
        </div>
        {error && <p className="text-[11px] font-bold text-rose-500 mt-1.5 uppercase tracking-widest">⚠ {error}</p>}
        {hint && !error && <p className="text-[11px] font-bold text-slate-400 mt-1.5 uppercase tracking-widest">{hint}</p>}
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
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-brand transition-colors" />
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-9 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-brand/40 focus:bg-white transition-all"
      />
    </div>
  );
}
