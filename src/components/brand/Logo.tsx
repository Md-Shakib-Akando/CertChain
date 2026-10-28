import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';

/**
 * CertChain seal mark — a guilloche-style rosette with a check, drawn as an
 * SVG so it renders crisply everywhere (header, sidebar, certificate, favicon).
 */
export function SealMark({ className, tone = 'ink' }: { className?: string; tone?: 'ink' | 'dark' | 'light' | 'gold' }) {
  const stroke = tone === 'light' ? '#F3EFE6' : tone === 'gold' ? '#9C7731' : '#1D3A6B';
  const accent = tone === 'light' ? '#D4B06A' : '#9C7731';
  const teeth = Array.from({ length: 24 });
  return (
    <svg viewBox="0 0 40 40" className={cn('size-8', className)} aria-hidden fill="none">
      {/* scalloped outer ring */}
      <g stroke={stroke} strokeWidth="1.1">
        {teeth.map((_, i) => {
          const a = (i / teeth.length) * Math.PI * 2;
          const x = 20 + Math.cos(a) * 17.2;
          const y = 20 + Math.sin(a) * 17.2;
          return <circle key={i} cx={x.toFixed(2)} cy={y.toFixed(2)} r="2.2" />;
        })}
      </g>
      <circle cx="20" cy="20" r="13.2" stroke={stroke} strokeWidth="1.4" />
      <circle cx="20" cy="20" r="10.6" stroke={accent} strokeWidth="0.9" strokeDasharray="1.4 1.6" />
      <path d="M14.6 20.4l3.6 3.5 7.4-8" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Wordmark: seal + "CertChain" with institution line. */
export function Logo({
  href = '/',
  tone = 'ink',
  subtitle = 'Pundra University',
  className,
  compact,
}: {
  href?: string | null;
  tone?: 'ink' | 'dark' | 'light';
  subtitle?: string | null;
  className?: string;
  compact?: boolean;
}) {
  const inner = (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <SealMark tone={tone === 'light' ? 'light' : 'ink'} className="size-8 shrink-0" />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className={cn('font-serif text-[19px] font-semibold tracking-[-0.01em]', tone === 'light' ? 'text-night-text' : 'text-ink')}>CertChain</span>
          {subtitle && <span className={cn('mt-1 text-[10.5px] font-medium uppercase tracking-[0.12em]', tone === 'light' ? 'text-night-muted' : 'text-muted')}>{subtitle}</span>}
        </span>
      )}
    </span>
  );
  if (!href) return inner;
  return (
    <Link href={href} className="inline-flex rounded-md" aria-label="CertChain home">
      {inner}
    </Link>
  );
}
