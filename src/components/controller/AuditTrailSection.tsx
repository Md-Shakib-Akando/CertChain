'use client';

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  Lock,
} from 'lucide-react';
import { ControllerAuditEvent } from '@/types/controller';
import {
  PageHeader,
  Alert,
  Card,
  TableToolbar,
  SearchInput,
  Select,
  Button,
  Badge,
  StatusBadge,
  HashText,
  explorerTxUrl,
  TableContainer,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
  EmptyState,
} from '@/components/ui';

interface AuditTrailSectionProps {
  auditLogs: ControllerAuditEvent[];
  onExportCsv: () => void;
}

export const AuditTrailSection: React.FC<AuditTrailSectionProps> = ({
  auditLogs,
  onExportCsv,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [resultFilter, setResultFilter] = useState('all');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchQuery =
        !searchQuery ||
        log.eventType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.targetReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.transactionHash && log.transactionHash.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchType =
        eventTypeFilter === 'all' ||
        log.eventType.toLowerCase().includes(eventTypeFilter.toLowerCase());

      const matchResult =
        resultFilter === 'all' || log.result.toLowerCase() === resultFilter.toLowerCase();

      return matchQuery && matchType && matchResult;
    });
  }, [auditLogs, searchQuery, eventTypeFilter, resultFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Append-Only Ledger"
        title="Immutable Controller Audit Trail"
        description="Searchable, tamper-evident audit records capturing approvals, rejections, revocation requests, cryptographic co-signatures, and smart contract broadcasts."
        actions={
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={onExportCsv}
          >
            Export CSV
          </Button>
        }
      />

      <Alert
        tone="neutral"
        icon={<Lock className="w-4 h-4 text-brand" />}
        title="Append-Only Integrity"
      >
        Audit entries are immutably written to the database cluster and cannot be edited or deleted through the Controller UI. On-chain smart contract broadcasts include their Sepolia transaction hash.
      </Alert>

      <Card>
        <TableToolbar
          left={
            <>
              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
                placeholder="Search by event type, actor email, target reference, or tx hash..."
                className="w-full sm:w-80"
              />
              <Select
                value={eventTypeFilter}
                onChange={(e) => setEventTypeFilter(e.target.value)}
                className="w-full sm:w-44"
                aria-label="Filter by event category"
              >
                <option value="all">All Event Types</option>
                <option value="issuer">Issuer Governance</option>
                <option value="revocation">Revocations</option>
                <option value="certificate">Certificates</option>
              </Select>
              <Select
                value={resultFilter}
                onChange={(e) => setResultFilter(e.target.value)}
                className="w-full sm:w-40"
                aria-label="Filter by outcome"
              >
                <option value="all">All Outcomes</option>
                <option value="success">Success</option>
                <option value="rejected">Rejected</option>
                <option value="failed">Failed</option>
              </Select>
            </>
          }
        />

        {filteredLogs.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-5 h-5" />}
            title="No audit records found"
            description="No audit trail records matched your filter criteria."
          />
        ) : (
          <TableContainer className="border-0 rounded-none no-scrollbar">
            <Table>
              <THead>
                <TR>
                  <TH>Event Type &amp; Details</TH>
                  <TH>Actor</TH>
                  <TH>Target Reference</TH>
                  <TH>Timestamp</TH>
                  <TH>Outcome</TH>
                  <TH>Transaction Evidence</TH>
                </TR>
              </THead>
              <TBody>
                {filteredLogs.map((log) => (
                  <TR key={log.id}>
                    <TD>
                      <div className="font-semibold text-ink text-xs">{log.eventType}</div>
                      {log.details && (
                        <div className="text-[11px] text-muted max-w-xs truncate mt-0.5">
                          {log.details}
                        </div>
                      )}
                    </TD>

                    <TD>
                      <div className="font-medium text-ink text-xs">{log.actor}</div>
                      <span className="text-[10px] text-subtle uppercase font-mono block">
                        Role: {log.actorRole}
                      </span>
                    </TD>

                    <TD>
                      <Badge tone="neutral" size="xs" className="font-mono max-w-[220px] truncate">
                        {log.targetReference}
                      </Badge>
                    </TD>

                    <TD>
                      <div className="text-xs text-ink-2">{log.timestamp}</div>
                      {log.blockTimestamp && (
                        <div className="text-[10px] text-brand font-mono mt-0.5">
                          Block Time: {log.blockTimestamp}
                        </div>
                      )}
                    </TD>

                    <TD>
                      <StatusBadge status={log.result} />
                    </TD>

                    <TD>
                      {log.transactionHash ? (
                        <div className="space-y-0.5">
                          <HashText
                            value={log.transactionHash}
                            start={8}
                            end={6}
                            href={explorerTxUrl(log.transactionHash)}
                          />
                          {log.blockNumber && (
                            <div className="text-[10px] text-subtle font-mono">
                              Block #{log.blockNumber} • Sepolia
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-subtle italic">Off-chain Event</span>
                      )}
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
