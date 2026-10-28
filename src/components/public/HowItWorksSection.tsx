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
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const [activeRoleTab, setActiveRoleTab] = useState<'issuers' | 'students' | 'verifiers'>('issuers');

  const lifecycleStages = [
    {
      num: '01',
      title: 'Issue',
      subtitle: 'Official Synthesis',
      description:
        'Authorized Registrar generates authentic degree credentials with student identity and academic records pre-matched against institutional data.',
      icon: <FileText className="w-5 h-5 text-blue-400" />,
      tag: 'Vector PDF',
    },
    {
      num: '02',
      title: 'Generate Fingerprint',
      subtitle: 'Cryptographic Hash',
      description:
        'A deterministic SHA-256 cryptographic digest is computed directly from the PDF bytes. Changing even one character produces a totally different hash.',
      icon: <Fingerprint className="w-5 h-5 text-cyan-400" />,
      tag: 'SHA-256 Digest',
    },
    {
      num: '03',
      title: 'Anchor on Chain',
      subtitle: 'Smart Contract',
      description:
        'The hash, unique Certificate ID, issuer address, and timestamp are permanently inscribed onto the decentralized blockchain ledger.',
      icon: <ChainLink className="w-5 h-5 text-teal-400" />,
      tag: 'Zero Personal Data',
    },
    {
      num: '04',
      title: 'Verify',
      subtitle: 'Zero-Gas Lookup',
      description:
        'Anyone can instantly verify credentials worldwide using the Certificate ID, scanning the printed QR code, or uploading the PDF for browser-based checking.',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      tag: 'Sub-Second',
    },
    {
      num: '05',
      title: 'Share',
      subtitle: 'Expiring Permissions',
      description:
        'Graduates generate time-limited verification links (/s/[token]) for job applications, allowing employers to inspect authenticated records directly.',
      icon: <Share2 className="w-5 h-5 text-indigo-400" />,
      tag: 'Time-Limited Links',
    },
  ];

  const roleWorkflows = {
    issuers: {
      roleTitle: 'University Issuers & Controller of Examinations',
      roleIcon: <Building className="w-5 h-5 text-cyan-400" />,
      description:
        'Institutional authorities manage credential governance with cryptographic accountability.',
      steps: [
        {
          step: '1',
          name: 'Registrar Authorization',
          detail: 'Controller of Examinations approves authorized issuer wallets on the smart contract.',
        },
        {
          step: '2',
          name: 'Single & Bulk Batch Issuance',
          detail: 'Issue individual degrees or batch-process graduating cohorts from CSV files in a single transaction.',
        },
        {
          step: '3',
          name: 'Automated Student Dispatch',
          detail: 'Synthesizes tamper-proof PDFs with QR stamps and triggers automated congratulatory emails.',
        },
        {
          step: '4',
          name: 'Deliberate Revocation Governance',
          detail: 'Initiate or co-sign revocation requests with documented justification for errors or disciplinary actions.',
        },
      ],
    },
    students: {
      roleTitle: 'Graduates & Students',
      roleIcon: <GraduationCap className="w-5 h-5 text-blue-400" />,
      description:
        'Graduates maintain complete, lifetime ownership of their academic credentials.',
      steps: [
        {
          step: '1',
          name: 'Secure Portal Access',
          detail: 'Sign in to access your complete portfolio of degree certificates, provisional certificates, and transcripts.',
        },
        {
          step: '2',
          name: 'Download Official PDFs',
          detail: 'Export high-resolution, vector-rendered certificates with embedded QR codes and blockchain anchors.',
        },
        {
          step: '3',
          name: 'Generate Employer Share Links',
          detail: 'Create time-limited verification URLs (24h, 48h, 7 days) to attach directly to CVs and job applications.',
        },
        {
          step: '4',
          name: 'Personal Verification Log',
          detail: 'Track when employers and scholarship boards view or verify your credentials.',
        },
      ],
    },
    verifiers: {
      roleTitle: 'Employers, Foreign Universities & Embassies',
      roleIcon: <Briefcase className="w-5 h-5 text-emerald-400" />,
      description:
        'Verify applicant credentials instantaneously without phone calls, delays, or paying blockchain gas.',
      steps: [
        {
          step: '1',
          name: 'No Account Required',
          detail: 'Visit the public verification page on any browser or mobile device — 100% free and open.',
        },
        {
          step: '2',
          name: 'Multi-Modal Verification',
          detail: 'Verify by typing Certificate ID, scanning the certificate QR code, or uploading the student PDF.',
        },
        {
          step: '3',
          name: 'Instant Ledger Comparison',
          detail: 'System recomputes the SHA-256 digest client-side and validates against the blockchain record.',
        },
        {
          step: '4',
          name: 'Unmistakable Results',
          detail: 'Get instant, definitive status: VALID (Authentic), REVOKED (with reason), or INVALID (Tampered / Not Found).',
        },
      ],
    },
  };

  return (
    <section
      id="how-it-works"
      className="bg-[#0D1424] py-20 sm:py-28 border-b border-white/10 relative overflow-hidden"
    >
      {/* Background Soft Lighting */}
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[350px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-cyan-300">
              End-to-End Workflow
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#F1F5F9] tracking-tight">
            The Credential Lifecycle
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-normal">
            From university issuance to global employer verification. Five simple stages powered by mathematical cryptography.
          </p>
        </div>

        {/* 5 Lifecycle Steps Horizontal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 mb-16">
          {lifecycleStages.map((stage, idx) => (
            <div
              key={stage.num}
              className="dark-liquid-glass rounded-2xl p-5 border border-white/10 relative flex flex-col justify-between text-left group hover:border-cyan-400/40 transition-all duration-200"
            >
              <div>
                {/* Header: Icon & Step Number */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {stage.icon}
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-400/60 group-hover:text-cyan-400 transition-colors">
                    {stage.num}
                  </span>
                </div>

                <div className="mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    {stage.subtitle}
                  </span>
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-200 transition-colors">
                    {stage.title}
                  </h3>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed font-normal">
                  {stage.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-medium text-slate-400">
                <span className="text-cyan-300">{stage.tag}</span>
                {idx < lifecycleStages.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-slate-400 hidden lg:block opacity-60" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Role-Specific Workflows Tabs Container */}
        <div className="dark-liquid-glass rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl">
          
          {/* Header & Tabs */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10 pb-6 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block mb-1">
                Audience Workflows
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                How CertChain Works For You
              </h3>
            </div>

            {/* Tab Buttons */}
            <div className="flex flex-wrap items-center gap-2 bg-[#080D18] p-1.5 rounded-2xl border border-white/10">
              <button
                onClick={() => setActiveRoleTab('issuers')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeRoleTab === 'issuers'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>University Staff</span>
              </button>

              <button
                onClick={() => setActiveRoleTab('students')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeRoleTab === 'students'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Graduates & Students</span>
              </button>

              <button
                onClick={() => setActiveRoleTab('verifiers')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeRoleTab === 'verifiers'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Employers & Verifiers</span>
              </button>
            </div>
          </div>

          {/* Active Role Content */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                {roleWorkflows[activeRoleTab].roleIcon}
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-bold text-white">
                  {roleWorkflows[activeRoleTab].roleTitle}
                </h4>
                <p className="text-xs sm:text-sm text-slate-400">
                  {roleWorkflows[activeRoleTab].description}
                </p>
              </div>
            </div>

            {/* 4 Steps Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {roleWorkflows[activeRoleTab].steps.map((st) => (
                <div
                  key={st.step}
                  className="bg-white/5 rounded-2xl p-5 border border-white/5 hover:border-white/15 transition-all text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-cyan-300 font-mono font-bold text-xs flex items-center justify-center mb-3">
                    {st.step}
                  </div>
                  <h5 className="text-sm font-bold text-slate-200 mb-1.5">{st.name}</h5>
                  <p className="text-xs text-slate-400 leading-relaxed font-normal">{st.detail}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
