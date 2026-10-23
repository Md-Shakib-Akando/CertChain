'use client';

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Copy,
  Lock,
} from 'lucide-react';
import { ControllerAuditEvent } from '@/types/controller';

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
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleCopy = (hash: string, id: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

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

  const getResultBadge = (result: 'success' | 'pending' | 'rejected' | 'failed') => {
    switch (result) {
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            Success
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3 h-3" />
            Failed
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header Info Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-[#0B2545] flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            <span>Immutable Controller Audit Trail</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Searchable, tamper-evident audit records capturing approvals, rejections, revocation requests, cryptographic co-signatures, and smart contract broadcasts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportCsv}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-teal-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Audit Log Immutability Notice per PDF Section 8 */}
      <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5">
        <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">Append-Only Integrity:</span> Audit entries are immutably written to the database cluster and cannot be edited or deleted through the Controller UI. Blockchain events are clearly distinguished from off-chain administrative records.
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by event type, actor email, target reference, or transaction hash..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#0B2545] placeholder-slate-400 focus:bg-white focus:outline-none transition"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 shrink-0">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white cursor-pointer"
          >
            <option value="all">All Event Types</option>
            <option value="issuer">Issuer Governance</option>
            <option value="revocation">Revocations</option>
            <option value="certificate">Certificates</option>
          </select>

          <select
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white cursor-pointer"
          >
            <option value="all">All Outcomes</option>
            <option value="success">Success</option>
            <option value="rejected">Rejected</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center p-6">
            <FileText className="w-12 h-12 text-slate-300 mb-3" />
            <h4 className="text-sm font-bold text-[#0B2545]">No Audit Records Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              No audit trail records matched your filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/90 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                  <th className="py-3.5 px-4">Event Type</th>
                  <th className="py-3.5 px-4">Actor</th>
                  <th className="py-3.5 px-4">Target Reference</th>
                  <th className="py-3.5 px-4">Timestamp (Server / Chain)</th>
                  <th className="py-3.5 px-4">Result</th>
                  <th className="py-3.5 px-4">Transaction Evidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition">
                    {/* Event Type */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#0B2545]">{log.eventType}</div>
                      {log.details && (
                        <div className="text-[11px] text-slate-500 max-w-xs truncate mt-0.5">
                          {log.details}
                        </div>
                      )}
                    </td>

                    {/* Actor */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{log.actor}</div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">
                        Role: {log.actorRole}
                      </span>
                    </td>

                    {/* Target Reference */}
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-700 px-2 py-0.5 rounded bg-slate-100">
                        {log.targetReference}
                      </span>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3 px-4 text-slate-600">
                      <div>{log.timestamp}</div>
                      {log.blockTimestamp && (
                        <div className="text-[10px] text-teal-700 font-mono flex items-center gap-1 mt-0.5">
                          <span>Block Time: {log.blockTimestamp}</span>
                        </div>
                      )}
                    </td>

                    {/* Result */}
                    <td className="py-3 px-4">
                      {getResultBadge(log.result)}
                    </td>

                    {/* Transaction Evidence */}
                    <td className="py-3 px-4">
                      {log.transactionHash ? (
                        <div>
                          <div className="flex items-center gap-1 font-mono text-[11px] text-teal-800">
                            <span>
                              {log.transactionHash.slice(0, 8)}...{log.transactionHash.slice(-6)}
                            </span>
                            <button
                              onClick={() => handleCopy(log.transactionHash!, log.id)}
                              className="p-1 rounded text-slate-400 hover:text-slate-700 transition cursor-pointer"
                              title="Copy Hash"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            {copiedHash === log.id && (
                              <span className="text-[9px] font-bold text-emerald-600">Copied!</span>
                            )}
                          </div>
                          {log.blockNumber && (
                            <div className="text-[10px] text-slate-400 font-mono">
                              Block #{log.blockNumber} &bull; Sepolia
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Off-chain Event</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
