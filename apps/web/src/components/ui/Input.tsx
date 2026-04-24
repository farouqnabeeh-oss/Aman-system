import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';

// ── Shared Label ────────────────────────────────────────────────
const FieldLabel = ({ id, children, icon: Icon }: { id?: string; children: string; icon?: any }) => (
  <div className="flex items-center gap-2 mb-2">
    {Icon && <Icon size={13} className="text-brand flex-shrink-0" />}
    <label htmlFor={id} className="text-[11px] font-bold text-[var(--text-3)] uppercase tracking-wider">
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
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-4)] pointer-events-none group-focus-within:text-brand transition-colors">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              'hud-input transition-all',
              leftIcon && 'pl-11',
              rightIcon && 'pr-11',
              error && '!border-rose-500/50 focus:!border-rose-500/70 focus:!shadow-[0_0_0_3px_rgba(244,63,94,0.12)]',
              className,
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-4)] pointer-events-none group-focus-within:text-brand transition-colors">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-[11px] font-bold text-rose-500 mt-2 flex items-center gap-1.5"><span>⚠</span> {error}</p>}
        {hint && !error && <p className="text-[11px] text-[var(--text-4)] mt-2 font-medium">{hint}</p>}
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
            'hud-input resize-none leading-relaxed min-h-[100px]',
            error && '!border-rose-500/50',
            className
          )}
          {...props}
        />
        {error && <p className="text-[11px] font-bold text-rose-500 mt-2 flex items-center gap-1.5"><span>⚠</span> {error}</p>}
        {hint && !error && <p className="text-[11px] text-[var(--text-4)] mt-2 font-medium">{hint}</p>}
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
              'hud-input appearance-none pr-10 cursor-pointer',
              error && '!border-rose-500/50',
              className
            )}
            {...props}
          >
            {placeholder && <option value="" className="bg-[var(--bg-surface)] text-[var(--text-4)]">{placeholder}</option>}
            {options.map(o => (
              <option key={o.value} value={o.value} className="bg-[var(--bg-surface)] text-[var(--text-1)]">{o.label}</option>
            ))}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDown size={14} className="text-[var(--text-4)] group-focus-within:text-brand transition-colors" />
          </div>
        </div>
        {error && <p className="text-[11px] font-bold text-rose-500 mt-2 flex items-center gap-1.5"><span>⚠</span> {error}</p>}
        {hint && !error && <p className="text-[11px] text-[var(--text-4)] mt-2 font-medium">{hint}</p>}
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
  name?: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="w-full">
      {label && <FieldLabel>{label}</FieldLabel>}
      <div className="flex flex-wrap gap-2.5">
        {options.map(o => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={clsx(
              'px-5 py-2.5 rounded-2xl text-xs font-bold border transition-all duration-200 active:scale-95',
              value === o.value
                ? 'bg-brand/10 border-brand/40 text-brand shadow-sm shadow-brand/10'
                : 'bg-[var(--bg-glass)] border-[var(--border)] text-[var(--text-3)] hover:text-[var(--text-1)] hover:border-brand/30'
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
      <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-4)] pointer-events-none group-focus-within:text-brand transition-colors" />
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className="hud-input pl-10 text-sm font-medium"
      />
    </div>
  );
}
