'use client';

import React, { useState, useMemo } from 'react';
import {
  Award,
  Eye,
  Download,
  Share2,
  FileText,
  Calendar,
  ArrowUpDown,
} from 'lucide-react';
import { CertificatesListViewProps } from '@/types/student';
import {
  PageHeader,
  Card,
  TableToolbar,
  SearchInput,
  Select,
  Button,
  Badge,
  StatusBadge,
  HashText,
  TableContainer,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
  EmptyState,
} from '@/components/ui';

export const CertificatesListView: React.FC<CertificatesListViewProps> = ({
  certificates,
  onOpenCertificateDetail,
  onOpenShareModal,
  onDownloadPdf,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const filteredCertificates = useMemo(() => {
    return certificates
      .filter((cert) => {
        const matchesQuery =
          cert.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cert.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cert.program.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cert.sha256Hash.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType = selectedType === 'all' || cert.type === selectedType;
        const matchesStatus = selectedStatus === 'all' || cert.status === selectedStatus;

        return matchesQuery && matchesType && matchesStatus;
      })
      .sort((a, b) => {
        if (sortOrder === 'newest') {
          return b.id.localeCompare(a.id);
        }
        return a.id.localeCompare(b.id);
      });
  }, [certificates, searchQuery, selectedType, selectedStatus, sortOrder]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Academic Credential Registry"
        title="My Issued Certificates"
        description="Browse, download, and verify all official degrees, provisional certificates, and academic transcripts anchored to your Student ID."
        actions={
          <Badge tone="neutral" size="md">
            Showing {filteredCertificates.length} of {certificates.length} credentials
          </Badge>
        }
      />

      <Card>
        <TableToolbar
          left={
            <>
              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
                placeholder="Search by Certificate ID, SHA-256 hash, or program..."
                className="w-full sm:w-80"
              />
              <Select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full sm:w-52"
                aria-label="Filter by certificate type"
              >
                <option value="all">All Certificate Types</option>
                <option value="Degree Certificate">Degree Certificate</option>
                <option value="Provisional Certificate">Provisional Certificate</option>
                <option value="Academic Transcript">Academic Transcript</option>
              </Select>
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full sm:w-44"
                aria-label="Filter by status"
              >
                <option value="all">All Statuses</option>
                <option value="valid">Valid (On-Chain)</option>
                <option value="revoked">Revoked</option>
              </Select>
            </>
          }
          right={
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<ArrowUpDown className="w-3.5 h-3.5" />}
              onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
            >
              {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
            </Button>
          }
        />

        {filteredCertificates.length === 0 ? (
          <EmptyState
            icon={<Award className="w-5 h-5" />}
            title="No certificates match your filters"
            description="Try adjusting your search query or clearing the type and status filters to view all issued credentials."
            action={
              (searchQuery || selectedType !== 'all' || selectedStatus !== 'all') && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedType('all');
                    setSelectedStatus('all');
                  }}
                >
                  Reset Filters
                </Button>
              )
            }
          />
        ) : (
          <TableContainer className="border-0 rounded-none no-scrollbar">
            <Table>
              <THead>
                <TR>
                  <TH>Certificate ID &amp; Hash</TH>
                  <TH>Credential Type</TH>
                  <TH>Program &amp; Session</TH>
                  <TH>Issue Date</TH>
                  <TH>Ledger Status</TH>
                  <TH align="right">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {filteredCertificates.map((cert) => (
                  <TR key={cert.id}>
                    <TD>
                      <div className="space-y-1">
                        <span className="font-mono text-xs font-semibold text-brand block">
                          {cert.id}
                        </span>
                        <HashText value={cert.sha256Hash} start={8} end={6} />
                      </div>
                    </TD>
                    <TD>
                      <div className="space-y-1">
                        <span className="font-semibold text-ink flex items-center gap-1.5 text-sm">
                          <FileText className="w-3.5 h-3.5 text-brand shrink-0" />
                          {cert.type}
                        </span>
                        {cert.supersededBy && (
                          <Badge tone="warning" size="xs">
                            Superseded by {cert.supersededBy}
                          </Badge>
                        )}
                      </div>
                    </TD>
                    <TD>
                      <div className="font-medium text-ink text-xs sm:text-sm">{cert.program}</div>
                      <div className="text-xs text-muted">
                        Session {cert.session} • {cert.batch}
                      </div>
                    </TD>
                    <TD>
                      <span className="text-xs text-ink-2 inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-muted" />
                        {cert.issueDate}
                      </span>
                    </TD>
                    <TD>
                      <div className="space-y-1">
                        <StatusBadge status={cert.status} />
                        {cert.status === 'revoked' && cert.revocationDate && (
                          <p className="text-[11px] text-danger font-mono">
                            Revoked {cert.revocationDate}
                          </p>
                        )}
                      </div>
                    </TD>
                    <TD align="right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <Button
                          variant="secondary"
                          size="xs"
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                          onClick={() => onOpenCertificateDetail(cert)}
                        >
                          Inspect
                        </Button>
                        <Button
                          variant="secondary"
                          size="xs"
                          leftIcon={<Download className="w-3.5 h-3.5" />}
                          onClick={() => onDownloadPdf(cert)}
                        >
                          PDF
                        </Button>
                        <Button
                          variant="primary"
                          size="xs"
                          leftIcon={<Share2 className="w-3.5 h-3.5" />}
                          onClick={() => onOpenShareModal(cert)}
                        >
                          Share
                        </Button>
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
