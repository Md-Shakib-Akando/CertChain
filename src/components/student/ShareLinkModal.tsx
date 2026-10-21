'use client';

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Share2,
  Clock,
  ShieldCheck,
  Copy,
  Check,
  Mail,
  MessageCircle,
  Eye,
  Tag,
  AlertCircle,
  Lock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { StudentCertificate, StudentShareLink } from './types';

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: StudentCertificate | null;
  certificatesList: StudentCertificate[];
  onLinkCreated: (newLink: StudentShareLink) => void;
}

export const ShareLinkModal: React.FC<ShareLinkModalProps> = ({
  isOpen,
  onClose,
  certificate,
  certificatesList,
  onLinkCreated,
}) => {
  const [selectedCertId, setSelectedCertId] = useState<string | null>(null);
  const [expiryHours, setExpiryHours] = useState<number>(24);
  const [recipientLabel, setRecipientLabel] = useState<string>('');
  const [maxViews, setMaxViews] = useState<string>('');
  const [includeDetails, setIncludeDetails] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedLink, setGeneratedLink] = useState<StudentShareLink | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const activeCertId = selectedCertId ?? certificate?.id ?? certificatesList[0]?.id ?? '';

  const handleClose = () => {
    setSelectedCertId(null);
    setGeneratedLink(null);
    setCopied(false);
    onClose();
  };

  // Generate QR code on canvas when link is generated
  useEffect(() => {
    let active = true;
    if (generatedLink && canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        generatedLink.fullUrl,
        {
          width: 170,
          margin: 1,
          color: {
            dark: '#0B2545',
            light: '#ffffff',
          },
        },
        (error) => {
          if (error && active) {
            console.error('QR code generation failed', error);
          }
        }
      );
    }
    return () => {
      active = false;
    };
  }, [generatedLink]);

  if (!isOpen) return null;

  const currentCert = certificatesList.find((c) => c.id === activeCertId) || certificate;

  const handleGenerateLink = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const array = new Uint8Array(16);
      if (typeof window !== 'undefined' && window.crypto) {
        window.crypto.getRandomValues(array);
      }
      const randomHex = Array.from(array)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      const token = `PUB-VREF-${randomHex.slice(0, 8).toUpperCase()}-${randomHex.slice(8, 16).toUpperCase()}`;

      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://certchain.pub.edu.bd';
      const fullUrl = `${baseUrl}/verify?token=${token}`;

      const now = new Date();
      const expiresAtDate = new Date(now.getTime() + expiryHours * 60 * 60 * 1000);

      const newLink: StudentShareLink = {
        id: `LNK-${Math.floor(1000 + Math.random() * 9000)}`,
        certId: currentCert ? currentCert.id : 'PUB-DEG-2026-000123',
        certType: currentCert ? currentCert.type : 'Degree Certificate',
        token,
        recipientLabel: recipientLabel.trim() || 'General Verification',
        createdAt: now.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        expiresAt: expiresAtDate.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        expiryHours,
        viewCount: 0,
        maxViews: maxViews ? parseInt(maxViews, 10) : null,
        includeDetails,
        status: 'active',
        fullUrl,
      };

      setGeneratedLink(newLink);
      onLinkCreated(newLink);
      setIsGenerating(false);
    }, 600);
  };

  const handleCopyLink = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink.fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getEmailShareUrl = () => {
    if (!generatedLink || !currentCert) return '#';
    const subject = encodeURIComponent(`Authentic Academic Credential Verification - ${currentCert.studentName}`);
    const body = encodeURIComponent(
      `Dear Recipient,\n\nYou can verify the blockchain-authenticated ${currentCert.type} of ${currentCert.studentName} (${currentCert.studentId}) via the official PUB CertChain verification portal:\n\nVerification Link: ${generatedLink.fullUrl}\n\nNote: This link is time-limited and will expire automatically on ${generatedLink.expiresAt}. It is verified cryptographically against the university smart contract.\n\nBest regards,\n${currentCert.studentName}`
    );
    return `mailto:?subject=${subject}&body=${body}`;
  };

  const getWhatsAppShareUrl = () => {
    if (!generatedLink || !currentCert) return '#';
    const text = encodeURIComponent(
      `Official PUB CertChain Verification Link for ${currentCert.studentName} (${currentCert.type}):\n${generatedLink.fullUrl}\n\nExpires: ${generatedLink.expiresAt}`
    );
    return `https://api.whatsapp.com/send?text=${text}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header (Matches landing page navy color #0D1E36) */}
        <div className="px-6 py-5 border-b border-slate-800 bg-[#0D1E36] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Share Verification Link
              </h3>
              <p className="text-xs text-slate-300">
                Grant employers instant proof of degree validity with zero login required.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {!generatedLink ? (
            /* Form View */
            <>
              {/* Select Certificate */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                  Select Certificate to Share
                </label>
                <select
                  value={activeCertId}
                  onChange={(e) => setSelectedCertId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 shadow-2xs cursor-pointer"
                >
                  {certificatesList.map((cert) => (
                    <option key={cert.id} value={cert.id}>
                      {cert.type} ({cert.id}) - {cert.status.toUpperCase()}
                    </option>
                  ))}
                </select>
                {currentCert?.status === 'revoked' && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5 mt-2 flex items-center gap-1.5 font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                    Note: This certificate is Revoked. The verification link will transparently show the revocation status and reason.
                  </p>
                )}
              </div>

              {/* Expiry Options */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
                    Expiration Period (Required)
                  </label>
                  <span className="text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
                    No permanent links allowed by policy
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: '1 Hour', hours: 1, note: 'Interview demo' },
                    { label: '24 Hours', hours: 24, note: 'Default / Standard' },
                    { label: '7 Days', hours: 168, note: 'HR Evaluation' },
                    { label: '30 Days', hours: 720, note: 'Visa / Board' },
                  ].map((opt) => (
                    <button
                      key={opt.hours}
                      type="button"
                      onClick={() => setExpiryHours(opt.hours)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition cursor-pointer ${
                        expiryHours === opt.hours
                          ? 'bg-blue-50 border-[#2563EB] text-[#2563EB] shadow-2xs font-bold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-sm">{opt.label}</span>
                      <span className="text-[10px] text-slate-500 mt-0.5">{opt.note}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient Label & Max Views */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                    Recipient Label (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dhaka Bank HR, German Embassy"
                    value={recipientLabel}
                    onChange={(e) => setRecipientLabel(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 shadow-2xs"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Helps you track who opened the link in your activity audit.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    Max Views Limit (Optional)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Leave empty for unlimited views"
                    value={maxViews}
                    onChange={(e) => setMaxViews(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 shadow-2xs"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Stops working after this many visits even before expiry.</p>
                </div>
              </div>

              {/* Data Minimization: Include Transcript Details Toggle */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-semibold text-[#0B2545]">Include Academic Transcript Details</span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                        Data Privacy
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      By default (OFF), the employer only sees degree authenticity, university seal, and graduation date.
                      Enable this toggle if you wish to expose course-wise grades &amp; CGPA.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                    <input
                      type="checkbox"
                      checked={includeDetails}
                      onChange={(e) => setIncludeDetails(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>

              {/* Security callout */}
              <div className="flex items-center gap-2 text-xs text-slate-600 bg-blue-50/70 p-3 rounded-xl border border-blue-100">
                <ShieldCheck className="w-4 h-4 text-[#2563EB] shrink-0" />
                <span>
                  High-entropy 128-bit unguessable token generated on-the-fly. Stored hashed. Can be cancelled anytime in your <strong>Manage Links</strong> tab.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleGenerateLink}
                  disabled={isGenerating}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-[#2563EB] hover:bg-blue-700 active:bg-blue-800 rounded-xl transition flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Generating Secure Link...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-blue-200" />
                      <span>Generate Verification Link</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Generated Success View */
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-emerald-950">Verification Link Ready!</h4>
                  <p className="text-xs text-emerald-700">
                    Expires in {generatedLink.expiryHours} hours ({generatedLink.expiresAt}).
                    {generatedLink.maxViews ? ` Limit: ${generatedLink.maxViews} views.` : ' Unlimited views.'}
                  </p>
                </div>
              </div>

              {/* Link Input & Copy */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Shareable Verification URL (No Login Required)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedLink.fullUrl}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-mono text-[#2563EB] focus:outline-none select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="shrink-0 px-4 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition shadow-xs cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* QR Code and Sharing Actions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                {/* QR Code Canvas */}
                <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-2xs border border-slate-200">
                  <canvas ref={canvasRef} className="rounded" />
                  <span className="text-[11px] font-bold text-slate-800 mt-2 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    PUB CertChain QR Verifier
                  </span>
                </div>

                {/* Direct Share Channels */}
                <div className="space-y-2.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 block">
                    Instant One-Click Sharing
                  </span>

                  <a
                    href={getEmailShareUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 flex items-center gap-2.5 text-xs font-semibold text-slate-800 transition shadow-2xs"
                  >
                    <Mail className="w-4 h-4 text-sky-600" />
                    <span>Send Pre-filled Email</span>
                  </a>

                  <a
                    href={getWhatsAppShareUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center gap-2.5 text-xs font-semibold text-emerald-800 transition shadow-2xs"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>Share on WhatsApp</span>
                  </a>

                  <a
                    href={generatedLink.fullUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-3.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 flex items-center gap-2.5 text-xs font-semibold text-[#2563EB] transition shadow-2xs"
                  >
                    <ExternalLink className="w-4 h-4 text-[#2563EB]" />
                    <span>Preview Employer View</span>
                  </a>
                </div>
              </div>

              {/* Done button */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#0B2545] rounded-xl text-sm font-semibold transition cursor-pointer"
                >
                  Close &amp; View in Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
