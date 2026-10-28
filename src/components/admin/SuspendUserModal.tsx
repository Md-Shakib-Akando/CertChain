'use client';

import React, { useState } from 'react';
import { Ban } from 'lucide-react';
import { AdminUser } from '@/types/admin';
import {
  Dialog,
  DialogBody,
  DialogFooter,
  Button,
  Field,
  Textarea,
} from '@/components/ui';

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
    <Dialog
      open={Boolean(user)}
      onClose={onClose}
      eyebrow="Account Access Restriction"
      title="Suspend Platform Account"
      size="sm"
    >
      <form onSubmit={handleSubmit}>
        <DialogBody className="space-y-4">
          <div className="bg-danger-soft border border-danger/25 rounded-md p-3 text-xs text-danger space-y-1">
            <p className="font-semibold">You are about to suspend:</p>
            <p className="font-mono font-semibold text-ink">
              {user.name} ({user.email})
            </p>
            <p className="text-[11px] text-danger/90 leading-relaxed pt-0.5">
              Suspended users cannot log in or perform credential transactions. In accordance with Section 5.1 of the specification, the user is suspended rather than deleted to preserve immutable audit references.
            </p>
          </div>

          <Field
            label="Reason for Suspension"
            hint="Mandatory for Audit Trail"
            required
          >
            <Textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Investigation of academic misconduct, requested by Registrar docket #412..."
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
            disabled={!reason.trim()}
            leftIcon={<Ban className="w-3.5 h-3.5" />}
          >
            Confirm Suspension
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};
