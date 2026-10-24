'use client';

import React, { useState } from 'react';
import { X, XCircle } from 'lucide-react';

interface RejectionReasonModalProps {
  isOpen: boolean;
  type: 'application' | 'revocation';
  targetTitle: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isActionLoading: boolean;
}

export const RejectionReasonModal: React.FC<RejectionReasonModalProps> = ({
  isOpen,
  type,
  targetTitle,
  onClose,
  onConfirm,
  isActionLoading,
}) => {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      onConfirm(reason.trim());
      setReason('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0B2545]">
                {type === 'application' ? 'Reject Issuer Application' : 'Reject Revocation Request'}
              </h3>
              <span className="text-[11px] text-slate-500 truncate block max-w-xs">
                {targetTitle}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
          <span className="font-bold">Required Audit Step:</span> Per university examination regulations, rejecting this {type === 'application' ? 'application' : 'revocation request'} requires documenting clear administrative grounds. This will be preserved in the immutable audit log.
          {type === 'revocation' && (
            <span className="block mt-1 font-semibold text-emerald-800">
              &bull; Rejection will retain the certificate in its current Valid status.
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Mandatory Rejection Grounds / Reason:
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={`State specific grounds for rejecting this ${type === 'application' ? 'issuer application' : 'revocation request'}...`}
              rows={4}
              required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#0B2545] placeholder-slate-400 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!reason.trim() || isActionLoading}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              {isActionLoading ? 'Processing...' : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
