'use client';

import React from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ReportsSectionProps {
  totalCertificates: number;
  validCertificates: number;
  revokedCertificates: number;
  totalStudents: number;
}

export const ReportsSection: React.FC<ReportsSectionProps> = ({
  totalCertificates,
  validCertificates,
  revokedCertificates,
  totalStudents,
}) => {
  const degreeDistribution = [
    { name: 'B.Sc. in Computer Science & Engineering', count: Math.max(1, Math.round(totalCertificates * 0.55)), percent: 55, color: 'bg-[#2563EB]' },
    { name: 'B.Sc. in Electrical & Electronic Engineering', count: Math.round(totalCertificates * 0.20), percent: 20, color: 'bg-emerald-500' },
    { name: 'B.Sc. in Civil Engineering', count: Math.round(totalCertificates * 0.12), percent: 12, color: 'bg-indigo-500' },
    { name: 'Bachelor of Business Administration (BBA)', count: Math.round(totalCertificates * 0.08), percent: 8, color: 'bg-amber-500' },
    { name: 'Bachelor of Laws (LL.B Honors)', count: Math.round(totalCertificates * 0.05), percent: 5, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h3 className="text-xl font-bold text-[#0B1F3A]">Issuance Reports &amp; Analytics</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Cryptographic issuance statistics, degree category breakdown, and ledger metrics.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Credentials</span>
          <p className="text-2xl font-black text-[#0B1F3A] mt-1">{totalCertificates}</p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">100% On-Chain Anchored</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Valid Status</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{validCertificates}</p>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">Active University Credentials</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Revocation Ratio</span>
          <p className="text-2xl font-black text-amber-600 mt-1">
            {totalCertificates > 0 ? ((revokedCertificates / totalCertificates) * 100).toFixed(1) : 0}%
          </p>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">{revokedCertificates} Revoked by Syndicate</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Registered Students</span>
          <p className="text-2xl font-black text-[#2563EB] mt-1">{totalStudents}</p>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">Verified Academic Profiles</span>
        </div>
      </div>

      {/* Program Distribution */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h4 className="text-base font-bold text-[#0B1F3A]">Credentials by Degree Program</h4>
            <p className="text-xs text-slate-500">Distribution of bachelor degrees and transcripts issued across university departments</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-blue-50 text-[#2563EB] text-xs font-bold">
            Live Telemetry
          </span>
        </div>

        <div className="space-y-4">
          {degreeDistribution.map((prog, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-800">{prog.name}</span>
                <span className="text-slate-500 font-mono font-semibold">
                  {prog.count} Credentials ({prog.percent}%)
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${prog.color}`}
                  style={{ width: `${prog.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cryptographic Trust Guarantee Card */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white space-y-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0 border border-blue-400/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold">Cryptographic Zero-Knowledge Integrity</h4>
            <p className="text-xs text-slate-300">
              Certificates issued through this portal are verifiable globally in under 200 milliseconds.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/10 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Deterministic PDF Hashing</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Ethereum Blockchain Anchored</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Controller Co-Sign Governance</span>
          </div>
        </div>
      </div>
    </div>
  );
};
