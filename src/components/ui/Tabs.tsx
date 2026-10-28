'use client';

import React, { useRef } from 'react';
import { cn } from '@/lib/cn';

export interface TabItem<K extends string = string> {
  key?: K;
  value?: K;
  label: React.ReactNode;
  icon?: React.ReactNode;
  count?: number;
  disabled?: boolean;
}

function resolveTabKey<K extends string>(item: TabItem<K>): K {
  return (item.key ?? item.value ?? '') as K;
}

function useRovingKeys<K extends string>(items: TabItem<K>[], value: K, onChange: (k: K) => void) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const onKeyDown = (e: React.KeyboardEvent) => {
    const enabled = items.filter((i) => !i.disabled);
    const idx = enabled.findIndex((i) => resolveTabKey(i) === value);
    let next = -1;
    if (e.key === 'ArrowRight') next = (idx + 1) % enabled.length;
    if (e.key === 'ArrowLeft') next = (idx - 1 + enabled.length) % enabled.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = enabled.length - 1;
    if (next >= 0) {
      e.preventDefault();
      const k = resolveTabKey(enabled[next]);
      onChange(k);
      refs.current[k]?.focus();
    }
  };
  return { refs, onKeyDown };
}

/** Underline tabs — for switching views within a page. */
export function Tabs<K extends string = string>({
  items,
  options,
  value,
  onChange,
  className,
  ariaLabel,
}: {
  items?: TabItem<K>[];
  options?: TabItem<K>[];
  value: K;
  onChange: (k: K) => void;
  variant?: string;
  className?: string;
  ariaLabel?: string;
}) {
  const list = items || options || [];
  const { refs, onKeyDown } = useRovingKeys(list, value, onChange);
  return (
    <div role="tablist" aria-label={ariaLabel} onKeyDown={onKeyDown} className={cn('flex items-center gap-1 border-b border-line overflow-x-auto scrollbar-thin', className)}>
      {list.map((t) => {
        const k = resolveTabKey(t);
        const active = k === value;
        return (
          <button
            key={k}
            ref={(el) => {
              refs.current[k] = el;
            }}
            role="tab"
            type="button"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            disabled={t.disabled}
            onClick={() => onChange(k)}
            className={cn(
              'relative inline-flex items-center gap-2 h-10 px-3 text-sm font-medium whitespace-nowrap transition-colors [&_svg]:size-4 disabled:opacity-40 cursor-pointer',
              active ? 'text-ink' : 'text-muted hover:text-ink'
            )}
          >
            {t.icon}
            {t.label}
            {t.count !== undefined && (
              <span className={cn('min-w-5 h-5 px-1.5 inline-flex items-center justify-center rounded-full text-[11px] font-semibold tabular', active ? 'bg-ink text-white' : 'bg-sunken text-ink-2')}>
                {t.count}
              </span>
            )}
            {active && <span className="absolute inset-x-2 -bottom-px h-0.5 bg-brand rounded-full" aria-hidden />}
          </button>
        );
      })}
    </div>
  );
}

/** Segmented control — for mutually exclusive modes/filters (compact). */
export function Segmented<K extends string = string>({
  items,
  options,
  value,
  onChange,
  className,
  ariaLabel,
  size = 'md',
  fullWidth,
}: {
  items?: TabItem<K>[];
  options?: TabItem<K>[];
  value: K;
  onChange: (k: K) => void;
  className?: string;
  ariaLabel?: string;
  size?: 'sm' | 'md';
  fullWidth?: boolean;
}) {
  const list = items || options || [];
  const { refs, onKeyDown } = useRovingKeys(list, value, onChange);
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className={cn('inline-flex max-w-full overflow-x-auto scrollbar-thin items-center gap-0.5 p-0.5 rounded-md bg-sunken border border-line', fullWidth && 'flex w-full', className)}
    >
      {list.map((t) => {
        const k = resolveTabKey(t);
        const active = k === value;
        return (
          <button
            key={k}
            ref={(el) => {
              refs.current[k] = el;
            }}
            role="tab"
            type="button"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            disabled={t.disabled}
            onClick={() => onChange(k)}
            className={cn(
              'inline-flex items-center justify-center gap-1.5 rounded-[5px] font-medium whitespace-nowrap transition-[background-color,color,box-shadow] [&_svg]:size-3.5 disabled:opacity-40 cursor-pointer',
              size === 'sm' ? 'h-7 px-2.5 text-[12.5px]' : 'h-8 px-3 text-[13px]',
              fullWidth && 'flex-1',
              active ? 'bg-surface text-ink shadow-[0_1px_2px_rgb(20_27_38/0.1),0_0_0_1px_rgb(20_27_38/0.04)]' : 'text-muted hover:text-ink'
            )}
          >
            {t.icon}
            {t.label}
            {t.count !== undefined && <span className="tabular text-muted">{t.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
