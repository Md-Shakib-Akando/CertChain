'use client';

import React, { useState } from 'react';
import { KeyRound, AlertTriangle } from 'lucide-react';
import { AdminUser, UserRole } from '@/types/admin';
import {
  Dialog,
  DialogBody,
  DialogFooter,
  Button,
  Field,
  Select,
  Textarea,
  RoleBadge,
} from '@/components/ui';

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
    <Dialog
      open={Boolean(user)}
      onClose={onClose}
      eyebrow="Access Privilege Reassignment"
      title="Reassign User Role"
      size="sm"
    >
      <form onSubmit={handleSubmit}>
        <DialogBody className="space-y-4">
          <div className="bg-sunken border border-line rounded-md p-3 text-xs space-y-1">
            <span className="eyebrow block">Target User</span>
            <span className="font-semibold text-ink block text-sm">{user.name}</span>
            <span className="font-mono text-muted block">{user.email}</span>
            <div className="pt-1.5 flex items-center gap-2 text-xs text-muted">
              <span>Current Role:</span>
              <RoleBadge role={user.role} />
            </div>
          </div>

          <Field label="Select New Assigned Role" required>
            <Select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
            >
              <option value="student">Student (Credential Holder)</option>
              <option value="issuer">Faculty / Staff Issuer (Smart Contract Bound)</option>
              <option value="controller">Controller of Examinations (Academic Authority)</option>
              <option value="admin">Super Admin (Technical Authority)</option>
            </Select>
          </Field>

          {user.role === 'admin' && selectedRole !== 'admin' && (
            <div className="p-3 rounded-md bg-warning-soft border border-warning/25 text-xs text-warning flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>Safeguard Active:</strong> You are demoting an administrator. The system will reject this action if this is the last functioning Super Admin on the platform.
              </span>
            </div>
          )}

          <Field
            label="Administrative Justification"
            hint="Logged to Audit Trail"
            required
          >
            <Textarea
              rows={2}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Appointment letter #PUB-HR-2026-99, transfer to Examinations Office..."
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
            variant="primary"
            size="sm"
            loading={isActionLoading}
            disabled={selectedRole === user.role || !reason.trim()}
            leftIcon={<KeyRound className="w-3.5 h-3.5" />}
          >
            Save Role Assignment
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};
