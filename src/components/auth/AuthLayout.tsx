'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  ArrowLeft,
  Lock,
  Layers,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FB] text-[#172033] font-sans">
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Side: Modern University SaaS + Blockchain Identity (Desktop) */}
        <aside className="lg:w-[45%] xl:w-[42%] bg-[#10233F] text-white p-8 lg:p-14 flex flex-col justify-between relative overflow-hidden shrink-0 border-r border-slate-800">
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

          {/* Top Brand & Back Link */}
          <div className="relative z-10 space-y-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 w-fit"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Main Site</span>
            </Link>

            {/* University & Brand Header */}
            <div className="flex items-center gap-3.5 pt-1">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center shadow-lg shadow-blue-500/25 border border-blue-400/30 shrink-0">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  PUB CertChain
                </h1>
                <p className="text-xs text-[#06B6D4] font-medium tracking-wide">
                  Pundra University of Science & Technology
                </p>
              </div>
            </div>
          </div>

          {/* Center Pitch: Professional Project Overview & Pillars */}
          <div className="relative z-10 my-8 lg:my-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2563EB]/20 border border-[#2563EB]/40 text-[#06B6D4] text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#06B6D4] animate-pulse" />
              <span>Official Academic Blockchain Gateway</span>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Securing Academic Legacies with Blockchain Integrity.
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-lg font-normal">
                PUB CertChain provides an immutable, cryptographically verifiable infrastructure for Pundra University degrees and transcripts — eliminating forgery, automating verification, and empowering graduates globally.
              </p>
            </div>

            {/* 4 Professional Project Pillars */}
            <div className="grid grid-cols-1 gap-3 pt-2">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-blue-400/30 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-[#06B6D4] flex items-center justify-center shrink-0 mt-0.5 border border-blue-400/30">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-white">
                    Immutable On-Chain Records
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed mt-0.5">
                    Certificates are SHA-256 hashed and permanently anchored to the blockchain, making unauthorized alteration mathematically impossible.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-blue-400/30 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-[#06B6D4] flex items-center justify-center shrink-0 mt-0.5 border border-blue-400/30">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-white">
                    Instant Global QR Verification
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed mt-0.5">
                    Employers and international institutions can verify academic authenticity in seconds with zero waiting time or manual paperwork.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-blue-400/30 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-[#06B6D4] flex items-center justify-center shrink-0 mt-0.5 border border-blue-400/30">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-white">
                    Controller-Authorized Governance
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed mt-0.5">
                    Strict role enforcement ensures certificate issuance permissions are granted exclusively with Controller of Examinations approval.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Metrics Badge Bar */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] text-slate-300 font-medium">
                🔒 100% Tamper-Proof
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] text-slate-300 font-medium">
                ⚡ Real-Time Proof
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] text-slate-300 font-medium">
                🎓 Self-Sovereign Access
              </span>
            </div>
          </div>

          {/* Footer of Left Column */}
          <div className="relative z-10 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <KeyRound className="w-3.5 h-3.5 text-[#06B6D4]" />
              <span className="text-[11px]">TLS 1.3 End-to-End Encrypted</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">PUB-CC v1.0 Enterprise</span>
          </div>
        </aside>

        {/* Right Side: Form Area */}
        <main className="flex-1 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-10 bg-[#F5F7FB]">
          <div className="w-full max-w-xl my-auto">
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
              <Link
                href="/"
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Home</span>
              </Link>
            </div>

            {/* Active Screen Child */}
            {children}

            {/* Bottom Security Assurance */}
            <div className="mt-8 text-center text-xs text-[#64748B] space-y-1">
              <p>
                Protected by PUB CertChain University Security Architecture.
              </p>
              <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 pt-1">
                <span>Terms of Service</span>
                <span>•</span>
                <span>Privacy Policy</span>
                <span>•</span>
                <span>Security Guidelines</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
