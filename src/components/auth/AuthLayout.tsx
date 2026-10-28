'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col bg-[#F5F7FB] text-[#172033] font-sans">
      <div className="flex-1 flex flex-col lg:flex-row lg:h-full lg:overflow-hidden">
        {/* Left Side: Minimalist Brand Identity (Desktop) - Fixed & Non-scrolling */}
        <aside className="lg:w-[42%] xl:w-[38%] bg-[#10233F] text-white p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden shrink-0 border-r border-slate-800 lg:sticky lg:top-0 lg:h-full lg:self-start">
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
                    stroke="#06B6D4"
                    strokeWidth="0.6"
                    strokeDasharray="4,4"
                  />
                  <circle cx="0" cy="0" r="2.5" fill="#2563EB" />
                  <circle cx="60" cy="0" r="2" fill="#06B6D4" />
                  <circle cx="0" cy="60" r="2" fill="#06B6D4" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#blockchain-grid)" />
              <line
                x1="80"
                y1="120"
                x2="240"
                y2="280"
                stroke="#2563EB"
                strokeWidth="1.5"
                strokeOpacity="0.4"
              />
              <line
                x1="240"
                y1="280"
                x2="380"
                y2="220"
                stroke="#06B6D4"
                strokeWidth="1.5"
                strokeOpacity="0.4"
              />
              <line
                x1="380"
                y1="220"
                x2="160"
                y2="460"
                stroke="#2563EB"
                strokeWidth="1.5"
                strokeOpacity="0.3"
              />
              <circle cx="80" cy="120" r="5" fill="#2563EB" />
              <circle cx="240" cy="280" r="6" fill="#06B6D4" />
              <circle cx="380" cy="220" r="5" fill="#2563EB" />
              <circle cx="160" cy="460" r="4.5" fill="#06B6D4" />
            </svg>
          </div>

          {/* Top: Back to Main Site Link */}
          <div className="relative z-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3.5 py-1.5 rounded-lg border border-white/10 w-fit"
            >
              <ArrowLeft className="size-3.5" aria-hidden />
              <span>Public Verifier</span>
            </Link>
          </div>

          {/* Center: Large PUB with CertChain below */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center my-auto py-12 select-none">
            <h1 className="text-8xl sm:text-9xl lg:text-[10rem] xl:text-[11rem] font-black tracking-[0.25em] lg:tracking-[0.3em] pl-[0.25em] lg:pl-[0.3em] leading-none text-white drop-shadow-md">
              PUB
            </h1>
            <p className="mt-4 sm:mt-6 text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-[0.18em] lg:tracking-[0.22em] pl-[0.18em] lg:pl-[0.22em] text-[#06B6D4]">
              CertChain
            </p>
          </div>

          {/* Bottom Spacer for balanced centering */}
          <div className="relative z-10 h-8" />
        </aside>

        {/* Right Side: Form Area - Independently scrollable on desktop */}
        <main className="flex-1 flex flex-col justify-start items-center p-4 sm:p-6 lg:p-10 bg-[#F5F7FB] lg:overflow-y-auto lg:h-full">
          <div className="w-full max-w-xl my-auto py-4 sm:py-8">
            {/* Mobile Header (Shown only on small screens) */}
            <div className="lg:hidden flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center shadow-md border border-blue-400/30">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-base text-[#10233F]">PUB CertChain</h1>
                  <p className="text-[10px] text-[#2563EB] font-medium">Authentication Gateway</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center justify-between pt-8 border-t border-night-line text-[11.5px] text-night-muted font-mono">
          <span>PUB CertChain Registry</span>
          <span>OpenZeppelin RBAC &middot; SHA-256</span>
        </div>
      </aside>

      {/* Right Form Column */}
      <main className="flex-1 paper-grain flex flex-col justify-center items-center px-4 sm:px-6 lg:px-12 py-10 sm:py-14">
        <div className="w-full max-w-lg">{children}</div>
      </main>
    </div>
  );
};
