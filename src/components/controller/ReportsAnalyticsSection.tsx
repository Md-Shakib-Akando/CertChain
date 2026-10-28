'use client';

import React from 'react';
import {
  Download,
  Printer,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import { ControllerStats, RevocationItem, IssuerApplication } from '@/types/controller';
import {
  PageHeader,
  Card,
  CardHeader,
  CardBody,
  Button,
  Badge,
  HashText,
} from '@/components/ui';

interface ReportsAnalyticsSectionProps {
  stats: ControllerStats;
  revocations: RevocationItem[];
  applications: IssuerApplication[];
  onExportCsv: () => void;
}

export const ReportsAnalyticsSection: React.FC<ReportsAnalyticsSectionProps> = ({
  stats,
  revocations,
  applications,
  onExportCsv,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const totalApps = applications.length;
  const approvedApps = applications.filter((a) => a.status === 'approved').length;
  const pendingApps = applications.filter((a) => a.status === 'pending').length;
  const rejectedApps = applications.filter((a) => a.status === 'rejected').length;

  const totalRevocations = revocations.length;
  const confirmedRevocations = revocations.filter((r) => r.workflowStatus === 'confirmed').length;
  const pendingRevocations = revocations.filter(
    (r) => r.workflowStatus === 'pending_review' || r.workflowStatus === 'awaiting_signature'
  ).length;
  const rejectedRevocations = revocations.filter((r) => r.workflowStatus === 'rejected').length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Governance Telemetry"
        title="Operational Reports & Analytics"
        description="Real backend statistics and operational summaries of issuer authorizations, certificate revocation workflows, and smart contract synchronization."
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Printer className="w-4 h-4" />}
              onClick={handlePrint}
            >
              Print Report
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={onExportCsv}
            >
              Export CSV
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            eyebrow="Access Vetting"
            title="Issuer Account Applications Summary"
            actions={<Badge tone="neutral">Total: {totalApps}</Badge>}
          />
          <CardBody className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-success">Authorized Active Issuers</span>
                <span className="font-mono font-semibold text-ink tabular">
                  {approvedApps} ({totalApps > 0 ? Math.round((approvedApps / totalApps) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-sunken overflow-hidden">
                <div
                  className="h-full bg-success rounded-full transition-all duration-500"
                  style={{
                    width: `${totalApps > 0 ? (approvedApps / totalApps) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-warning">Pending Controller Decision</span>
                <span className="font-mono font-semibold text-ink tabular">
                  {pendingApps} ({totalApps > 0 ? Math.round((pendingApps / totalApps) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-sunken overflow-hidden">
                <div
                  className="h-full bg-warning rounded-full transition-all duration-500"
                  style={{
                    width: `${totalApps > 0 ? (pendingApps / totalApps) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-danger">Rejected Applications</span>
                <span className="font-mono font-semibold text-ink tabular">
                  {rejectedApps} ({totalApps > 0 ? Math.round((rejectedApps / totalApps) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-sunken overflow-hidden">
                <div
                  className="h-full bg-danger rounded-full transition-all duration-500"
                  style={{
                    width: `${totalApps > 0 ? (rejectedApps / totalApps) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-canvas border border-line text-xs text-muted leading-relaxed">
              All registrar authorization decisions are recorded with actor email, department affiliation, and server timestamp.
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            eyebrow="Dual-Control Revocations"
            title="Revocation Workflow Breakdown"
            actions={<Badge tone="neutral">Total: {totalRevocations}</Badge>}
          />
          <CardBody className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-success">Confirmed on Blockchain</span>
                <span className="font-mono font-semibold text-ink tabular">
                  {confirmedRevocations} (
                  {totalRevocations > 0
                    ? Math.round((confirmedRevocations / totalRevocations) * 100)
                    : 0}
                  %)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-sunken overflow-hidden">
                <div
                  className="h-full bg-success rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      totalRevocations > 0 ? (confirmedRevocations / totalRevocations) * 100 : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-warning">Pending Review / Co-Signature</span>
                <span className="font-mono font-semibold text-ink tabular">
                  {pendingRevocations} (
                  {totalRevocations > 0
                    ? Math.round((pendingRevocations / totalRevocations) * 100)
                    : 0}
                  %)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-sunken overflow-hidden">
                <div
                  className="h-full bg-warning rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      totalRevocations > 0 ? (pendingRevocations / totalRevocations) * 100 : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-ink-2">
                  Rejected Requests (Certificates Retained)
                </span>
                <span className="font-mono font-semibold text-ink tabular">
                  {rejectedRevocations} (
                  {totalRevocations > 0
                    ? Math.round((rejectedRevocations / totalRevocations) * 100)
                    : 0}
                  %)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-sunken overflow-hidden">
                <div
                  className="h-full bg-subtle rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      totalRevocations > 0 ? (rejectedRevocations / totalRevocations) * 100 : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-canvas border border-line text-xs text-muted leading-relaxed">
              Per examination regulations, rejected revocation requests keep certificates valid and preserve the rejection grounds in the audit log.
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader
          eyebrow="Ledger Synchronization"
          title="Smart Contract Health & Privacy Compliance"
        />
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-canvas border border-line space-y-1">
              <span className="eyebrow block">Network Status</span>
              <span className="text-success font-semibold text-sm flex items-center gap-1.5">
                <Activity className="w-4 h-4" />
                Connected (Sepolia Testnet)
              </span>
              <span className="text-[11px] text-muted block font-mono">
                Block #{stats.blockchainNetwork.latestBlock.toLocaleString()}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-canvas border border-line space-y-1">
              <span className="eyebrow block">Smart Contract Architecture</span>
              <span className="font-semibold text-ink text-sm block truncate">
                PUB CertChain Verifier
              </span>
              <HashText value={stats.blockchainNetwork.contractAddress} start={8} end={6} />
            </div>

            <div className="p-4 rounded-xl bg-canvas border border-line space-y-1">
              <span className="eyebrow block">Student Privacy Protection</span>
              <span className="text-success font-semibold text-sm flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                100% Off-Chain PII
              </span>
              <span className="text-[11px] text-muted block">
                Only SHA-256 certificate digests stored on-chain
              </span>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
