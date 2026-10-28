'use client';

import React, { useState } from 'react';
import {
  Dialog,
  Button,
  Field,
  Textarea,
  Alert,
} from '@/components/ui';

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
    <Dialog
      open={isOpen}
      onClose={onClose}
      size="md"
      eyebrow="Mandatory Governance Record"
      title={type === 'application' ? 'Reject Issuer Application' : 'Reject Revocation Request'}
      description={targetTitle}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Alert tone="warning" title="Required Audit Documentation">
          Per university examination regulations, rejecting this{' '}
          {type === 'application' ? 'application' : 'revocation request'} requires documenting clear administrative grounds in the immutable audit log.
          {type === 'revocation' && (
            <span className="block mt-1 font-semibold text-success">
              • Rejection retains the certificate in its current Valid on-chain status.
            </span>
          )}
        </Alert>

        <Field label="Mandatory Rejection Grounds / Reason" required>
          <Textarea
            rows={4}
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={`State specific grounds for rejecting this ${
              type === 'application' ? 'issuer application' : 'revocation request'
            }...`}
          />
        </Field>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="danger"
            size="sm"
            loading={isActionLoading}
            disabled={!reason.trim()}
          >
            Confirm Rejection
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
