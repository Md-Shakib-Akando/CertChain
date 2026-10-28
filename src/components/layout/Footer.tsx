'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';

export const Footer: React.FC = () => {
  const router = useRouter();
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push(`/#${id}`);
    }
  };

  return (
    <footer className="bg-night text-night-muted border-t border-night-line on-night">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-10 border-b border-night-line">
          {/* Column 1: Brand & Archival Note */}
          <div className="lg:col-span-5 space-y-3.5">
            <Logo href="/" tone="light" subtitle="Pundra University of Science & Technology" />
            <p className="text-[13px] text-night-muted leading-relaxed max-w-sm">
              Official cryptographic academic credential registry. Every conferred certificate is fingerprinted with SHA-256 and anchored to Ethereum for permanent, zero-gas public verification.
            </p>
            <div className="inline-flex items-center gap-2 text-xs text-seal-bright font-mono pt-1">
              <ShieldCheck className="size-3.5 shrink-0" aria-hidden />
              <span>PUB CSE Fest-26 National Hackathon &middot; Problem A1</span>
            </div>
          </div>

          {/* Column 2: Registry Navigation */}
          <div className="lg:col-span-3 space-y-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-night-text">
              Public Verification
            </p>
            <ul className="space-y-2 text-[13px]">
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('verify')}
                  className="hover:text-night-text transition-colors"
                >
                  Verify by Certificate ID
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('verify')}
                  className="hover:text-night-text transition-colors"
                >
                  Verify by PDF SHA-256 Digest
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('how-it-works')}
                  className="hover:text-night-text transition-colors"
                >
                  Issuance &amp; Revocation Lifecycle
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('features')}
                  className="hover:text-night-text transition-colors"
                >
                  Cryptographic Architecture
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Institutional Portals */}
          <div className="lg:col-span-4 space-y-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-night-text">
              Institutional Workspaces
            </p>
            <ul className="space-y-2 text-[13px]">
              <li>
                <Link href="/login" className="hover:text-night-text transition-colors">
                  Student Credential Vault &amp; Share Links
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-night-text transition-colors">
                  Registrar &amp; Certificate Issuance Desk
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-night-text transition-colors">
                  Controller of Examinations Authority
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-night-text transition-colors">
                  Graduate &amp; Staff Onboarding
                </Link>
              </li>
              <li className="pt-1">
                <a
                  href="https://github.com/Md-Shakib-Akando/CertChain"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-brand-bright hover:underline font-medium"
                >
                  <span>Source Repository (GitHub)</span>
                  <ExternalLink className="size-3.5" aria-hidden />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-night-muted">
          <p>
            &copy; 2026 CertChain Registry &middot; Pundra University of Science &amp; Technology (PUST / PUB).
          </p>
          <p className="font-mono text-[11.5px]">
            Solidity 0.8.20 &middot; OpenZeppelin AccessControl &middot; SHA-256 Deterministic PDF
          </p>
        </div>
      </div>
    </footer>
  );
};
