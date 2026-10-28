'use client';

import React from 'react';
import {
  CheckCircle2,
  XCircle,
  PenTool,
  Eye,
  RotateCcw,
} from 'lucide-react';
import { RevocationItem } from '@/types/controller';
import {
  PageHeader,
  Alert,
  Card,
  TableToolbar,
  SearchInput,
  Select,
  Badge,
  StatusBadge,
  HashText,
  explorerTxUrl,
  Button,
  IconButton,
  TableContainer,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
  EmptyState,
} from '@/components/ui';

interface RevocationRequestsSectionProps {
  revocations: RevocationItem[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: string;
  onStatusFilterChange: (s: string) => void;
  onOpenDetailModal: (rev: RevocationItem) => void;
  onOpenCoSignModal: (rev: RevocationItem) => void;
  onOpenRejectModal: (rev: RevocationItem) => void;
  isActionLoading: boolean;
}

export const RevocationRequestsSection: React.FC<RevocationRequestsSectionProps> = ({
  revocations,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onOpenDetailModal,
  onOpenCoSignModal,
  onOpenRejectModal,
  isActionLoading,
}) => {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dual-Control Revocation Ledger"
        title="Academic Certificate Revocation Requests"
        description="Inspect revocation grounds submitted by the Registrar and provide the mandatory secondary cryptographic co-signature before on-chain execution."
        actions={
          <Badge tone="neutral">
            Total Requests: {revocations.length}
          </Badge>
        }
      />

      <Alert tone="warning" title="Cryptographic Co-Signature Requirement">
        A UI approval button alone is not a valid cryptographic co-signature. The smart contract requires an issuer request paired with the Controller&apos;s cryptographic authorization. Certificates remain valid until the Ethereum Sepolia transaction confirms.
      </Alert>

      <Card>
        <TableToolbar
          left={
            <>
              <SearchInput
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onClear={() => onSearchChange('')}
                placeholder="Search by Certificate ID, Student ID, Student Name, or grounds..."
                className="w-full sm:w-96"
              />
              <Select
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value)}
                className="w-full sm:w-52"
                aria-label="Filter revocation requests by workflow state"
              >
                <option value="all">All Workflow States</option>
                <option value="pending_review">Pending Review</option>
                <option value="awaiting_signature">Awaiting Signature</option>
                <option value="submitted">Transaction Submitted</option>
                <option value="confirmed">Confirmed on Chain</option>
                <option value="rejected">Rejected</option>
                <option value="failed">Failed / Reverted</option>
              </Select>
            </>
          }
        />

        {revocations.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 className="w-5 h-5" />}
            title="No revocation requests found"
            description="There are currently no certificate revocation requests matching your filter criteria."
          />
        ) : (
          <TableContainer className="border-0 rounded-none">
            <Table>
              <THead>
                <TR>
                  <TH>Certificate ID &amp; Type</TH>
                  <TH>Candidate &amp; Program</TH>
                  <TH>Requesting Issuer</TH>
                  <TH>Revocation Grounds</TH>
                  <TH>Cert Status</TH>
                  <TH>Workflow State</TH>
                  <TH align="right">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {revocations.map((rev) => (
                  <TR key={rev.id}>
                    <TD>
                      <div className="space-y-0.5">
                        <div className="font-mono font-semibold text-xs text-brand">
                          {rev.certificateId}
                        </div>
                        <span className="text-xs text-muted block">{rev.certificateType}</span>
                        {rev.transactionHash && (
                          <div className="pt-0.5">
                            <HashText
                              value={rev.transactionHash}
                              start={6}
                              end={4}
                              href={explorerTxUrl(rev.transactionHash)}
                            />
                          </div>
                        )}
                      </div>
                    </TD>

                    <TD>
                      <div className="font-semibold text-ink text-xs">{rev.studentName}</div>
                      <div className="text-[11px] text-muted font-mono">{rev.studentId}</div>
                      <div className="text-[11px] text-subtle truncate max-w-[160px]">
                        {rev.program}
                      </div>
                    </TD>

                    <TD>
                      <div className="font-medium text-ink text-xs">
                        {rev.requestingIssuer.name}
                      </div>
                      <div className="text-[11px] text-muted mb-1">
                        {rev.requestingIssuer.department}
                      </div>
                      <Badge tone="success" size="xs">
                        Authorized Issuer
                      </Badge>
                    </TD>

                    <TD>
                      <p className="text-xs text-ink-2 line-clamp-2 max-w-xs leading-relaxed">
                        {rev.reason}
                      </p>
                      <span className="text-[11px] text-subtle block mt-0.5">
                        Requested: {rev.requestedAt}
                      </span>
                    </TD>

                    <TD>
                      <StatusBadge status={rev.currentStatus} />
                    </TD>

                    <TD>
                      <StatusBadge status={rev.workflowStatus} />
                    </TD>

                    <TD align="right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <IconButton
                          label="Inspect revocation evidence"
                          variant="secondary"
                          size="xs"
                          onClick={() => onOpenDetailModal(rev)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </IconButton>

                        {(rev.workflowStatus === 'pending_review' ||
                          rev.workflowStatus === 'awaiting_signature') && (
                          <>
                            <Button
                              variant="primary"
                              size="xs"
                              disabled={isActionLoading}
                              leftIcon={<PenTool className="w-3.5 h-3.5" />}
                              onClick={() => onOpenCoSignModal(rev)}
                            >
                              Co-Sign
                            </Button>

                            <Button
                              variant="danger-outline"
                              size="xs"
                              disabled={isActionLoading}
                              leftIcon={<XCircle className="w-3.5 h-3.5" />}
                              onClick={() => onOpenRejectModal(rev)}
                            >
                              Reject
                            </Button>
                          </>
                        )}

                        {rev.workflowStatus === 'failed' && (
                          <Button
                            variant="seal"
                            size="xs"
                            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                            onClick={() => onOpenCoSignModal(rev)}
                          >
                            Retry
                          </Button>
                        )}
                      </div>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </div>
  );
};
