'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, KeyRound, FileCheck2 } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-canvas text-ink font-sans">
      {/* Left Archival Column (Desktop) */}
      <aside className="lg:w-[44%] xl:w-[42%] bg-night text-night-text night-grid p-8 lg:p-12 xl:p-14 flex flex-col justify-between relative shrink-0 border-b lg:border-b-0 lg:border-r border-night-line on-night">
        <div className="space-y-8">
          <div className="flex items-center justify-between gap-4">
            <Logo href="/" tone="light" subtitle="Pundra University of Science & Technology" />
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-night-line bg-night-2/80 hover:bg-night-3 text-xs font-medium text-night-text transition-colors"
            >
              <ArrowLeft className="size-3.5" aria-hidden />
              <span>Public Verifier</span>
            </Link>
          </div>

          <div className="space-y-3 pt-2 lg:pt-6">
            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm bg-night-2 border border-night-line text-[11px] font-semibold uppercase tracking-[0.12em] text-seal-bright">
              Institutional Credential Gateway
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight leading-[1.15] text-night-text">
              Cryptographic Governance for Academic Records.
            </h1>
            <p className="text-sm text-night-muted leading-relaxed max-w-md">
              CertChain enforces role-based access across students, registrars, and the Controller of Examinations—anchoring every official degree fingerprint to Ethereum.
            </p>
          </div>

          {/* 3 Governance Pillars (Desktop) */}
          <div className="hidden sm:grid grid-cols-1 gap-3 pt-2">
            <div className="rounded-md bg-night-2/90 border border-night-line p-4 flex items-start gap-3">
              <span className="mt-0.5 size-8 rounded bg-night-3 border border-night-line text-seal-bright inline-flex items-center justify-center shrink-0">
                <FileCheck2 className="size-4" aria-hidden />
              </span>
              <div>
                <h2 className="text-xs font-semibold text-night-text">
                  Immutable SHA-256 Ledger Anchoring
                </h2>
                <p className="text-xs text-night-muted mt-0.5 leading-relaxed">
                  Every certificate PDF is deterministically fingerprinted so any unauthorized modification is immediately detected.
                </p>
              </div>
            </div>

            <div className="rounded-md bg-night-2/90 border border-night-line p-4 flex items-start gap-3">
              <span className="mt-0.5 size-8 rounded bg-night-3 border border-night-line text-seal-bright inline-flex items-center justify-center shrink-0">
                <KeyRound className="size-4" aria-hidden />
              </span>
              <div>
                <h2 className="text-xs font-semibold text-night-text">
                  Controller-Authorized Issuance &amp; Co-Signing
                </h2>
                <p className="text-xs text-night-muted mt-0.5 leading-relaxed">
                  Registrar wallets require Controller of Examinations authorization; revocations require dual cryptographic co-signing.
                </p>
              </div>
            </div>

            <div className="rounded-md bg-night-2/90 border border-night-line p-4 flex items-start gap-3">
              <span className="mt-0.5 size-8 rounded bg-night-3 border border-night-line text-seal-bright inline-flex items-center justify-center shrink-0">
                <ShieldCheck className="size-4" aria-hidden />
              </span>
              <div>
                <h2 className="text-xs font-semibold text-night-text">
                  Verified Graduate Onboarding
                </h2>
                <p className="text-xs text-night-muted mt-0.5 leading-relaxed">
                  Student accounts are matched against official university admission records and verified via email OTP.
                </p>
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
