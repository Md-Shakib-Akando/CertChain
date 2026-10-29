'use client';

import React from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

/* --------------------------------------------------------------------------
   Table primitives. Wrap in <TableContainer> for horizontal scroll on small
   screens. Dense, left-aligned text; right-aligned numbers; sticky header.
   -------------------------------------------------------------------------- */
export function TableContainer({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('w-full overflow-x-auto no-scrollbar bg-surface border border-line rounded-lg shadow-card', className)} {...rest}>
      {children}
    </div>
  );
}

export function Table({ className, ...rest }: React.TableHTMLAttributes<HTMLTableElement>) {
  return <table className={cn('w-full border-collapse text-sm', className)} {...rest} />;
}

export function THead({ className, ...rest }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('bg-sunken/70 border-b border-line', className)} {...rest} />;
}

export function TBody({ className, ...rest }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('divide-y divide-line', className)} {...rest} />;
}

export function TR({ className, interactive, ...rest }: React.HTMLAttributes<HTMLTableRowElement> & { interactive?: boolean }) {
  return <tr className={cn('transition-colors', interactive && 'hover:bg-sunken/60 cursor-pointer', className)} {...rest} />;
}

export function TH({ className, align = 'left', ...rest }: React.ThHTMLAttributes<HTMLTableCellElement> & { align?: 'left' | 'right' | 'center' }) {
  return (
    <th
      scope="col"
      className={cn(
        'h-9 px-4 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-muted whitespace-nowrap',
        align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left',
        className
      )}
      {...rest}
    />
  );
}

export function TD({ className, align = 'left', ...rest }: React.TdHTMLAttributes<HTMLTableCellElement> & { align?: 'left' | 'right' | 'center' }) {
  return (
    <td
      className={cn('px-4 py-3 align-middle text-ink', align === 'right' ? 'text-right tabular' : align === 'center' ? 'text-center' : 'text-left', className)}
      {...rest}
    />
  );
}

/** Sortable header cell. */
export function SortableTH<K extends string>({
  label,
  sortKey,
  currentKey,
  direction,
  onSort,
  align,
  className,
}: {
  label: React.ReactNode;
  sortKey: K;
  currentKey: K | null;
  direction: 'asc' | 'desc';
  onSort: (key: K) => void;
  align?: 'left' | 'right';
  className?: string;
}) {
  const active = currentKey === sortKey;
  const Icon = !active ? ArrowUpDown : direction === 'asc' ? ArrowUp : ArrowDown;
  return (
    <TH align={align} className={className} aria-sort={active ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn('inline-flex items-center gap-1 uppercase tracking-[0.06em] hover:text-ink', active && 'text-ink')}
      >
        {label}
        <Icon className={cn('size-3', !active && 'opacity-50')} aria-hidden />
      </button>
    </TH>
  );
}

/** Toolbar row placed above a table: search, filters, actions. */
export function TableToolbar({
  className,
  left,
  right,
  children,
}: {
  className?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  children?: React.ReactNode;
}) {
  if (left !== undefined || right !== undefined) {
    return (
      <div className={cn('flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between bg-surface border border-line rounded-lg shadow-card', className)}>
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">{left}</div>
        {right && <div className="flex flex-wrap items-center gap-2 shrink-0">{right}</div>}
      </div>
    );
  }
  return <div className={cn('flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between', className)}>{children}</div>;
}

/* -------------------------------------------------------------------------- */
export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  className,
  itemLabel = 'results',
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  className?: string;
  itemLabel?: string;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  return (
    <nav className={cn('flex items-center justify-between gap-3 px-5 py-3 border-t border-line text-[13px] text-muted', className)} aria-label="Pagination">
      <p className="tabular">
        {total === 0 ? `No ${itemLabel}` : (
          <>
            Showing <span className="text-ink font-medium">{from}–{to}</span> of <span className="text-ink font-medium">{total}</span> {itemLabel}
          </>
        )}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="size-8 inline-flex items-center justify-center rounded-md border border-line bg-surface text-ink-2 hover:bg-sunken disabled:opacity-40 disabled:pointer-events-none"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="px-2 tabular text-ink-2">
          {page} / {pages}
        </span>
        <button
          type="button"
          className="size-8 inline-flex items-center justify-center rounded-md border border-line bg-surface text-ink-2 hover:bg-sunken disabled:opacity-40 disabled:pointer-events-none"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </nav>
  );
}

/** Helper hook for client-side pagination of an array. Resets to page 1 when `resetKey` changes. */
export function usePagination<T>(items: T[], pageSize = 10, resetKey?: unknown) {
  const [page, setPage] = React.useState(1);
  const [lastKey, setLastKey] = React.useState(resetKey);
  if (resetKey !== lastKey) {
    setLastKey(resetKey);
    setPage(1);
  }
  const pages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, pages);
  const pageItems = items.slice((safePage - 1) * pageSize, safePage * pageSize);
  return { page: safePage, setPage, pageItems, total: items.length, pageSize };
}
