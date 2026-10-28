'use client';

import React from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  Share2,
  ArrowRight,
  Download,
  Eye,
  Clock,
  History,
  FileCheck,
} from 'lucide-react';
import { StudentDashboardViewProps } from '@/types/student';
import {
  PageHeader,
  StatStrip,
  Card,
  CardHeader,
  CardBody,
  Button,
  Badge,
  StatusBadge,
  HashText,
  Alert,
  EmptyState,
} from '@/components/ui';

export const StudentDashboardView: React.FC<StudentDashboardViewProps> = ({
  profile,
  certificates,
  shareLinks,
  auditLogs,
  onNavigateTab,
  onOpenCertificateDetail,
  onOpenShareModal,
  onDownloadPdf,
}) => {
  const totalCount = certificates.length;
  const validCount = certificates.filter((c) => c.status === 'valid').length;
  const revokedCerts = certificates.filter((c) => c.status === 'revoked');
  const revokedCount = revokedCerts.length;
  const activeLinksCount = shareLinks.filter((l) => l.status === 'active').length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`Student Credential Vault • ${profile.department || 'Pundra University'}`}
        title={`Welcome back, ${profile.name}`}
        description={`Official read-only academic credential dossier for Student ID ${profile.studentId}. Last authenticated session: ${profile.lastLoginTime}.`}
        meta={
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            <Badge tone="brand" dot>
              Student Roll: {profile.studentId}
            </Badge>
            {profile.program && <Badge tone="neutral">{profile.program}</Badge>}
            {profile.cgpa && <Badge tone="seal">CGPA: {profile.cgpa} / 4.00</Badge>}
          </div>
        }
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Award className="w-4 h-4" />}
              onClick={() => onNavigateTab('certificates')}
            >
              All Credentials
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Share2 className="w-4 h-4" />}
              onClick={() => onOpenShareModal()}
            >
              Generate Share Link
            </Button>
          </>
        }
      />

      {/* Revocation Notice if any certificate is revoked */}
      {revokedCount > 0 && (
        <Alert
          tone="danger"
          title={`Academic Notice: ${revokedCount} Credential${revokedCount > 1 ? 's' : ''} Flagged as Revoked on Smart Contract`}
        >
          <div className="space-y-2.5 mt-2">
            {revokedCerts.map((rc) => (
              <div
                key={rc.id}
                className="p-3 rounded-lg bg-surface border border-danger-border text-xs text-ink space-y-1"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold">
                    {rc.type} (<span className="font-mono">{rc.id}</span>)
                  </span>
                  <span className="text-[11px] text-danger font-medium">
                    Revoked: {rc.revocationDate || 'Recorded on-chain'}
                  </span>
                </div>
                <p className="text-ink-2">
                  <strong>Reason:</strong> {rc.revocationReason || 'Revoked by the Controller of Examinations.'}
                </p>
                {rc.revocationTxHash && (
                  <div className="flex items-center gap-2 pt-1 text-[11px] text-muted">
                    <span>Revocation Tx:</span>
                    <HashText value={rc.revocationTxHash} start={12} end={8} href={`https://sepolia.etherscan.io/tx/${rc.revocationTxHash}`} />
                  </div>
                )}
              </div>
            ))}
            <p className="text-[11px] text-danger/90">
              Revoked status is synchronized directly from the Ethereum Sepolia smart contract. Downloads and share links remain accessible for audit transparency but carry an explicit REVOKED watermark.
            </p>
          </div>
        </Alert>
      )}

      {/* Key Metrics */}
      <StatStrip
        cols={4}
        stats={[
          {
            label: 'Total Credentials',
            value: totalCount,
            sublabel: 'Degree, Provisional & Transcripts',
            icon: <Award className="w-4 h-4" />,
            tone: 'brand',
            onClick: () => onNavigateTab('certificates'),
          },
          {
            label: 'Valid On-Chain',
            value: validCount,
            sublabel: 'Cryptographically verified',
            icon: <CheckCircle2 className="w-4 h-4" />,
            tone: 'success',
            onClick: () => onNavigateTab('certificates'),
          },
          {
            label: 'Revoked / Superseded',
            value: revokedCount,
            sublabel: 'Transparent reasons logged',
            icon: <XCircle className="w-4 h-4" />,
            tone: revokedCount > 0 ? 'danger' : 'default',
            onClick: () => onNavigateTab('certificates'),
          },
          {
            label: 'Active Share Links',
            value: activeLinksCount,
            sublabel: 'Time-bound employer URLs',
            icon: <Share2 className="w-4 h-4" />,
            tone: 'seal',
            onClick: () => onNavigateTab('links'),
          },
        ]}
      />

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Columns: Issued Credentials */}
        <Card className="lg:col-span-8">
          <CardHeader
            eyebrow="Anchored Documents"
            title="Your Issued Academic Credentials"
            description="Official PDF diplomas anchored on Ethereum Sepolia with embedded verification QR codes."
            actions={
              <Button
                variant="ghost"
                size="sm"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                onClick={() => onNavigateTab('certificates')}
              >
                View All
              </Button>
            }
          />
          <CardBody className="space-y-3">
            {certificates.length === 0 ? (
              <EmptyState
                icon={<Award className="w-5 h-5" />}
                title="No academic credentials issued yet"
                description="When the Office of the Registrar issues and anchors your degree or provisional certificate on the blockchain, it will appear here automatically."
              />
            ) : (
              certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="p-4 rounded-xl bg-canvas border border-line hover:border-line-strong transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-ink">{cert.type}</span>
                      <Badge tone="brand" size="xs" className="font-mono">
                        {cert.id}
                      </Badge>
                      <StatusBadge status={cert.status} size="sm" />
                    </div>
                    <p className="text-xs text-ink-2 font-medium">
                      {cert.program} • Session {cert.session} ({cert.batch})
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
                      <span>Issued: {cert.issueDate}</span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <span>SHA-256:</span>
                        <HashText value={cert.sha256Hash} start={10} end={6} copyable={false} />
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-line">
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
                </div>
              ))
            )}
          </CardBody>
        </Card>

        {/* Right 4 Columns: Recent Activity Audit Preview */}
        <Card className="lg:col-span-4">
          <CardHeader
            eyebrow="Chronological Log"
            title="Recent Audit Activity"
            description="Employer verifications & on-chain events."
            actions={
              <Button
                variant="ghost"
                size="xs"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                onClick={() => onNavigateTab('activity')}
              >
                All
              </Button>
            }
          />
          <CardBody className="space-y-4">
            {auditLogs.length === 0 ? (
              <EmptyState
                compact
                icon={<History className="w-5 h-5" />}
                title="No recent activity"
                description="Verification events will be logged here."
              />
            ) : (
              <div className="relative pl-5 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-px before:bg-line">
                {auditLogs.slice(0, 5).map((item) => (
                  <div key={item.id} className="relative">
                    <div className="absolute -left-[17px] top-1.5 w-2.5 h-2.5 rounded-full bg-brand ring-4 ring-surface" />
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-ink leading-tight">{item.title}</span>
                        {item.method && (
                          <Badge tone="neutral" size="xs">
                            {item.method}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted line-clamp-2 leading-relaxed">{item.description}</p>
                      <span className="text-[11px] text-subtle flex items-center gap-1 pt-0.5">
                        <Clock className="w-3 h-3" />
                        {item.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button
              variant="secondary"
              size="sm"
              fullWidth
              leftIcon={<FileCheck className="w-4 h-4" />}
              onClick={() => onNavigateTab('activity')}
            >
              View Complete Audit Trail
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
