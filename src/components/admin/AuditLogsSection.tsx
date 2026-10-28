'use client';

import React, { useState } from 'react';
import { FileText, Search, Download } from 'lucide-react';
import { AdminAuditEvent } from '@/types/admin';
import {
  PageHeader,
  Card,
  Button,
  Input,
  Select,
  StatusBadge,
  RoleBadge,
  HashText,
  EmptyState,
  TableContainer,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
} from '@/components/ui';

interface AuditLogsSectionProps {
  logs: AdminAuditEvent[];
  onExportCsv: () => void;
}

export const AuditLogsSection: React.FC<AuditLogsSectionProps> = ({ logs, onExportCsv }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedOutcome, setSelectedOutcome] = useState('all');

  const filtered = logs.filter((log) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      log.action.toLowerCase().includes(q) ||
      log.actorEmail.toLowerCase().includes(q) ||
      (log.targetReference && log.targetReference.toLowerCase().includes(q)) ||
      (log.details && log.details.toLowerCase().includes(q)) ||
      (log.transactionHash && log.transactionHash.toLowerCase().includes(q));

    const matchesRole = selectedRole === 'all' || log.actorRole === selectedRole;
    const matchesOutcome = selectedOutcome === 'all' || log.outcome === selectedOutcome;

    return matchesSearch && matchesRole && matchesOutcome;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Cryptographic & System Ledger"
        title="Immutable Application Audit Trail"
        description="Tamper-evident log of administrative events, account state updates, and smart contract commits."
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={onExportCsv}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export Audit CSV
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <Card padding="md" className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6">
            <Input
              type="text"
              placeholder="Search action, actor, target reference, or transaction..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="sm:col-span-3">
            <Select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="all">All Actor Roles</option>
              <option value="admin">Super Admin</option>
              <option value="controller">Controller</option>
              <option value="issuer">Issuer (Staff)</option>
              <option value="student">Student</option>
              <option value="system">System / Node</option>
            </Select>
          </div>

          <div className="sm:col-span-3">
            <Select
              value={selectedOutcome}
              onChange={(e) => setSelectedOutcome(e.target.value)}
            >
              <option value="all">All Outcomes</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="failure">Failure</option>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted pt-2 border-t border-line">
          <span>Showing {filtered.length} audit entries</span>
          <span className="font-mono text-[11px]">
            Append-Only Storage (No Delete/Edit Interface)
          </span>
        </div>
      </Card>

      {/* Audit Log Table */}
      {filtered.length === 0 ? (
        <Card padding="lg">
          <EmptyState
            icon={<FileText className="w-5 h-5" />}
            title="No Audit Logs Found"
            description="Audit logs are recorded automatically as system events occur."
          />
        </Card>
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <TR>
                <TH>Timestamp</TH>
                <TH>Action</TH>
                <TH>Actor</TH>
                <TH>Target / Entity</TH>
                <TH>Outcome</TH>
                <TH align="right">Blockchain Tx</TH>
              </TR>
            </THead>
            <TBody>
              {filtered.map((log) => (
                <TR key={log.id}>
                  <TD className="font-mono text-xs text-muted whitespace-nowrap">
                    {log.timestamp}
                  </TD>

                  <TD>
                    <span className="font-semibold text-ink block">{log.action}</span>
                    {log.details && (
                      <span className="text-xs text-muted line-clamp-1">{log.details}</span>
                    )}
                  </TD>

                  <TD>
                    <span className="font-mono text-xs text-ink block mb-0.5">
                      {log.actorEmail}
                    </span>
                    <RoleBadge role={log.actorRole} />
                  </TD>

                  <TD>
                    <span className="text-ink font-medium text-xs block">
                      {log.targetReference || 'Platform Entity'}
                    </span>
                    <span className="eyebrow block mt-0.5">Type: {log.targetType}</span>
                  </TD>

                  <TD>
                    <StatusBadge status={log.outcome} />
                  </TD>

                  <TD align="right">
                    {log.transactionHash ? (
                      <HashText
                        value={log.transactionHash}
                        head={8}
                        tail={6}
                        size="xs"
                        href={`https://sepolia.etherscan.io/tx/${log.transactionHash}`}
                      />
                    ) : (
                      <span className="text-muted font-mono text-xs">—</span>
                    )}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};
