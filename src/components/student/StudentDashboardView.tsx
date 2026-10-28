'use client';

import React from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  Share2,
  ArrowRight,
  ShieldAlert,
  Download,
  Eye,
  Clock,
  History,
  FileCheck,
  ShieldCheck,
} from 'lucide-react';
import { StudentDashboardViewProps } from '@/types/student';

export const StudentDashboardView: React.FC<StudentDashboardViewProps> = ({
  profile,
  certificates,
  shareLinks,
  auditLogs,
  onNavigateTab,
  onOpenCertificateDetail,
  onOpenShareModal,
  onDownloadPdf,
}) => {
  const totalCount = certificates.length;
  const validCount = certificates.filter((c) => c.status === 'valid').length;
  const revokedCerts = certificates.filter((c) => c.status === 'revoked');
  const revokedCount = revokedCerts.length;
  const activeLinksCount = shareLinks.filter((l) => l.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner (Matches Dark Liquid Glass theme) */}
      <div className="bg-[#121C2E] rounded-2xl border border-white/10 p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Official Student Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F1F5F9] tracking-tight">
              Welcome back, {profile.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Last login: {profile.lastLoginTime}
              </span>
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigateTab('certificates')}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-white/10 transition cursor-pointer"
            >
              <Award className="w-4 h-4 text-cyan-400" />
              <span>View Certificates</span>
            </button>
            <button
              onClick={() => onOpenShareModal()}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/25 border border-cyan-400/30 transition cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Create Share Link</span>
            </button>
            <button
              onClick={() => onNavigateTab('activity')}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-white/10 transition cursor-pointer"
            >
              <History className="w-4 h-4 text-slate-400" />
              <span>View Activity</span>
            </button>
          </div>
        </div>
      </div>

      {/* Revocation Alert Banner */}
      {revokedCount > 0 && (
        <div className="rounded-2xl bg-red-950/40 border border-red-500/30 p-5 shadow-xl">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="space-y-2 flex-1">
              <div>
                <h3 className="text-sm font-bold text-red-300 uppercase tracking-wide">
                  Academic Notice: {revokedCount} Certificate Flagged as Revoked on Smart Contract
                </h3>
              </div>
              {revokedCerts.map((rc) => (
                <div key={rc.id} className="text-xs text-red-200 bg-[#0D1424] p-3 rounded-xl border border-red-500/30">
                  <div className="font-semibold text-white flex flex-wrap items-center gap-2">
                    <span>{rc.type} ({rc.id})</span>
                    <span className="text-[11px] text-red-400 font-normal">
                      Revocation Date: {rc.revocationDate || 'Recent'}
                    </span>
                  </div>
                  <p className="mt-1 text-slate-300">
                    <strong>Reason:</strong> {rc.revocationReason || 'Revoked by the Controller of Examinations.'}
                  </p>
                  {rc.revocationTxHash && (
                    <p className="mt-1 font-mono text-[11px] text-slate-400 truncate">
                      Revocation Tx: {rc.revocationTxHash}
                    </p>
                  )}
                </div>
              ))}
              <p className="text-[11px] text-red-400/80">
                Revoked status is permanently synchronized from the smart contract. Downloads and shares remain accessible for academic audit trails but are explicitly stamped as REVOKED.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4 Summary Cards (Bento Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Certificates */}
        <div
          onClick={() => onNavigateTab('certificates')}
          className="group cursor-pointer rounded-2xl bg-[#121C2E] border border-white/10 hover:border-cyan-400/30 p-5 transition-all shadow-xl hover:shadow-cyan-500/5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Credentials</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#F1F5F9]">{totalCount}</span>
            <span className="text-xs text-slate-400">issued by PUB</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Degree, Provisional, Transcript</p>
        </div>

        {/* Card 2: Valid Certificates */}
        <div
          onClick={() => onNavigateTab('certificates')}
          className="group cursor-pointer rounded-2xl bg-[#121C2E] border border-white/10 hover:border-emerald-500/30 p-5 transition-all shadow-xl hover:shadow-emerald-500/5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Valid on-chain</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400">{validCount}</span>
            <span className="text-xs text-emerald-300/80 font-medium">Verified authentic</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Cryptographically intact</p>
        </div>

        {/* Card 3: Revoked Certificates */}
        <div
          onClick={() => onNavigateTab('certificates')}
          className="group cursor-pointer rounded-2xl bg-[#121C2E] border border-white/10 hover:border-red-500/30 p-5 transition-all shadow-xl hover:shadow-red-500/5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Revoked / Superseded</span>
            <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 group-hover:scale-105 transition-transform">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-red-400">{revokedCount}</span>
            <span className="text-xs text-red-300/80 font-medium">Flagged on chain</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Transparent reasons logged</p>
        </div>

        {/* Card 4: Active Share Links */}
        <div
          onClick={() => onNavigateTab('links')}
          className="group cursor-pointer rounded-2xl bg-[#121C2E] border border-white/10 hover:border-cyan-400/30 p-5 transition-all shadow-xl hover:shadow-cyan-500/5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Share Links</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
              <Share2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-cyan-400">{activeLinksCount}</span>
            <span className="text-xs text-cyan-300/80 font-medium">Live links</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Time-limited verification URLs</p>
        </div>
      </div>

      {/* Main Grid: Recent Certificates & Recent Activity Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Certificates List Preview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-[#F1F5F9]">Your Issued Credentials</h2>
            </div>
            <button
              onClick={() => onNavigateTab('certificates')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {certificates.length === 0 ? (
              <div className="rounded-2xl bg-[#121C2E] border border-white/10 p-8 text-center shadow-xl">
                <Award className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-[#F1F5F9]">No Certificates Issued Yet</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  When your official academic credentials or degrees are verified and recorded on the blockchain, they will appear here.
                </p>
              </div>
            ) : (
              certificates.map((cert) => {
                const isValid = cert.status === 'valid';
                return (
                  <div
                    key={cert.id}
                    className="rounded-2xl bg-[#121C2E] border border-white/10 hover:border-white/20 p-5 transition-all shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-[#F1F5F9]">{cert.type}</span>
                        <span className="font-mono text-xs text-cyan-300 bg-cyan-500/10 border border-cyan-400/30 px-2 py-0.5 rounded-md font-semibold">
                          {cert.id}
                        </span>
                        {isValid ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            Valid On-Chain
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-0.5 rounded-full">
                            <XCircle className="w-3 h-3 text-red-400" />
                            Revoked
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 font-medium">
                        {cert.program} • {cert.session} ({cert.batch})
                      </p>
                      <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span>Issued: {cert.issueDate}</span>
                        <span className="text-slate-600">•</span>
                        <span className="font-mono text-[10px] text-slate-400 truncate max-w-xs">
                          SHA-256: {cert.sha256Hash.slice(0, 16)}...
                        </span>
                      </div>
                    </div>

                    {/* Actions for this Certificate */}
                    <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                      <button
                        onClick={() => onOpenCertificateDetail(cert)}
                        className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition cursor-pointer"
                        title="View PDF & Blockchain Proof"
                      >
                        <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => onDownloadPdf(cert)}
                        className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition cursor-pointer"
                        title="Download Official Issued PDF"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-400" />
                        <span>PDF</span>
                      </button>
                      <button
                        onClick={() => onOpenShareModal(cert)}
                        className="px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                        title="Generate Secure Share Link"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Activity Log Audit Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-[#F1F5F9]">Recent Activity</h2>
            </div>
            <button
              onClick={() => onNavigateTab('activity')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="rounded-2xl bg-[#121C2E] border border-white/10 p-5 space-y-4 shadow-xl">
            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
              {auditLogs.slice(0, 4).map((item) => (
                <div key={item.id} className="relative group">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-4 ring-[#121C2E]" />
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#F1F5F9] leading-tight">{item.title}</span>
                      {item.method && (
                        <span className="text-[10px] bg-white/5 text-slate-300 border border-white/10 px-1.5 py-0.5 rounded shrink-0">
                          {item.method}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{item.description}</p>
                    <span className="text-[10px] text-slate-500 mt-1 block">{item.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigateTab('activity')}
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>View Complete Audit Trail</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
