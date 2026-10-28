'use client';

import React from 'react';
import { Shield, KeyRound, FileSignature, GraduationCap } from 'lucide-react';
import { Badge } from '@/components/ui';

export const StatsCommunitySection: React.FC = () => {
  const roles = [
    {
      role: 'Controller of Examinations',
      contractRole: 'CONTROLLER_ROLE',
      icon: KeyRound,
      scope: 'Executive Academic Authority',
      responsibilities: [
        'Reviews and approves Registrar / Issuer staff applications',
        'Authorizes issuer wallet addresses on the CertChain smart contract',
        'Provides mandatory cryptographic co-signature for certificate revocations',
      ],
    },
    {
      role: 'Registrar & Certificate Issuer',
      contractRole: 'ISSUER_ROLE',
      icon: FileSignature,
      scope: 'Credential Synthesis & Anchoring',
      responsibilities: [
        'Matches graduating students against verified academic records',
        'Issues single certificates or batch CSV cohorts onto Ethereum',
        'Submits formal revocation requests with documented justification',
      ],
    },
    {
      role: 'Super Administrator',
      contractRole: 'DEFAULT_ADMIN_ROLE',
      icon: Shield,
      scope: 'Platform & Node Infrastructure',
      responsibilities: [
        'Provisions Controller of Examinations accounts and monitors system health',
        'Audits platform-wide security logs and tamper-detection alerts',
        'Strictly separated from academic issuance and revocation decisions',
      ],
    },
    {
      role: 'Graduates & Public Verifiers',
      contractRole: 'PUBLIC / STUDENT',
      icon: GraduationCap,
      scope: 'Self-Sovereign Holding & Zero-Gas Lookup',
      responsibilities: [
        'Students download vector PDFs and create expiring /s/[token] share links',
        'Employers verify credentials by ID, QR scan, or PDF SHA-256 hash',
        'Zero gas fees and no Web3 wallet required for verification',
      ],
    },
  ];

  return (
    <section id="governance" className="bg-surface py-16 sm:py-24 border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <p className="eyebrow mb-1.5">Institutional Governance Model</p>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-ink tracking-tight">
            Separation of Academic and Technical Authority
          </h2>
          <p className="mt-2 text-sm sm:text-base text-muted leading-relaxed">
            In accordance with university examination bylaws, no single account can unilaterally issue and revoke credentials or alter audit history.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {roles.map((r) => {
            const Icon = r.icon;
            return (
              <div
                key={r.role}
                className="bg-canvas border border-line rounded-lg p-6 space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="size-10 rounded-md bg-surface border border-line text-brand inline-flex items-center justify-center shrink-0">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <div>
                      <h3 className="font-serif text-lg font-semibold text-ink">
                        {r.role}
                      </h3>
                      <p className="text-xs text-muted">{r.scope}</p>
                    </div>
                  </div>
                  <Badge tone="brand" size="sm" className="font-mono">
                    {r.contractRole}
                  </Badge>
                </div>

                <ul className="space-y-2 text-xs sm:text-[13px] text-ink-2 pt-2 border-t border-line">
                  {r.responsibilities.map((line) => (
                    <li key={line} className="flex items-start gap-2">
                      <span className="mt-1.5 size-1.5 rounded-full bg-seal shrink-0" aria-hidden />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
