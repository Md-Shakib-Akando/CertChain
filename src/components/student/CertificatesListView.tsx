'use client';

import React, { useState, useMemo } from 'react';
import {
  Award,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  Download,
  Share2,
  FileText,
  Calendar,
  ArrowUpDown,
} from 'lucide-react';
import { CertificatesListViewProps } from '@/types/student';

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
      {/* Page Title & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#F1F5F9]">My Academic Certificates</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse and manage all official degrees, provisional certificates, and academic transcripts issued to your Student ID.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl font-medium shadow-sm">
            Showing {filteredCertificates.length} of {certificates.length} credentials
          </span>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-[#121C2E] border border-white/10 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by Certificate ID, Hash, or Type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0D1424] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 shadow-inner"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-[#0D1424] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 cursor-pointer shadow-inner"
            >
              <option value="all">All Certificate Types</option>
              <option value="Degree Certificate">Degree Certificate</option>
              <option value="Provisional Certificate">Provisional Certificate</option>
              <option value="Academic Transcript">Academic Transcript</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative flex gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-[#0D1424] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 cursor-pointer shadow-inner"
            >
              <option value="all">All Statuses</option>
              <option value="valid">Valid (On-Chain)</option>
              <option value="revoked">Revoked</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
              className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
              title="Toggle sort order"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Certificates Table */}
      {filteredCertificates.length === 0 ? (
        <div className="rounded-2xl bg-[#121C2E] border border-white/10 p-12 text-center shadow-xl">
          <Award className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#F1F5F9]">No Certificates Match Your Filters</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, or clear the type and status filters to see all issued certificates.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedType('all');
              setSelectedStatus('all');
            }}
            className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 text-xs font-semibold text-cyan-300 border border-cyan-400/30 rounded-xl transition cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#121C2E] shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-4 sm:px-6">Certificate ID</th>
                  <th className="py-4 px-4">Type</th>
                  <th className="py-4 px-4">Program &amp; Session</th>
                  <th className="py-4 px-4">Issue Date</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs sm:text-sm">
                {filteredCertificates.map((cert) => {
                  const isValid = cert.status === 'valid';
                  return (
                    <tr
                      key={cert.id}
                      className="hover:bg-white/5 transition group"
                    >
                      {/* Column 1: Certificate ID */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-cyan-300 block">
                            {cert.id}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400 block truncate max-w-[140px]">
                            Hash: {cert.sha256Hash.slice(0, 10)}...{cert.sha256Hash.slice(-6)}
                          </span>
                        </div>
                      </td>

                      {/* Column 2: Type */}
                      <td className="py-4 px-4">
                        <span className="font-semibold text-[#F1F5F9] flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-cyan-400" />
                          {cert.type}
                        </span>
                        {cert.supersededBy && (
                          <span className="text-[10px] text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30 font-medium inline-block mt-0.5">
                            Superseded by {cert.supersededBy}
                          </span>
                        )}
                      </td>

                      {/* Column 3: Program & Session */}
                      <td className="py-4 px-4">
                        <div className="text-slate-200 font-medium">{cert.program}</div>
                        <div className="text-slate-400 text-xs">{cert.session} • {cert.batch}</div>
                      </td>

                      {/* Column 4: Issue Date */}
                      <td className="py-4 px-4">
                        <span className="text-slate-400 flex items-center gap-1 text-xs">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {cert.issueDate}
                        </span>
                      </td>

                      {/* Column 5: Status Badge */}
                      <td className="py-4 px-4">
                        {isValid ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            Valid
                          </span>
                        ) : (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30">
                              <XCircle className="w-3.5 h-3.5 text-red-400" />
                              Revoked
                            </span>
                            {cert.revocationDate && (
                              <p className="text-[10px] text-red-400 font-mono">
                                Revoked on {cert.revocationDate}
                              </p>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Column 6: Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenCertificateDetail(cert)}
                            className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold flex items-center gap-1 transition border border-white/10 cursor-pointer"
                            title="View PDF & Proof Panel"
                          >
                            <Eye className="w-3.5 h-3.5 text-cyan-400" />
                            <span className="hidden sm:inline">View</span>
                          </button>

                          <button
                            onClick={() => onDownloadPdf(cert)}
                            className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold flex items-center gap-1 transition border border-white/10 cursor-pointer"
                            title="Download Issued PDF"
                          >
                            <Download className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="hidden sm:inline">PDF</span>
                          </button>

                          <button
                            onClick={() => onOpenShareModal(cert)}
                            className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-semibold flex items-center gap-1 transition border border-cyan-400/30 cursor-pointer"
                            title="Create Shareable Verification Link"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Share</span>
                          </button>
                        </div>
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
