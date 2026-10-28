'use client';

import React, { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { AdminUser } from '@/types/admin';
import {
  Dialog,
  DialogBody,
  DialogFooter,
  Button,
  Field,
  Textarea,
} from '@/components/ui';

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
    <Dialog
      open={Boolean(user)}
      onClose={onClose}
      eyebrow="Irreversible Database Action"
      title="Delete User from Database"
      size="sm"
    >
      <form onSubmit={handleSubmit}>
        <DialogBody className="space-y-4">
          <div className="bg-danger-soft border border-danger/25 rounded-md p-3.5 text-xs text-danger space-y-2">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Permanent Database Removal Warning</span>
            </div>
            <p className="text-ink leading-relaxed text-[11px]">
              You are about to permanently erase the following user record from the MongoDB database:
            </p>
            <div className="p-2.5 bg-surface rounded border border-danger/20 text-xs space-y-0.5">
              <p className="font-semibold text-ink">{user.name}</p>
              <p className="font-mono text-[11px] text-muted">{user.email}</p>
              <p className="text-[10px] text-danger font-mono uppercase tracking-wider">
                Role: {user.role} • Status: {user.status}
              </p>
            </div>
            <p className="text-[11px] text-danger font-medium leading-relaxed">
              This action cannot be reversed. All login credentials and personal records will be deleted immediately.
            </p>
          </div>

          <Field
            label="Reason for Deletion"
            hint="Recorded in Audit Trail"
          >
            <Textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Duplicate registration test account, fraudulent entry, or requested right-to-be-forgotten..."
            />
          </Field>
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isActionLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="danger"
            size="sm"
            loading={isActionLoading}
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Permanently Delete
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};
