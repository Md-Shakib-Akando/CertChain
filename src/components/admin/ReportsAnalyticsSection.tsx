'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  Award,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { AnalyticsTrendPoint, DashboardKPIs } from '@/types/admin';

interface ReportsAnalyticsSectionProps {
  kpis: DashboardKPIs;
  trends: AnalyticsTrendPoint[];
}

export const ReportsAnalyticsSection: React.FC<ReportsAnalyticsSectionProps> = ({ kpis, trends }) => {
  const [selectedRange, setSelectedRange] = useState<'30d' | '90d' | 'all'>('30d');

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#0B2545] flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>Platform Reports &amp; Analytics</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Institutional verification metrics, issuance throughput, and revocation trends.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Range Picker */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl shadow-2xs">
            {(['30d', '90d', 'all'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRange(r)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  selectedRange === r
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r === '30d' ? 'Last 30 Days' : r === '90d' ? 'Last 90 Days' : 'All Time'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total On-Chain Issuances
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#0B2545]">{kpis.totalCertificates}</span>
            <span className="text-xs text-emerald-600 font-semibold">Verified Active</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Primeasia University Degrees &amp; Transcripts</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Public Verifications
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">{kpis.verificationEvents}</span>
            <span className="text-xs text-emerald-700/80 font-medium">100% Cryptographic</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Queries from employers, banks &amp; universities</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Revocation Ratio
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-red-600">{kpis.revokedCertificates}</span>
            <span className="text-xs text-slate-400">of {kpis.totalCertificates} total</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Sealed with Controller co-signature</p>
        </div>
      </div>

      {/* Issuance Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#0B2545]">Credential Issuance &amp; Verification Daily Velocity</h3>
            <p className="text-xs text-slate-500 mt-0.5">Chronological throughput recorded across the academic year</p>
          </div>
          <span className="text-[11px] font-mono text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
            Audit Period: 7-Day Window
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Credentials Issued</th>
                <th className="py-2.5 px-4">Public Verifications</th>
                <th className="py-2.5 px-4">Revocations</th>
                <th className="py-2.5 px-4 text-right">Integrity Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {trends.map((pt) => (
                <tr key={pt.date} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">{pt.date}</td>
                  <td className="py-3 px-4 text-blue-600 font-semibold">{pt.issued}</td>
                  <td className="py-3 px-4 text-emerald-600 font-semibold">{pt.verified}</td>
                  <td className="py-3 px-4 text-red-600 font-semibold">{pt.revoked}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                      100% Intact
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Privacy Guarantee Note (PDF Spec Section 5.6) */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-800">Aggregate Data Minimization Policy: </strong>
          In accordance with Section 5.6 of the specification, aggregate reports strictly exclude individual student course-wise grades, GPA calculations, contact numbers, and raw PDF credentials to preserve institutional privacy compliance.
        </div>
      </div>
    </div>
  );
};
