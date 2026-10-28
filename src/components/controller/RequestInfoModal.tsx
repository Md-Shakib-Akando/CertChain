'use client';

import React, { useState } from 'react';
import {
  Dialog,
  Button,
  Field,
  Textarea,
} from '@/components/ui';

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
    <Dialog
      open={isOpen}
      onClose={onClose}
      size="md"
      eyebrow="Applicant Vetting"
      title="Request Additional Information"
      description={`Request supporting academic credentials, Dean endorsements, or wallet verification proof from ${applicantName}.`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Required Information / Clarification Notes" required>
          <Textarea
            rows={4}
            required
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Please provide your official faculty appointment letter and confirm your MetaMask wallet public key..."
          />
        </Field>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={isActionLoading}
            disabled={!notes.trim()}
          >
            Send Request to Applicant
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
