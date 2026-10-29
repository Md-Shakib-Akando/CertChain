'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from './Button';
import { Input } from './Field';

const FOCUSABLE = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Optional icon rendered beside the title */
  icon?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Prevent closing via backdrop/Escape while an operation is running */
  dismissible?: boolean;
  /** Render as a right-side sheet instead of a centered dialog */
  variant?: 'center' | 'sheet';
  className?: string;
  bodyClassName?: string;
}

const widths = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

export function Dialog({
  open,
  onClose,
  eyebrow,
  title,
  description,
  icon,
  children,
  footer,
  size = 'md',
  dismissible = true,
  variant = 'center',
  className,
  bodyClassName,
}: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();
  const [mounted, setMounted] = useState(false);
  const onCloseRef = useRef(onClose);
  const dismissibleRef = useRef(dismissible);

  useEffect(() => {
    onCloseRef.current = onClose;
    dismissibleRef.current = dismissible;
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    const t = window.setTimeout(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const auto = panel.querySelector<HTMLElement>('[data-autofocus]');
      const first = auto || panel.querySelector<HTMLElement>(`[data-dialog-body] ${FOCUSABLE}`) || panel;
      first.focus();
    }, 20);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismissibleRef.current) {
        e.stopPropagation();
        onCloseRef.current();
      }
      if (e.key === 'Tab' && panelRef.current) {
        const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => n.offsetParent !== null);
        if (nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!mounted || !open) return null;

  const isSheet = variant === 'sheet';

  return createPortal(
    <div className={cn('fixed inset-0 z-[60] flex', isSheet ? 'justify-end' : 'items-end sm:items-center justify-center p-0 sm:p-6')}>
      <div className="absolute inset-0 bg-night/45 backdrop-blur-[2px] animate-fade-in" onClick={() => dismissible && onClose()} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={cn(
          'relative bg-surface shadow-overlay flex flex-col outline-none',
          isSheet
            ? 'h-full w-full max-w-xl border-l border-line animate-[slide-in-right_240ms_var(--ease-out-quart)_both]'
            : cn('w-full max-h-[92dvh] rounded-t-xl sm:rounded-xl border border-line animate-scale-in', widths[size]),
          className
        )}
      >
        <header className="flex items-start gap-3 px-5 sm:px-6 pt-5 pb-4 border-b border-line">
          {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
          <div className="min-w-0 flex-1">
            {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
            <h2 id={titleId} className="text-[17px] font-semibold text-ink leading-6">
              {title}
            </h2>
            {description && (
              <p id={descId} className="mt-1 text-[13.5px] text-muted leading-5">
                {description}
              </p>
            )}
          </div>
          {dismissible && (
            <button
              type="button"
              onClick={onClose}
              className="-mr-2 -mt-1 size-8 inline-flex items-center justify-center rounded-md text-muted hover:text-ink hover:bg-sunken cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="size-4" />
            </button>
          )}
        </header>
        {children && (
          <div data-dialog-body className={cn('flex-1 overflow-y-auto no-scrollbar px-5 sm:px-6 py-5', bodyClassName)}>
            {children}
          </div>
        )}
        {footer && <footer className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 px-5 sm:px-6 py-3.5 border-t border-line bg-sunken/50 rounded-b-xl">{footer}</footer>}
      </div>
      <style>{`@keyframes slide-in-right{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>
    </div>,
    document.body
  );
}

export function DialogBody({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('space-y-4', className)} {...rest} />;
}

export function DialogFooter({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 pt-4 mt-4 border-t border-line',
        className
      )}
      {...rest}
    />
  );
}

/* --------------------------------------------------------------------------
   ConfirmDialog — deliberate confirmation for consequential actions.
   `confirmPhrase` forces the user to type a value (e.g. a certificate ID)
   before an irreversible action is enabled.
   -------------------------------------------------------------------------- */
export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'primary';
  loading?: boolean;
  confirmDisabled?: boolean;
  confirmPhrase?: string;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  eyebrow,
  title,
  description,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'primary',
  loading,
  confirmDisabled,
  confirmPhrase,
}: ConfirmDialogProps) {
  const [typed, setTyped] = useState('');
  const [lastOpen, setLastOpen] = useState(open);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) setTyped('');
  }
  const phraseOk = !confirmPhrase || typed.trim() === confirmPhrase;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      dismissible={!loading}
      size="sm"
      eyebrow={eyebrow}
      title={title}
      description={description}
      icon={
        tone === 'danger' ? (
          <span className="size-9 rounded-full bg-danger-soft text-danger inline-flex items-center justify-center">
            <AlertTriangle className="size-[18px]" />
          </span>
        ) : undefined
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={() => onConfirm()} loading={loading} disabled={confirmDisabled || !phraseOk}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {(children || confirmPhrase) && (
        <div className="space-y-4">
          {children}
          {confirmPhrase && (
            <div className="space-y-1.5">
              <label className="text-[13px] text-ink-2" htmlFor="confirm-phrase">
                Type <span className="font-mono font-medium text-ink bg-sunken px-1 py-0.5 rounded">{confirmPhrase}</span> to confirm
              </label>
              <Input id="confirm-phrase" value={typed} onChange={(e) => setTyped(e.target.value)} mono autoComplete="off" spellCheck={false} />
            </div>
          )}
        </div>
      )}
    </Dialog>
  );
}
