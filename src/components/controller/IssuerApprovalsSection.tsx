'use client';

import React from 'react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Eye,
  UserCheck,
  Mail,
} from 'lucide-react';
import { IssuerApplication } from '@/types/controller';
import {
  PageHeader,
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
  EmptyState,
} from '@/components/ui';

interface IssuerApprovalsSectionProps {
  applications: IssuerApplication[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: string;
  onStatusFilterChange: (s: string) => void;
  onOpenDetailModal: (app: IssuerApplication) => void;
  onApproveIssuer: (appId: string) => void;
  onOpenRejectModal: (app: IssuerApplication) => void;
  onOpenRequestInfoModal: (app: IssuerApplication) => void;
  isActionLoading: boolean;
}

export const IssuerApprovalsSection: React.FC<IssuerApprovalsSectionProps> = ({
  applications,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onOpenDetailModal,
  onApproveIssuer,
  onOpenRejectModal,
  onOpenRequestInfoModal,
  isActionLoading,
}) => {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Access Vetting"
        title="Issuer Account Authorization Applications"
        description="Review registration requests submitted by eligible Registrar and Academic Officers. Only Controller-approved accounts may compile diplomas or initiate revocation requests."
        actions={
          <Badge tone="neutral">
            Total Applications: {applications.length}
          </Badge>
        }
      />

      <Card>
        <TableToolbar
          left={
            <>
              <SearchInput
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onClear={() => onSearchChange('')}
                placeholder="Search by applicant name, official email, employee ID, or department..."
                className="w-full sm:w-96"
              />
              <Select
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value)}
                className="w-full sm:w-48"
                aria-label="Filter applications by status"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </Select>
            </>
          }
        />

        {applications.length === 0 ? (
          <EmptyState
            icon={<UserCheck className="w-5 h-5" />}
            title="No issuer applications found"
            description="There are currently no registrar or issuer account applications matching your filter criteria."
          />
        ) : (
          <TableContainer className="border-0 rounded-none">
            <Table>
              <THead>
                <TR>
                  <TH>Applicant Profile</TH>
                  <TH>Department &amp; Designation</TH>
                  <TH>Employee ID</TH>
                  <TH>Requested Role</TH>
                  <TH>Submitted At</TH>
                  <TH>Status</TH>
                  <TH align="right">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {applications.map((app) => (
                  <TR key={app.id}>
                    <TD>
                      <div className="space-y-0.5">
                        <div className="font-semibold text-ink text-sm">{app.name}</div>
                        <div className="text-xs text-muted flex items-center gap-1 font-mono">
                          <Mail className="w-3 h-3 text-subtle" />
                          <span>{app.email}</span>
                        </div>
                        {app.walletAddress && (
                          <div className="pt-0.5">
                            <HashText value={app.walletAddress} start={6} end={4} />
                          </div>
                        )}
                      </div>
                    </TD>

                    <TD>
                      <div className="font-medium text-ink text-xs">{app.department}</div>
                      <div className="text-xs text-muted">{app.designation}</div>
                    </TD>

                    <TD>
                      <Badge tone="neutral" size="xs" className="font-mono">
                        {app.employeeId}
                      </Badge>
                    </TD>

                    <TD>
                      <span className="text-xs font-medium text-ink-2">{app.requestedRole}</span>
                    </TD>

                    <TD>
                      <span className="text-xs text-muted">{app.submittedAt}</span>
                    </TD>

                    <TD>
                      <StatusBadge status={app.status} />
                    </TD>

                    <TD align="right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <IconButton
                          label="Inspect application details"
                          variant="secondary"
                          size="xs"
                          onClick={() => onOpenDetailModal(app)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </IconButton>

                        {app.status === 'pending' && (
                          <>
                            <Button
                              variant="primary"
                              size="xs"
                              disabled={isActionLoading}
                              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                              onClick={() => onApproveIssuer(app.id)}
                            >
                              Approve
                            </Button>

                            <Button
                              variant="danger-outline"
                              size="xs"
                              disabled={isActionLoading}
                              leftIcon={<XCircle className="w-3.5 h-3.5" />}
                              onClick={() => onOpenRejectModal(app)}
                            >
                              Reject
                            </Button>

                            <Button
                              variant="secondary"
                              size="xs"
                              disabled={isActionLoading}
                              leftIcon={<HelpCircle className="w-3.5 h-3.5" />}
                              onClick={() => onOpenRequestInfoModal(app)}
                            >
                              Info
                            </Button>
                          </>
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
