'use client';

import React, { useId, useState } from 'react';
import { AlertCircle, Check, ChevronDown, Eye, EyeOff, Search, X } from 'lucide-react';
import { cn } from '@/lib/cn';

/* --------------------------------------------------------------------------
   Field — label + control + hint/error, with ids wired for a11y.
   -------------------------------------------------------------------------- */
export interface FieldControlProps {
  id: string;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
}

export interface FieldProps {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  optional?: boolean | string;
  /** Content shown at the right of the label row (e.g. "Forgot password?") */
  labelAside?: React.ReactNode;
  className?: string;
  id?: string;
  children: React.ReactElement | ((props: FieldControlProps) => React.ReactNode);
}

export function Field({ label, hint, error, required, optional, labelAside, className, id: idProp, children }: FieldProps) {
  const autoId = useId();
  const id = idProp || `f${autoId.replace(/:/g, '')}`;
  const hintId = hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-err` : undefined;
  const describedBy = [errId, hintId].filter(Boolean).join(' ') || undefined;
  const controlProps: FieldControlProps = { id, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy };

  let control: React.ReactNode;
  if (typeof children === 'function') control = children(controlProps);
  else control = React.cloneElement(children as React.ReactElement<Record<string, unknown>>, controlProps as unknown as Record<string, unknown>);

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {(label || labelAside) && (
        <div className="flex items-baseline justify-between gap-3">
          {label && (
            <label htmlFor={id} className="text-[13px] font-medium text-ink">
              {label}
              {required && <span className="text-danger ml-0.5" aria-hidden>*</span>}
              {optional && <span className="ml-1.5 font-normal text-muted">Optional</span>}
            </label>
          )}
          {labelAside && <div className="text-[13px]">{labelAside}</div>}
        </div>
      )}
      {control}
      {error ? (
        <p id={errId} className="flex items-start gap-1.5 text-[12.5px] leading-5 text-danger" role="alert">
          <AlertCircle className="size-3.5 mt-[3px] shrink-0" aria-hidden />
          <span>{error}</span>
        </p>
      ) : hint ? (
        <p id={hintId} className="text-[12.5px] leading-5 text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
const controlBase =
  'w-full bg-surface text-ink text-sm placeholder:text-subtle border border-line-strong rounded-md shadow-[inset_0_1px_1px_rgb(20_27_38/0.03)] transition-[border-color,box-shadow] duration-150 hover:border-[#b9b2a3] focus:outline-none focus-visible:outline-none focus:border-brand focus:ring-3 focus:ring-brand/15 disabled:bg-sunken disabled:text-muted disabled:cursor-not-allowed aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger/15 read-only:bg-sunken';

export type ControlSize = 'sm' | 'md' | 'lg';
const controlHeights: Record<ControlSize, string> = {
  sm: 'h-8 text-[13px]',
  md: 'h-9.5',
  lg: 'h-11 text-[15px]',
};

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  leftIcon?: React.ReactNode;
  rightSlot?: React.ReactNode;
  inputSize?: ControlSize;
  mono?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { leftIcon, rightSlot, inputSize = 'md', mono, className, ...rest },
  ref
) {
  if (!leftIcon && !rightSlot) {
    return <input ref={ref} className={cn(controlBase, controlHeights[inputSize], 'px-3', mono && 'font-mono text-[13px]', className)} {...rest} />;
  }
  return (
    <div className={cn('relative', className)}>
      {leftIcon && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted [&_svg]:size-4" aria-hidden>
          {leftIcon}
        </span>
      )}
      <input
        ref={ref}
        className={cn(controlBase, controlHeights[inputSize], leftIcon ? 'pl-9' : 'pl-3', rightSlot ? 'pr-10' : 'pr-3', mono && 'font-mono text-[13px]')}
        {...rest}
      />
      {rightSlot && <span className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">{rightSlot}</span>}
    </div>
  );
});

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className, rows = 4, ...rest },
  ref
) {
  return <textarea ref={ref} rows={rows} className={cn(controlBase, 'px-3 py-2 leading-6 resize-y min-h-[84px]', className)} {...rest} />;
});

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  inputSize?: ControlSize;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select({ className, inputSize = 'md', children, ...rest }, ref) {
  return (
    <div className={cn('relative', className)}>
      <select ref={ref} className={cn(controlBase, controlHeights[inputSize], 'appearance-none pl-3 pr-9 cursor-pointer')} {...rest}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted" aria-hidden />
    </div>
  );
});

export const PasswordInput = React.forwardRef<HTMLInputElement, Omit<InputProps, 'type' | 'rightSlot'>>(function PasswordInput(props, ref) {
  const [visible, setVisible] = useState(false);
  return (
    <Input
      ref={ref}
      type={visible ? 'text' : 'password'}
      autoComplete={props.autoComplete ?? 'current-password'}
      {...props}
      rightSlot={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="size-8 inline-flex items-center justify-center rounded-md text-muted hover:text-ink hover:bg-sunken"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      }
    />
  );
});

export interface SearchInputProps extends Omit<InputProps, 'type' | 'leftIcon' | 'rightSlot'> {
  value: string;
  onValueChange?: (v: string) => void;
  onClear?: () => void;
}

export function SearchInput({
  value,
  onValueChange,
  onChange,
  onClear,
  placeholder = 'Search…',
  className,
  ...rest
}: SearchInputProps) {
  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onValueChange) {
      onValueChange('');
    }
  };

  return (
    <Input
      type="search"
      value={value}
      onChange={(e) => {
        onChange?.(e);
        onValueChange?.(e.target.value);
      }}
      placeholder={placeholder}
      leftIcon={<Search />}
      className={className}
      rightSlot={
        value ? (
          <button
            type="button"
            onClick={handleClear}
            className="size-7 inline-flex items-center justify-center rounded text-muted hover:text-ink hover:bg-sunken"
            aria-label="Clear search"
          >
            <X className="size-3.5" />
          </button>
        ) : undefined
      }
      {...rest}
    />
  );
}

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox({ label, description, className, id, ...rest }, ref) {
  const autoId = useId();
  const cid = id || `c${autoId.replace(/:/g, '')}`;
  return (
    <div className={cn('flex items-start gap-2.5', className)}>
      <span className="relative mt-[2px] inline-flex">
        <input
          ref={ref}
          id={cid}
          type="checkbox"
          className="peer size-4 appearance-none rounded-[4px] border border-line-strong bg-surface shadow-[inset_0_1px_1px_rgb(20_27_38/0.04)] checked:bg-brand checked:border-brand transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50 cursor-pointer"
          {...rest}
        />
        <Check className="pointer-events-none absolute inset-0 m-auto size-3 text-white opacity-0 peer-checked:opacity-100" strokeWidth={3} aria-hidden />
      </span>
      {(label || description) && (
        <label htmlFor={cid} className="text-sm leading-5 text-ink cursor-pointer select-none">
          {label}
          {description && <span className="block text-[12.5px] text-muted mt-0.5">{description}</span>}
        </label>
      )}
    </div>
  );
});

/** Toggle switch with an accessible label. */
export function Switch({ checked, onChange, label, description, disabled, id }: { checked: boolean; onChange: (v: boolean) => void; label?: React.ReactNode; description?: React.ReactNode; disabled?: boolean; id?: string }) {
  const autoId = useId();
  const sid = id || `s${autoId.replace(/:/g, '')}`;
  return (
    <div className="flex items-start justify-between gap-4">
      {(label || description) && (
        <label htmlFor={sid} className="text-sm text-ink cursor-pointer">
          {label}
          {description && <span className="block text-[12.5px] text-muted mt-0.5">{description}</span>}
        </label>
      )}
      <button
        id={sid}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:opacity-50',
          checked ? 'bg-brand' : 'bg-line-strong'
        )}
      >
        <span className={cn('inline-block size-4 rounded-full bg-white shadow transition-transform', checked ? 'translate-x-[18px]' : 'translate-x-0.5')} />
      </button>
    </div>
  );
}
