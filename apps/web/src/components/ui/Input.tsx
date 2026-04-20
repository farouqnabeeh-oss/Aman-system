import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';

// ── Shared Label ────────────────────────────────────────────────
const FieldLabel = ({ id, children, icon: Icon }: { id?: string; children: string; icon?: any }) => (
  <div className="flex items-center gap-1.5 mb-2">
    {Icon && <Icon size={12} className="text-blue-400 flex-shrink-0" />}
    <label htmlFor={id} className="text-xs font-medium text-slate-400 uppercase tracking-wider">
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
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              'hud-input transition-all',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && '!border-rose-500/50 focus:!border-rose-500/70 focus:!shadow-[0_0_0_3px_rgba(244,63,94,0.12)]',
              className,
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-[11px] font-medium text-rose-400 mt-1.5 flex items-center gap-1">⚠ {error}</p>}
        {hint && !error && <p className="text-[11px] text-slate-600 mt-1.5">{hint}</p>}
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
            'hud-input resize-none leading-relaxed',
            error && '!border-rose-500/50',
            className
          )}
          {...props}
        />
        {error && <p className="text-[11px] font-medium text-rose-400 mt-1.5">⚠ {error}</p>}
        {hint && !error && <p className="text-[11px] text-slate-600 mt-1.5">{hint}</p>}
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
              'hud-input appearance-none pr-9 cursor-pointer',
              error && '!border-rose-500/50',
              className
            )}
            {...props}
          >
            {placeholder && <option value="" className="bg-[#111827] text-slate-400">{placeholder}</option>}
            {options.map(o => (
              <option key={o.value} value={o.value} className="bg-[#111827]">{o.label}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDown size={14} className="text-slate-500" />
          </div>
        </div>
        {error && <p className="text-[11px] font-medium text-rose-400 mt-1.5">⚠ {error}</p>}
        {hint && !error && <p className="text-[11px] text-slate-600 mt-1.5">{hint}</p>}
      </div>
    );
  },
);
Select.displayName = 'Select';

// ── Radio Group ──────────────────────────────────────────────────
export function RadioGroup({
  label, options, value, onChange
}: {
  label?: string;
  name?: string; // Kept in type if someone passed it but marked optional and unused for now
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="w-full">
      {label && <FieldLabel>{label}</FieldLabel>}
      <div className="flex flex-wrap gap-2">
        {options.map(o => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={clsx(
              'px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-150',
              value === o.value
                ? 'bg-blue-500/15 border-blue-500/40 text-blue-300'
                : 'bg-white/3 border-white/6 text-slate-400 hover:text-white hover:border-white/15'
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Search Input ─────────────────────────────────────────────────
import { Search } from 'lucide-react';

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
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none group-focus-within:text-blue-400 transition-colors" />
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className="hud-input pl-9 text-sm"
      />
    </div>
  );
}
