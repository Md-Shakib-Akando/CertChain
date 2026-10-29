'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { CheckCircle2, CircleAlert, Info, TriangleAlert, X } from 'lucide-react';
import { cn } from '@/lib/cn';

export type ToastTone = 'success' | 'error' | 'info' | 'warning';
export interface ToastOptions {
  tone?: ToastTone;
  title?: React.ReactNode;
  message: React.ReactNode;
  /** ms; 0 keeps the toast until dismissed. Default 5000 (errors 8000). */
  duration?: number;
}
interface ToastRecord extends ToastOptions {
  id: number;
}

const ToastCtx = createContext<{ push: (t: ToastOptions) => void } | null>(null);

const toneMeta: Record<ToastTone, { icon: React.ElementType; cls: string }> = {
  success: { icon: CheckCircle2, cls: 'text-success' },
  error: { icon: CircleAlert, cls: 'text-danger' },
  info: { icon: Info, cls: 'text-info' },
  warning: { icon: TriangleAlert, cls: 'text-warning' },
};

/** Visual toast card — also usable standalone for legacy hook-driven toasts. */
export function ToastCard({ tone = 'info', title, message, onDismiss }: ToastOptions & { onDismiss?: () => void }) {
  const meta = toneMeta[tone] || toneMeta.info;
  const Icon = meta.icon;
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className="pointer-events-auto w-full sm:w-[380px] flex items-start gap-3 rounded-lg border border-line bg-surface px-4 py-3 shadow-overlay animate-rise-in"
    >
      <Icon className={cn('size-[18px] mt-0.5 shrink-0', meta.cls)} aria-hidden />
      <div className="min-w-0 flex-1 text-sm">
        {title && <p className="font-semibold text-ink">{title}</p>}
        <div className={cn('text-ink-2 leading-5 break-words', title && 'mt-0.5 text-[13px]')}>{message}</div>
      </div>
      {onDismiss && (
        <button type="button" onClick={onDismiss} className="-mr-1 size-6 inline-flex items-center justify-center rounded text-muted hover:text-ink hover:bg-sunken" aria-label="Dismiss notification">
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}

export function ToastViewport({ children }: { children: React.ReactNode }) {
  return (
    <div className="pointer-events-none fixed z-[70] bottom-4 inset-x-4 sm:inset-x-auto sm:right-5 sm:bottom-5 flex flex-col items-end gap-2" aria-live="polite">
      {children}
    </div>
  );
}

/**
 * Renders a single toast driven by external state (used by existing hooks
 * that keep `toast` in their own state). Keeps the look identical to provider toasts.
 */
export function StateToast({
  toast,
  message,
  tone,
  onDismiss,
}: {
  toast?: { type: ToastTone | string; message: React.ReactNode } | null;
  message?: React.ReactNode | null;
  tone?: ToastTone | string;
  onDismiss?: () => void;
}) {
  const resolvedMessage = toast ? toast.message : message;
  const rawTone = (toast ? toast.type : tone) || 'info';
  const resolvedTone: ToastTone =
    rawTone === 'success' || rawTone === 'error' || rawTone === 'warning' || rawTone === 'info'
      ? rawTone
      : rawTone === 'danger'
      ? 'error'
      : 'info';

  if (!resolvedMessage) return null;
  return (
    <ToastViewport>
      <ToastCard tone={resolvedTone} message={resolvedMessage} onDismiss={onDismiss} />
    </ToastViewport>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const idRef = useRef(0);
  const timers = useRef<Map<number, number>>(new Map());

  const dismiss = useCallback((id: number) => {
    setToasts((ts) => ts.filter((t) => t.id !== id));
    const tm = timers.current.get(id);
    if (tm) window.clearTimeout(tm);
    timers.current.delete(id);
  }, []);

  const push = useCallback(
    (t: ToastOptions) => {
      const id = ++idRef.current;
      setToasts((ts) => [...ts.slice(-3), { ...t, id }]);
      const duration = t.duration ?? (t.tone === 'error' ? 8000 : 5000);
      if (duration > 0) timers.current.set(id, window.setTimeout(() => dismiss(id), duration));
    },
    [dismiss]
  );

  useEffect(() => {
    const map = timers.current;
    return () => map.forEach((tm) => window.clearTimeout(tm));
  }, []);

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <ToastViewport>
        {toasts.map((t) => (
          <ToastCard key={t.id} {...t} onDismiss={() => dismiss(t.id)} />
        ))}
      </ToastViewport>
    </ToastCtx.Provider>
  );
}

/** `const toast = useToast(); toast.success('Saved')` */
export function useToast() {
  const ctx = useContext(ToastCtx);
  const push = useCallback((t: ToastOptions) => ctx?.push(t), [ctx]);
  return {
    push,
    success: (message: React.ReactNode, title?: React.ReactNode) => push({ tone: 'success', message, title }),
    error: (message: React.ReactNode, title?: React.ReactNode) => push({ tone: 'error', message, title }),
    info: (message: React.ReactNode, title?: React.ReactNode) => push({ tone: 'info', message, title }),
    warning: (message: React.ReactNode, title?: React.ReactNode) => push({ tone: 'warning', message, title }),
  };
}
