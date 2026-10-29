'use client';

import React from 'react';
import {
  ShieldCheck,
  Fingerprint,
  QrCode,
  Ban,
  History,
  UserCheck,
  Layers,
  Lock,
} from 'lucide-react';
import { Badge } from '@/components/ui';

export const WhyChooseSection: React.FC = () => {
  const features = [
    {
      icon: Fingerprint,
      title: 'Deterministic SHA-256 Anchoring',
      description:
        'Each certificate PDF is generated deterministically and hashed with SHA-256. The 32-byte digest is stored on Ethereum for permanent tamper resistance.',
      badge: 'Zero-Trust Integrity',
    },
    {
      icon: ShieldCheck,
      title: 'Byte-Level Tamper Detection',
      description:
        'Altering a single character, graduation date, or CGPA decimal point produces a completely different hash and immediately flags INVALID_MODIFIED.',
      badge: 'Active Fraud Alert',
    },
    {
      icon: QrCode,
      title: 'Embedded High-Density QR Stamp',
      description:
        'Every official PDF carries an error-correcting QR code linking directly to its verification record for instant camera or image scanning.',
      badge: 'Sub-Second Lookup',
    },
    {
      icon: Ban,
      title: 'Dual-Authority Revocation',
      description:
        'Revocations require a formal justification from the Registrar and cryptographic co-signature by the Controller of Examinations.',
      badge: 'Co-Signed Governance',
    },
    {
      icon: Layers,
      title: 'Batch CSV Cohort Issuance',
      description:
        'Registrars can pre-validate graduating cohorts from CSV files and anchor multiple credentials in gas-optimized batch operations.',
      badge: 'Cohort Scale',
    },
    {
      icon: UserCheck,
      title: 'Privacy-Preserving Share Links',
      description:
        'Graduates create time-limited /s/[token] verification links for recruiters without exposing raw personal records on the public ledger.',
      badge: 'FERPA / GDPR Mindful',
    },
    {
      icon: History,
      title: 'Immutable Security Audit Log',
      description:
        'Every issuance, revocation, public verification, and tamper-detection alert is recorded with actor role, timestamp, and transaction hash.',
      badge: 'Compliance Trail',
    },
    {
      icon: Lock,
      title: 'OpenZeppelin Role Governance',
      description:
        'Smart contract permissions strictly separate Super Admin infrastructure management, Controller authority, and Registrar issuance.',
      badge: 'AccessControl RBAC',
    },
  ];

  return (
    <section id="features" className="bg-canvas py-16 sm:py-24 border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <p className="eyebrow mb-1.5">Cryptographic Architecture &amp; Security</p>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-ink tracking-tight">
            Built for Institutional Accountability
          </h2>
          <p className="mt-2 text-sm sm:text-base text-muted leading-relaxed">
            CertChain combines OpenZeppelin smart contract governance with deterministic PDF synthesis so universities retain full authority while verifiers gain mathematical certainty.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="bg-surface border border-line rounded-lg p-5 shadow-card flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="size-9 rounded-md bg-brand-soft text-brand border border-brand-line inline-flex items-center justify-center">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <Badge tone="neutral" size="sm">
                      {item.badge}
                    </Badge>
                  </div>
                  <h3 className="font-serif text-base font-semibold text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-muted leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
