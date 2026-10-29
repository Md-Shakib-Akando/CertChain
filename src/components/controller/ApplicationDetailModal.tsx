'use client';

import React from 'react';
import { Wallet } from 'lucide-react';
import { IssuerApplication } from '@/types/controller';
import {
  Dialog,
  Button,
  Badge,
  StatusBadge,
  DescriptionList,
  HashText,
  Alert,
  Card,
} from '@/components/ui';

interface ApplicationDetailModalProps {
  application: IssuerApplication | null;
  onClose: () => void;
  onApprove: (appId: string) => void;
  onReject: (app: IssuerApplication) => void;
  onRequestInfo: (app: IssuerApplication) => void;
  isActionLoading: boolean;
}

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  application,
  onClose,
  onApprove,
  onReject,
  onRequestInfo,
  isActionLoading,
}) => {
  if (!application) return null;

  return (
    <Dialog
      open={Boolean(application)}
      onClose={onClose}
      size="lg"
      eyebrow={`Ref: ${application.requestId || application.id}`}
      title="Issuer Application Dossier"
      description="Inspect institutional credentials and wallet binding before authorizing Registrar/Issuer privileges."
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2 w-full">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
          {application.status === 'pending' && (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={isActionLoading}
                onClick={() => {
                  onClose();
                  onRequestInfo(application);
                }}
              >
                Request More Info
              </Button>
              <Button
                variant="danger-outline"
                size="sm"
                disabled={isActionLoading}
                onClick={() => {
                  onClose();
                  onReject(application);
                }}
              >
                Reject
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={isActionLoading}
                onClick={() => onApprove(application.id)}
              >
                Approve Issuer
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
              term: 'Applicant Full Name',
              detail: <span className="font-semibold text-ink">{application.name}</span>,
            },
            {
              term: 'Official University Email',
              detail: <span className="font-mono text-xs">{application.email}</span>,
            },
            {
              term: 'Department & Designation',
              detail: `${application.department} • ${application.designation}`,
            },
            {
              term: 'University Employee ID',
              detail: <span className="font-mono font-semibold">{application.employeeId}</span>,
            },
            {
              term: 'Requested Role',
              detail: <Badge tone="brand">{application.requestedRole}</Badge>,
            },
            {
              term: 'Application Status',
              detail: <StatusBadge status={application.status} />,
            },
          ]}
        />

        <Card padding="md" className="bg-sunken/70 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="eyebrow flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-brand" />
              Bound Wallet Identity Status
            </span>
            {application.isWalletVerified ? (
              <Badge tone="success" size="xs">
                Signature Verified
              </Badge>
            ) : (
              <Badge tone="warning" size="xs">
                Pending Verification
              </Badge>
            )}
          </div>
          {application.walletAddress ? (
            <HashText value={application.walletAddress} start={12} end={8} />
          ) : (
            <span className="text-xs font-mono text-muted">
              No wallet address submitted with application
            </span>
          )}
        </Card>

        {application.rejectionReason && (
          <Alert tone="danger" title="Previous Rejection Reason">
            {application.rejectionReason}
          </Alert>
        )}
      </div>
    </Dialog>
  );
};
