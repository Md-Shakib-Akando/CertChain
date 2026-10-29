'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

export interface MenuItem {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  onSelect?: () => void;
  href?: string;
  tone?: 'default' | 'danger';
  disabled?: boolean;
  /** Render a divider above this item */
  separator?: boolean;
}

/**
 * Accessible dropdown menu (button + role=menu). Arrow keys move focus,
 * Escape closes and returns focus to the trigger.
 */
export function DropdownMenu({
  trigger,
  items,
  align = 'end',
  header,
  className,
  menuClassName,
  label,
}: {
  trigger: (props: { 'aria-haspopup': 'menu'; 'aria-expanded': boolean; 'aria-controls': string; onClick: () => void; ref: React.Ref<HTMLButtonElement> }) => React.ReactNode;
  items: MenuItem[];
  align?: 'start' | 'end';
  header?: React.ReactNode;
  className?: string;
  menuClassName?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    const t = window.setTimeout(() => menuRef.current?.querySelector<HTMLElement>('[role=menuitem]:not([aria-disabled=true])')?.focus(), 10);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
      window.clearTimeout(t);
    };
  }, [open]);

  const onMenuKey = (e: React.KeyboardEvent) => {
    const nodes = Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role=menuitem]:not([aria-disabled=true])') || []);
    const idx = nodes.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      nodes[(idx + 1) % nodes.length]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      nodes[(idx - 1 + nodes.length) % nodes.length]?.focus();
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  };

  const itemCls = (it: MenuItem) =>
    cn(
      'w-full flex items-center gap-2.5 px-2.5 h-8 rounded-[5px] text-[13.5px] text-left outline-none [&_svg]:size-4 [&_svg]:shrink-0',
      it.tone === 'danger' ? 'text-danger hover:bg-danger-soft focus:bg-danger-soft' : 'text-ink hover:bg-sunken focus:bg-sunken',
      it.disabled && 'opacity-40 pointer-events-none'
    );

  return (
    <div ref={rootRef} className={cn('relative inline-flex', className)}>
      {trigger({ 'aria-haspopup': 'menu', 'aria-expanded': open, 'aria-controls': id, onClick: () => setOpen((o) => !o), ref: triggerRef })}
      {open && (
        <div
          ref={menuRef}
          id={id}
          role="menu"
          aria-label={label}
          onKeyDown={onMenuKey}
          className={cn(
            'absolute top-full mt-1.5 z-50 min-w-52 rounded-lg border border-line bg-surface p-1 shadow-overlay animate-scale-in origin-top',
            align === 'end' ? 'right-0' : 'left-0',
            menuClassName
          )}
        >
          {header && <div className="px-2.5 pt-2 pb-2.5 mb-1 border-b border-line">{header}</div>}
          {items.map((it) => (
            <React.Fragment key={it.key}>
              {it.separator && <div className="my-1 h-px bg-line" role="separator" />}
              {it.href ? (
                <a role="menuitem" href={it.href} className={itemCls(it)} aria-disabled={it.disabled || undefined} onClick={() => setOpen(false)}>
                  {it.icon}
                  {it.label}
                </a>
              ) : (
                <button
                  role="menuitem"
                  type="button"
                  className={itemCls(it)}
                  aria-disabled={it.disabled || undefined}
                  onClick={() => {
                    setOpen(false);
                    it.onSelect?.();
                  }}
                >
                  {it.icon}
                  {it.label}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

