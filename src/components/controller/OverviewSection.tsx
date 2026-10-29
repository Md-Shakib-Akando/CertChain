'use client';

import React from 'react';
import {
  Users,
  UserCheck,
  FileX2,
  Activity,
  ArrowRight,
  Clock,
  CheckCircle2,
  PenTool,
  ShieldCheck,
} from 'lucide-react';
import {
  ControllerStats,
  PendingActionItem,
  RecentActivityItem,
  ControllerTab,
} from '@/types/controller';
import {
  StatStrip,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Badge,
  HashText,
  EmptyState,
} from '@/components/ui';

interface OverviewSectionProps {
  stats: ControllerStats;
  pendingActions: PendingActionItem[];
  recentActivity: RecentActivityItem[];
  onNavigateTab: (tab: ControllerTab) => void;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  stats,
  pendingActions,
  recentActivity,
  onNavigateTab,
}) => {
  return (
    <div className="space-y-6">
      {/* Institutional Role Callout Banner */}
      <Card className="bg-night text-night-text border-night-line on-night" padding="lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-night-2 text-seal flex items-center justify-center shrink-0 border border-seal/40 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-serif font-semibold text-night-text">
                  Controller of Examinations Governance Authority
                </h3>
                <Badge tone="seal" size="xs">
                  Cryptographic Co-Signer
                </Badge>
              </div>
              <p className="text-xs text-night-muted max-w-2xl leading-relaxed">
                You are the designated university authority for vetting Registrar/Issuer applications and providing the mandatory secondary cryptographic co-signature for certificate revocations.
              </p>
            </div>
          </div>

          <Button
            variant="seal"
            size="sm"
            leftIcon={<PenTool className="w-4 h-4" />}
            onClick={() => onNavigateTab('co-signature-center')}
          >
            Co-Sign Revocations
          </Button>
        </div>
      </Card>

      {/* Top 4 Metrics */}
      <StatStrip
        cols={4}
        stats={[
          {
            label: 'Active Issuers',
            value: stats.activeIssuers,
            sublabel: 'Authorized academic staff',
            icon: <Users className="w-4 h-4" />,
            tone: 'brand',
            onClick: () => onNavigateTab('issuer-directory'),
          },
          {
            label: 'Pending Applications',
            value: stats.pendingIssuerApplications,
            sublabel: 'Awaiting Controller vetting',
            icon: <UserCheck className="w-4 h-4" />,
            tone: stats.pendingIssuerApplications > 0 ? 'warning' : 'default',
            onClick: () => onNavigateTab('issuer-approvals'),
          },
          {
            label: 'Pending Revocations',
            value: stats.pendingRevocations,
            sublabel: 'Awaiting review / co-sign',
            icon: <FileX2 className="w-4 h-4" />,
            tone: stats.pendingRevocations > 0 ? 'danger' : 'default',
            onClick: () => onNavigateTab('revocation-requests'),
          },
          {
            label: 'Blockchain Network',
            value: stats.blockchainNetwork.state === 'connected' ? 'Connected' : 'Degraded',
            sublabel: stats.blockchainNetwork.networkName,
            icon: <Activity className="w-4 h-4" />,
            tone: stats.blockchainNetwork.state === 'connected' ? 'success' : 'warning',
            onClick: () => onNavigateTab('co-signature-center'),
          },
        ]}
      />

      {/* Smart Contract Deployment Strip */}
      <Card padding="md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-brand-muted flex items-center justify-center text-brand shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="eyebrow block">Smart Contract Deployment (CertChain.sol)</span>
              <div className="mt-0.5">
                <HashText
                  value={stats.blockchainNetwork.contractAddress}
                  start={14}
                  end={10}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-muted self-stretch sm:self-auto justify-between border-t md:border-t-0 pt-3 md:pt-0 border-line">
            <div>
              <span className="text-[10px] text-subtle block font-semibold uppercase tracking-wider">
                Latest Block
              </span>
              <span className="font-mono font-semibold text-ink">
                #{stats.blockchainNetwork.latestBlock.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-subtle block font-semibold uppercase tracking-wider">
                Chain ID
              </span>
              <span className="font-mono font-semibold text-ink">
                {stats.blockchainNetwork.chainId}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-subtle block font-semibold uppercase tracking-wider">
                Sync Status
              </span>
              <Badge tone="success" size="xs" dot>
                Live
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Grid: Prioritized Pending Actions + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <Card className="lg:col-span-8">
          <CardHeader
            eyebrow="Action Queue"
            title="Prioritized Pending Governance Actions"
            description="Issuer account applications and certificate revocation requests awaiting your decision."
            actions={
              <Badge tone={pendingActions.length > 0 ? 'warning' : 'success'}>
                {pendingActions.length} Pending
              </Badge>
            }
          />
          <CardBody>
            {pendingActions.length === 0 ? (
              <EmptyState
                icon={<CheckCircle2 className="w-5 h-5" />}
                title="All governance actions completed"
                description="No issuer applications or revocation requests currently require your attention."
              />
            ) : (
              <div className="divide-y divide-line">
                {pendingActions.map((action) => (
                  <div
                    key={action.id}
                    className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`p-2 rounded-lg shrink-0 mt-0.5 border ${
                          action.type === 'revocation_request'
                            ? 'bg-danger-bg text-danger border-danger-border'
                            : 'bg-warning-bg text-warning border-warning-border'
                        }`}
                      >
                        {action.type === 'revocation_request' ? (
                          <FileX2 className="w-4 h-4" />
                        ) : (
                          <UserCheck className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold text-ink truncate">
                            {action.title}
                          </span>
                          <Badge
                            tone={action.priority === 'high' ? 'danger' : 'neutral'}
                            size="xs"
                          >
                            {action.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted truncate">{action.subtitle}</p>
                        <span className="text-[11px] text-subtle block">
                          Submitted: {action.submittedAt}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant={action.type === 'revocation_request' ? 'danger' : 'primary'}
                      size="xs"
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      onClick={() => onNavigateTab(action.actionTab)}
                    >
                      Review
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
          <CardFooter className="flex items-center justify-between text-xs text-muted">
            <span>All decisions are enforced server-side and logged immutably.</span>
            <Button
              variant="ghost"
              size="xs"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={() => onNavigateTab('co-signature-center')}
            >
              Open Co-Signature Center
            </Button>
          </CardFooter>
        </Card>

        <Card className="lg:col-span-4">
          <CardHeader
            eyebrow="Recent Events"
            title="Examination Activity"
            actions={
              <Button
                variant="ghost"
                size="xs"
                onClick={() => onNavigateTab('audit-trail')}
              >
                Full Audit
              </Button>
            }
          />
          <CardBody className="space-y-3">
            {recentActivity.length === 0 ? (
              <EmptyState
                compact
                icon={<Clock className="w-5 h-5" />}
                title="No recent activity"
                description="Governance decisions will appear here."
              />
            ) : (
              <div className="divide-y divide-line">
                {recentActivity.slice(0, 5).map((item) => (
                  <div key={item.id} className="py-3 first:pt-0 last:pb-0 space-y-1 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-ink truncate">{item.title}</span>
                      <span className="text-[11px] text-subtle font-mono shrink-0">
                        {item.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                    {item.txHash && (
                      <div className="pt-0.5">
                        <HashText value={item.txHash} start={8} end={6} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardBody>
          <CardFooter>
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              onClick={() => onNavigateTab('audit-trail')}
            >
              Inspect Audit Trail
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
