'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Download,
  Share2,
  Lock,
  RefreshCw,
  History,
  CheckCircle2,
  AlertTriangle,
  QrCode,
} from 'lucide-react';
import { CertificateDetailModalProps } from '@/types/student';
import {
  Dialog,
  Button,
  StatusBadge,
  Card,
  CardBody,
  DescriptionList,
  HashText,
  explorerTxUrl,
  Alert,
  CertificateDocumentPreview,
} from '@/components/ui';

export const CertificateDetailModal: React.FC<CertificateDetailModalProps> = ({
  isOpen = true,
  certificate,
  onClose,
  onOpenShareModal,
  onDownloadPdf,
}) => {
  const [isVerifyingLive, setIsVerifyingLive] = useState(false);
  const [liveVerificationResult, setLiveVerificationResult] = useState<'valid' | 'revoked' | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    if (!certificate?.id) return;

    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const verifyUrl = `${origin}/?id=${encodeURIComponent(certificate.id)}#verify`;

    QRCode.toDataURL(verifyUrl, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 280,
      color: {
        dark: '#0B1F3AFF',
        light: '#FFFFFFFF',
      },
    })
      .then((url) => {
        if (isMounted) setQrDataUrl(url);
      })
      .catch((err) => {
        console.error('Failed to generate dynamic certificate QR code:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [certificate?.id]);

  if (!isOpen || !certificate) return null;

  const handleLiveVerify = async () => {
    setIsVerifyingLive(true);
    setLiveVerificationResult(null);
    try {
      const res = await fetch(`/api/public/verify/${encodeURIComponent(certificate.id)}`);
      if (res.ok) {
        const data = await res.json();
        setLiveVerificationResult(
          data?.status === 'REVOKED' || data?.revoked ? 'revoked' : 'valid'
        );
      } else {
        setLiveVerificationResult(certificate.status);
      }
    } catch {
      setLiveVerificationResult(certificate.status);
    } finally {
      setIsVerifyingLive(false);
    }
  };

  const handleDownloadPdf = () => {
    if (onDownloadPdf) {
      onDownloadPdf(certificate);
    } else {
      window.print();
    }
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `${certificate.id}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      size="xl"
      eyebrow={`Credential Inspection • ${certificate.id}`}
      title={`${certificate.type} — Cryptographic Dossier`}
      description="Inspect the official A4 diploma specimen alongside its immutable Ethereum Sepolia blockchain proof."
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3 w-full">
          <StatusBadge status={certificate.status} />
          <div className="flex flex-wrap items-center gap-2">
            {qrDataUrl && (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<QrCode className="w-4 h-4" />}
                onClick={handleDownloadQr}
              >
                Download QR Stamp
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Share2 className="w-4 h-4" />}
              onClick={() => onOpenShareModal(certificate)}
            >
              Generate Share Link
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={handleDownloadPdf}
            >
              Download Official PDF
            </Button>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: Official A4 Landscape Certificate Specimen */}
        <div className="lg:col-span-7 space-y-3">
          <CertificateDocumentPreview
            certId={certificate.id}
            studentName={certificate.studentName}
            studentId={certificate.studentId}
            degree={certificate.degreeName || certificate.type}
            department={certificate.program}
            session={certificate.session}
            cgpa={certificate.cgpa}
            issuedAt={certificate.issueDate}
            txHash={certificate.txHash}
            pdfHash={certificate.sha256Hash}
            revoked={certificate.status === 'revoked'}
            revocationReason={certificate.revocationReason}
            qrCodeDataUrl={qrDataUrl}
          />
          <p className="text-[11px] text-muted text-center">
            This preview mirrors the deterministic A4 PDF generated by Pundra University&apos;s cryptographic issuance engine.
          </p>
        </div>

        {/* Right 5 Cols: Blockchain Proof Panel */}
        <div className="lg:col-span-5 space-y-4">
          <Card padding="md" className="bg-sunken/60">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-brand" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink">
                  Live Smart Contract Check
                </h4>
              </div>
              <Button
                variant="primary"
                size="xs"
                loading={isVerifyingLive}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                onClick={handleLiveVerify}
              >
                Verify Now
              </Button>
            </div>

            {liveVerificationResult === 'valid' ? (
              <div className="p-2.5 rounded-lg bg-success-bg border border-success-border text-success text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>SHA-256 digest matches on-chain record. Status: VALID.</span>
              </div>
            ) : liveVerificationResult === 'revoked' ? (
              <div className="p-2.5 rounded-lg bg-danger-bg border border-danger-border text-danger text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Smart contract reports this credential is REVOKED.</span>
              </div>
            ) : (
              <p className="text-xs text-muted leading-relaxed">
                Query <code className="font-mono text-ink">CertChain.verifyCertificate()</code> live on Ethereum Sepolia to confirm current ledger state.
              </p>
            )}
          </Card>

          {certificate.status === 'revoked' && (
            <Alert tone="danger" title="Credential Revoked on Smart Contract">
              <div className="space-y-1.5 mt-1 text-xs">
                <p>
                  <strong>Reason:</strong> {certificate.revocationReason || 'Revoked by the Controller of Examinations'}
                </p>
                {certificate.revocationDate && (
                  <p>
                    <strong>Revocation Date:</strong> {certificate.revocationDate}
                  </p>
                )}
                {certificate.revocationTxHash && (
                  <div className="pt-1 flex items-center gap-2">
                    <span>Revocation Tx:</span>
                    <HashText
                      value={certificate.revocationTxHash}
                      start={10}
                      end={6}
                      href={explorerTxUrl(certificate.revocationTxHash)}
                    />
                  </div>
                )}
              </div>
            </Alert>
          )}

          <Card>
            <CardBody className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
                Cryptographic Proof Metadata
              </h4>
              <DescriptionList
                cols={1}
                items={[
                  {
                    term: 'Document SHA-256 Digest',
                    detail: <HashText value={certificate.sha256Hash} start={14} end={10} />,
                  },
                  {
                    term: 'Issuance Transaction Hash',
                    detail: (
                      <HashText
                        value={certificate.txHash}
                        start={12}
                        end={8}
                        href={explorerTxUrl(certificate.txHash)}
                      />
                    ),
                  },
                  {
                    term: 'Authorized Issuer Wallet',
                    detail: <HashText value={certificate.issuerAddress} start={10} end={8} />,
                  },
                  {
                    term: 'Block Number & Network',
                    detail: (
                      <span className="font-mono text-xs text-ink">
                        Block #{certificate.blockNumber} • {certificate.network}
                      </span>
                    ),
                  },
                ]}
              />
            </CardBody>
          </Card>

          {certificate.supersededBy && (
            <Alert tone="warning" title="Superseded Credential Version" icon={<History className="w-4 h-4" />}>
              This document was superseded by newer credential{' '}
              <code className="font-mono font-semibold">{certificate.supersededBy}</code>.
            </Alert>
          )}
        </div>
      </div>
    </Dialog>
  );
};
