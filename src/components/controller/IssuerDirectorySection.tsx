'use client';

import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  Copy,
  Eye,
  AlertTriangle,
  Lock,
  Unlock,
} from 'lucide-react';
import { IssuerApplication, ContractAuthorizationStatus, AccountStatus } from '@/types/controller';

interface IssuerDirectorySectionProps {
  issuers: IssuerApplication[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: string;
  onStatusFilterChange: (s: string) => void;
  onOpenDetailModal: (issuer: IssuerApplication) => void;
  onSuspendIssuer: (issuerId: string, reason: string) => void;
  onReactivateIssuer: (issuerId: string) => void;
  isActionLoading: boolean;
  onSeedDemo: () => void;
}

export const IssuerDirectorySection: React.FC<IssuerDirectorySectionProps> = ({
  issuers,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onOpenDetailModal,
  onSuspendIssuer,
  onReactivateIssuer,
  isActionLoading,
  onSeedDemo,
}) => {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [suspensionModalUser, setSuspensionModalUser] = useState<IssuerApplication | null>(null);
  const [suspendReason, setSuspendReason] = useState('');

  const handleCopy = (address: string, id: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(id);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const getContractAuthBadge = (status: ContractAuthorizationStatus) => {
    switch (status) {
      case 'authorized':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            Authorized
          </span>
        );
      case 'unauthorized':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3" />
            Unauthorized
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" />
            Pending On-Chain
          </span>
        );
      case 'unknown':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            Unknown
          </span>
        );
    }
  };

  const getAccountStatusBadge = (status: AccountStatus) => {
    if (status === 'suspended') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
          <Lock className="w-3 h-3" />
          Suspended
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
        <Unlock className="w-3 h-3" />
        Active
      </span>
    );
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header Info Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-[#0B2545] flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            <span>Authorized Registrar &amp; Issuer Directory</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Searchable registry of approved academic issuers, bound cryptographic wallet addresses, and active authorization state on the Ethereum Sepolia smart contract.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700">
            Total Issuers: {issuers.length}
          </span>
        </div>
      </div>

      {/* Critical Institutional Policy Banner per PDF Section 7 */}
      <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">Institutional Policy Boundary:</span> Suspending an issuer does not automatically revoke certificates previously issued by them. Application account status and smart-contract authorization status are maintained as distinct fields.
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
            placeholder="Search by issuer name, email, department, or wallet address..."
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
            <option value="all">All Account Statuses</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended Only</option>
          </select>
        </div>
      </div>

      {/* Issuers Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {issuers.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center p-6">
            <Users className="w-12 h-12 text-slate-300 mb-3" />
            <h4 className="text-sm font-bold text-[#0B2545]">No Issuers Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              There are no registered issuers matching your search or filters.
            </p>
            <button
              onClick={onSeedDemo}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-500 transition shadow-xs cursor-pointer"
            >
              Load Demo Issuers
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/90 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                  <th className="py-3.5 px-4">Issuer Profile</th>
                  <th className="py-3.5 px-4">Bound Wallet Address</th>
                  <th className="py-3.5 px-4">Contract Authorization</th>
                  <th className="py-3.5 px-4">Application Status</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4">Issued Credentials</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {issuers.map((issuer) => (
                  <tr key={issuer.id} className="hover:bg-slate-50/60 transition">
                    {/* Issuer Profile */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#0B2545]">{issuer.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{issuer.email}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {issuer.department} &bull; {issuer.designation}
                      </div>
                    </td>

                    {/* Bound Wallet */}
                    <td className="py-3 px-4">
                      {issuer.walletAddress ? (
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700">
                          <span>
                            {issuer.walletAddress.slice(0, 6)}...{issuer.walletAddress.slice(-4)}
                          </span>
                          <button
                            onClick={() => handleCopy(issuer.walletAddress!, issuer.id)}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 transition cursor-pointer"
                            title="Copy Wallet Address"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          {copiedAddress === issuer.id && (
                            <span className="text-[9px] font-bold text-emerald-600">Copied!</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">No wallet bound</span>
                      )}
                    </td>

                    {/* Contract Authorization */}
                    <td className="py-3 px-4">
                      {getContractAuthBadge(issuer.contractAuthorization)}
                    </td>

                    {/* Application Status */}
                    <td className="py-3 px-4 capitalize font-semibold text-slate-700">
                      {issuer.status}
                    </td>

                    {/* Account Status */}
                    <td className="py-3 px-4">
                      {getAccountStatusBadge(issuer.accountStatus)}
                    </td>

                    {/* Issued Certificates */}
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-[#0B2545] px-2 py-0.5 rounded bg-slate-100">
                        {issuer.issuedCertificatesCount || 0}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenDetailModal(issuer)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {issuer.accountStatus === 'active' ? (
                          <button
                            onClick={() => {
                              setSuspensionModalUser(issuer);
                              setSuspendReason('');
                            }}
                            disabled={isActionLoading}
                            className="px-2 py-1 rounded-lg text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition cursor-pointer disabled:opacity-50"
                            title="Suspend Issuer Account"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => onReactivateIssuer(issuer.id)}
                            disabled={isActionLoading}
                            className="px-2 py-1 rounded-lg text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer disabled:opacity-50"
                            title="Reactivate Issuer Account"
                          >
                            Reactivate
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

      {/* Suspension Modal */}
      {suspensionModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#0B2545]">
                  Suspend Issuer Account
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Are you sure you want to suspend {suspensionModalUser.name}?
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
              <span className="font-bold">Policy Note:</span> Suspending this account prevents them from issuing new certificates. Certificates already issued remain valid unless explicitly revoked.
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Reason for Suspension (Mandatory):
              </label>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="State administrative reason for suspending issuer..."
                rows={3}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setSuspensionModalUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (suspendReason.trim()) {
                    onSuspendIssuer(suspensionModalUser.id, suspendReason.trim());
                    setSuspensionModalUser(null);
                  }
                }}
                disabled={!suspendReason.trim() || isActionLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                Confirm Suspension
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
