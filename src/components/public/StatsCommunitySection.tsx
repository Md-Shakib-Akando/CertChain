'use client';

import React from 'react';
import { Award, ShieldCheck, Cpu, Database, CheckCircle2 } from 'lucide-react';

export const StatsCommunitySection: React.FC = () => {
  return (
    <section id="about" className="bg-[#080D18] py-20 sm:py-28 border-b border-white/10 relative overflow-hidden">
      {/* Background Soft Lighting */}
      <div className="absolute top-1/2 left-1/3 w-[600px] h-[350px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Box: Institutional Vision & Problem Context */}
          <div className="lg:col-span-5 relative dark-liquid-glass rounded-3xl overflow-hidden p-8 sm:p-10 text-white flex flex-col justify-between border border-white/15 shadow-2xl">
            <div className="space-y-4">
              <span className="text-4xl sm:text-5xl font-serif text-cyan-400 font-black block leading-none">
                “
              </span>
              <p className="text-base sm:text-lg font-medium text-slate-200 leading-relaxed italic">
                Academic credential fraud and slow, manual background checks cost institutions and graduates valuable time. By combining immutable smart contracts with deterministic cryptography, CertChain establishes immediate mathematical trust.
              </p>
            </div>

            <div className="pt-6 border-t border-white/10 mt-6">
              <div className="font-extrabold text-white text-sm sm:text-base">
                Pundra University of Science & Technology
              </div>
              <div className="text-xs text-cyan-300 font-mono mt-0.5">
                Department of Computer Science & Engineering · Hackathon 2026
              </div>
            </div>
          </div>

          {/* Right Box: Architecture Specs & Cryptographic Guarantees */}
          <div className="lg:col-span-7 dark-liquid-glass rounded-3xl p-8 sm:p-12 border border-white/10 flex flex-col justify-between space-y-8 shadow-2xl">
            
            {/* Header */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Technical Specifications & Standards</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#F1F5F9] tracking-tight">
                Architectural Integrity by Design
              </h2>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed font-normal">
                Engineered to meet real-world institutional standards with enterprise role governance.
              </p>
            </div>

            {/* 3 Metric Columns with Honest, True Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono">
                  256-bit
                </div>
                <div className="text-xs text-slate-300 font-semibold mt-1">
                  SHA-256 Digest
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Deterministic PDF fingerprinting
                </div>
              </div>

              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono">
                  0 Gas
                </div>
                <div className="text-xs text-slate-300 font-semibold mt-1">
                  Public Verifier Cost
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Read-only EVM view queries
                </div>
              </div>

              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
                  100%
                </div>
                <div className="text-xs text-slate-300 font-semibold mt-1">
                  Tamper Detection
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Single-byte mismatch triggers alert
                </div>
              </div>
            </div>

            {/* Architecture Highlights Row */}
            <div className="pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center text-xs">
              <div className="flex items-center gap-2.5 text-slate-300 font-medium">
                <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>OpenZeppelin RBAC</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-300 font-medium">
                <Database className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Off-Chain Data Protection</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-300 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Ethers.js v6 Signatures</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
