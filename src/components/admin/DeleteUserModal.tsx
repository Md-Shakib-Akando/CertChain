'use client';

import React, { useState } from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import { AdminUser } from '@/types/admin';

interface DeleteUserModalProps {
  user: AdminUser | null;
  onClose: () => void;
  onConfirm: (userId: string, reason?: string) => Promise<boolean>;
  isActionLoading: boolean;
}

export const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
  user,
  onClose,
  onConfirm,
  isActionLoading,
}) => {
  const [reason, setReason] = useState('');

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm(user.id, reason.trim() || undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-red-600">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-red-600" />
            </div>
            <h3 className="font-bold text-base text-[#0B2545]">Delete User from Database</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Warning Banner */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-xs text-red-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-red-700">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>Permanent Database Removal Warning</span>
            </div>
            <p className="text-slate-700 leading-relaxed text-[11px]">
              You are about to permanently erase the following user record from the MongoDB database:
            </p>
            <div className="p-2.5 bg-white/80 rounded-lg border border-red-100 text-xs space-y-0.5">
              <p className="font-bold text-slate-900">{user.name}</p>
              <p className="font-mono text-[11px] text-slate-600">{user.email}</p>
              <p className="text-[10px] text-red-600 font-semibold uppercase tracking-wider">
                Role: {user.role} • Status: {user.status}
              </p>
            </div>
            <p className="text-[11px] text-red-700 font-medium leading-relaxed">
              ⚠️ This action cannot be reversed. All login credentials and personal records will be deleted immediately.
            </p>
          </div>

          {/* Reason for Deletion */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Reason for Deletion (Recorded in Audit Trail)
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Duplicate registration test account, fraudulent entry, or requested right-to-be-forgotten..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-red-600 focus:bg-white resize-none shadow-2xs"
            />
          </div>

          {/* Action Buttons */}
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
              disabled={isActionLoading}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isActionLoading ? 'Deleting...' : 'Permanently Delete'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
