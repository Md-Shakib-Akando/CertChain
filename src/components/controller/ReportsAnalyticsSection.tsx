'use client';

import React from 'react';
import {
  BarChart3,
  Download,
  Printer,
  ShieldCheck,
  FileX2,
  Users,
  Activity,
} from 'lucide-react';
import { ControllerStats, RevocationItem, IssuerApplication } from '@/types/controller';

interface ReportsAnalyticsSectionProps {
  stats: ControllerStats;
  revocations: RevocationItem[];
  applications: IssuerApplication[];
  onExportCsv: () => void;
}

export const ReportsAnalyticsSection: React.FC<ReportsAnalyticsSectionProps> = ({
  stats,
  revocations,
  applications,
  onExportCsv,
}) => {
  const handlePrint = () => {
    window.print();
  };

  // Compute metrics from actual database data
  const totalApps = applications.length;
  const approvedApps = applications.filter((a) => a.status === 'approved').length;
  const pendingApps = applications.filter((a) => a.status === 'pending').length;
  const rejectedApps = applications.filter((a) => a.status === 'rejected').length;

  const totalRevocations = revocations.length;
  const confirmedRevocations = revocations.filter((r) => r.workflowStatus === 'confirmed').length;
  const pendingRevocations = revocations.filter(
    (r) => r.workflowStatus === 'pending_review' || r.workflowStatus === 'awaiting_signature'
  ).length;
  const rejectedRevocations = revocations.filter((r) => r.workflowStatus === 'rejected').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Info Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-[#0B2545] flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-600" />
            <span>Operational Reports &amp; Analytics</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Real backend statistics and operational summaries of issuer authorizations, certificate revocation workflows, and smart contract health.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Print Report</span>
          </button>
          <button
            onClick={onExportCsv}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Grid: 2 Analytical Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Issuer Authorization Governance */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600" />
              <h4 className="text-sm font-bold text-[#0B2545]">
                Issuer Account Applications Summary
              </h4>
            </div>
            <span className="text-xs font-bold text-slate-600">Total: {totalApps}</span>
          </div>

          <div className="space-y-3">
            {/* Approved Bar */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-emerald-800">Authorized Active Issuers</span>
                <span className="font-mono font-bold text-slate-700">
                  {approvedApps} ({totalApps > 0 ? Math.round((approvedApps / totalApps) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${totalApps > 0 ? (approvedApps / totalApps) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Pending Bar */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-amber-800">Pending Controller Decision</span>
                <span className="font-mono font-bold text-slate-700">
                  {pendingApps} ({totalApps > 0 ? Math.round((pendingApps / totalApps) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${totalApps > 0 ? (pendingApps / totalApps) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Rejected Bar */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-rose-800">Rejected Applications</span>
                <span className="font-mono font-bold text-slate-700">
                  {rejectedApps} ({totalApps > 0 ? Math.round((rejectedApps / totalApps) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${totalApps > 0 ? (rejectedApps / totalApps) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
            All registrar authorization decisions are recorded with actor email, department affiliation, and timestamp.
          </div>
        </div>

        {/* Card 2: Revocation Workflow Status Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileX2 className="w-4 h-4 text-rose-600" />
              <h4 className="text-sm font-bold text-[#0B2545]">
                Revocation Workflow Breakdown
              </h4>
            </div>
            <span className="text-xs font-bold text-slate-600">Total: {totalRevocations}</span>
          </div>

          <div className="space-y-3">
            {/* Confirmed */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-emerald-800">Confirmed on Blockchain</span>
                <span className="font-mono font-bold text-slate-700">
                  {confirmedRevocations} ({totalRevocations > 0 ? Math.round((confirmedRevocations / totalRevocations) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${totalRevocations > 0 ? (confirmedRevocations / totalRevocations) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Pending Co-sign */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-amber-800">Pending Review / Co-signature</span>
                <span className="font-mono font-bold text-slate-700">
                  {pendingRevocations} ({totalRevocations > 0 ? Math.round((pendingRevocations / totalRevocations) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${totalRevocations > 0 ? (pendingRevocations / totalRevocations) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Rejected */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-800">Rejected Requests (Certs Retained)</span>
                <span className="font-mono font-bold text-slate-700">
                  {rejectedRevocations} ({totalRevocations > 0 ? Math.round((rejectedRevocations / totalRevocations) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-slate-400 rounded-full transition-all duration-500"
                  style={{
                    width: `${totalRevocations > 0 ? (rejectedRevocations / totalRevocations) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
            Per examination regulations, rejected revocation requests keep certificates valid and preserve the rejection reason in the audit trail.
          </div>
        </div>
      </div>

      {/* Network Sync Health & Security Summary per PDF Section 9 */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
        <h4 className="text-sm font-bold text-[#0B2545] mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-teal-600" />
          <span>Smart Contract Health &amp; Security Compliance</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Network Status
            </span>
            <span className="text-emerald-700 font-bold text-sm mt-0.5 block flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Connected (Sepolia Testnet)
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Block #{stats.blockchainNetwork.latestBlock.toLocaleString()}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Smart Contract Architecture
            </span>
            <span className="font-bold text-[#0B2545] text-sm mt-0.5 block truncate">
              PUB CertChain Verifier
            </span>
            <span className="font-mono text-[10px] text-slate-500 block truncate mt-1">
              {stats.blockchainNetwork.contractAddress}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Student Privacy Protection
            </span>
            <span className="text-emerald-700 font-bold text-sm mt-0.5 block flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              100% Off-Chain PII
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Only SHA-256 certificate hashes stored on-chain
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
