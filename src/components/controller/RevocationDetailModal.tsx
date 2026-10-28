'use client';

import React from 'react';
import {
  X,
  FileX2,
  PenTool,
} from 'lucide-react';
import { RevocationItem } from '@/types/controller';

interface RevocationDetailModalProps {
  revocation: RevocationItem | null;
  onClose: () => void;
  onCoSign: (rev: RevocationItem) => void;
  onReject: (rev: RevocationItem) => void;
  isActionLoading: boolean;
}

export const RevocationDetailModal: React.FC<RevocationDetailModalProps> = ({
  revocation,
  onClose,
  onCoSign,
  onReject,
  isActionLoading,
}) => {
  if (!revocation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0 border border-rose-200">
              <FileX2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0B2545]">
                Revocation Request Evidence
              </h3>
              <span className="text-[11px] font-mono text-slate-500">
                Target Credential: {revocation.certificateId}
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

        {/* Certificate Details (Minimal PII per PDF Section 6.2) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Candidate Reference
            </span>
            <span className="font-bold text-[#0B2545] text-sm mt-0.5 block">
              {revocation.studentName}
            </span>
            <span className="font-mono text-[11px] text-slate-500 block">
              ID: {revocation.studentId}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Academic Credential
            </span>
            <span className="font-semibold text-slate-800 block mt-0.5">
              {revocation.certificateType}
            </span>
            <span className="text-slate-500 block text-[11px]">
              {revocation.program}
            </span>
          </div>
        </div>

        {/* Revocation Grounds & Recorded Evidence */}
        <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs space-y-2">
          <span className="text-[10px] uppercase font-bold text-amber-800 block tracking-wider">
            Documented Grounds for Revocation
          </span>
          <p className="text-slate-800 font-medium leading-relaxed">
            {revocation.reason}
          </p>

          {revocation.evidenceNotes && (
            <div className="mt-2 pt-2 border-t border-amber-200/80">
              <span className="text-[10px] font-bold text-amber-800 uppercase block">
                Syndicate / Committee Notes
              </span>
              <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed font-sans">
                {revocation.evidenceNotes}
              </p>
            </div>
          )}
        </div>

        {/* Requesting Registrar & On-chain Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Requesting Authority
            </span>
            <span className="font-semibold text-slate-800 block mt-0.5">
              {revocation.requestingIssuer.name}
            </span>
            <span className="text-slate-500 block text-[11px]">
              {revocation.requestingIssuer.department}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Requested: {revocation.requestedAt}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Workflow State
            </span>
            <span className="font-bold text-slate-800 text-sm mt-0.5 block capitalize">
              {revocation.workflowStatus.replace('_', ' ')}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Cert Status: {revocation.currentStatus}
            </span>
          </div>
        </div>

        {/* Blockchain Evidence if available */}
        {revocation.transactionHash && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Confirmed Blockchain Transaction
            </span>
            <span className="font-mono text-[11px] text-teal-800 break-all block mt-0.5">
              {revocation.transactionHash}
            </span>
            {revocation.blockNumber && (
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Observed in Block #{revocation.blockNumber} on Sepolia
              </span>
            )}
          </div>
        )}

        {/* Rejection notice if previously rejected */}
        {revocation.rejectionReason && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
            <span className="font-bold block">Rejection Details:</span>
            <p className="mt-0.5">{revocation.rejectionReason}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            Close
          </button>

          {(revocation.workflowStatus === 'pending_review' ||
            revocation.workflowStatus === 'awaiting_signature') && (
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => {
                  onClose();
                  onReject(revocation);
                }}
                disabled={isActionLoading}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition cursor-pointer disabled:opacity-50"
              >
                Reject Request
              </button>

              <button
                onClick={() => {
                  onClose();
                  onCoSign(revocation);
                }}
                disabled={isActionLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Co-sign Revocation</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
