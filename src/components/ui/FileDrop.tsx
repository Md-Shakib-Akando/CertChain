'use client';

import React, { useRef, useState } from 'react';
import { Check, FileUp, X } from 'lucide-react';
import { cn } from '@/lib/cn';

/* --------------------------------------------------------------------------
   FileDrop — drag-and-drop + click-to-browse upload area.
   -------------------------------------------------------------------------- */
export function FileDrop({
  accept,
  onFile,
  onFileChange,
  file,
  onClear,
  title = 'Drop a file here, or browse',
  hint,
  disabled,
  className,
  id,
}: {
  accept?: string;
  onFile?: (file: File) => void;
  onFileChange?: (file: File | null) => void;
  file?: File | null;
  onClear?: () => void;
  title?: React.ReactNode;
  hint?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  id?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const emitFile = (f: File) => {
    onFile?.(f);
    onFileChange?.(f);
  };

  const handleClear = () => {
    onClear?.();
    onFileChange?.(null);
  };

  if (file) {
    return (
      <div className={cn('flex items-center gap-3 rounded-lg border border-line bg-surface px-4 py-3', className)}>
        <span className="size-9 rounded-md bg-success-soft text-success inline-flex items-center justify-center shrink-0">
          <Check className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink truncate">{file.name}</p>
          <p className="text-[12px] text-muted tabular">{(file.size / 1024).toFixed(1)} KB</p>
        </div>
        {(onClear || onFileChange) && (
          <button type="button" onClick={handleClear} className="size-8 inline-flex items-center justify-center rounded-md text-muted hover:text-ink hover:bg-sunken" aria-label="Remove file">
            <X className="size-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        if (disabled) return;
        const f = e.dataTransfer.files?.[0];
        if (f) emitFile(f);
      }}
      className={cn(
        'relative flex flex-col items-center justify-center text-center rounded-lg border border-dashed px-6 py-9 transition-colors',
        drag ? 'border-brand bg-brand-soft/60' : 'border-line-strong bg-sunken/40 hover:bg-sunken/70',
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
    >
      <span className="mb-3 size-10 rounded-full bg-surface border border-line text-ink-2 inline-flex items-center justify-center shadow-card" aria-hidden>
        <FileUp className="size-[18px]" />
      </span>
      <p className="text-sm font-medium text-ink">
        {title}{' '}
      </p>
      {hint && <p className="mt-1 text-[12.5px] text-muted">{hint}</p>}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-4 inline-flex items-center h-8 px-3 rounded-md border border-line-strong bg-surface text-[13px] font-medium text-ink shadow-card hover:bg-sunken cursor-pointer"
        disabled={disabled}
      >
        Choose file
      </button>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) emitFile(f);
          e.target.value = '';
        }}
      />
    </div>
  );
}
