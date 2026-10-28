'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col bg-canvas text-ink font-sans">
      <div className="flex-1 flex flex-col lg:flex-row lg:h-full lg:overflow-hidden">
        {/* Left Side: Minimalist Brand Identity (Desktop) - Fixed & Non-scrolling with Test Branch Theme */}
        <aside className="lg:w-[42%] xl:w-[38%] bg-night text-night-text night-grid p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden shrink-0 border-b lg:border-b-0 lg:border-r border-night-line on-night lg:sticky lg:top-0 lg:h-full lg:self-start">
          {/* Subtle Blockchain Connected Node Pattern Background (SVG) */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <svg
              className="w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
              width="100%"
              height="100%"
            >
              <defs>
                <pattern
                  id="blockchain-grid"
                  width="60"
                  height="60"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 60 0 L 0 0 0 60"
                    fill="none"
                    stroke="#D4B06A"
                    strokeWidth="0.6"
                    strokeDasharray="4,4"
                  />
                  <circle cx="0" cy="0" r="2.5" fill="#1D3A6B" />
                  <circle cx="60" cy="0" r="2" fill="#D4B06A" />
                  <circle cx="0" cy="60" r="2" fill="#D4B06A" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#blockchain-grid)" />
              <line
                x1="80"
                y1="120"
                x2="240"
                y2="280"
                stroke="#1D3A6B"
                strokeWidth="1.5"
                strokeOpacity="0.4"
              />
              <line
                x1="240"
                y1="280"
                x2="380"
                y2="220"
                stroke="#D4B06A"
                strokeWidth="1.5"
                strokeOpacity="0.4"
              />
              <line
                x1="380"
                y1="220"
                x2="160"
                y2="460"
                stroke="#1D3A6B"
                strokeWidth="1.5"
                strokeOpacity="0.3"
              />
              <circle cx="80" cy="120" r="5" fill="#1D3A6B" />
              <circle cx="240" cy="280" r="6" fill="#D4B06A" />
              <circle cx="380" cy="220" r="5" fill="#1D3A6B" />
              <circle cx="160" cy="460" r="4.5" fill="#D4B06A" />
            </svg>
          </div>

          {/* Top: Back to Main Site Link */}
          <div className="relative z-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-night-muted hover:text-night-text transition-colors bg-night-2/80 hover:bg-night-3 px-3.5 py-1.5 rounded-lg border border-night-line w-fit"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Main Site</span>
            </Link>
          </div>

          {/* Center: Large PUB with CertChain below */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center my-auto py-12 select-none">
            <h1 className="text-8xl sm:text-9xl lg:text-[10rem] xl:text-[11rem] font-black tracking-[0.25em] lg:tracking-[0.3em] pl-[0.25em] lg:pl-[0.3em] leading-none text-night-text drop-shadow-md">
              PUB
            </h1>
            <p className="mt-4 sm:mt-6 text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-[0.18em] lg:tracking-[0.22em] pl-[0.18em] lg:pl-[0.22em] text-seal-bright">
              CertChain
            </p>
          </div>

          {/* Bottom Spacer for balanced centering */}
          <div className="relative z-10 h-8" />
        </aside>

        {/* Right Side: Form Area - Independently scrollable on desktop */}
        <main className="flex-1 paper-grain flex flex-col justify-start items-center p-4 sm:p-6 lg:p-10 bg-canvas lg:overflow-y-auto lg:h-full">
          <div className="w-full max-w-xl my-auto py-4 sm:py-8">
            {/* Mobile Header (Shown only on small screens) */}
            <div className="lg:hidden flex items-center justify-between mb-6 pb-4 border-b border-line">
              <Logo href="/" tone="ink" subtitle="Authentication Gateway" />
              <Link
                href="/"
                className="text-xs font-semibold text-ink inline-flex items-center gap-1 bg-surface px-2.5 py-1.5 rounded-lg border border-line shadow-xs hover:bg-sunken transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Home</span>
              </Link>
            </div>

            {/* Active Screen Child */}
            {children}

            {/* Bottom Security Assurance */}
            <div className="mt-8 text-center text-xs text-muted space-y-1">
              <p>
                Protected by PUB CertChain University Security Architecture.
              </p>
              <div className="flex items-center justify-center gap-3 text-[11px] text-subtle pt-1 font-mono">
                <span>OpenZeppelin RBAC</span>
                <span>&middot;</span>
                <span>SHA-256 Ledger</span>
                <span>&middot;</span>
                <span>Multi-Signature</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
