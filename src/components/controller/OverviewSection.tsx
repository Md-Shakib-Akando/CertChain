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
  ChevronRight,
  Copy,
  PenTool,
  ShieldCheck,
} from 'lucide-react';
import {
  ControllerStats,
  PendingActionItem,
  RecentActivityItem,
  ControllerTab,
} from '@/types/controller';

interface OverviewSectionProps {
  stats: ControllerStats;
  pendingActions: PendingActionItem[];
  recentActivity: RecentActivityItem[];
  onNavigateTab: (tab: ControllerTab) => void;
  onSeedDemo: () => void;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  stats,
  pendingActions,
  recentActivity,
  onNavigateTab,
  onSeedDemo,
}) => {
  const [copiedAddress, setCopiedAddress] = React.useState(false);

  const handleCopyContract = () => {
    if (stats.blockchainNetwork.contractAddress) {
      navigator.clipboard.writeText(stats.blockchainNetwork.contractAddress);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const metricCards = [
    {
      title: 'Active Issuers',
      count: stats.activeIssuers,
      subtext: 'Currently authorized academic staff',
      icon: Users,
      color: 'teal',
      accentBg: 'bg-teal-50 text-teal-700 border-teal-200',
      actionTab: 'issuer-directory' as ControllerTab,
      actionText: 'View Directory',
    },
    {
      title: 'Pending Issuer Applications',
      count: stats.pendingIssuerApplications,
      subtext: 'Awaiting Controller authorization',
      icon: UserCheck,
      color: 'amber',
      accentBg: 'bg-amber-50 text-amber-700 border-amber-200',
      actionTab: 'issuer-approvals' as ControllerTab,
      actionText: 'Review Applications',
      urgent: stats.pendingIssuerApplications > 0,
    },
    {
      title: 'Pending Revocations',
      count: stats.pendingRevocations,
      subtext: 'Awaiting Controller review / co-sign',
      icon: FileX2,
      color: 'rose',
      accentBg: 'bg-rose-50 text-rose-700 border-rose-200',
      actionTab: 'revocation-requests' as ControllerTab,
      actionText: 'Inspect Requests',
      urgent: stats.pendingRevocations > 0,
    },
    {
      title: 'Blockchain Network',
      count: stats.blockchainNetwork.state === 'connected' ? 'Connected' : 'Degraded',
      subtext: stats.blockchainNetwork.networkName,
      icon: Activity,
      color: 'emerald',
      accentBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      actionTab: 'co-signature-center' as ControllerTab,
      actionText: 'Smart Contract State',
      isStatus: true,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Institutional Role Callout Banner per PDF Section 1 & 11 */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0B2545] to-[#0B1E36] text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-700">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 border border-teal-500/30 mt-0.5">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">
                Controller of Examinations Authority
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-400/20 text-teal-300 border border-teal-400/30 uppercase tracking-wider">
                Cryptographic Co-signer
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              You are the designated university authority for approving registrar issuer accounts and providing the required secondary cryptographic co-signature for certificate revocations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
          <button
            onClick={() => onNavigateTab('co-signature-center')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Co-sign Revocations</span>
          </button>
        </div>
      </div>

      {/* 4 Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 tracking-tight">
                    {card.title}
                  </span>
                  <div className={`p-2 rounded-xl ${card.accentBg}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="mt-3 flex items-baseline gap-2">
                  <span
                    className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                      card.isStatus
                        ? card.count === 'Connected'
                          ? 'text-emerald-700 text-xl'
                          : 'text-amber-700 text-xl'
                        : card.urgent
                        ? 'text-[#0B2545]'
                        : 'text-[#0B2545]'
                    }`}
                  >
                    {card.count}
                  </span>
                  {card.urgent && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800">
                      Action Required
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 mt-1 truncate">{card.subtext}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onNavigateTab(card.actionTab)}
                  className="text-xs font-bold text-teal-700 hover:text-teal-900 transition flex items-center gap-1 cursor-pointer"
                >
                  <span>{card.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Network & Contract Quick Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
            <Activity className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Smart Contract Deployment
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-xs sm:text-sm font-semibold text-[#0B2545] break-all">
                {stats.blockchainNetwork.contractAddress}
              </span>
              <button
                onClick={handleCopyContract}
                className="p-1 rounded text-slate-400 hover:text-slate-700 transition cursor-pointer"
                title="Copy Address"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              {copiedAddress && (
                <span className="text-[10px] font-bold text-emerald-600">Copied!</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500 self-stretch sm:self-auto justify-between border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Latest Block</span>
            <span className="font-mono font-bold text-[#0B2545]">
              #{stats.blockchainNetwork.latestBlock.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Chain ID</span>
            <span className="font-mono font-bold text-[#0B2545]">
              {stats.blockchainNetwork.chainId}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Sync Status</span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Prioritized Pending Actions + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Prioritized Pending Actions */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <h4 className="text-sm font-bold text-[#0B2545]">
                  Prioritized Pending Actions
                </h4>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {pendingActions.length} Pending
              </span>
            </div>

            {pendingActions.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-2 opacity-80" />
                <h5 className="text-sm font-bold text-[#0B2545]">All Actions Completed</h5>
                <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
                  No issuer applications or revocation requests currently require your attention.
                </p>
                <button
                  onClick={onSeedDemo}
                  className="mt-4 px-3 py-1.5 rounded-xl text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition cursor-pointer"
                >
                  Load Demo Pending Actions
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 mt-2">
                {pendingActions.map((action) => (
                  <div
                    key={action.id}
                    className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                          action.type === 'revocation_request'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {action.type === 'revocation_request' ? (
                          <FileX2 className="w-4 h-4" />
                        ) : (
                          <UserCheck className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#0B2545] truncate">
                            {action.title}
                          </span>
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                              action.priority === 'high'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {action.priority}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {action.subtitle}
                        </p>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Submitted: {action.submittedAt}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigateTab(action.actionTab)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1 cursor-pointer ${
                        action.type === 'revocation_request'
                          ? 'bg-rose-600 hover:bg-rose-700 text-white'
                          : 'bg-teal-600 hover:bg-teal-700 text-white'
                      }`}
                    >
                      <span>Review</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Actions enforced with server-side and cryptographic checks</span>
            <button
              onClick={() => onNavigateTab('co-signature-center')}
              className="font-bold text-teal-700 hover:text-teal-900"
            >
              Go to Co-signature Center &rarr;
            </button>
          </div>
        </div>

        {/* Right 1 Col: Recent Activity */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-600" />
                <h4 className="text-sm font-bold text-[#0B2545]">Recent Activity</h4>
              </div>
              <button
                onClick={() => onNavigateTab('audit-trail')}
                className="text-[11px] font-bold text-teal-700 hover:text-teal-900"
              >
                View Full Audit
              </button>
            </div>

            {recentActivity.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center justify-center">
                <Clock className="w-8 h-8 text-slate-300 mb-2" />
                <span className="text-xs text-slate-400 font-medium">No recent activity logs</span>
              </div>
            ) : (
              <div className="space-y-3 mt-3">
                {recentActivity.slice(0, 5).map((item) => (
                  <div key={item.id} className="text-xs pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#0B2545] truncate max-w-[170px]">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.timestamp}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                    {item.txHash && (
                      <div className="mt-1 flex items-center gap-1 font-mono text-[10px] text-teal-700">
                        <span>Tx:</span>
                        <span className="truncate max-w-[160px]">{item.txHash}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => onNavigateTab('audit-trail')}
              className="w-full py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 border border-slate-200 transition text-center cursor-pointer"
            >
              Inspect Audit Records
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
