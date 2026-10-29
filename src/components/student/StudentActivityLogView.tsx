'use client';

import React, { useState, useMemo } from 'react';
import {
  FileCheck,
  AlertCircle,
  Share2,
  Ban,
  Eye,
  QrCode,
  ShieldCheck,
  Clock,
  CheckCircle2,
  History,
} from 'lucide-react';
import { StudentAuditEvent, StudentActivityLogViewProps } from '@/types/student';
import {
  PageHeader,
  StatStrip,
  Card,
  CardBody,
  TableToolbar,
  SearchInput,
  Segmented,
  Badge,
  HashText,
  explorerTxUrl,
  Alert,
  EmptyState,
} from '@/components/ui';

export const StudentActivityLogView: React.FC<StudentActivityLogViewProps> = ({ auditLogs }) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'chain' | 'verifications' | 'shares'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.certId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.txHash && item.txHash.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchesFilter = true;
      if (selectedFilter === 'chain') {
        matchesFilter = item.eventType === 'CertificateIssued' || item.eventType === 'CertificateRevoked';
      } else if (selectedFilter === 'shares') {
        matchesFilter = item.eventType === 'ShareLinkCreated' || item.eventType === 'ShareLinkCancelled';
      } else if (selectedFilter === 'verifications') {
        matchesFilter =
          item.eventType === 'LinkOpened' ||
          item.eventType === 'VerifiedByQR' ||
          item.eventType === 'VerifiedByCertificateID';
      }

      return matchesSearch && matchesFilter;
    });
  }, [auditLogs, searchQuery, selectedFilter]);

  const stats = useMemo(() => {
    const total = auditLogs.length;
    const verifications = auditLogs.filter(
      (l) => l.eventType === 'LinkOpened' || l.eventType === 'VerifiedByQR' || l.eventType === 'VerifiedByCertificateID'
    ).length;
    const chainEvents = auditLogs.filter((l) => Boolean(l.txHash)).length;
    const shares = auditLogs.filter((l) => l.eventType === 'ShareLinkCreated').length;
    return { total, verifications, chainEvents, shares };
  }, [auditLogs]);

  const getEventBadge = (eventType: StudentAuditEvent['eventType']) => {
    switch (eventType) {
      case 'CertificateIssued':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-success" />,
          tone: 'success' as const,
          dot: 'bg-success',
        };
      case 'CertificateRevoked':
        return {
          icon: <AlertCircle className="w-4 h-4 text-danger" />,
          tone: 'danger' as const,
          dot: 'bg-danger',
        };
      case 'ShareLinkCreated':
        return {
          icon: <Share2 className="w-4 h-4 text-brand" />,
          tone: 'brand' as const,
          dot: 'bg-brand',
        };
      case 'ShareLinkCancelled':
        return {
          icon: <Ban className="w-4 h-4 text-warning" />,
          tone: 'warning' as const,
          dot: 'bg-warning',
        };
      case 'LinkOpened':
        return {
          icon: <Eye className="w-4 h-4 text-info" />,
          tone: 'info' as const,
          dot: 'bg-info',
        };
      case 'VerifiedByQR':
        return {
          icon: <QrCode className="w-4 h-4 text-seal" />,
          tone: 'seal' as const,
          dot: 'bg-seal',
        };
      case 'VerifiedByCertificateID':
      default:
        return {
          icon: <FileCheck className="w-4 h-4 text-brand" />,
          tone: 'brand' as const,
          dot: 'bg-brand',
        };
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Cryptographic Audit Ledger"
        title="Student Activity & Verification Log"
        description="Tamper-evident chronological audit trail of all certificate issuances, revocations, share links, and employer verification queries."
      />

      <StatStrip
        cols={4}
        stats={[
          { label: 'Total Audit Events', value: stats.total, tone: 'default' },
          { label: 'Employer Verifications', value: stats.verifications, tone: 'brand' },
          { label: 'Blockchain Commits', value: stats.chainEvents, tone: 'success' },
          { label: 'Share Links Created', value: stats.shares, tone: 'seal' },
        ]}
      />

      <Card>
        <TableToolbar
          left={
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
              placeholder="Search events, certificate ID, or transaction hash..."
              className="w-full sm:w-80"
            />
          }
          right={
            <Segmented
              value={selectedFilter}
              onChange={setSelectedFilter}
              size="sm"
              options={[
                { value: 'all', label: 'All Events' },
                { value: 'chain', label: 'On-Chain' },
                { value: 'verifications', label: 'Verifications' },
                { value: 'shares', label: 'Share Links' },
              ]}
            />
          }
        />

        <CardBody>
          {filteredLogs.length === 0 ? (
            <EmptyState
              icon={<History className="w-5 h-5" />}
              title="No activity events match your criteria"
              description="Try clearing your search query or switching the event category filter."
            />
          ) : (
            <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-px before:bg-line">
              {filteredLogs.map((event) => {
                const badge = getEventBadge(event.eventType);

                return (
                  <div key={event.id} className="relative">
                    <div
                      className={`absolute -left-[22px] sm:-left-[30px] top-3 w-3 h-3 rounded-full ${badge.dot} ring-4 ring-surface`}
                    />

                    <div className="bg-canvas border border-line rounded-xl p-4 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {badge.icon}
                          <span className="font-semibold text-sm text-ink">{event.title}</span>
                          <Badge tone={badge.tone} size="xs" className="font-mono">
                            {event.certId}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-1.5 text-muted text-xs">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{event.timestamp}</span>
                        </div>
                      </div>

                      <p className="text-xs text-ink-2 leading-relaxed">{event.description}</p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-2 border-t border-line text-[11px] text-muted">
                        {event.method && (
                          <div>
                            <span>Method: </span>
                            <span className="font-medium text-ink">{event.method}</span>
                          </div>
                        )}

                        {event.actorRole && (
                          <div>
                            <span>Actor: </span>
                            <span className="font-medium text-ink">{event.actorRole}</span>
                          </div>
                        )}

                        {event.txHash && (
                          <div className="inline-flex items-center gap-1.5">
                            <span>On-Chain Tx:</span>
                            <HashText
                              value={event.txHash}
                              start={10}
                              end={8}
                              href={explorerTxUrl(event.txHash)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>

      <Alert
        tone="neutral"
        icon={<ShieldCheck className="w-4 h-4 text-brand" />}
        title="Privacy & Zero-Tracking Guarantee"
      >
        Verifier personal identity is never logged or tracked. Only the verification timestamp, query channel (QR scan, Certificate ID lookup, or share link access), and cryptographic status are recorded in your personal audit log.
      </Alert>
    </div>
  );
};
