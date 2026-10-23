'use client';

import React, { useState } from 'react';
import { X, Ban } from 'lucide-react';
import { AdminUser } from '@/types/admin';

interface SuspendUserModalProps {
  user: AdminUser | null;
  onClose: () => void;
  onConfirm: (userId: string, reason: string) => Promise<boolean>;
  isActionLoading: boolean;
}

export const SuspendUserModal: React.FC<SuspendUserModalProps> = ({
  user,
  onClose,
  onConfirm,
  isActionLoading,
}) => {
  const [reason, setReason] = useState('');

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    await onConfirm(user.id, reason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-red-600">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
              <Ban className="w-4 h-4 text-red-600" />
            </div>
            <h3 className="font-bold text-base text-[#0B2545]">Suspend Platform Account</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-900 space-y-1">
            <p className="font-bold">You are about to suspend:</p>
            <p className="font-semibold text-slate-900">
              {user.name} ({user.email})
            </p>
            <p className="text-[11px] text-red-700/80 leading-relaxed">
              Suspended users cannot log in or perform credential transactions. In accordance with Section 5.1 of the specification, the user is suspended rather than deleted to preserve immutable audit references.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Reason for Suspension (Mandatory for Audit Trail)
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Investigation of academic misconduct, requested by Registrar docket #412..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-red-600 focus:bg-white resize-none shadow-2xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isActionLoading}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isActionLoading || !reason.trim()}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>{isActionLoading ? 'Suspending...' : 'Confirm Suspension'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
