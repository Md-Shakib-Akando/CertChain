import React from 'react';
import { AlertTriangle, CheckCircle2, CircleAlert, Info, Loader2, RotateCw } from 'lucide-react';
import { cn } from '@/lib/cn';

export function Spinner({
  className,
  size = 'md',
  label = 'Loading',
}: {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  label?: string;
}) {
  const sizeCls =
    size === 'xs'
      ? 'size-3'
      : size === 'sm'
      ? 'size-3.5'
      : size === 'lg'
      ? 'size-6'
      : 'size-4';
  return (
    <span role="status" className="inline-flex">
      <Loader2 className={cn(sizeCls, 'animate-spin text-muted', className)} aria-hidden />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton h-4', className)} aria-hidden />;
}

/** Table-shaped skeleton for list loading states. */
export function SkeletonRows({ rows = 5, columns = 4, className }: { rows?: number; columns?: number; className?: string }) {
  return (
    <div className={cn('divide-y divide-line', className)} role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-6 px-5 py-3.5">
          {Array.from({ length: columns }).map((__, c) => (
            <Skeleton key={c} className={cn('h-3.5', c === 0 ? 'w-40' : c === columns - 1 ? 'w-16 ml-auto' : 'w-24')} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Page-level loading block that mirrors the layout of a dashboard. */
export function PageSkeleton({ rows = 6 }: { rows?: number } = {}) {
  return (
    <div className="space-y-6" role="status" aria-label="Loading">
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-72" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-line bg-surface p-5 space-y-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-14" />
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-line bg-surface">
        <SkeletonRows rows={rows} />
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  compact,
}: {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn('flex flex-col items-center text-center', compact ? 'px-6 py-8' : 'px-6 py-14', className)}>
      {icon && (
        <span className="mb-4 size-11 rounded-full border border-line bg-sunken text-muted inline-flex items-center justify-center [&_svg]:size-5" aria-hidden>
          {icon}
        </span>
      )}
      <p className="text-[15px] font-semibold text-ink">{title}</p>
      {description && <p className="mt-1.5 max-w-sm text-[13.5px] leading-5 text-muted">{description}</p>}
      {action && <div className="mt-5 flex flex-wrap items-center justify-center gap-2">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', description, onRetry, className }: { title?: React.ReactNode; description?: React.ReactNode; onRetry?: () => void; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center text-center px-6 py-12', className)} role="alert">
      <span className="mb-4 size-11 rounded-full bg-danger-soft text-danger inline-flex items-center justify-center" aria-hidden>
        <CircleAlert className="size-5" />
      </span>
      <p className="text-[15px] font-semibold text-ink">{title}</p>
      {description && <p className="mt-1.5 max-w-md text-[13.5px] leading-5 text-muted">{description}</p>}
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-5 inline-flex items-center gap-2 h-8 px-3 rounded-md border border-line-strong bg-surface text-[13px] font-medium text-ink hover:bg-sunken">
          <RotateCw className="size-3.5" /> Try again
        </button>
      )}
    </div>
  );
}

/** Inline callout / banner. */
export function Alert({
  tone = 'info',
  title,
  children,
  action,
  className,
  icon,
}: {
  tone?: 'info' | 'success' | 'warning' | 'danger' | 'neutral';
  title?: React.ReactNode;
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}) {
  const map = {
    info: { cls: 'bg-info-soft border-info-line', ic: 'text-info', Icon: Info },
    success: { cls: 'bg-success-soft border-success-line', ic: 'text-success', Icon: CheckCircle2 },
    warning: { cls: 'bg-warning-soft border-warning-line', ic: 'text-warning', Icon: AlertTriangle },
    danger: { cls: 'bg-danger-soft border-danger-line', ic: 'text-danger', Icon: CircleAlert },
    neutral: { cls: 'bg-sunken border-line', ic: 'text-muted', Icon: Info },
  }[tone];
  const Icon = map.Icon;
  return (
    <div className={cn('flex items-start gap-3 rounded-md border px-4 py-3 text-sm', map.cls, className)} role={tone === 'danger' ? 'alert' : undefined}>
      <span className={cn('mt-0.5 shrink-0 [&_svg]:size-4', map.ic)} aria-hidden>
        {icon || <Icon />}
      </span>
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold text-ink">{title}</p>}
        {children && <div className={cn('text-ink-2 leading-5', title && 'mt-0.5 text-[13px]')}>{children}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
