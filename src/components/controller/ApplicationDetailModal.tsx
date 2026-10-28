'use client';

import React from 'react';
import {
  X,
  UserCheck,
  Mail,
  Wallet,
} from 'lucide-react';
import { IssuerApplication } from '@/types/controller';

interface ApplicationDetailModalProps {
  application: IssuerApplication | null;
  onClose: () => void;
  onApprove: (appId: string) => void;
  onReject: (app: IssuerApplication) => void;
  onRequestInfo: (app: IssuerApplication) => void;
  isActionLoading: boolean;
}

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  application,
  onClose,
  onApprove,
  onReject,
  onRequestInfo,
  isActionLoading,
}) => {
  if (!application) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-200">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0B2545]">
                Issuer Application Details
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                Ref: {application.requestId || application.id}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Applicant Profile Information per PDF Section 5.2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Applicant Full Name
            </span>
            <span className="font-bold text-[#0B2545] text-sm mt-0.5 block">
              {application.name}
            </span>
            <div className="flex items-center gap-1 font-mono text-[11px] text-slate-500 mt-1">
              <Mail className="w-3 h-3 text-slate-400" />
              <span>{application.email}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Department &amp; Designation
            </span>
            <span className="font-semibold text-slate-800 block mt-0.5">
              {application.department}
            </span>
            <span className="text-slate-500 block text-[11px] mt-0.5">
              {application.designation}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              University Employee ID
            </span>
            <span className="font-mono font-bold text-slate-800 text-sm mt-0.5 block">
              {application.employeeId}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Requested Role
            </span>
            <span className="font-bold text-teal-700 text-sm mt-0.5 block">
              {application.requestedRole}
            </span>
          </div>
        </div>

        {/* Web3 Wallet Identity Binding per PDF Section 5.2 */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5 text-teal-600" />
              <span>Bound Wallet Identity Status</span>
            </span>
            {application.isWalletVerified ? (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Signature Verified
              </span>
            ) : (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Pending Verification
              </span>
            )}
          </div>
          <span className="font-mono text-xs text-slate-800 break-all block">
            {application.walletAddress || 'No wallet address submitted with application'}
          </span>
        </div>

        {/* Application Status & History */}
        <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">
              Submitted At
            </span>
            <span className="font-medium text-slate-700">{application.submittedAt}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">
              Current Status
            </span>
            <span className="font-bold capitalize text-teal-700">
              {application.status}
            </span>
          </div>
        </div>

        {/* Rejection / Note display if any */}
        {application.rejectionReason && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
            <span className="font-bold block">Previous Rejection Reason:</span>
            <p className="mt-0.5 leading-relaxed">{application.rejectionReason}</p>
          </div>
        )}

        {/* Action Buttons per PDF Section 5.2 */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            Close
          </button>

          {application.status === 'pending' && (
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => {
                  onClose();
                  onRequestInfo(application);
                }}
                disabled={isActionLoading}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer disabled:opacity-50"
              >
                Request More Info
              </button>

              <button
                onClick={() => {
                  onClose();
                  onReject(application);
                }}
                disabled={isActionLoading}
                className="px-3 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition cursor-pointer disabled:opacity-50"
              >
                Reject
              </button>

              <button
                onClick={() => onApprove(application.id)}
                disabled={isActionLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                Approve Issuer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
