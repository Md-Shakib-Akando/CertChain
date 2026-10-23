'use client';

import React, { useState } from 'react';
import {
  Share2,
  Plus,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Copy,
  Check,
  Ban,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { StudentShareLink, ManageLinksViewProps } from './types';

export const ManageLinksView: React.FC<ManageLinksViewProps> = ({
  shareLinks,
  onCancelLink,
  onOpenShareModal,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCopy = (link: StudentShareLink) => {
    navigator.clipboard.writeText(link.fullUrl);
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleConfirmCancel = (linkId: string) => {
    onCancelLink(linkId);
    setCancellingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0B2545]">Manage Shared Verification Links</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track active credentials shared with employers and universities. You can cancel any link at any moment to revoke access immediately.
          </p>
        </div>

        <button
          onClick={onOpenShareModal}
          className="px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Link</span>
        </button>
      </div>

      {/* Info Callout */}
      <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-blue-900 shadow-2xs">
        <ShieldCheck className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-[#0B2545]">Time-Limited Verification Policy</p>
          <p className="text-slate-600 leading-relaxed">
            Every shared link expires automatically after its configured duration. Once cancelled or expired, anyone visiting the link receives an immediate <em>&ldquo;This link has expired or was cancelled&rdquo;</em> message with zero credential disclosure.
          </p>
        </div>
      </div>

      {/* Table of Links */}
      {shareLinks.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-200/90 p-12 text-center shadow-xs">
          <Share2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#0B2545]">No Verification Links Created Yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Generate time-limited links for employers or universities to verify your credentials without needing to sign up or connect a wallet.
          </p>
          <button
            onClick={onOpenShareModal}
            className="mt-4 px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-xs font-semibold text-white rounded-xl shadow-xs transition cursor-pointer"
          >
            Create Your First Link
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/90 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-4 px-4 sm:px-6">Certificate &amp; Recipient</th>
                  <th className="py-4 px-4">Created</th>
                  <th className="py-4 px-4">Expires At</th>
                  <th className="py-4 px-4">Views / Limit</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {shareLinks.map((link) => {
                  const isActive = link.status === 'active';
                  const isCancelled = link.status === 'cancelled';
                  const isExpired = link.status === 'expired';

                  return (
                    <tr
                      key={link.id}
                      className="hover:bg-slate-50/80 transition group"
                    >
                      {/* Certificate & Recipient */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#0B2545]">{link.recipientLabel}</span>
                            {link.includeDetails && (
                              <span className="text-[10px] bg-blue-50 text-[#2563EB] border border-blue-200 px-1.5 py-0.5 rounded font-mono font-medium">
                                + Grades
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <span className="font-mono text-[#2563EB] font-bold">{link.certId}</span>
                            <span className="text-slate-300">•</span>
                            <span>{link.certType}</span>
                          </div>
                        </div>
                      </td>

                      {/* Created */}
                      <td className="py-4 px-4">
                        <span className="text-slate-600 text-xs flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {link.createdAt}
                        </span>
                      </td>

                      {/* Expires At */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <span className="text-slate-800 text-xs flex items-center gap-1 font-medium">
                            <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
                            {link.expiresAt}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            Duration: {link.expiryHours}h
                          </span>
                        </div>
                      </td>

                      {/* Views / Limit */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1 text-slate-700 text-xs font-medium">
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          <span>{link.viewCount}</span>
                          <span className="text-slate-300">/</span>
                          <span className="text-slate-500">
                            {link.maxViews ? `${link.maxViews} max` : 'Unlimited'}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {isActive && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Active
                          </span>
                        )}
                        {isCancelled && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                            <XCircle className="w-3 h-3 text-red-600" />
                            Cancelled
                          </span>
                        )}
                        {isExpired && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            <Clock className="w-3 h-3 text-slate-400" />
                            Expired
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleCopy(link)}
                            className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition border border-slate-200 shadow-2xs cursor-pointer"
                            title="Copy Verification URL"
                          >
                            {copiedId === link.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="hidden sm:inline text-emerald-700">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-500" />
                                <span className="hidden sm:inline">Copy</span>
                              </>
                            )}
                          </button>

                          {isActive && (
                            <button
                              onClick={() => setCancellingId(link.id)}
                              className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold flex items-center gap-1.5 transition border border-red-200 cursor-pointer"
                              title="Cancel this link immediately"
                            >
                              <Ban className="w-3.5 h-3.5 text-red-600" />
                              <span className="hidden sm:inline">Cancel Link</span>
                            </button>
                          )}
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

      {/* Confirmation Modal for Cancelling Link */}
      {cancellingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0B2545]">Revoke This Verification Link?</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Are you sure you want to cancel this share link? Once cancelled, the URL will stop working immediately. Anyone attempting to open it will see an expired notice.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setCancellingId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Keep Link Active
              </button>
              <button
                onClick={() => handleConfirmCancel(cancellingId)}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition shadow-xs cursor-pointer"
              >
                Yes, Cancel Link Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
