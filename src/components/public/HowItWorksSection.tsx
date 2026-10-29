'use client';

import React, { useState } from 'react';
import {
  FileText,
  Fingerprint,
  Link as ChainLink,
  ShieldCheck,
  Share2,
  Building,
  GraduationCap,
  Briefcase,
} from 'lucide-react';
import { Card, CardBody, Segmented, Badge } from '@/components/ui';

export const HowItWorksSection: React.FC = () => {
  const [activeRoleTab, setActiveRoleTab] = useState<'issuers' | 'students' | 'verifiers'>('issuers');

  const lifecycleStages = [
    {
      num: '01',
      title: 'Synthesize Record',
      tag: 'Deterministic PDF',
      description:
        'Authorized Registrar validates student academic standing against official records and synthesizes a deterministic A4 vector PDF.',
      icon: FileText,
    },
    {
      num: '02',
      title: 'Compute SHA-256',
      tag: '256-Bit Digest',
      description:
        'A canonical SHA-256 cryptographic digest is computed directly from the normalized PDF byte buffer.',
      icon: Fingerprint,
    },
    {
      num: '03',
      title: 'Anchor On-Chain',
      tag: 'Zero Personal Data',
      description:
        'Only the Certificate ID, 32-byte SHA-256 hash, issuer wallet, and timestamp are committed to the Ethereum smart contract.',
      icon: ChainLink,
    },
    {
      num: '04',
      title: 'Instant Verification',
      tag: 'Zero-Gas View Call',
      description:
        'Verifiers query the ledger by ID, scan the high-density QR code, or drop the PDF to verify byte-level authenticity.',
      icon: ShieldCheck,
    },
    {
      num: '05',
      title: 'Time-Bound Sharing',
      tag: 'Tokenized Access',
      description:
        'Graduates generate time-expiring employer share links (/s/[token]) with optional view caps and instant revocation.',
      icon: Share2,
    },
  ];

  const roleWorkflows = {
    issuers: {
      roleTitle: 'Registrar & Controller of Examinations',
      description:
        'Separation of duties between credential issuance (Registrar) and executive oversight / revocation co-signing (Controller of Examinations).',
      steps: [
        {
          step: '01',
          name: 'Controller Wallet Authorization',
          detail: 'The Controller of Examinations reviews staff applications and grants ISSUER_ROLE on the CertChain smart contract.',
        },
        {
          step: '02',
          name: 'Single or Cohort CSV Issuance',
          detail: 'Registrar matches student records, previews the academic certificate, and anchors single or batch cohorts on-chain.',
        },
        {
          step: '03',
          name: 'Dual-Authority Revocation',
          detail: 'If an error or disciplinary action occurs, the Registrar submits a revocation request that requires Controller co-signature.',
        },
      ],
    },
    students: {
      roleTitle: 'Graduating Students & Alumni',
      description:
        'Self-service onboarding matched against official university records, with full control over how credentials are shared.',
      steps: [
        {
          step: '01',
          name: 'OTP & Academic Record Verification',
          detail: 'Students verify their university email via OTP and match their Student ID against pre-seeded graduation records.',
        },
        {
          step: '02',
          name: 'Download Vector PDF with QR Stamp',
          detail: 'Access official degree certificates and transcripts with embedded high-density verification QR codes.',
        },
        {
          step: '03',
          name: 'Create Expiring Employer Share Links',
          detail: 'Generate custom /s/[token] links for recruiters with configurable expiration windows and view counters.',
        },
      ],
    },
    verifiers: {
      roleTitle: 'Employers, Embassies & Other Universities',
      description:
        'Frictionless public verification without creating an account, connecting a Web3 wallet, or paying gas fees.',
      steps: [
        {
          step: '01',
          name: 'Enter ID, Scan QR, or Drop PDF',
          detail: 'Choose any of the three verification modes in the public workbench above.',
        },
        {
          step: '02',
          name: 'Client-Side Cryptographic Comparison',
          detail: 'Uploaded PDFs are hashed in the browser via Web Crypto API and compared against the immutable smart contract record.',
        },
        {
          step: '03',
          name: 'Inspect On-Chain Proof',
          detail: 'Confirm VALID, REVOKED, or TAMPERED status along with block number and transaction hash.',
        },
      ],
    },
  };

  const currentRole = roleWorkflows[activeRoleTab];

  return (
    <section id="how-it-works" className="bg-surface py-16 sm:py-24 border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Header */}
        <div className="max-w-2xl">
          <p className="eyebrow mb-1.5">Credential Lifecycle</p>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-ink tracking-tight">
            From Registrar Issuance to Global Verification
          </h2>
          <p className="mt-2 text-sm sm:text-base text-muted leading-relaxed">
            Every certificate follows a five-stage cryptographic pipeline designed to preserve student privacy while making forgery mathematically detectable.
          </p>
        </div>

        {/* 5-Stage Pipeline Grid */}
        <ol className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {lifecycleStages.map((stage) => {
            const Icon = stage.icon;
            return (
              <li
                key={stage.num}
                className="bg-canvas border border-line rounded-lg p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="font-mono text-xs font-semibold text-seal">
                      STEP {stage.num}
                    </span>
                    <span className="size-8 rounded-md bg-surface border border-line text-brand inline-flex items-center justify-center">
                      <Icon className="size-4" aria-hidden />
                    </span>
                  </div>
                  <h3 className="font-serif text-base font-semibold text-ink">
                    {stage.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-muted leading-relaxed">
                    {stage.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-line">
                  <Badge tone="neutral" size="sm">
                    {stage.tag}
                  </Badge>
                </div>
              </li>
            );
          })}
        </ol>

        {/* Role-Specific Workflows */}
        <Card className="bg-canvas">
          <CardBody className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-line">
              <div>
                <p className="eyebrow">Role-Based Workflows</p>
                <h3 className="font-serif text-xl font-semibold text-ink mt-1">
                  {currentRole.roleTitle}
                </h3>
                <p className="text-xs sm:text-sm text-muted mt-0.5">
                  {currentRole.description}
                </p>
              </div>
              <Segmented
                ariaLabel="Select stakeholder role"
                value={activeRoleTab}
                onChange={setActiveRoleTab}
                items={[
                  { key: 'issuers', label: 'University Staff', icon: <Building /> },
                  { key: 'students', label: 'Students', icon: <GraduationCap /> },
                  { key: 'verifiers', label: 'Public Verifiers', icon: <Briefcase /> },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {currentRole.steps.map((s) => (
                <div
                  key={s.step}
                  className="bg-surface border border-line rounded-md p-4 space-y-1.5"
                >
                  <span className="font-mono text-xs font-semibold text-brand">
                    {s.step}
                  </span>
                  <h4 className="text-sm font-semibold text-ink">{s.name}</h4>
                  <p className="text-xs text-muted leading-relaxed">{s.detail}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </section>
  );
};
