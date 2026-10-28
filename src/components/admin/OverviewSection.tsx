'use client';

import React, { useState } from 'react';
import {
  Users,
  Award,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Boxes,
  ArrowRight,
  ShieldAlert,
  ExternalLink,
  Activity,
  Layers,
  Database,
  Mail,
  Server,
  TrendingUp,
} from 'lucide-react';
import {
  DashboardKPIs,
  AdminAuditEvent,
  ServiceHealthItem,
  BlockchainNetworkConfig,
  AdminTab,
  AnalyticsTrendPoint,
} from '@/types/admin';
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardBody,
  Button,
  Badge,
  StatusBadge,
  Segmented,
  HashText,
} from '@/components/ui';

interface OverviewSectionProps {
  kpis: DashboardKPIs;
  recentLogs: AdminAuditEvent[];
  systemHealth: ServiceHealthItem[];
  blockchainConfig: BlockchainNetworkConfig;
  analyticsTrends: AnalyticsTrendPoint[];
  onNavigateTab: (tab: AdminTab) => void;
  onFilterUsersByRole?: (role: string) => void;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  kpis,
  recentLogs,
  systemHealth,
  blockchainConfig,
  analyticsTrends,
  onNavigateTab,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('7d');

  const kpiCards = [
    {
      label: 'Total Users',
      value: kpis.totalUsers,
      hint: 'Accounts on Platform',
      icon: <Users className="w-4 h-4 text-brand" />,
      tab: 'users' as AdminTab,
      tone: 'text-ink',
    },
    {
      label: 'Certificates',
      value: kpis.totalCertificates,
      hint: 'Indexed On-Chain',
      icon: <Award className="w-4 h-4 text-brand" />,
      tab: 'reports' as AdminTab,
      tone: 'text-ink',
    },
    {
      label: 'Revoked',
      value: kpis.revokedCertificates,
      hint: 'Flagged on Chain',
      icon: <AlertTriangle className="w-4 h-4 text-danger" />,
      tab: 'reports' as AdminTab,
      tone: 'text-danger',
    },
    {
      label: 'Pending Staff',
      value: kpis.pendingIssuerApprovals,
      hint: 'Controller Review',
      icon: <Clock className="w-4 h-4 text-warning" />,
      tab: 'users' as AdminTab,
      tone: 'text-warning',
    },
    {
      label: 'Verifications',
      value: kpis.verificationEvents,
      hint: 'QR & Link Queries',
      icon: <CheckCircle2 className="w-4 h-4 text-success" />,
      tab: 'audit' as AdminTab,
      tone: 'text-success',
    },
    {
      label: 'Network',
      value: 'Connected',
      hint: `Sepolia #${kpis.latestBlock}`,
      icon: <Boxes className="w-4 h-4 text-success" />,
      tab: 'monitoring' as AdminTab,
      tone: 'text-success',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Platform Infrastructure · Pundra University of Science & Technology"
        title="Super Admin Command Center"
        description="Monitor platform services, manage institutional user accounts, and audit cryptographic ledger operations."
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onNavigateTab('roles')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            View Permission Matrix
          </Button>
        }
      />

      {/* Institutional Role Boundary Notice (PDF Spec Section 2) */}
      <Card padding="md" className="bg-brand-soft/40 border-brand/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-brand/10 border border-brand/20 text-brand flex items-center justify-center shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-ink">
                  Technical Administration Workspace
                </h3>
                <Badge tone="brand" size="sm">
                  Read-Only Academic Scope
                </Badge>
              </div>
              <p className="text-xs text-muted mt-1 max-w-3xl leading-relaxed">
                Super Admin manages infrastructure, platform accounts, and network integrity. In accordance with university academic bylaws, certificate issuance, revocation co-signing, and academic issuer authorizations remain under the exclusive governance of the <strong className="text-ink font-semibold">Controller of Examinations</strong>.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* 6 Core KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {kpiCards.map((item) => (
          <Card
            key={item.label}
            padding="md"
            interactive
            onClick={() => onNavigateTab(item.tab)}
            className="flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="eyebrow">{item.label}</span>
              <div className="w-7 h-7 rounded-md bg-sunken border border-line flex items-center justify-center">
                {item.icon}
              </div>
            </div>
            <div className="mt-3">
              <div className={`font-serif text-2xl font-semibold tabular ${item.tone}`}>
                {item.value}
              </div>
              <span className="text-[11px] text-muted block mt-0.5 font-mono truncate">
                {item.hint}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Grid: Activity Trend Chart & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (8 Cols): Certificate & Verification Activity Chart */}
        <Card padding="lg" className="lg:col-span-8 space-y-5">
          <CardHeader className="mb-0 pb-3 border-b border-line">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand" />
                <span>Certificate Issuance &amp; Verification Volume</span>
              </CardTitle>
              <CardDescription>
                On-chain credential operations and public verification query trends
              </CardDescription>
            </div>

            <Segmented
              size="sm"
              value={selectedPeriod}
              onChange={setSelectedPeriod}
              options={[
                { value: '7d', label: '7 Days' },
                { value: '30d', label: '30 Days' },
                { value: '90d', label: '90 Days' },
              ]}
            />
          </CardHeader>

          <CardBody className="pt-2 space-y-3">
            <div className="h-56 flex items-end justify-between gap-2 sm:gap-4 border-b border-line pb-3">
              {analyticsTrends.map((pt) => {
                const maxVal = 60;
                const issuedHeight = Math.max(12, (pt.issued / maxVal) * 100);
                const verifiedHeight = Math.max(16, (pt.verified / maxVal) * 100);

                return (
                  <div
                    key={pt.date}
                    className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group"
                  >
                    <div className="w-full flex items-end justify-center gap-1.5 h-full">
                      <div
                        style={{ height: `${issuedHeight}%` }}
                        className="w-full max-w-[14px] bg-brand rounded-t-sm group-hover:bg-brand-hover transition-all"
                        title={`${pt.issued} Certificates Issued on ${pt.date}`}
                      />
                      <div
                        style={{ height: `${verifiedHeight}%` }}
                        className="w-full max-w-[14px] bg-success rounded-t-sm opacity-85 group-hover:opacity-100 transition-all"
                        title={`${pt.verified} Verifications on ${pt.date}`}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-muted group-hover:text-ink whitespace-nowrap">
                      {pt.date}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-muted">
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-brand" />
                  <span className="font-medium text-ink">Issued On-Chain</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-success" />
                  <span className="font-medium text-ink">Public Verifications</span>
                </div>
              </div>
              <span className="text-[11px] font-mono text-muted">
                Synchronized from MongoDB Atlas &amp; Sepolia Indexer
              </span>
            </div>
          </CardBody>
        </Card>

        {/* Right (4 Cols): Blockchain Node & Smart Contract Status Panel */}
        <Card padding="lg" className="lg:col-span-4 space-y-4">
          <CardHeader className="mb-0 pb-3 border-b border-line">
            <CardTitle className="flex items-center gap-2">
              <Boxes className="w-4 h-4 text-brand" />
              <span>Blockchain Node Status</span>
            </CardTitle>
            <Badge tone="success" dot size="sm">
              Synchronized
            </Badge>
          </CardHeader>

          <CardBody className="space-y-3 text-xs">
            <div className="p-3 bg-sunken rounded-md border border-line space-y-1">
              <span className="eyebrow block">Network &amp; Chain ID</span>
              <div className="flex items-center justify-between font-mono font-semibold text-ink pt-0.5">
                <span>{blockchainConfig.networkName}</span>
                <Badge tone="brand" size="sm">
                  ID: {blockchainConfig.chainId}
                </Badge>
              </div>
            </div>

            <div className="p-3 bg-sunken rounded-md border border-line space-y-2">
              <span className="eyebrow block">Smart Contract Address</span>
              <div className="p-2 rounded bg-surface border border-line">
                <HashText value={blockchainConfig.contractAddress} head={10} tail={8} size="xs" />
              </div>
              <a
                href={blockchainConfig.explorerUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-brand hover:underline inline-flex items-center gap-1 font-medium pt-0.5"
              >
                <span>View on Sepolia Etherscan</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 bg-sunken rounded-md border border-line">
                <span className="eyebrow block">Latest Block</span>
                <span className="font-mono font-semibold text-ink text-sm mt-0.5 block">
                  #{kpis.latestBlock}
                </span>
              </div>
              <div className="p-3 bg-sunken rounded-md border border-line">
                <span className="eyebrow block">RPC Latency</span>
                <span className="font-mono font-semibold text-success text-sm mt-0.5 block">
                  146ms
                </span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Lower Row: Live System Monitoring (4 Services) & Recent Activity Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (6 Cols): System Health Monitoring Overview */}
        <Card padding="lg" className="lg:col-span-6 space-y-4">
          <CardHeader className="mb-0 pb-3 border-b border-line">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-success" />
              <span>System Health Checks</span>
            </CardTitle>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => onNavigateTab('monitoring')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Detailed Diagnostics
            </Button>
          </CardHeader>

          <CardBody className="space-y-2.5">
            {systemHealth.map((svc) => (
              <div
                key={svc.service}
                className="p-3.5 rounded-md border border-line bg-sunken/50 hover:bg-sunken transition flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-surface border border-line flex items-center justify-center shrink-0 mt-0.5">
                    {svc.service === 'api' && <Server className="w-4 h-4 text-brand" />}
                    {svc.service === 'database' && <Database className="w-4 h-4 text-success" />}
                    {svc.service === 'email' && <Mail className="w-4 h-4 text-seal" />}
                    {svc.service === 'blockchain' && <Boxes className="w-4 h-4 text-info" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-ink">{svc.displayName}</span>
                      {svc.latencyMs !== undefined && (
                        <span className="text-[11px] font-mono text-muted">{svc.latencyMs}ms</span>
                      )}
                    </div>
                    <p className="text-xs text-muted mt-0.5 leading-relaxed">{svc.message}</p>
                  </div>
                </div>

                <StatusBadge status={svc.status} />
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Right (6 Cols): Recent Administrative Audit Stream */}
        <Card padding="lg" className="lg:col-span-6 space-y-4">
          <CardHeader className="mb-0 pb-3 border-b border-line">
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand" />
              <span>Recent Platform Activity</span>
            </CardTitle>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => onNavigateTab('audit')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              View All Audit Logs
            </Button>
          </CardHeader>

          <CardBody className="space-y-2.5">
            {recentLogs.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted">
                No recent activity logged in this session.
              </div>
            ) : (
              recentLogs.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-md border border-line bg-sunken/50 hover:bg-sunken transition space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-ink">{item.action}</span>
                    <span className="text-[11px] text-muted font-mono">{item.timestamp}</span>
                  </div>
                  <p className="text-xs text-muted line-clamp-1">
                    {item.details || item.targetReference}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted pt-0.5">
                    <span className="font-mono text-brand font-medium">{item.actorEmail}</span>
                    <span>•</span>
                    <span className="capitalize">{item.actorRole}</span>
                    {item.transactionHash && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-success truncate max-w-[160px]">
                          Tx: {item.transactionHash.slice(0, 10)}…
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
