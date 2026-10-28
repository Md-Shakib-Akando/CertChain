'use client';

import React from 'react';
import { KeyRound, Ban, CheckCircle2, Trash2 } from 'lucide-react';
import { AdminUser } from '@/types/admin';
import {
  Dialog,
  DialogBody,
  DialogFooter,
  Button,
  RoleBadge,
  StatusBadge,
  HashText,
} from '@/components/ui';

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
    <Dialog
      open={Boolean(user)}
      onClose={onClose}
      eyebrow="Platform Identity Record"
      title={user.name}
      description={user.email}
      size="md"
    >
      <DialogBody className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-sunken rounded-md border border-line space-y-1.5">
            <span className="eyebrow block">Assigned Role</span>
            <RoleBadge role={user.role} />
          </div>

          <div className="p-3 bg-sunken rounded-md border border-line space-y-1.5">
            <span className="eyebrow block">Account Status</span>
            <StatusBadge status={user.status} />
          </div>
        </div>

        <div className="divide-y divide-line border-t border-b border-line">
          <div className="flex items-center justify-between py-2.5">
            <span className="text-muted">Database ID</span>
            <span className="font-mono text-ink">{user.id}</span>
          </div>

          <div className="flex items-center justify-between py-2.5">
            <span className="text-muted">Institutional Email</span>
            <span className="font-mono text-ink font-semibold">{user.email}</span>
          </div>

          {user.studentId && (
            <div className="flex items-center justify-between py-2.5">
              <span className="text-muted">Student ID</span>
              <span className="font-mono text-brand font-semibold">{user.studentId}</span>
            </div>
          )}

          {user.employeeId && (
            <div className="flex items-center justify-between py-2.5">
              <span className="text-muted">Employee ID</span>
              <span className="font-mono text-brand font-semibold">{user.employeeId}</span>
            </div>
          )}

          <div className="flex items-center justify-between py-2.5">
            <span className="text-muted">Department / Office</span>
            <span className="text-ink font-medium">{user.department || 'PUB Academic'}</span>
          </div>

          {user.walletAddress && (
            <div className="py-2.5 space-y-1.5">
              <span className="text-muted block">Authorized Ethereum Wallet</span>
              <div className="p-2 bg-sunken rounded border border-line">
                <HashText value={user.walletAddress} head={14} tail={10} size="xs" />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between py-2.5">
            <span className="text-muted">Registered Date</span>
            <span className="font-mono text-ink">{user.createdAt}</span>
          </div>

          <div className="flex items-center justify-between py-2.5">
            <span className="text-muted">Last Active Session</span>
            <span className="font-mono text-ink">{user.lastLoginAt || 'Recent'}</span>
          </div>
        </div>
      </DialogBody>

      <DialogFooter className="justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              onClose();
              onOpenRoleModal(user);
            }}
            leftIcon={<KeyRound className="w-3.5 h-3.5" />}
          >
            Change Role
          </Button>

          {isSuspended ? (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await onReactivateUser(user.id);
                onClose();
              }}
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-success" />}
            >
              Reactivate
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                onClose();
                onOpenSuspendModal(user);
              }}
              leftIcon={<Ban className="w-3.5 h-3.5 text-danger" />}
            >
              Suspend Account
            </Button>
          )}

          {onOpenDeleteModal && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                onClose();
                onOpenDeleteModal(user);
              }}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Delete Account
            </Button>
          )}
        </div>

        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
