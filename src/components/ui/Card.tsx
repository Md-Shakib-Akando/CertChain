import React from 'react';
import { cn } from '@/lib/cn';

/* --------------------------------------------------------------------------
   Card — the single panel primitive for the whole product.
   -------------------------------------------------------------------------- */
export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'section' | 'div' | 'article' | 'aside';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

const cardPadding: Record<NonNullable<CardProps['padding']>, string> = {
  none: '',
  sm: 'p-3.5',
  md: 'p-4 sm:p-5',
  lg: 'p-5 sm:p-6',
};

export function Card({
  className,
  as: Tag = 'section',
  padding,
  interactive,
  ...rest
}: CardProps) {
  const hasBg = className && /\bbg-/.test(className);
  return (
    <Tag
      className={cn(
        !hasBg && 'bg-surface',
        'border border-line rounded-lg shadow-card',
        padding && cardPadding[padding],
        interactive && 'cursor-pointer transition-colors hover:border-line-strong hover:bg-sunken/30',
        className
      )}
      {...rest}
    />
  );
}

export interface CardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  /** Heading level for document outline; defaults to h2 */
  level?: 2 | 3;
}

export function CardHeader({
  eyebrow,
  title,
  description,
  icon,
  actions,
  level = 2,
  className,
  children,
  ...rest
}: CardHeaderProps) {
  const H = level === 2 ? 'h2' : 'h3';
  if (!title && children) {
    return (
      <div
        className={cn(
          'flex items-start justify-between gap-4 px-5 pt-4 pb-3.5 border-b border-line',
          className
        )}
        {...rest}
      >
        {children}
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    );
  }
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 px-5 pt-4 pb-3.5 border-b border-line',
        className
      )}
      {...rest}
    >
      <div className="flex items-start gap-3 min-w-0">
        {icon && (
          <span className="mt-0.5 text-muted [&_svg]:size-[18px]" aria-hidden>
            {icon}
          </span>
        )}
        <div className="min-w-0">
          {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
          {title && <H className="text-[15px] font-semibold text-ink leading-6">{title}</H>}
          {description && (
            <p className="text-[13px] text-muted leading-5 mt-0.5">{description}</p>
          )}
          {children}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

export function CardTitle({ className, ...rest }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-[15px] font-semibold text-ink leading-6', className)} {...rest} />;
}

export function CardDescription({ className, ...rest }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-[13px] text-muted leading-5 mt-0.5', className)} {...rest} />;
}

export function CardBody({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5', className)} {...rest} />;
}

export function CardFooter({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'px-5 py-3 border-t border-line bg-sunken/50 rounded-b-lg flex items-center gap-3',
        className
      )}
      {...rest}
    />
  );
}

/** Definition list used for record details (certificate, user, request). */
export function DescriptionList({
  items,
  columns,
  cols,
  className,
}: {
  items: Array<{
    term: React.ReactNode;
    value?: React.ReactNode;
    detail?: React.ReactNode;
    full?: boolean;
  }>;
  columns?: 1 | 2 | 3;
  cols?: 1 | 2 | 3;
  className?: string;
}) {
  const numCols = columns ?? cols ?? 2;
  return (
    <dl
      className={cn(
        'grid gap-x-6 gap-y-4',
        numCols === 1
          ? 'grid-cols-1'
          : numCols === 2
          ? 'grid-cols-1 sm:grid-cols-2'
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        className
      )}
    >
      {items.map((it, i) => {
        const primary = it.value !== undefined ? it.value : it.detail;
        const secondary = it.value !== undefined ? it.detail : undefined;
        return (
          <div key={i} className={cn('min-w-0', it.full && 'sm:col-span-full')}>
            <dt className="text-[12px] font-medium text-muted">{it.term}</dt>
            <dd className="mt-1 text-sm text-ink break-words">
              {primary ?? <span className="text-subtle">—</span>}
              {secondary && (
                <span className="block text-[11.5px] text-muted mt-0.5">{secondary}</span>
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

export function Divider({ className, label }: { className?: string; label?: React.ReactNode }) {
  if (label) {
    return (
      <div className={cn('flex items-center gap-3 text-[12px] text-muted', className)} role="separator">
        <span className="h-px flex-1 bg-line" />
        {label}
        <span className="h-px flex-1 bg-line" />
      </div>
    );
  }
  return <hr className={cn('border-0 h-px bg-line', className)} />;
}
