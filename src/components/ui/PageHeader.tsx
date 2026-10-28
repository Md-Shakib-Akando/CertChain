import React from 'react';
import { cn } from '@/lib/cn';

/* --------------------------------------------------------------------------
   PageHeader — every internal page starts with this.
   eyebrow (section) → serif title → one-line description → actions on right.
   -------------------------------------------------------------------------- */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  meta,
  className,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  /** Small row under the description (badges, timestamps) */
  meta?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn('flex flex-col gap-4 md:flex-row md:items-end md:justify-between pb-6', className)}>
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
        <h1 className="font-serif text-[26px] sm:text-[28px] leading-[1.15] font-semibold tracking-[-0.01em] text-ink">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-[14px] leading-[22px] text-muted">{description}</p>}
        {meta && <div className="mt-3 flex flex-wrap items-center gap-2">{meta}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </header>
  );
}

/** Section heading inside a page (between groups of cards). */
export function SectionHeading({ title, description, actions, className }: { title: React.ReactNode; description?: React.ReactNode; actions?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-end justify-between gap-4 mb-3', className)}>
      <div>
        <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
        {description && <p className="text-[13px] text-muted mt-0.5">{description}</p>}
      </div>
      {actions}
    </div>
  );
}

/* --------------------------------------------------------------------------
   Stat — a KPI figure. Shows only real numbers; `hint` explains the source.
   -------------------------------------------------------------------------- */
export type StatTone = 'neutral' | 'success' | 'danger' | 'warning' | 'brand' | 'seal' | 'info' | string;

const statToneClasses: Record<string, string> = {
  neutral: 'text-ink',
  success: 'text-success',
  danger: 'text-danger',
  warning: 'text-warning',
  brand: 'text-brand',
  seal: 'text-seal',
  info: 'text-info',
};

export function Stat({
  label,
  value,
  hint,
  icon,
  tone = 'neutral',
  action,
  className,
  loading,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  tone?: StatTone;
  action?: React.ReactNode;
  className?: string;
  loading?: boolean;
}) {
  const valueTone = statToneClasses[tone] || 'text-ink';
  return (
    <div className={cn('bg-surface border border-line rounded-lg shadow-card px-5 py-4 flex flex-col', className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] font-medium text-muted">{label}</p>
        {icon && <span className="text-subtle [&_svg]:size-4" aria-hidden>{icon}</span>}
      </div>
      {loading ? (
        <span className="skeleton h-8 w-16 mt-2" aria-hidden />
      ) : (
        <p className={cn('mt-1.5 font-serif text-[30px] leading-9 font-semibold tabular tracking-tight', valueTone)}>{value}</p>
      )}
      {hint && <p className="mt-1 text-[12.5px] text-muted leading-5">{hint}</p>}
      {action && <div className="mt-auto pt-3">{action}</div>}
    </div>
  );
}

export interface StatStripItem {
  label: React.ReactNode;
  value: React.ReactNode;
  hint?: React.ReactNode;
  sublabel?: React.ReactNode;
  delta?: React.ReactNode;
  deltaTone?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  tone?: StatTone;
  onClick?: () => void;
}

/** Grouped KPI strip: one card split by hairlines (denser than separate cards). */
export function StatStrip({
  items,
  stats,
  cols,
  className,
}: {
  items?: StatStripItem[];
  stats?: StatStripItem[];
  cols?: number;
  className?: string;
}) {
  const list = items || stats || [];
  return (
    <div
      className={cn(
        'bg-surface border border-line rounded-lg shadow-card grid grid-cols-2 lg:grid-flow-col lg:auto-cols-fr divide-line',
        cols === 3 && 'lg:grid-cols-3',
        cols === 4 && 'lg:grid-cols-4',
        className
      )}
    >
      {list.map((it, i) => {
        const toneCls = statToneClasses[it.tone || 'neutral'] || 'text-ink';
        const sub = it.hint ?? it.sublabel;
        return (
          <div
            key={i}
            onClick={it.onClick}
            className={cn(
              'px-5 py-4 border-line',
              i % 2 === 1 && 'border-l',
              i >= 2 && 'border-t lg:border-t-0',
              i > 0 && 'lg:border-l',
              it.onClick && 'cursor-pointer hover:bg-sunken/40 transition-colors'
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-[13px] font-medium text-muted">{it.label}</p>
              {it.icon && (
                <span className="text-subtle [&_svg]:size-4 shrink-0" aria-hidden>
                  {it.icon}
                </span>
              )}
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <p className={cn('font-serif text-[28px] leading-9 font-semibold tabular tracking-tight', toneCls)}>
                {it.value}
              </p>
              {it.delta && (
                <span
                  className={cn(
                    'text-xs font-medium',
                    it.deltaTone === 'up'
                      ? 'text-success'
                      : it.deltaTone === 'down'
                      ? 'text-danger'
                      : 'text-muted'
                  )}
                >
                  {it.delta}
                </span>
              )}
            </div>
            {sub && <p className="mt-0.5 text-[12.5px] text-muted">{sub}</p>}
          </div>
        );
      })}
    </div>
  );
}
