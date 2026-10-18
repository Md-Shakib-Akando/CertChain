'use client';

import React from 'react';
import {
  
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  
} from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      badge: 'Issuance',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200/80',
      title: 'Issue Certificate',
      description:
        'University staff generates and digitally issues an official certificate (PDF) with student credentials and academic metadata.',
      highlight: 'Tamper-Proof PDF Format',
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
      ),
    },
    {
      num: '02',
      badge: 'Cryptography',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
      title: 'Generate Hash',
      description:
        'A cryptographic SHA-256 digital fingerprint is computed from the certificate. Changing even a single pixel alters the hash completely.',
      highlight: 'SHA-256 Digital Fingerprint',
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="4" y1="9" x2="20" y2="9" />
          <line x1="4" y1="15" x2="20" y2="15" />
          <line x1="10" y1="3" x2="8" y2="21" />
          <line x1="16" y1="3" x2="14" y2="21" />
        </svg>
      ),
    },
    {
      num: '03',
      badge: 'Blockchain',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200/80',
      title: 'Record on Blockchain',
      description:
        'The hash, Certificate ID, university identity, and issue date are permanently written to an immutable decentralized smart contract.',
      highlight: 'Immutable Smart Contract',
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
    },
    {
      num: '04',
      badge: 'Verification',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      title: 'Verify Certificate',
      description:
        'Anyone can instantly verify authenticity within seconds by entering the ID, scanning the QR code, or uploading the PDF document.',
      highlight: 'Instant Global Validation',
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      ),
    },
  ];

  return (
    <section
      id="how-it-works"
      className="relative bg-gradient-to-b from-[#F6F9FD] via-[#EDF3FA] to-[#F6F9FD] py-20 sm:py-24 border-b border-slate-200/80 overflow-hidden"
    >
      {/* Background Soft Accent Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-blue-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header: Executive & Clean */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-14 sm:mb-16 gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/70 text-[#2563EB] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
              <span className="text-[11px] font-bold tracking-widest uppercase">
                Simple & Transparent Process
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#0B2545] tracking-tight">
              How It Works
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl">
              From cryptographic issuance to instant global verification — all secured permanently on the blockchain.
            </p>
          </div>

          {/* Right Header Pill: Security Guarantee */}
          <div className="hidden md:flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-slate-200/80 px-4 py-2.5 rounded-xl shadow-xs text-xs font-semibold text-slate-700">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/60">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span>100% Tamper-Evident & Immutable</span>
          </div>
        </div>

        {/* 4 Professional Pipeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7 relative">
          {steps.map((step, idx) => (
            <div
              key={step.num}
              className="relative bg-white/95 backdrop-blur-sm rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-[0_4px_20px_rgba(15,23,42,0.04)] hover:shadow-[0_16px_36px_rgba(37,99,235,0.12)] hover:-translate-y-1.5 hover:border-blue-300 transition-all duration-300 flex flex-col justify-between group overflow-visible"
            >
              {/* Top Accent Gradient Bar on Hover */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl" />

              <div>
                {/* Top Row: Icon Container & Step Number */}
                <div className="flex items-center justify-between mb-5">
                  <div className="w-13 h-13 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/70 border border-blue-200/70 text-[#2563EB] flex items-center justify-center shadow-xs group-hover:scale-110 group-hover:bg-[#2563EB] group-hover:text-white group-hover:border-blue-600 transition-all duration-300">
                    {step.icon}
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-bold text-slate-400 group-hover:text-blue-500 transition-colors uppercase tracking-wider">
                      Step
                    </span>
                    <span className="text-2xl font-black text-slate-300 group-hover:text-[#2563EB]/50 transition-colors font-mono">
                      {step.num}
                    </span>
                  </div>
                </div>

                {/* Badge Tag */}
                <div className="inline-block mb-3">
                  <span
                    className={`text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-md border ${step.badgeColor}`}
                  >
                    {step.badge}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#2563EB] transition-colors tracking-tight">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2 font-normal">
                  {step.description}
                </p>
              </div>

              {/* Bottom Micro Highlight */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-[11px] font-medium text-slate-500 group-hover:text-blue-600 transition-colors">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{step.highlight}</span>
              </div>

              {/* Connecting Circle Arrow between cards on desktop */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:flex items-center justify-center absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white border border-slate-200 shadow-md text-slate-400 group-hover:text-blue-600 group-hover:border-blue-400 transition-colors pointer-events-none">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Assurance Bar */}
        <div className="mt-12 sm:mt-14 pt-8 border-t border-slate-200/80 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-slate-600 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>Zero manual verification required</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>Works in any web browser without plugins</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>Cryptographic mathematical certainty</span>
          </div>
        </div>

      </div>
    </section>
  );
};
