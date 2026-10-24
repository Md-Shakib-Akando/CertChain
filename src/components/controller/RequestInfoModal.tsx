'use client';

import React, { useState } from 'react';
import { X, HelpCircle } from 'lucide-react';

interface RequestInfoModalProps {
  isOpen: boolean;
  applicantName: string;
  onClose: () => void;
  onConfirm: (notes: string) => void;
  isActionLoading: boolean;
}

export const RequestInfoModal: React.FC<RequestInfoModalProps> = ({
  isOpen,
  applicantName,
  onClose,
  onConfirm,
  isActionLoading,
}) => {
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (notes.trim()) {
      onConfirm(notes.trim());
      setNotes('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0B2545]">
                Request More Information
              </h3>
              <span className="text-[11px] text-slate-500 truncate block max-w-xs">
                Applicant: {applicantName}
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

        <p className="text-xs text-slate-600 leading-relaxed">
          Request additional academic credentials, dean endorsements, or MetaMask wallet verification proof from {applicantName}.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Required Information / Clarification Notes:
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Please provide your official faculty appointment letter and confirm your MetaMask wallet public key..."
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
              disabled={!notes.trim() || isActionLoading}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              {isActionLoading ? 'Sending...' : 'Send Request to Staff'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
