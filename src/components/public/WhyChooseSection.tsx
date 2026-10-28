'use client';

import React from 'react';
import {
  ShieldCheck,
  Fingerprint,
  QrCode,
  Ban,
  History,
  User,
  Layers,
  Lock,
} from 'lucide-react';

export const WhyChooseSection: React.FC = () => {
  const features = [
    {
      icon: <Fingerprint className="w-5 h-5 text-cyan-400" />,
      title: 'Cryptographic Certificate Verification',
      description:
        'Every credential is mathematically fingerprinted using SHA-256. Verifiers confirm authenticity against the blockchain without contacting university staff.',
      badge: 'Zero-Trust Security',
    },
    {
      icon: <QrCode className="w-5 h-5 text-cyan-400" />,
      title: 'QR-Based Verification',
      description:
        'High-density error-correcting QR code printed directly on every certificate PDF allows employers to scan and verify authenticity in milliseconds.',
      badge: 'Instant Lookup',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      title: 'Active Tamper Detection',
      description:
        'Altering even a single letter, graduation date, or CGPA decimal point breaks cryptographic equivalence, immediately flagging the document as INVALID.',
      badge: 'Pixel-Level Integrity',
    },
    {
      icon: <Ban className="w-5 h-5 text-amber-400" />,
      title: 'Audited Certificate Revocation',
      description:
        'Controller of Examinations co-signs revocations with mandatory documented justification. Revoked credentials remain permanently tracked as Revoked.',
      badge: 'Permanent Ledger',
    },
    {
      icon: <Layers className="w-5 h-5 text-blue-400" />,
      title: 'Batch Certificate Issuance',
      description:
        'Institutions can batch-process hundreds of student records from CSV files, synthesizing PDFs and anchoring credentials in a single gas-optimized transaction.',
      badge: 'Cohort Scaling',
    },
    {
      icon: <User className="w-5 h-5 text-indigo-400" />,
      title: 'Student Credential Portal',
      description:
        'Graduates securely view official certificates, download pristine vector PDFs, and generate privacy-preserving, time-limited verification links for employers.',
      badge: 'Student Ownership',
    },
    {
      icon: <History className="w-5 h-5 text-teal-400" />,
      title: 'Transparent Blockchain Audit Trail',
      description:
        'Every issuance, revocation, and public verification event is recorded in an immutable ledger with transaction hashes, timestamps, and actor references.',
      badge: 'Audit Readiness',
    },
    {
      icon: <Lock className="w-5 h-5 text-sky-400" />,
      title: 'Secure Multi-Role Access Control',
      description:
        'Enterprise governance using OpenZeppelin AccessControl. Only authorized university issuer wallets approved by the Controller can anchor credentials.',
      badge: 'Institutional RBAC',
    },
  ];

  return (
    <section id="features" className="bg-[#080D18] py-20 sm:py-28 border-b border-white/10 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-cyan-300">
              Core Platform Capabilities
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#F1F5F9] tracking-tight">
            Institutional Trust. Cryptographic Certainty.
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-normal">
            Designed for universities, graduating students, and global verifiers. Everything needed to eliminate academic credential fraud.
          </p>
        </div>

        {/* 8 Feature Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {features.map((item, index) => (
            <div
              key={index}
              className="dark-liquid-glass dark-liquid-glass-hover rounded-2xl p-6 sm:p-7 border border-white/10 flex flex-col justify-between group text-left relative overflow-hidden"
            >
              <div>
                {/* Icon & Chip Header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:border-cyan-400/40 transition-all duration-300">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-bold font-mono tracking-wider uppercase px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300 group-hover:text-cyan-300 group-hover:border-cyan-500/30 transition-colors">
                    {item.badge}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white mb-2.5 tracking-tight group-hover:text-cyan-200 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>

              {/* Bottom Subtle Indicator */}
              <div className="mt-6 pt-3.5 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <span className="group-hover:text-cyan-400 transition-colors">Enterprise Grade</span>
                <span className="font-mono opacity-40">0{index + 1}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
