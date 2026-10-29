'use client';

import React from 'react';
import { PenTool } from 'lucide-react';
import { RevocationItem } from '@/types/controller';
import {
  Dialog,
  Button,
  StatusBadge,
  DescriptionList,
  HashText,
  explorerTxUrl,
  Alert,
  Card,
} from '@/components/ui';

interface RevocationDetailModalProps {
  revocation: RevocationItem | null;
  onClose: () => void;
  onCoSign: (rev: RevocationItem) => void;
  onReject: (rev: RevocationItem) => void;
  isActionLoading: boolean;
}

export const RevocationDetailModal: React.FC<RevocationDetailModalProps> = ({
  revocation,
  onClose,
  onCoSign,
  onReject,
  isActionLoading,
}) => {
  if (!revocation) return null;

  return (
    <Dialog
      open={Boolean(revocation)}
      onClose={onClose}
      size="lg"
      eyebrow={`Target Credential: ${revocation.certificateId}`}
      title="Revocation Request Evidence Dossier"
      description="Inspect documented revocation grounds and Registrar justification prior to co-signing."
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2 w-full">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
          {(revocation.workflowStatus === 'pending_review' ||
            revocation.workflowStatus === 'awaiting_signature') && (
            <div className="flex items-center gap-2">
              <Button
                variant="danger-outline"
                size="sm"
                disabled={isActionLoading}
                onClick={() => {
                  onClose();
                  onReject(revocation);
                }}
              >
                Reject Request
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={isActionLoading}
                leftIcon={<PenTool className="w-3.5 h-3.5" />}
                onClick={() => {
                  onClose();
                  onCoSign(revocation);
                }}
              >
                Co-Sign Revocation
              </Button>
            </div>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        <DescriptionList
          cols={2}
          items={[
            {
              term: 'Candidate Full Name',
              detail: <span className="font-semibold text-ink">{revocation.studentName}</span>,
            },
            {
              term: 'Student Roll ID',
              detail: <span className="font-mono">{revocation.studentId}</span>,
            },
            {
              term: 'Credential Type',
              detail: revocation.certificateType,
            },
            {
              term: 'Academic Program',
              detail: revocation.program,
            },
            {
              term: 'Requesting Registrar',
              detail: `${revocation.requestingIssuer.name} (${revocation.requestingIssuer.department || 'Registrar Office'})`,
            },
            {
              term: 'Workflow Status',
              detail: <StatusBadge status={revocation.workflowStatus} />,
            },
          ]}
        />

        <Card padding="md" className="bg-warning-bg/60 border-warning-border space-y-2">
          <span className="eyebrow text-warning block">Documented Grounds for Revocation</span>
          <p className="text-xs text-ink font-medium leading-relaxed">{revocation.reason}</p>
          {revocation.evidenceNotes && (
            <div className="pt-2 border-t border-warning-border">
              <span className="eyebrow text-warning block">Syndicate / Committee Notes</span>
              <p className="text-xs text-ink-2 mt-0.5 leading-relaxed">{revocation.evidenceNotes}</p>
            </div>
          )}
        </Card>

        {revocation.transactionHash && (
          <Card padding="sm" className="bg-sunken">
            <span className="eyebrow block mb-1">Confirmed Blockchain Transaction</span>
            <HashText
              value={revocation.transactionHash}
              start={12}
              end={8}
              href={explorerTxUrl(revocation.transactionHash)}
            />
          </Card>
        )}

        {revocation.rejectionReason && (
          <Alert tone="danger" title="Rejection Grounds">
            {revocation.rejectionReason}
          </Alert>
        )}
      </div>
    </Dialog>
  );
};
