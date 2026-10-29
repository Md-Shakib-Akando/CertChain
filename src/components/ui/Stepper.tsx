import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

/** Horizontal stepper for multi-step workflows (issuance wizard, registration). */
export function Stepper({
  steps,
  current,
  currentStep,
  className,
  onStepClick,
}: {
  steps: Array<{ label: string; description?: string }>;
  current?: number;
  currentStep?: number;
  className?: string;
  onStepClick?: (index: number) => void;
}) {
  const activeIndex = current ?? currentStep ?? 0;
  return (
    <ol className={cn('flex items-start gap-2 sm:gap-0', className)} aria-label="Progress">
      {steps.map((s, i) => {
        const done = i < activeIndex;
        const active = i === activeIndex;
        const clickable = onStepClick && done;
        const content = (
          <>
            <span
              className={cn(
                'size-7 shrink-0 rounded-full inline-flex items-center justify-center text-[12px] font-semibold border transition-colors tabular',
                done && 'bg-brand border-brand text-white',
                active && 'bg-surface border-brand text-brand ring-3 ring-brand/12',
                !done && !active && 'bg-surface border-line-strong text-muted'
              )}
            >
              {done ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
            </span>
            <span className="hidden sm:flex flex-col text-left min-w-0">
              <span className={cn('text-[13px] font-medium leading-4', active || done ? 'text-ink' : 'text-muted')}>{s.label}</span>
              {s.description && <span className="text-[12px] text-muted leading-4 mt-0.5 truncate">{s.description}</span>}
            </span>
          </>
        );
        return (
          <li key={s.label} className="flex flex-1 items-center gap-3 min-w-0" aria-current={active ? 'step' : undefined}>
            {clickable ? (
              <button type="button" onClick={() => onStepClick?.(i)} className="flex items-center gap-2.5 min-w-0 rounded-md">
                {content}
              </button>
            ) : (
              <div className="flex items-center gap-2.5 min-w-0">{content}</div>
            )}
            {i < steps.length - 1 && <span className={cn('h-px flex-1 min-w-4 mx-1 sm:mx-3', done ? 'bg-brand' : 'bg-line-strong')} aria-hidden />}
          </li>
        );
      })}
      <li className="sr-only">
        Step {activeIndex + 1} of {steps.length}: {steps[activeIndex]?.label}
      </li>
    </ol>
  );
}
