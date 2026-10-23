'use client';

import React, { useState } from 'react';
import { X, KeyRound, AlertTriangle } from 'lucide-react';
import { AdminUser, UserRole } from '@/types/admin';

interface ChangeRoleModalProps {
  user: AdminUser | null;
  onClose: () => void;
  onConfirm: (userId: string, newRole: UserRole, reason: string) => Promise<boolean>;
  isActionLoading: boolean;
}

export const ChangeRoleModal: React.FC<ChangeRoleModalProps> = ({
  user,
  onClose,
  onConfirm,
  isActionLoading,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>((user?.role as UserRole) || 'student');
  const [reason, setReason] = useState('');

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole === user.role) return;
    await onConfirm(user.id, selectedRole, reason.trim() || 'Role update authorized by Super Admin');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-blue-600">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="font-bold text-base text-[#0B2545]">Reassign User Role</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
            <span className="text-slate-400 block font-bold text-[10px] uppercase">Target User</span>
            <span className="font-bold text-slate-800 block text-sm">{user.name}</span>
            <span className="font-mono text-slate-500 block">{user.email}</span>
            <div className="pt-1 text-[11px] text-slate-600">
              Current Role:{' '}
              <span className="font-bold uppercase text-blue-600">{user.role}</span>
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Select New Assigned Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-600 cursor-pointer shadow-2xs font-semibold"
            >
              <option value="student">Student (Credential Holder)</option>
              <option value="issuer">Faculty / Staff Issuer (Smart Contract Bound)</option>
              <option value="controller">Controller of Examinations (Academic Authority)</option>
              <option value="admin">Super Admin (Technical Authority)</option>
            </select>
          </div>

          {/* Safeguard Warning */}
          {user.role === 'admin' && selectedRole !== 'admin' && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Safeguard Active:</strong> You are demoting an administrator. The system will reject this action if this is the last functioning Super Admin on the platform.
              </span>
            </div>
          )}

          {/* Reason Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Administrative Justification (Logged to Audit Trail)
            </label>
            <textarea
              rows={2}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Appointment letter #PUB-HR-2026-99, transfer to Examinations Office..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white resize-none shadow-2xs"
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
              disabled={isActionLoading || selectedRole === user.role || !reason.trim()}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{isActionLoading ? 'Updating Role...' : 'Save Role Assignment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
