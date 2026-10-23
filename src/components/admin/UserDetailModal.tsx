'use client';

import React from 'react';
import {
  X,
  KeyRound,
  Ban,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { AdminUser } from '@/types/admin';

interface UserDetailModalProps {
  user: AdminUser | null;
  onClose: () => void;
  onOpenRoleModal: (user: AdminUser) => void;
  onOpenSuspendModal: (user: AdminUser) => void;
  onOpenDeleteModal?: (user: AdminUser) => void;
  onReactivateUser: (userId: string) => Promise<boolean>;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  onClose,
  onOpenRoleModal,
  onOpenSuspendModal,
  onOpenDeleteModal,
  onReactivateUser,
}) => {
  if (!user) return null;

  const isSuspended = user.status === 'suspended';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0B1E36] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">{user.name}</h3>
              <p className="text-[11px] font-mono text-blue-200">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Assigned Role</span>
              <span className="font-bold text-blue-700 uppercase mt-0.5 block">{user.role}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Account Status</span>
              <span className="font-bold text-slate-800 capitalize mt-0.5 block">{user.status}</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Database ID:</span>
              <span className="font-mono text-slate-700">{user.id}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Institutional Email:</span>
              <span className="font-mono text-slate-800 font-semibold">{user.email}</span>
            </div>

            {user.studentId && (
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Student ID:</span>
                <span className="font-mono text-blue-600 font-bold">{user.studentId}</span>
              </div>
            )}

            {user.employeeId && (
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Employee ID:</span>
                <span className="font-mono text-blue-600 font-bold">{user.employeeId}</span>
              </div>
            )}

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Department / Office:</span>
              <span className="text-slate-800 font-medium">{user.department || 'PUB Academic'}</span>
            </div>

            {user.walletAddress && (
              <div className="py-1.5 border-b border-slate-100 space-y-1">
                <span className="text-slate-500 block">Authorized Ethereum Wallet:</span>
                <span className="font-mono text-[11px] text-slate-800 break-all bg-slate-50 p-2 rounded-lg border border-slate-200 block">
                  {user.walletAddress}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Registered Date:</span>
              <span className="text-slate-800 font-medium">{user.createdAt}</span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-500">Last Active Session:</span>
              <span className="text-slate-800 font-medium">{user.lastLoginAt || 'Recent'}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenRoleModal(user);
              }}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-slate-500" />
              <span>Change Role</span>
            </button>

            {isSuspended ? (
              <button
                onClick={async () => {
                  await onReactivateUser(user.id);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Reactivate</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onOpenSuspendModal(user);
                }}
                className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Ban className="w-3.5 h-3.5 text-red-600" />
                <span>Suspend Account</span>
              </button>
            )}

            {onOpenDeleteModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenDeleteModal(user);
                }}
                className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Account</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
