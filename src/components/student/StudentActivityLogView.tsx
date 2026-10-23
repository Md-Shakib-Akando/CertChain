'use client';

import React, { useState, useMemo } from 'react';
import {
  FileCheck,
  AlertCircle,
  Share2,
  Ban,
  Eye,
  QrCode,
  Search,
  ExternalLink,
  ShieldCheck,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { StudentAuditEvent, StudentActivityLogViewProps } from './types';

export const StudentActivityLogView: React.FC<StudentActivityLogViewProps> = ({ auditLogs }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
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
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
          color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
          dot: 'bg-emerald-500',
        };
      case 'CertificateRevoked':
        return {
          icon: <AlertCircle className="w-4 h-4 text-red-600" />,
          color: 'bg-red-50 border-red-200 text-red-700',
          dot: 'bg-red-500',
        };
      case 'ShareLinkCreated':
        return {
          icon: <Share2 className="w-4 h-4 text-[#2563EB]" />,
          color: 'bg-blue-50 border-blue-200 text-[#2563EB]',
          dot: 'bg-blue-600',
        };
      case 'ShareLinkCancelled':
        return {
          icon: <Ban className="w-4 h-4 text-amber-600" />,
          color: 'bg-amber-50 border-amber-200 text-amber-700',
          dot: 'bg-amber-500',
        };
      case 'LinkOpened':
        return {
          icon: <Eye className="w-4 h-4 text-sky-600" />,
          color: 'bg-sky-50 border-sky-200 text-sky-700',
          dot: 'bg-sky-500',
        };
      case 'VerifiedByQR':
        return {
          icon: <QrCode className="w-4 h-4 text-teal-600" />,
          color: 'bg-teal-50 border-teal-200 text-teal-700',
          dot: 'bg-teal-500',
        };
      case 'VerifiedByCertificateID':
      default:
        return {
          icon: <FileCheck className="w-4 h-4 text-indigo-600" />,
          color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
          dot: 'bg-indigo-500',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0B2545]">Student Activity &amp; Audit Log</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tamper-evident chronological audit trail of all certificate issuances, revocations, share links, and employer verification events.
          </p>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total Audit Events</span>
          <div className="text-2xl font-black text-[#0B2545] mt-1">{stats.total}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Verifications by Employers</span>
          <div className="text-2xl font-black text-[#2563EB] mt-1">{stats.verifications}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Blockchain Commits</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{stats.chainEvents}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Active Share Links</span>
          <div className="text-2xl font-black text-sky-600 mt-1">{stats.shares}</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search events, cert ID, tx hash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Events' },
            { id: 'chain', label: 'Blockchain Commits' },
            { id: 'verifications', label: 'Employer Verifications' },
            { id: 'shares', label: 'Share Links' },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedFilter === filter.id
                  ? 'bg-[#2563EB] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline List */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {filteredLogs.map((event) => {
            const badge = getEventBadge(event.eventType);

            return (
              <div key={event.id} className="relative group">
                {/* Timeline node */}
                <div
                  className={`absolute -left-[27px] sm:-left-[35px] top-1.5 w-3.5 h-3.5 rounded-full ${badge.dot} ring-4 ring-white group-hover:scale-125 transition-transform`}
                />

                <div className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-xl p-4 transition-all space-y-2 shadow-2xs">
                  {/* Top line: title, type badge, timestamp */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className={`p-1 rounded-lg border flex items-center justify-center ${badge.color}`}>
                        {badge.icon}
                      </div>
                      <span className="font-bold text-sm text-[#0B2545]">{event.title}</span>
                      <span className="font-mono text-[11px] text-[#2563EB] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded font-semibold">
                        {event.certId}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{event.timestamp}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed">{event.description}</p>

                  {/* Meta / Blockchain Tx info */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 border-t border-slate-200/80 text-[11px]">
                    {event.method && (
                      <div className="flex items-center gap-1 text-slate-600">
                        <span className="text-slate-400">Method:</span>
                        <span className="font-medium text-slate-800">{event.method}</span>
                      </div>
                    )}

                    {event.actorRole && (
                      <div className="flex items-center gap-1 text-slate-600">
                        <span className="text-slate-400">Actor:</span>
                        <span className="font-medium text-slate-800">{event.actorRole}</span>
                      </div>
                    )}

                    {event.txHash && (
                      <div className="flex items-center gap-1.5 text-[#2563EB]">
                        <span className="text-slate-400">On-Chain Tx:</span>
                        <a
                          href={`https://sepolia.etherscan.io/tx/${event.txHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono hover:underline flex items-center gap-1 font-semibold"
                        >
                          {event.txHash.slice(0, 14)}...{event.txHash.slice(-8)}
                          <ExternalLink className="w-3 h-3 text-[#2563EB]" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredLogs.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-xs">
            No activity logs match your filter criteria.
          </div>
        )}
      </div>

      {/* Privacy Guarantee Note */}
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-600 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-800">Privacy &amp; Security Compliance: </strong>
          Verifier personal identity is never logged or tracked to maintain global privacy standards.
          Only the exact verification timestamp, method (QR scan, certificate ID query, or share link access), and certificate status are recorded in your personal audit trail.
        </div>
      </div>
    </div>
  );
};
