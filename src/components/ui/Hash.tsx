'use client';

import React, { useState } from 'react';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/cn';

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

export function CopyButton({ value, label = 'Copy', className, showLabel }: { value: string; label?: string; className?: string; showLabel?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async (e) => {
        e.stopPropagation();
        if (await copyText(value)) {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        }
      }}
      className={cn(
        'inline-flex items-center gap-1.5 rounded text-muted hover:text-ink hover:bg-sunken transition-colors cursor-pointer',
        showLabel ? 'h-7 px-2 text-[12px] font-medium' : 'size-7 justify-center',
        className
      )}
      aria-label={copied ? 'Copied' : `${label}: ${value}`}
      title={copied ? 'Copied' : label}
    >
      {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
      {showLabel && (copied ? 'Copied' : label)}
      <span className="sr-only" aria-live="polite">{copied ? 'Copied to clipboard' : ''}</span>
    </button>
  );
}

export function truncateMiddle(value: string, head = 10, tail = 8) {
  if (!value) return '';
  if (value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

/**
 * HashText — the one way to show hashes, tx hashes, addresses and IDs.
 * Monospace, middle-truncated, with full value in title and a copy button.
 */
export function HashText({
  value,
  head,
  tail,
  start,
  end,
  full,
  copy,
  copyable,
  href,
  size = 'sm',
  className,
  label,
}: {
  value?: string | null;
  head?: number;
  tail?: number;
  start?: number;
  end?: number;
  /** Show the full value wrapped instead of truncating */
  full?: boolean;
  copy?: boolean;
  copyable?: boolean;
  /** Optional explorer link */
  href?: string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  label?: string;
}) {
  if (!value) return <span className="text-subtle">—</span>;
  const resolvedHead = head ?? start ?? 10;
  const resolvedTail = tail ?? end ?? 8;
  const shouldCopy = copy ?? copyable ?? true;
  return (
    <span className={cn('inline-flex items-center gap-0.5 min-w-0 max-w-full', className)}>
      <code
        title={value}
        className={cn(
          'font-mono text-ink-2',
          size === 'xs' ? 'text-[11.5px]' : size === 'md' ? 'text-[13.5px]' : 'text-[12.5px]',
          full ? 'break-all' : 'truncate'
        )}
      >
        {full ? value : truncateMiddle(value, resolvedHead, resolvedTail)}
      </code>
      {shouldCopy && <CopyButton value={value} label={label ? `Copy ${label}` : 'Copy'} className="shrink-0" />}
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="size-7 inline-flex items-center justify-center rounded text-muted hover:text-ink hover:bg-sunken shrink-0"
          aria-label="Open in block explorer"
          title="Open in block explorer"
        >
          <ExternalLink className="size-3.5" />
        </a>
      )}
    </span>
  );
}

/** Block explorer link helper; returns undefined for local/unknown networks. */
export function explorerTxUrl(txHash?: string | null, network?: string | null) {
  if (!txHash || !/^0x[0-9a-fA-F]{64}$/.test(txHash)) return undefined;
  const n = (network || '').toLowerCase();
  if (n.includes('sepolia')) return `https://sepolia.etherscan.io/tx/${txHash}`;
  if (n.includes('mainnet')) return `https://etherscan.io/tx/${txHash}`;
  return undefined;
}
