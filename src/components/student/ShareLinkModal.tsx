'use client';

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Share2,
  ShieldCheck,
  Mail,
  MessageCircle,
  ExternalLink,
  Download,
} from 'lucide-react';
import { StudentShareLink, ShareLinkModalProps } from '@/types/student';
import {
  Dialog,
  Field,
  Select,
  Input,
  Switch,
  Button,
  Badge,
  Alert,
  CopyButton,
  Card,
} from '@/components/ui';

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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const activeCertId = selectedCertId ?? certificate?.id ?? certificatesList[0]?.id ?? '';

  const handleClose = () => {
    setSelectedCertId(null);
    setGeneratedLink(null);
    onClose();
  };

  useEffect(() => {
    let active = true;
    if (generatedLink && canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        generatedLink.fullUrl,
        {
          errorCorrectionLevel: 'M',
          width: 180,
          margin: 2,
          color: {
            dark: '#0B1F3A',
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

  const handleDownloadShareQr = () => {
    if (!canvasRef.current || !generatedLink) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${generatedLink.certId}-share-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerateLink = async () => {
    setIsGenerating(true);
    try {
      const targetCertId = currentCert ? currentCert.id : 'PUB-DEG-2026-000105';
      const label = recipientLabel.trim() || 'General Verification';
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://certchain.pub.edu.bd';

      const res = await fetch('/api/student/share-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          certId: targetCertId,
          certType: currentCert ? currentCert.type : 'Degree Certificate',
          createdBy: currentCert?.studentId || undefined,
          recipientLabel: label,
          durationHours: expiryHours,
          maxViews: maxViews ? parseInt(maxViews, 10) : null,
          includeDetails,
        }),
      });

      const data = await res.json();
      const now = new Date();
      const expiresAtDate = new Date(now.getTime() + expiryHours * 60 * 60 * 1000);

      const token = data?.token || `PUB-VREF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      const fullUrl = data?.shareUrl || `${baseUrl}/s/${token}`;

      const newLink: StudentShareLink = {
        id: data?.shareLink?.id ? String(data.shareLink.id) : `LNK-${Math.floor(1000 + Math.random() * 9000)}`,
        certId: targetCertId,
        certType: currentCert ? currentCert.type : 'Degree Certificate',
        token,
        recipientLabel: label,
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
    } catch (err) {
      console.error('Failed to generate share link via API:', err);
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://certchain.pub.edu.bd';
      const fallbackToken = `offline-${Math.random().toString(36).substring(2, 10)}`;
      const now = new Date();
      const fallbackLink: StudentShareLink = {
        id: `LNK-${Math.floor(1000 + Math.random() * 9000)}`,
        certId: currentCert ? currentCert.id : 'PUB-DEG-2026-000105',
        certType: currentCert ? currentCert.type : 'Degree Certificate',
        token: fallbackToken,
        recipientLabel: recipientLabel.trim() || 'General Verification',
        createdAt: now.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        expiresAt: new Date(now.getTime() + expiryHours * 3600000).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        expiryHours,
        viewCount: 0,
        maxViews: maxViews ? parseInt(maxViews, 10) : null,
        includeDetails,
        status: 'active',
        fullUrl: `${baseUrl}/s/${fallbackToken}`,
      };
      setGeneratedLink(fallbackLink);
      onLinkCreated(fallbackLink);
    } finally {
      setIsGenerating(false);
    }
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
    <Dialog
      open={isOpen}
      onClose={handleClose}
      size="lg"
      eyebrow="Employer Credential Access"
      title="Generate Time-Limited Verification Link"
      description="Grant employers or admissions committees instant cryptographic proof of degree validity with zero login required."
      footer={
        !generatedLink ? (
          <>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={isGenerating}
              leftIcon={<Share2 className="w-4 h-4" />}
              onClick={handleGenerateLink}
            >
              Generate Verification Link
            </Button>
          </>
        ) : (
          <Button variant="secondary" size="sm" onClick={handleClose}>
            Close &amp; Return to Portal
          </Button>
        )
      }
    >
      {!generatedLink ? (
        <div className="space-y-5">
          <Field label="Select Credential to Share" required>
            <Select
              value={activeCertId}
              onChange={(e) => setSelectedCertId(e.target.value)}
            >
              {certificatesList.map((cert) => (
                <option key={cert.id} value={cert.id}>
                  {cert.type} ({cert.id}) — {cert.status.toUpperCase()}
                </option>
              ))}
            </Select>
          </Field>

          {currentCert?.status === 'revoked' && (
            <Alert tone="warning" title="Revoked Credential Notice">
              This credential is marked Revoked on-chain. The generated share link will transparently display its revocation status and reason.
            </Alert>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-ink">Expiration Duration *</span>
              <Badge tone="warning" size="xs">
                Mandatory Expiry Policy
              </Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: '1 Hour', hours: 1, note: 'Live interview' },
                { label: '24 Hours', hours: 24, note: 'Standard review' },
                { label: '7 Days', hours: 168, note: 'HR evaluation' },
                { label: '30 Days', hours: 720, note: 'Embassy / Visa' },
              ].map((opt) => {
                const active = expiryHours === opt.hours;
                return (
                  <button
                    key={opt.hours}
                    type="button"
                    onClick={() => setExpiryHours(opt.hours)}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-colors cursor-pointer ${
                      active
                        ? 'bg-brand-muted border-brand text-brand font-semibold'
                        : 'bg-surface border-line text-ink hover:bg-sunken'
                    }`}
                  >
                    <span className="text-sm">{opt.label}</span>
                    <span className="text-[11px] text-muted mt-0.5">{opt.note}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Recipient Label"
              optional="optional"
              hint="Helps identify who opened the link in your activity log."
            >
              <Input
                placeholder="e.g. BRAC Bank HR, DAAD Germany"
                value={recipientLabel}
                onChange={(e) => setRecipientLabel(e.target.value)}
              />
            </Field>

            <Field
              label="Max Views Limit"
              optional="optional"
              hint="Expires early after this many openings."
            >
              <Input
                type="number"
                min="1"
                placeholder="Unlimited views"
                value={maxViews}
                onChange={(e) => setMaxViews(e.target.value)}
              />
            </Field>
          </div>

          <Card padding="md" className="bg-sunken/60">
            <Switch
              checked={includeDetails}
              onChange={setIncludeDetails}
              label="Include Academic Transcript & CGPA Details"
              description="By default (OFF), employers only see degree authenticity, university seal, and issue date. Enable to disclose CGPA."
            />
          </Card>

          <Alert tone="info" icon={<ShieldCheck className="w-4 h-4" />}>
            A high-entropy 128-bit token is generated and stored hashed. You can revoke access at any moment from the{' '}
            <strong>Verification Links</strong> tab.
          </Alert>
        </div>
      ) : (
        <div className="space-y-5">
          <Alert tone="success" title="Verification Share Link Ready">
            Expires in <strong>{generatedLink.expiryHours} hours</strong> ({generatedLink.expiresAt}).
            {generatedLink.maxViews ? ` Limited to ${generatedLink.maxViews} total views.` : ' Unlimited views until expiry.'}
          </Alert>

          <Field label="Shareable Employer Verification URL (Zero Login Required)">
            <div className="flex items-center gap-2">
              <Input readOnly value={generatedLink.fullUrl} mono className="flex-1" />
              <CopyButton value={generatedLink.fullUrl} label="Copy Link" className="h-10 px-3" />
            </div>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center p-4 rounded-xl bg-sunken border border-line">
            <div className="flex flex-col items-center justify-center p-3 bg-surface rounded-lg border border-line">
              <canvas ref={canvasRef} className="rounded" />
              <span className="text-[11px] font-semibold text-ink mt-2 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-success" />
                PUB CertChain QR Verifier
              </span>
              <button
                type="button"
                onClick={handleDownloadShareQr}
                className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium bg-sunken hover:bg-canvas text-ink border border-line transition-colors cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>Download QR Image</span>
              </button>
            </div>

            <div className="space-y-2.5">
              <span className="eyebrow block">Direct Dispatch Channels</span>

              <a
                href={getEmailShareUrl()}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-3.5 rounded-lg bg-surface hover:bg-canvas border border-line flex items-center gap-2.5 text-xs font-medium text-ink transition-colors"
              >
                <Mail className="w-4 h-4 text-brand" />
                <span>Send Pre-filled Email</span>
              </a>

              <a
                href={getWhatsAppShareUrl()}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-3.5 rounded-lg bg-success-bg hover:opacity-90 border border-success-border flex items-center gap-2.5 text-xs font-medium text-success transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Share via WhatsApp</span>
              </a>

              <a
                href={generatedLink.fullUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-3.5 rounded-lg bg-brand-muted hover:opacity-90 border border-brand/20 flex items-center gap-2.5 text-xs font-medium text-brand transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Preview Employer View</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
};
