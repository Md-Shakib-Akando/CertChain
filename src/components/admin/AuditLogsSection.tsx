'use client';

import React, { useState } from 'react';
import {
  FileText,
  Search,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { AdminAuditEvent } from '@/types/admin';

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

  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case 'success':
        return {
          icon: <CheckCircle2 className="w-3 h-3 text-emerald-600" />,
          style: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-3 h-3 text-amber-600" />,
          style: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'failure':
      default:
        return {
          icon: <XCircle className="w-3 h-3 text-red-600" />,
          style: 'bg-red-50 text-red-700 border-red-200',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#0B2545] flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Immutable Application Audit Trail </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tamper-evident log of administrative events, account state updates, and smart contract commits.
          </p>
        </div>

        <button
          onClick={onExportCsv}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-2 shadow-2xs transition cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-blue-600" />
          <span>Export Audit CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="relative sm:col-span-6">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search action, actor, target reference, or transaction..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/10 shadow-2xs"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-blue-600 cursor-pointer shadow-2xs"
            >
              <option value="all">All Actor Roles</option>
              <option value="admin">Super Admin</option>
              <option value="controller">Controller</option>
              <option value="issuer">Issuer (Staff)</option>
              <option value="student">Student</option>
              <option value="system">System / Node</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedOutcome}
              onChange={(e) => setSelectedOutcome(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-blue-600 cursor-pointer shadow-2xs"
            >
              <option value="all">All Outcomes</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="failure">Failure</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>Showing {filtered.length} audit entries</span>
          <span className="text-[11px] font-mono text-slate-400">
            Append-Only Storage (No Delete/Edit Interface)
          </span>
        </div>
      </div>

      {/* Audit Log Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center shadow-xs space-y-2">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-[#0B2545]">No Audit Logs Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Audit logs are recorded automatically as system events occur.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4 sm:px-6">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Target / Entity</th>
                  <th className="py-3 px-4">Outcome</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Blockchain Tx</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((log) => {
                  const outcome = getOutcomeBadge(log.outcome);
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition">
                      {/* Timestamp */}
                      <td className="py-3.5 px-4 sm:px-6 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {log.timestamp}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-[#0B2545] block">{log.action}</span>
                        {log.details && (
                          <span className="text-[11px] text-slate-500 line-clamp-1">
                            {log.details}
                          </span>
                        )}
                      </td>

                      {/* Actor */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-slate-700 block">{log.actorEmail}</span>
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          {log.actorRole}
                        </span>
                      </td>

                      {/* Target */}
                      <td className="py-3.5 px-4">
                        <span className="text-slate-800 font-medium block">
                          {log.targetReference || 'Platform Entity'}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          Type: {log.targetType}
                        </span>
                      </td>

                      {/* Outcome */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${outcome.style}`}
                        >
                          {outcome.icon}
                          <span>{log.outcome}</span>
                        </span>
                      </td>

                      {/* Tx Hash */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        {log.transactionHash ? (
                          <a
                            href={`https://sepolia.etherscan.io/tx/${log.transactionHash}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 font-mono text-[11px] text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            <span>{log.transactionHash.slice(0, 10)}...</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-slate-300 font-mono text-[11px]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
