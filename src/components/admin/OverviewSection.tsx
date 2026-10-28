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
  Copy,
  Check,
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
  const [copiedContract, setCopiedContract] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('7d');

  const handleCopyContract = () => {
    navigator.clipboard.writeText(kpis.contractAddress);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Institutional Role Boundary Notice (PDF Spec Section 2) */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0B2545] flex items-center gap-2">
              <span>Technical Administration Workspace</span>
              <span className="text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">
                Read-Only Academic Scope
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Super Admin manages infrastructure, platform accounts, and network integrity. In accordance with university academic bylaws, certificate issuance, revocation co-signing, and academic issuer authorizations remain under the exclusive governance of the <strong>Controller of Examinations</strong>.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('roles')}
          className="self-start md:self-center px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0B2545] text-xs font-semibold flex items-center gap-1.5 transition shrink-0 cursor-pointer"
        >
          <span>View Permission Matrix</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 6 Core KPI Cards (PDF Spec Section 4.2) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Card 1: Total Users */}
        <div
          onClick={() => onNavigateTab('users')}
          className="group cursor-pointer rounded-2xl bg-white border border-slate-200/90 hover:border-blue-400 p-4 transition shadow-xs hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Users
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-[#0B2545]">{kpis.totalUsers}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Accounts on Platform</span>
          </div>
        </div>

        {/* Card 2: Total Certificates */}
        <div
          onClick={() => onNavigateTab('reports')}
          className="group cursor-pointer rounded-2xl bg-white border border-slate-200/90 hover:border-blue-400 p-4 transition shadow-xs hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Certificates
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-[#0B2545]">{kpis.totalCertificates}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Indexed On-Chain</span>
          </div>
        </div>

        {/* Card 3: Revoked Certificates */}
        <div
          onClick={() => onNavigateTab('reports')}
          className="group cursor-pointer rounded-2xl bg-white border border-slate-200/90 hover:border-red-400 p-4 transition shadow-xs hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Revoked
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-red-600">{kpis.revokedCertificates}</span>
            <span className="text-[10px] text-red-600/70 block mt-0.5 font-medium">Flagged on Chain</span>
          </div>
        </div>

        {/* Card 4: Pending Issuer Approvals (Controller governed, read-only count) */}
        <div
          onClick={() => onNavigateTab('users')}
          className="group cursor-pointer rounded-2xl bg-white border border-slate-200/90 hover:border-amber-400 p-4 transition shadow-xs hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Pending Staff
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-amber-600">
              {kpis.pendingIssuerApprovals}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Controller Review</span>
          </div>
        </div>

        {/* Card 5: Verification Events */}
        <div
          onClick={() => onNavigateTab('audit')}
          className="group cursor-pointer rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-400 p-4 transition shadow-xs hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Verifications
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-emerald-600">
              {kpis.verificationEvents}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">QR &amp; Link Queries</span>
          </div>
        </div>

        {/* Card 6: Network Status */}
        <div
          onClick={() => onNavigateTab('monitoring')}
          className="group cursor-pointer rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-400 p-4 transition shadow-xs hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Network
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-base font-extrabold text-emerald-600 flex items-center gap-1.5">
              <span>Connected</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </span>
            <span className="text-[10px] font-mono text-slate-400 block mt-0.5">Sepolia #7421890</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Activity Trend Chart & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (8 Cols): Certificate & Verification Activity Chart */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#0B2545] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>Certificate Issuance &amp; Verification Volume</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                On-chain credential operations and public verification query trends
              </p>
            </div>

            {/* Time Filter Buttons */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
              {(['7d', '30d', '90d'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    selectedPeriod === period
                      ? 'bg-white text-blue-600 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {period === '7d' ? 'Last 7 Days' : period === '30d' ? '30 Days' : '90 Days'}
                </button>
              ))}
            </div>
          </div>

          {/* Bar Chart Representation (Institutional Style) */}
          <div className="pt-4">
            <div className="h-56 flex items-end justify-between gap-2 sm:gap-4 border-b border-slate-200 pb-3">
              {analyticsTrends.map((pt) => {
                const maxVal = 60;
                const issuedHeight = Math.max(12, (pt.issued / maxVal) * 100);
                const verifiedHeight = Math.max(16, (pt.verified / maxVal) * 100);

                return (
                  <div key={pt.date} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <div className="w-full flex items-end justify-center gap-1 h-full">
                      {/* Issued Bar */}
                      <div
                        style={{ height: `${issuedHeight}%` }}
                        className="w-full max-w-[14px] bg-blue-500 rounded-t-md group-hover:bg-blue-600 transition-all relative"
                        title={`${pt.issued} Certificates Issued on ${pt.date}`}
                      />
                      {/* Verified Bar */}
                      <div
                        style={{ height: `${verifiedHeight}%` }}
                        className="w-full max-w-[14px] bg-emerald-400 rounded-t-md group-hover:bg-emerald-500 transition-all relative"
                        title={`${pt.verified} Verifications on ${pt.date}`}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 group-hover:text-slate-700 whitespace-nowrap">
                      {pt.date}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between pt-3 text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-blue-500" />
                  <span className="font-medium text-slate-700">Issued On-Chain</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-400" />
                  <span className="font-medium text-slate-700">Public Verifications</span>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 italic">Data synchronized from MongoDB &amp; Sepolia Indexer</span>
            </div>
          </div>
        </div>

        {/* Right (4 Cols): Blockchain Node & Smart Contract Status Panel */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Boxes className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-[#0B2545]">Blockchain Node Status</h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
              Synchronized
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Network &amp; Chain ID
              </span>
              <div className="flex items-center justify-between font-mono font-bold text-slate-800">
                <span>{blockchainConfig.networkName}</span>
                <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  ID: {blockchainConfig.chainId}
                </span>
              </div>
            </div>

            {/* Smart Contract Address */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  Smart Contract Address
                </span>
                <button
                  onClick={handleCopyContract}
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold text-[11px] cursor-pointer"
                >
                  {copiedContract ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedContract ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="font-mono text-[11px] text-blue-700 font-semibold break-all bg-white p-2 rounded-lg border border-slate-200 select-all">
                {blockchainConfig.contractAddress}
              </div>
              <a
                href={blockchainConfig.explorerUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-slate-600 hover:text-blue-600 flex items-center gap-1 font-semibold pt-1"
              >
                <span>View on Sepolia Etherscan</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Latest Block & Last Action */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block font-medium">Latest Block:</span>
                <span className="font-mono font-bold text-slate-800">#{kpis.latestBlock}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block font-medium">RPC Latency:</span>
                <span className="font-mono font-bold text-emerald-600">146ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Row: Live System Monitoring (4 Services) & Recent Activity Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (6 Cols): System Health Monitoring Overview */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-[#0B2545]">System Health Checks</h3>
            </div>
            <button
              onClick={() => onNavigateTab('monitoring')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Detailed Diagnostics</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {systemHealth.map((svc) => {
              const isHealthy = svc.status === 'healthy';
              return (
                <div
                  key={svc.service}
                  className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-slate-50 transition flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                      {svc.service === 'api' && <Server className="w-4 h-4 text-blue-600" />}
                      {svc.service === 'database' && <Database className="w-4 h-4 text-emerald-600" />}
                      {svc.service === 'email' && <Mail className="w-4 h-4 text-indigo-600" />}
                      {svc.service === 'blockchain' && <Boxes className="w-4 h-4 text-sky-600" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#0B2545]">{svc.displayName}</span>
                        {svc.latencyMs !== undefined && (
                          <span className="text-[10px] font-mono text-slate-400">
                            {svc.latencyMs}ms
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{svc.message}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 border ${
                      isHealthy
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {isHealthy ? 'Online' : 'Degraded'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right (6 Cols): Recent Administrative Audit Stream */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-[#0B2545]">Recent Platform Activity</h3>
            </div>
            <button
              onClick={() => onNavigateTab('audit')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View All Audit Logs</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {recentLogs.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No recent activity logged in this session.
              </div>
            ) : (
              recentLogs.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-slate-50 transition space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#0B2545]">{item.action}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{item.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-1">{item.details || item.targetReference}</p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-0.5">
                    <span className="font-mono text-blue-600">{item.actorEmail}</span>
                    <span>•</span>
                    <span className="capitalize">{item.actorRole}</span>
                    {item.transactionHash && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-emerald-600 truncate max-w-[140px]">
                          Tx: {item.transactionHash.slice(0, 10)}...
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
