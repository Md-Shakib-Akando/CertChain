'use client';

import React, { useState } from 'react';
import { ShieldCheck, MailCheck } from 'lucide-react';
import {
  Dialog,
  DialogBody,
  DialogFooter,
  Button,
  Field,
  Input,
} from '@/components/ui';

interface ProvisionControllerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    name: string;
    email: string;
    department: string;
  }) => Promise<{ success: boolean; email?: string } | null>;
  isActionLoading: boolean;
}

export const ProvisionControllerModal: React.FC<ProvisionControllerModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isActionLoading,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Office of the Controller of Examinations');
  const [createdResult, setCreatedResult] = useState<{
    email: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setName('');
    setEmail('');
    setCreatedResult(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const res = await onConfirm({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      department: department.trim(),
    });

    if (res?.success) {
      setCreatedResult({
        email: res.email || email,
      });
      setName('');
      setEmail('');
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      eyebrow="Academic Governance Onboarding"
      title="Provision Controller Account"
      description="Secure institutional provisioning (No public signup allowed)"
      size="md"
    >
      {createdResult ? (
        <>
          <DialogBody className="space-y-4 text-center py-6">
            <div className="w-12 h-12 rounded-lg bg-success-soft text-success border border-success/25 flex items-center justify-center mx-auto">
              <MailCheck className="w-6 h-6" />
            </div>

            <div className="space-y-2 max-w-sm mx-auto">
              <h4 className="font-serif text-base font-semibold text-ink">
                Invitation Email Successfully Sent
              </h4>
              <p className="text-xs text-muted leading-relaxed">
                An official Brevo invitation has been securely delivered to{' '}
                <strong className="font-mono text-brand font-semibold">{createdResult.email}</strong>.
              </p>
              <div className="p-3 bg-sunken border border-line rounded-md text-xs text-muted text-left space-y-1">
                <p className="font-semibold text-ink">Next Steps for Controller:</p>
                <p>1. Open their official mailbox at {createdResult.email}.</p>
                <p>2. Click the confidential &quot;Set Up Password&quot; link in the email.</p>
                <p>3. Configure their master password to access the Controller Desk.</p>
              </div>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button variant="primary" size="sm" onClick={handleClose}>
              Done
            </Button>
          </DialogFooter>
        </>
      ) : (
        <form onSubmit={handleSubmit}>
          <DialogBody className="space-y-4">
            <div className="p-3 rounded-md bg-brand-soft/60 border border-brand/20 text-xs text-ink leading-relaxed space-y-1">
              <p className="font-semibold text-brand">Institutional Security Policy (PRD Section 5.1):</p>
              <p className="text-muted">
                The Controller of Examinations is the highest academic authority for credential issuance and revocation co-signing. Public signup is forbidden; an invitation link will be dispatched exclusively to their official email to set up their password.
              </p>
            </div>

            <Field label="Full Official Name" required>
              <Input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Prof. Dr. M. A. Karim"
              />
            </Field>

            <Field
              label="Institutional Email Address"
              hint="@pub.edu.bd or authorized"
              required
            >
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="controller@pub.edu.bd"
                mono
              />
            </Field>

            <Field label="Department / Office" required>
              <Input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </Field>
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isActionLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={isActionLoading}
              disabled={!name.trim() || !email.trim()}
              leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
            >
              Send Invitation Link
            </Button>
          </DialogFooter>
        </form>
      )}
    </Dialog>
  );
};
