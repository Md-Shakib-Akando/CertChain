'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  QrCode,
  FileCheck2,
  ArrowRight,
  LayoutDashboard,
  CheckCircle2,
} from 'lucide-react';
import { useAuthSession } from '@/lib/authSession';
import { SealMark } from '@/components/brand/Logo';
import { Button, ButtonLink } from '@/components/ui';

interface LandingHeroProps {
  onStartVerify: () => void;
  onLearnMore?: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onStartVerify,
  onLearnMore,
}) => {
  const { isLoggedIn, user } = useAuthSession();
  const dashboardUrl =
    user?.role === 'student'
      ? '/dashboard/student'
      : user?.role === 'issuer' || user?.role === 'registrar'
      ? '/dashboard/issuer'
      : user?.role === 'admin' || user?.role === 'super_admin'
      ? '/admin/dashboard'
      : '/dashboard/controller';

  return (
    <section
      id="hero"
      className="relative bg-night text-night-text night-grid border-b border-night-line on-night overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Left Column: Editorial Introduction & Primary Actions */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-night-2 border border-night-line text-[11px] font-semibold uppercase tracking-[0.12em] text-seal-bright">
                <span className="size-1.5 rounded-full bg-seal-bright" aria-hidden />
                Pundra University Credential Registry
              </span>
              {isLoggedIn && (
                <Link
                  href={dashboardUrl}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-night-3 border border-night-line text-xs text-night-text hover:border-white/25 transition-colors"
                >
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  <span>Signed in as {user?.name || 'User'}</span>
                </Link>
              )}
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[52px] font-semibold tracking-[-0.015em] leading-[1.1] text-night-text">
              University degrees, anchored on-chain and verifiable in seconds.
            </h1>

            <p className="text-base sm:text-[17px] text-night-muted leading-relaxed max-w-xl">
              CertChain binds every Pundra University degree and transcript to a deterministic SHA-256 fingerprint on Ethereum. Employers, embassies, and universities can confirm authenticity immediately—with zero gas fees and no manual registrar inquiries.
            </p>

            {/* Primary Calls to Action */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button
                variant="night"
                size="lg"
                onClick={onStartVerify}
                rightIcon={<ArrowRight />}
              >
                Verify a Certificate
              </Button>

              <Button
                variant="night-ghost"
                size="lg"
                onClick={() => {
                  if (onLearnMore) {
                    onLearnMore();
                  } else {
                    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                How Verification Works
              </Button>

              {isLoggedIn && (
                <ButtonLink
                  href={dashboardUrl}
                  variant="night-ghost"
                  size="lg"
                  leftIcon={<LayoutDashboard />}
                >
                  Open Workspace
                </ButtonLink>
              )}
            </div>

            {/* Key Guarantees Strip */}
            <dl className="pt-5 border-t border-night-line grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="flex items-start gap-2.5">
                <FileCheck2 className="size-4 text-seal-bright shrink-0 mt-0.5" aria-hidden />
                <div>
                  <dt className="font-semibold text-night-text">SHA-256 Byte Integrity</dt>
                  <dd className="text-night-muted mt-0.5">1-byte alteration flags tampering</dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <QrCode className="size-4 text-seal-bright shrink-0 mt-0.5" aria-hidden />
                <div>
                  <dt className="font-semibold text-night-text">Multi-Modal Lookup</dt>
                  <dd className="text-night-muted mt-0.5">Verify by ID, QR scan, or PDF</dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="size-4 text-seal-bright shrink-0 mt-0.5" aria-hidden />
                <div>
                  <dt className="font-semibold text-night-text">Dual-Authority Governance</dt>
                  <dd className="text-night-muted mt-0.5">Controller co-signed revocations</dd>
                </div>
              </div>
            </dl>
          </div>

          {/* Right Column: Archival Credential Specimen Card */}
          <div className="lg:col-span-6">
            <div className="max-w-lg mx-auto lg:ml-auto">
              {/* Paper Diploma Specimen */}
              <div className="bg-[#FCFBF7] text-[#141B26] rounded-md p-2.5 shadow-document border border-[#E3DFD5]">
                <div className="border-2 border-[#0B1F3A] p-1">
                  <div className="border border-[#9C7731] p-5 sm:p-6 relative">
                    <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E3DFD5]">
                      <div className="flex items-center gap-3">
                        <SealMark tone="ink" className="size-9 shrink-0" />
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9C7731]">
                            Official Academic Credential
                          </p>
                          <h2 className="font-serif text-sm sm:text-base font-bold text-[#0B1F3A]">
                            Pundra University of Science &amp; Technology
                          </h2>
                          <p className="text-[11px] text-[#64748B]">
                            Bogura, Bangladesh &middot; Syndicate Authority
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#E6F3EC] text-[#146C43] border border-[#B9DCC8] text-[11px] font-semibold shrink-0">
                        <CheckCircle2 className="size-3" aria-hidden />
                        Verified
                      </span>
                    </div>

                    <div className="py-4 space-y-3">
                      <div>
                        <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#64748B]">
                          Conferred Upon
                        </p>
                        <p className="font-serif text-xl sm:text-2xl font-bold text-[#0B1F3A] mt-0.5">
                          Md. Shakib Akando
                        </p>
                        <p className="text-xs font-mono font-medium text-[#9C7731]">
                          Student ID: 0322410105101055
                        </p>
                      </div>

                      <div className="rounded bg-[#F6F5F1] border border-[#E3DFD5] p-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#64748B]">
                            Degree Program
                          </p>
                          <p className="font-serif text-sm font-semibold text-[#141B26] truncate">
                            B.Sc. in Computer Science &amp; Engineering
                          </p>
                        </div>
                        <div className="text-right pl-3 border-l border-[#E3DFD5] shrink-0">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#64748B]">
                            CGPA
                          </p>
                          <p className="font-mono text-sm font-bold text-[#146C43] tabular">
                            3.88 / 4.00
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E3DFD5] flex items-center justify-between gap-2 text-[11px] text-[#3B4452]">
                      <span className="font-mono font-medium text-[#0B1F3A]">
                        ID: PUB-DEG-2026-000105
                      </span>
                      <button
                        type="button"
                        onClick={onStartVerify}
                        className="text-xs font-semibold text-[#1D3A6B] hover:underline inline-flex items-center gap-1"
                      >
                        Inspect live record &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cryptographic Ledger Receipt Bar beneath specimen */}
              <div className="mt-3 rounded-md bg-night-2 border border-night-line px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="size-2 rounded-full bg-emerald-400 shrink-0" aria-hidden />
                  <span className="text-night-muted shrink-0">SHA-256:</span>
                  <span className="text-night-text truncate">
                    c1dbba77e693ebb2a18510ae6b4a2546...
                  </span>
                </div>
                <span className="text-seal-bright shrink-0 text-[11px]">
                  Ethereum &middot; Zero-Gas Read
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
