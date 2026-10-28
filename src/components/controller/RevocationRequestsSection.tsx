'use client';

import React from 'react';
import {
  FileX2,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  PenTool,
  AlertTriangle,
  Eye,
  RotateCcw,
} from 'lucide-react';
import { RevocationItem, RevocationWorkflowState } from '@/types/controller';

interface RevocationRequestsSectionProps {
  revocations: RevocationItem[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: string;
  onStatusFilterChange: (s: string) => void;
  onOpenDetailModal: (rev: RevocationItem) => void;
  onOpenCoSignModal: (rev: RevocationItem) => void;
  onOpenRejectModal: (rev: RevocationItem) => void;
  isActionLoading: boolean;
}

export const RevocationRequestsSection: React.FC<RevocationRequestsSectionProps> = ({
  revocations,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onOpenDetailModal,
  onOpenCoSignModal,
  onOpenRejectModal,
  isActionLoading,
}) => {
  const getWorkflowBadge = (state: RevocationWorkflowState) => {
    switch (state) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            Confirmed on Chain
          </span>
        );
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3 animate-spin" />
            Tx Submitted
          </span>
        );
      case 'awaiting_signature':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            <PenTool className="w-3 h-3" />
            Awaiting Signature
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300">
            <XCircle className="w-3 h-3" />
            Request Rejected
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3 h-3" />
            Tx Failed
          </span>
        );
      case 'pending_review':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" />
            Pending Review
          </span>
        );
    }
  };

  const getCertificateStatusBadge = (status: 'valid' | 'pending_revocation' | 'revoked') => {
    switch (status) {
      case 'revoked':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
            Revoked
          </span>
        );
      case 'pending_revocation':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
            Pending Revocation
          </span>
        );
      case 'valid':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
            Valid
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header Info Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-[#0B2545] flex items-center gap-2">
            <FileX2 className="w-5 h-5 text-rose-600" />
            <span>Academic Certificate Revocation Requests</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            The Registrar or faculty issuer initiates revocation with documented grounds. As Controller, inspect the evidence and supply the mandatory secondary cryptographic co-signature before any on-chain revocation is executed.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700">
            Total Requests: {revocations.length}
          </span>
        </div>
      </div>

      {/* Critical Security Callout per PDF Section 6.4 */}
      <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/90 text-xs text-amber-900 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">Cryptographic Co-signature Notice:</span> A UI approval button alone is not a valid cryptographic co-signature. The smart contract requires an issuer request paired with the Controller&apos;s cryptographic signature. Certificates remain valid until the blockchain transaction confirms.
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by Certificate ID, Student ID, Student Name, or grounds..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#0B2545] placeholder-slate-400 focus:bg-white focus:outline-none transition"
          />
        </div>

        {/* Workflow State Filter */}
        <div className="flex items-center gap-2 shrink-0">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white cursor-pointer"
          >
            <option value="all">All Workflow States</option>
            <option value="pending_review">Pending Review</option>
            <option value="awaiting_signature">Awaiting Signature</option>
            <option value="submitted">Transaction Submitted</option>
            <option value="confirmed">Confirmed on Chain</option>
            <option value="rejected">Rejected</option>
            <option value="failed">Failed / Reverted</option>
          </select>
        </div>
      </div>

      {/* Requests Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {revocations.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center p-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3 opacity-80" />
            <h4 className="text-sm font-bold text-[#0B2545]">No Revocation Requests</h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              There are currently no certificate revocation requests submitted in the system.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/90 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                  <th className="py-3.5 px-4">Certificate ID &amp; Type</th>
                  <th className="py-3.5 px-4">Student &amp; Degree</th>
                  <th className="py-3.5 px-4">Requesting Issuer</th>
                  <th className="py-3.5 px-4">Revocation Grounds</th>
                  <th className="py-3.5 px-4">Cert Status</th>
                  <th className="py-3.5 px-4">Workflow State</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {revocations.map((rev) => (
                  <tr key={rev.id} className="hover:bg-slate-50/60 transition">
                    {/* Certificate ID & Type */}
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-[#0B2545]">{rev.certificateId}</div>
                      <span className="text-[11px] text-slate-500">{rev.certificateType}</span>
                      {rev.transactionHash && (
                        <div className="text-[10px] text-teal-700 font-mono mt-0.5 flex items-center gap-1">
                          <span className="text-slate-400">Tx:</span>
                          <span className="truncate max-w-[120px]">{rev.transactionHash}</span>
                        </div>
                      )}
                    </td>

                    {/* Student & Degree */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{rev.studentName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{rev.studentId}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[160px]">{rev.program}</div>
                    </td>

                    {/* Requesting Issuer */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{rev.requestingIssuer.name}</div>
                      <div className="text-[11px] text-slate-500">{rev.requestingIssuer.department}</div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        Authorized Issuer
                      </span>
                    </td>

                    {/* Reason */}
                    <td className="py-3 px-4">
                      <p className="text-slate-700 line-clamp-2 max-w-xs text-[11px] leading-relaxed">
                        {rev.reason}
                      </p>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Requested: {rev.requestedAt}
                      </span>
                    </td>

                    {/* Current Certificate Status */}
                    <td className="py-3 px-4">
                      {getCertificateStatusBadge(rev.currentStatus)}
                    </td>

                    {/* Workflow Status */}
                    <td className="py-3 px-4">
                      {getWorkflowBadge(rev.workflowStatus)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenDetailModal(rev)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
                          title="Inspect Evidence & Record"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {(rev.workflowStatus === 'pending_review' || rev.workflowStatus === 'awaiting_signature') && (
                          <>
                            <button
                              onClick={() => onOpenCoSignModal(rev)}
                              disabled={isActionLoading}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-2xs transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              title="Co-sign Revocation"
                            >
                              <PenTool className="w-3 h-3" />
                              <span>Co-sign</span>
                            </button>

                            <button
                              onClick={() => onOpenRejectModal(rev)}
                              disabled={isActionLoading}
                              className="px-2 py-1.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              title="Reject Request"
                            >
                              <XCircle className="w-3 h-3" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}

                        {rev.workflowStatus === 'failed' && (
                          <button
                            onClick={() => onOpenCoSignModal(rev)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-2xs transition flex items-center gap-1 cursor-pointer"
                            title="Retry Co-signature"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Retry</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
