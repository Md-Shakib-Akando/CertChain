'use client';

import React, { useState } from 'react';
import {
  Users,
  ShieldAlert,
  Eye,
} from 'lucide-react';
import { IssuerApplication } from '@/types/controller';
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
  Button,
  IconButton,
  TableContainer,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
  Dialog,
  Field,
  Textarea,
  EmptyState,
} from '@/components/ui';

interface IssuerDirectorySectionProps {
  issuers: IssuerApplication[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: string;
  onStatusFilterChange: (s: string) => void;
  onOpenDetailModal: (issuer: IssuerApplication) => void;
  onSuspendIssuer: (issuerId: string, reason: string) => void;
  onReactivateIssuer: (issuerId: string) => void;
  isActionLoading: boolean;
}

export const IssuerDirectorySection: React.FC<IssuerDirectorySectionProps> = ({
  issuers,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onOpenDetailModal,
  onSuspendIssuer,
  onReactivateIssuer,
  isActionLoading,
}) => {
  const [suspensionModalUser, setSuspensionModalUser] = useState<IssuerApplication | null>(null);
  const [suspendReason, setSuspendReason] = useState('');

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Authorized Signers"
        title="Authorized Registrar & Issuer Directory"
        description="Searchable registry of approved academic issuers, bound cryptographic wallet addresses, and active authorization state on the Ethereum Sepolia smart contract."
        actions={
          <Badge tone="neutral">
            Total Issuers: {issuers.length}
          </Badge>
        }
      />

      <Alert
        tone="info"
        icon={<ShieldAlert className="w-4 h-4" />}
        title="Institutional Policy Boundary"
      >
        Suspending an issuer prevents them from issuing new credentials, but does not automatically revoke diplomas previously anchored by them. Application account status and smart-contract authorization state are maintained as distinct attributes.
      </Alert>

      <Card>
        <TableToolbar
          left={
            <>
              <SearchInput
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onClear={() => onSearchChange('')}
                placeholder="Search by issuer name, email, department, or wallet address..."
                className="w-full sm:w-96"
              />
              <Select
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value)}
                className="w-full sm:w-48"
                aria-label="Filter issuers by account status"
              >
                <option value="all">All Account Statuses</option>
                <option value="active">Active Only</option>
                <option value="suspended">Suspended Only</option>
              </Select>
            </>
          }
        />

        {issuers.length === 0 ? (
          <EmptyState
            icon={<Users className="w-5 h-5" />}
            title="No issuers found"
            description="There are currently no authorized registrar or examination issuers matching your filter."
          />
        ) : (
          <TableContainer className="border-0 rounded-none no-scrollbar">
            <Table>
              <THead>
                <TR>
                  <TH>Issuer Profile</TH>
                  <TH>Bound Wallet Address</TH>
                  <TH>Contract Auth</TH>
                  <TH>Vetting Status</TH>
                  <TH>Account Status</TH>
                  <TH>Issued</TH>
                  <TH align="right">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {issuers.map((issuer) => (
                  <TR key={issuer.id}>
                    <TD>
                      <div className="font-semibold text-ink text-xs">{issuer.name}</div>
                      <div className="text-[11px] text-muted font-mono">{issuer.email}</div>
                      <div className="text-[11px] text-subtle mt-0.5">
                        {issuer.department} • {issuer.designation}
                      </div>
                    </TD>

                    <TD>
                      {issuer.walletAddress ? (
                        <HashText value={issuer.walletAddress} start={6} end={4} />
                      ) : (
                        <span className="text-xs text-subtle italic">No wallet bound</span>
                      )}
                    </TD>

                    <TD>
                      <StatusBadge status={issuer.contractAuthorization} />
                    </TD>

                    <TD>
                      <StatusBadge status={issuer.status} />
                    </TD>

                    <TD>
                      <StatusBadge status={issuer.accountStatus} />
                    </TD>

                    <TD>
                      <Badge tone="neutral" size="xs" className="font-mono">
                        {issuer.issuedCertificatesCount || 0}
                      </Badge>
                    </TD>

                    <TD align="right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <IconButton
                          label="View issuer details"
                          variant="secondary"
                          size="xs"
                          onClick={() => onOpenDetailModal(issuer)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </IconButton>

                        {issuer.accountStatus === 'active' ? (
                          <Button
                            variant="danger-outline"
                            size="xs"
                            disabled={isActionLoading}
                            onClick={() => {
                              setSuspensionModalUser(issuer);
                              setSuspendReason('');
                            }}
                          >
                            Suspend
                          </Button>
                        ) : (
                          <Button
                            variant="secondary"
                            size="xs"
                            disabled={isActionLoading}
                            onClick={() => onReactivateIssuer(issuer.id)}
                          >
                            Reactivate
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

      <Dialog
        open={Boolean(suspensionModalUser)}
        onClose={() => setSuspensionModalUser(null)}
        size="md"
        eyebrow="Access Control"
        title="Suspend Issuer Account"
        description={
          suspensionModalUser
            ? `Are you sure you want to suspend ${suspensionModalUser.name} (${suspensionModalUser.email})?`
            : ''
        }
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setSuspensionModalUser(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={isActionLoading}
              disabled={!suspendReason.trim()}
              onClick={() => {
                if (suspensionModalUser && suspendReason.trim()) {
                  onSuspendIssuer(suspensionModalUser.id, suspendReason.trim());
                  setSuspensionModalUser(null);
                }
              }}
            >
              Confirm Suspension
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Alert tone="warning" title="Policy Note">
            Suspending this account prevents them from issuing new certificates. Certificates already issued remain valid unless explicitly revoked.
          </Alert>

          <Field label="Reason for Suspension" required>
            <Textarea
              rows={3}
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="State administrative grounds for suspending this issuer..."
            />
          </Field>
        </div>
      </Dialog>
    </div>
  );
};
