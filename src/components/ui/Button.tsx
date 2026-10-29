'use client';

import React from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'danger-soft'
  | 'danger-outline'
  | 'seal'
  | 'link'
  | 'night'
  | 'night-ghost';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'icon-sm' | 'icon';

const base =
  'items-center justify-center gap-2 whitespace-nowrap font-medium select-none transition-[background-color,border-color,color,box-shadow] duration-150 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:shrink-0 cursor-pointer';

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-brand text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_1px_2px_rgb(20_27_38/0.2)] hover:bg-brand-hover active:bg-brand-active',
  secondary:
    'bg-surface text-ink border border-line-strong shadow-card hover:bg-sunken hover:border-[#bdb6a6] active:bg-[#e9e6de]',
  outline:
    'bg-surface text-ink border border-line-strong shadow-card hover:bg-sunken hover:border-[#bdb6a6] active:bg-[#e9e6de]',
  ghost: 'text-ink-2 hover:bg-sunken hover:text-ink active:bg-[#e9e6de]',
  danger:
    'bg-danger text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_1px_2px_rgb(20_27_38/0.2)] hover:bg-danger-hover',
  'danger-soft': 'bg-surface text-danger border border-danger-line hover:bg-danger-soft',
  'danger-outline': 'bg-surface text-danger border border-danger-line hover:bg-danger-soft',
  seal: 'bg-seal text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_1px_2px_rgb(20_27_38/0.2)] hover:opacity-90',
  link: 'text-brand underline-offset-4 hover:underline px-0! h-auto!',
  night:
    'bg-white text-night hover:bg-[#ece9e2] shadow-[0_1px_2px_rgb(0_0_0/0.3)]',
  'night-ghost': 'text-night-text border border-night-line hover:bg-white/[0.06] hover:border-white/20',
};

const sizes: Record<ButtonSize, string> = {
  xs: 'h-7 px-2.5 text-[12px] rounded-md [&_svg]:size-3',
  sm: 'h-8 px-3 text-[13px] rounded-md [&_svg]:size-3.5',
  md: 'h-9.5 px-4 text-sm rounded-md [&_svg]:size-4',
  lg: 'h-11 px-5 text-[15px] rounded-md [&_svg]:size-4',
  'icon-sm': 'size-8 rounded-md [&_svg]:size-4',
  icon: 'size-9.5 rounded-md [&_svg]:size-[18px]',
};

export function buttonClasses({
  variant = 'primary',
  size = 'md',
  fullWidth,
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; fullWidth?: boolean; className?: string } = {}) {
  const hasDisplay = className && /\b(hidden|flex|inline-flex|block|inline-block|grid)\b/.test(className);
  const resolvedVariant: ButtonVariant =
    (variant === 'secondary' || variant === 'outline') && className && /\b(bg-night|text-night-text)\b/.test(className)
      ? 'night-ghost'
      : variant;
  return cn(!hasDisplay && 'inline-flex', base, variants[resolvedVariant], sizes[size], fullWidth && 'w-full', className);
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** Text announced/shown while loading (defaults to children) */
  loadingText?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, loadingText, leftIcon, rightIcon, fullWidth, className, children, disabled, type = 'button', ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses({ variant, size, fullWidth, className })}
      {...rest}
    >
      {loading ? <Loader2 className="animate-spin" aria-hidden /> : leftIcon}
      {loading && loadingText ? loadingText : children}
      {!loading && rightIcon}
    </button>
  );
}
);

export interface ButtonLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  external?: boolean;
}

/** A link that looks exactly like a Button. Uses next/link for internal routes. */
export function ButtonLink({ href, variant = 'primary', size = 'md', leftIcon, rightIcon, fullWidth, external, className, children, ...rest }: ButtonLinkProps) {
  const cls = buttonClasses({ variant, size, fullWidth, className });
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} {...rest}>
        {leftIcon}
        {children}
        {rightIcon}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {leftIcon}
      {children}
      {rightIcon}
    </Link>
  );
}

/** Icon-only button. `label` is required for accessibility and used as tooltip. */
export const IconButton = React.forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, 'size' | 'leftIcon' | 'rightIcon'> & {
    label?: string;
    size?: 'icon' | 'icon-sm' | 'sm' | 'xs';
  }
>(function IconButton({ label = 'Action', size = 'icon', variant = 'ghost', children, ...rest }, ref) {
  const mappedSize: ButtonSize = size === 'sm' || size === 'xs' ? 'icon-sm' : size;
  return (
    <Button ref={ref} variant={variant} size={mappedSize} aria-label={label} title={label} {...rest}>
      {children}
    </Button>
  );
});
