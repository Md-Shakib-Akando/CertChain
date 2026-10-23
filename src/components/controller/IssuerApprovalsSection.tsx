'use client';

import React from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Eye,
  Clock,
  UserCheck,
  Mail,
} from 'lucide-react';
import { IssuerApplication, IssuerApplicationStatus } from '@/types/controller';

interface IssuerApprovalsSectionProps {
  applications: IssuerApplication[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: string;
  onStatusFilterChange: (s: string) => void;
  onOpenDetailModal: (app: IssuerApplication) => void;
  onApproveIssuer: (appId: string) => void;
  onOpenRejectModal: (app: IssuerApplication) => void;
  onOpenRequestInfoModal: (app: IssuerApplication) => void;
  isActionLoading: boolean;
  onSeedDemo: () => void;
}

export const IssuerApprovalsSection: React.FC<IssuerApprovalsSectionProps> = ({
  applications,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onOpenDetailModal,
  onApproveIssuer,
  onOpenRejectModal,
  onOpenRequestInfoModal,
  isActionLoading,
  onSeedDemo,
}) => {

  const getStatusBadge = (status: IssuerApplicationStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      case 'more_info_required':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <HelpCircle className="w-3 h-3" />
            More Info Req.
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" />
            Pending Review
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
            <UserCheck className="w-5 h-5 text-teal-600" />
            <span>Issuer Account Authorization Applications</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Review registration requests submitted by eligible Registrar and Academic Officers. Only authorized accounts are permitted to prepare certificates and initiate revocation requests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700">
            Total Applications: {applications.length}
          </span>
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
            placeholder="Search by applicant name, official email, employee ID, or department..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#0B2545] placeholder-slate-400 focus:bg-white focus:outline-none transition"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 shrink-0">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applications Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {applications.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center p-6">
            <UserCheck className="w-12 h-12 text-slate-300 mb-3" />
            <h4 className="text-sm font-bold text-[#0B2545]">No Applications Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              There are no issuer registration applications matching your search or filter criteria.
            </p>
            <button
              onClick={onSeedDemo}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-500 transition shadow-xs cursor-pointer"
            >
              Load Demo Applications
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/90 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                  <th className="py-3.5 px-4">Applicant Profile</th>
                  <th className="py-3.5 px-4">Department &amp; Designation</th>
                  <th className="py-3.5 px-4">Employee ID</th>
                  <th className="py-3.5 px-4">Requested Role</th>
                  <th className="py-3.5 px-4">Submitted At</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/60 transition">
                    {/* Applicant Profile */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#0B2545]">{app.name}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{app.email}</span>
                      </div>
                      {app.walletAddress && (
                        <div className="text-[10px] text-teal-700 font-mono mt-0.5 flex items-center gap-1">
                          <span className="text-slate-400">Wallet:</span>
                          <span>{app.walletAddress.slice(0, 6)}...{app.walletAddress.slice(-4)}</span>
                        </div>
                      )}
                    </td>

                    {/* Department / Designation */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{app.department}</div>
                      <div className="text-[11px] text-slate-500">{app.designation}</div>
                    </td>

                    {/* Employee ID */}
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-700 px-2 py-0.5 rounded bg-slate-100">
                        {app.employeeId}
                      </span>
                    </td>

                    {/* Requested Role */}
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-700">
                        {app.requestedRole}
                      </span>
                    </td>

                    {/* Submitted At */}
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {app.submittedAt}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      {getStatusBadge(app.status)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenDetailModal(app)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
                          title="View Application Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {app.status === 'pending' && (
                          <>
                            <button
                              onClick={() => onApproveIssuer(app.id)}
                              disabled={isActionLoading}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-2xs transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              title="Approve Issuer"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Approve</span>
                            </button>

                            <button
                              onClick={() => onOpenRejectModal(app)}
                              disabled={isActionLoading}
                              className="px-2 py-1.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              title="Reject Application"
                            >
                              <XCircle className="w-3 h-3" />
                              <span>Reject</span>
                            </button>

                            <button
                              onClick={() => onOpenRequestInfoModal(app)}
                              disabled={isActionLoading}
                              className="px-2 py-1.5 rounded-lg text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              title="Request More Info"
                            >
                              <HelpCircle className="w-3 h-3" />
                              <span className="hidden sm:inline">Info</span>
                            </button>
                          </>
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
