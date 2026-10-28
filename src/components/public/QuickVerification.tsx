'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import {
  Search,
  QrCode,
  Camera,
  Upload,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CameraOff,
  FileText,
  Download,
  Eye,
  RotateCcw,
  CircleHelp,
  CloudOff,
} from 'lucide-react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Segmented,
  Input,
  StatusBadge,
  HashText,
  explorerTxUrl,
  Dialog,
  CertificateDocumentPreview,
  DescriptionList,
  Alert,
} from '@/components/ui';

type VerificationStatus = 'VALID' | 'REVOKED' | 'NOT_FOUND' | 'INVALID_MODIFIED' | 'ERROR';

interface VerificationResult {
  id: string;
  name: string;
  studentId?: string;
  degree: string;
  program?: string;
  type?: string;
  status: VerificationStatus;
  session?: string;
  cgpa?: string;
  issueDate?: string;
  sha256Hash?: string;
  txHash: string;
  blockNumber: string;
  numericBlock?: number;
  network?: string;
  revocationReason?: string;
  revocationDate?: string;
  message?: string;
  computedHash?: string;
  expectedHash?: string;
}

export const QuickVerification: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'id' | 'qr' | 'pdf'>('id');
  const [certIdInput, setCertIdInput] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedPdfName, setSelectedPdfName] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);

  // Real Camera Scanner State
  const [isScanningCamera, setIsScanningCamera] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isScanningCameraRef = useRef<boolean>(false);
  const animFrameIdRef = useRef<number | null>(null);

  // Verification Result State
  const [result, setResult] = useState<VerificationResult | null>(null);

  const extractCertIdFromQr = (text: string): string => {
    const trimmed = text.trim();
    try {
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        const url = new URL(trimmed);
        const queryId = url.searchParams.get('id') || url.searchParams.get('certId');
        if (queryId) return queryId.trim().toUpperCase();

        const pathParts = url.pathname.split('/').filter(Boolean);
        if (pathParts.length > 0) {
          return pathParts[pathParts.length - 1].trim().toUpperCase();
        }
      }
    } catch {
      // Not a URL, use raw string
    }
    return trimmed.toUpperCase();
  };

  // REAL VERIFICATION BY ID
  const handleVerify = useCallback(async (idToSearch: string) => {
    const cleanId = idToSearch.trim().toUpperCase();
    if (!cleanId) return;

    setIsVerifying(true);
    setCameraError(null);

    try {
      const res = await fetch(`/api/public/verify/${encodeURIComponent(cleanId)}`);
      const data = await res.json();

      if (res.ok && data.success && data.certificate) {
        setResult({
          id: data.certificate.id,
          name: data.certificate.studentName,
          studentId: data.certificate.studentId,
          degree: data.certificate.degree || data.certificate.program,
          program: data.certificate.program,
          type: data.certificate.type,
          status: data.status,
          session: data.certificate.session,
          cgpa: data.certificate.cgpa,
          issueDate: data.certificate.issueDate,
          sha256Hash: data.certificate.sha256Hash,
          txHash: data.certificate.txHash,
          blockNumber: data.certificate.blockNumber ? `#${data.certificate.blockNumber}` : '',
          numericBlock: data.certificate.blockNumber,
          network: data.certificate.network,
          revocationReason: data.certificate.revocationReason,
          revocationDate: data.certificate.revocationDate,
        });
      } else if (res.status >= 500) {
        setResult({
          id: cleanId,
          name: 'N/A',
          degree: 'N/A',
          status: 'ERROR',
          message:
            data.message ||
            'The verification ledger service encountered an unexpected error. Please try again shortly.',
          txHash: '',
          blockNumber: '',
        });
      } else {
        setResult({
          id: cleanId,
          name: 'N/A',
          degree: 'N/A',
          status: 'NOT_FOUND',
          message:
            data.message ||
            `No certificate record matching "${cleanId}" was found in the university registry or blockchain ledger.`,
          txHash: '',
          blockNumber: '',
        });
      }
    } catch {
      setResult({
        id: cleanId,
        name: 'N/A',
        degree: 'N/A',
        status: 'ERROR',
        message:
          'Could not reach the verification service. Please verify your network connection and try again.',
        txHash: '',
        blockNumber: '',
      });
    } finally {
      setIsVerifying(false);
    }
  }, []);

  // Auto-verify on mount if ?id= is in URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const queryId = params.get('id') || params.get('certId');
      if (queryId) {
        setTimeout(() => {
          setCertIdInput(queryId);
          handleVerify(queryId);
        }, 100);
      }
    }
  }, [handleVerify]);

  // Stop camera stream safely
  const stopCamera = useCallback(() => {
    isScanningCameraRef.current = false;
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanningCamera(false);
  }, []);

  const tickScanRef = useRef<() => void>(() => {});

  const tickScan = useCallback(() => {
    if (!isScanningCameraRef.current || !videoRef.current) return;

    if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          const detectedId = extractCertIdFromQr(code.data);
          stopCamera();
          setCertIdInput(detectedId);
          handleVerify(detectedId);
          return;
        }
      }
    }

    if (isScanningCameraRef.current) {
      animFrameIdRef.current = requestAnimationFrame(tickScanRef.current);
    }
  }, [handleVerify, stopCamera]);

  useEffect(() => {
    tickScanRef.current = tickScan;
  }, [tickScan]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsScanningCamera(true);
        isScanningCameraRef.current = true;
        animFrameIdRef.current = requestAnimationFrame(tickScanRef.current);
      }
    } catch {
      setCameraError(
        'Camera access was denied or is unavailable on this device. You can upload an image of the QR code below instead.'
      );
    }
  };

  useEffect(() => {
    if (activeTab !== 'qr' && isScanningCameraRef.current) {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTab, stopCamera]);

  // REAL QR IMAGE UPLOAD SCANNING
  const handleQrImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsVerifying(true);
    setCameraError(null);
    const reader = new FileReader();

    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code && code.data) {
            const detectedId = extractCertIdFromQr(code.data);
            setCertIdInput(detectedId);
            handleVerify(detectedId);
          } else {
            setIsVerifying(false);
            setResult({
              id: file.name,
              name: 'N/A',
              degree: 'N/A',
              status: 'NOT_FOUND',
              message:
                'No readable QR code was detected in the uploaded image. Ensure the QR stamp is sharp and unobstructed.',
              txHash: '',
              blockNumber: '',
            });
          }
        } else {
          setIsVerifying(false);
        }
      };
      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // REAL PDF SHA-256 FINGERPRINT VERIFICATION
  const processPdfFile = async (file: File) => {
    setSelectedPdfName(file.name);
    setIsVerifying(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hexHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

      const idMatch = file.name.match(/(PUB-(?:DEG|PRO|TRN|CRT)-\d{4}-\d+|CERT-DEMO-\d{4}-\d+)/i);
      const extractedCertId = idMatch ? idMatch[0] : file.name.replace(/\.pdf$/i, '');

      const res = await fetch('/api/public/verify/hash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash: hexHash, certId: extractedCertId }),
      });
      const data = await res.json();

      if (res.ok && data.success && data.certificate) {
        setResult({
          id: data.certificate.id,
          name: data.certificate.studentName,
          studentId: data.certificate.studentId,
          degree: data.certificate.degree || data.certificate.program,
          program: data.certificate.program,
          type: data.certificate.type,
          status: data.status,
          session: data.certificate.session,
          cgpa: data.certificate.cgpa,
          issueDate: data.certificate.issueDate,
          sha256Hash: data.certificate.sha256Hash || hexHash,
          txHash: data.certificate.txHash,
          blockNumber: data.certificate.blockNumber ? `#${data.certificate.blockNumber}` : '',
          numericBlock: data.certificate.blockNumber,
          network: data.certificate.network,
          revocationReason: data.certificate.revocationReason,
          revocationDate: data.certificate.revocationDate,
          computedHash: hexHash,
        });
      } else if (data.status === 'INVALID_MODIFIED') {
        setResult({
          id: data.certificateId || extractedCertId,
          name: data.studentName || 'Official Student Record',
          degree: 'N/A',
          status: 'INVALID_MODIFIED',
          message:
            data.message ||
            'Security Alert: The uploaded PDF byte hash does not match the official hash anchored on-chain. This file has been modified or forged.',
          txHash: '',
          blockNumber: '',
          computedHash: data.computedHash || hexHash,
          expectedHash: data.expectedHash,
        });
      } else {
        setResult({
          id: file.name,
          name: 'N/A',
          degree: 'N/A',
          status: 'NOT_FOUND',
          message:
            data.message ||
            'No certificate record on the blockchain matches this PDF file’s SHA-256 cryptographic digest.',
          txHash: '',
          blockNumber: '',
          computedHash: hexHash,
        });
      }
    } catch {
      setResult({
        id: file.name,
        name: 'N/A',
        degree: 'N/A',
        status: 'ERROR',
        message: 'Failed to compute SHA-256 digest or communicate with the verification endpoint.',
        txHash: '',
        blockNumber: '',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void processPdfFile(file);
    }
    e.target.value = '';
  };

  const sampleIds = [
    { id: 'PUB-DEG-2026-000105', label: 'PUB-DEG-2026-000105 (Valid)' },
    { id: 'CERT-DEMO-2026-002', label: 'CERT-DEMO-2026-002 (Revoked)' },
  ];

  return (
    <section id="verify" className="bg-canvas paper-grain py-16 sm:py-24 border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="max-w-2xl mb-10">
          <p className="eyebrow mb-1.5">Public Verification Workbench &middot; Zero Gas</p>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-ink tracking-tight">
            Verify an Academic Credential
          </h2>
          <p className="mt-2 text-sm sm:text-base text-muted leading-relaxed">
            Authenticate any Pundra University certificate by entering its Certificate ID, scanning its printed QR stamp, or uploading the official PDF for client-side SHA-256 tamper inspection.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Verification Input Workbench */}
          <div className="lg:col-span-6">
            <Card>
              <CardHeader
                title="Select Verification Method"
                description="All verification queries are read-only and free for public verifiers."
              />
              <CardBody className="space-y-5">
                <Segmented
                  fullWidth
                  ariaLabel="Verification method"
                  value={activeTab}
                  onChange={(k) => {
                    stopCamera();
                    setActiveTab(k);
                  }}
                  items={[
                    { key: 'id', label: 'Certificate ID', icon: <Search /> },
                    { key: 'qr', label: 'Scan QR Code', icon: <QrCode /> },
                    { key: 'pdf', label: 'Upload PDF', icon: <FileText /> },
                  ]}
                />

                {/* TAB 1: Certificate ID */}
                {activeTab === 'id' && (
                  <div className="space-y-4">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (certIdInput.trim()) {
                          handleVerify(certIdInput);
                        }
                      }}
                      className="space-y-3"
                    >
                      <label htmlFor="cert-id-search-input" className="block text-[13px] font-medium text-ink">
                        Certificate Identifier
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2.5">
                        <Input
                          id="cert-id-search-input"
                          type="text"
                          mono
                          inputSize="lg"
                          value={certIdInput}
                          onChange={(e) => setCertIdInput(e.target.value)}
                          placeholder="e.g. PUB-DEG-2026-000105"
                          className="flex-1"
                        />
                        <Button
                          type="submit"
                          variant="primary"
                          size="lg"
                          loading={isVerifying}
                          loadingText="Verifying..."
                          disabled={!certIdInput.trim()}
                          leftIcon={<Search />}
                        >
                          Verify Record
                        </Button>
                      </div>
                    </form>

                    {/* Quick Sample Pills */}
                    <div className="pt-2 border-t border-line flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-muted font-medium">Try official sample record:</span>
                      {sampleIds.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setCertIdInput(item.id);
                            handleVerify(item.id);
                          }}
                          className="px-2.5 py-1 rounded bg-sunken hover:bg-[#e5e1d7] text-ink font-mono text-[11.5px] border border-line transition-colors"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 2: Scan QR Code */}
                {activeTab === 'qr' && (
                  <div className="space-y-4">
                    {cameraError && (
                      <Alert tone="warning" title="Camera unavailable">
                        {cameraError}
                      </Alert>
                    )}

                    <div className="rounded-lg border border-line bg-sunken/60 p-5 flex flex-col items-center justify-center text-center min-h-[210px]">
                      {isScanningCamera ? (
                        <div className="relative w-full max-w-[300px] h-48 rounded-md overflow-hidden bg-night border border-line-strong">
                          <video
                            ref={videoRef}
                            className="w-full h-full object-cover"
                            playsInline
                            muted
                          />
                        </div>
                      ) : (
                        <div className="size-24 rounded-lg bg-surface border border-line-strong shadow-card flex items-center justify-center">
                          <QrCode className="size-12 text-brand" />
                        </div>
                      )}
                      <p className="mt-3 text-xs text-muted">
                        {isScanningCamera
                          ? 'Hold the certificate QR stamp steady inside the camera frame.'
                          : 'Use your device camera or upload an image/screenshot of the certificate QR code.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {isScanningCamera ? (
                        <Button
                          variant="danger"
                          onClick={stopCamera}
                          leftIcon={<CameraOff />}
                        >
                          Stop Camera
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          onClick={startCamera}
                          loading={isVerifying}
                          leftIcon={<Camera />}
                        >
                          Start Camera Scan
                        </Button>
                      )}

                      <label className="inline-flex items-center justify-center gap-2 h-9.5 px-4 text-sm font-medium rounded-md bg-surface text-ink border border-line-strong shadow-card hover:bg-sunken cursor-pointer">
                        <Upload className="size-4 text-muted" />
                        <span>Upload QR Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleQrImageUpload}
                          className="sr-only"
                        />
                      </label>
                    </div>
                  </div>
                )}

                {/* TAB 3: Upload PDF */}
                {activeTab === 'pdf' && (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-dashed border-line-strong bg-sunken/40 p-6 text-center space-y-3">
                      <div className="size-10 mx-auto rounded-full bg-surface border border-line flex items-center justify-center text-brand shadow-card">
                        <Upload className="size-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-ink">
                          Upload Official Certificate PDF
                        </p>
                        <p className="text-xs text-muted mt-0.5 max-w-md mx-auto">
                          Your browser computes the 256-bit SHA-256 digest locally and compares it against the anchored smart contract hash.
                        </p>
                      </div>
                      {selectedPdfName && (
                        <p className="text-xs font-mono text-ink-2 bg-surface inline-block px-2.5 py-1 rounded border border-line">
                          Last inspected: {selectedPdfName}
                        </p>
                      )}
                      <div>
                        <label className="inline-flex items-center justify-center gap-2 h-9.5 px-4 rounded-md bg-brand text-white hover:bg-brand-hover text-sm font-medium cursor-pointer shadow-card">
                          <FileText className="size-4" />
                          <span>{isVerifying ? 'Computing SHA-256 & Verifying...' : 'Choose PDF Document'}</span>
                          <input
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={handlePdfUpload}
                            disabled={isVerifying}
                            className="sr-only"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="rounded-md bg-sunken/70 border border-line px-3.5 py-2.5 text-xs text-muted space-y-1">
                      <p className="font-semibold text-ink-2">Evaluator Demo Files (in repository `/demo`):</p>
                      <p className="font-mono text-[11px]">
                        &bull; demo/PUB-DEG-2026-000105.pdf (Authentic) &nbsp;&bull; demo/PUB-DEG-2026-000105-tampered.pdf (Altered)
                      </p>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Right Column: Live Verification Result Panel */}
          <div className="lg:col-span-6">
            {!result ? (
              <Card className="border-dashed">
                <CardBody className="py-12 px-6 text-center space-y-4">
                  <div className="size-12 mx-auto rounded-full bg-sunken border border-line flex items-center justify-center text-brand">
                    <ShieldCheck className="size-6" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1.5">
                    <h3 className="font-serif text-lg font-semibold text-ink">
                      Awaiting Credential Query
                    </h3>
                    <p className="text-xs sm:text-[13.5px] text-muted leading-relaxed">
                      Enter a Certificate ID, scan a QR stamp, or upload a certificate PDF on the left. The cryptographic verification report, graduate metadata, and blockchain transaction anchor will appear here immediately.
                    </p>
                  </div>
                  <div className="pt-2 flex flex-wrap justify-center gap-2">
                    <StatusBadge status="valid" label="Valid — Authentic" size="sm" />
                    <StatusBadge status="revoked" label="Revoked — Co-signed" size="sm" />
                    <StatusBadge status="tampered" label="Tampered — Hash Mismatch" size="sm" />
                    <StatusBadge status="not_found" label="Not Found" size="sm" />
                  </div>
                </CardBody>
              </Card>
            ) : (
              <Card className="overflow-hidden animate-rise-in" role="region" aria-live="polite" aria-label="Verification result">
                {/* Status Banner Header */}
                <div
                  className={`px-5 py-4 border-b flex items-start justify-between gap-4 ${
                    result.status === 'VALID'
                      ? 'bg-success-soft border-success-line'
                      : result.status === 'REVOKED'
                      ? 'bg-warning-soft border-warning-line'
                      : result.status === 'INVALID_MODIFIED'
                      ? 'bg-danger-soft border-danger-line'
                      : 'bg-sunken border-line'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 size-9 rounded-full flex items-center justify-center shrink-0 ${
                        result.status === 'VALID'
                          ? 'bg-success text-white'
                          : result.status === 'REVOKED'
                          ? 'bg-warning text-white'
                          : result.status === 'INVALID_MODIFIED'
                          ? 'bg-danger text-white'
                          : 'bg-ink-2 text-white'
                      }`}
                    >
                      {result.status === 'VALID' ? (
                        <ShieldCheck className="size-5" />
                      ) : result.status === 'REVOKED' ? (
                        <ShieldAlert className="size-5" />
                      ) : result.status === 'INVALID_MODIFIED' ? (
                        <AlertTriangle className="size-5" />
                      ) : result.status === 'ERROR' ? (
                        <CloudOff className="size-5" />
                      ) : (
                        <CircleHelp className="size-5" />
                      )}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge
                          status={
                            result.status === 'VALID'
                              ? 'valid'
                              : result.status === 'REVOKED'
                              ? 'revoked'
                              : result.status === 'INVALID_MODIFIED'
                              ? 'tampered'
                              : result.status === 'ERROR'
                              ? 'unavailable'
                              : 'not_found'
                          }
                          size="sm"
                        />
                        <span className="font-mono text-xs text-ink-2 font-medium">
                          {result.id}
                        </span>
                      </div>
                      <h3 className="font-serif text-lg font-semibold text-ink mt-1">
                        {result.status === 'VALID'
                          ? 'Authentic University Credential'
                          : result.status === 'REVOKED'
                          ? 'Credential Officially Revoked'
                          : result.status === 'INVALID_MODIFIED'
                          ? 'Security Alert: Document Tampering Detected'
                          : result.status === 'ERROR'
                          ? 'Verification Service Unavailable'
                          : 'No Matching Record Found'}
                      </h3>
                      <p className="text-xs text-ink-2 mt-0.5 leading-relaxed">
                        {result.status === 'VALID'
                          ? 'This credential matches the canonical SHA-256 fingerprint anchored on the blockchain ledger and is in good standing.'
                          : result.status === 'REVOKED'
                          ? 'This certificate was formally revoked with Controller of Examinations co-signature and is no longer valid.'
                          : result.status === 'INVALID_MODIFIED'
                          ? result.message
                          : result.message}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setResult(null)}
                    leftIcon={<RotateCcw />}
                  >
                    Reset
                  </Button>
                </div>

                {/* Result Body */}
                <CardBody className="space-y-5">
                  {(result.status === 'VALID' || result.status === 'REVOKED') && (
                    <>
                      {result.status === 'REVOKED' && result.revocationReason && (
                        <Alert tone="danger" title="Official Revocation Justification">
                          <p>{result.revocationReason}</p>
                          {result.revocationDate && (
                            <p className="text-xs mt-1 font-mono">Revoked on: {result.revocationDate}</p>
                          )}
                        </Alert>
                      )}

                      <DescriptionList
                        columns={2}
                        items={[
                          {
                            term: 'Graduate Full Name',
                            value: <span className="font-semibold text-ink">{result.name}</span>,
                          },
                          {
                            term: 'Certificate ID',
                            value: <HashText value={result.id} head={14} tail={8} />,
                          },
                          {
                            term: 'Conferred Program',
                            value: <span className="font-medium">{result.degree}</span>,
                            full: true,
                          },
                          {
                            term: 'Academic Session & CGPA',
                            value: (
                              <span className="tabular">
                                {result.session || '—'} &middot;{' '}
                                <strong className="text-success">{result.cgpa || '—'} / 4.00</strong>
                              </span>
                            ),
                          },
                          {
                            term: 'Issuance Date',
                            value: result.issueDate || '—',
                          },
                        ]}
                      />

                      {/* Cryptographic Proof Box */}
                      <div className="rounded-md bg-sunken border border-line p-3.5 space-y-2.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-ink uppercase tracking-wider text-[11px]">
                            On-Chain Cryptographic Anchor
                          </span>
                          {result.blockNumber && (
                            <span className="font-mono text-[11px] text-brand font-medium">
                              Block {result.blockNumber}
                            </span>
                          )}
                        </div>
                        {result.sha256Hash && (
                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-line">
                            <span className="text-muted shrink-0">SHA-256 Digest</span>
                            <HashText value={result.sha256Hash} head={14} tail={12} label="SHA-256 hash" />
                          </div>
                        )}
                        {result.txHash && (
                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-line">
                            <span className="text-muted shrink-0">Transaction Hash</span>
                            <HashText
                              value={result.txHash}
                              head={12}
                              tail={10}
                              href={explorerTxUrl(result.txHash, result.network || 'sepolia')}
                              label="transaction hash"
                            />
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="pt-1 flex flex-wrap items-center gap-2.5">
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<Eye />}
                          onClick={() => setPreviewOpen(true)}
                        >
                          Inspect Certificate Preview
                        </Button>
                        <a
                          href={`/api/certificates/${encodeURIComponent(result.id)}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 h-8 px-3 text-[13px] font-medium rounded-md bg-surface text-ink border border-line-strong shadow-card hover:bg-sunken"
                        >
                          <Download className="size-3.5" />
                          <span>Download Official PDF</span>
                        </a>
                      </div>
                    </>
                  )}

                  {result.status === 'INVALID_MODIFIED' && (
                    <div className="space-y-4">
                      <Alert tone="danger" title="Cryptographic Digest Mismatch">
                        Even a 1-byte modification to student name, CGPA, or conferral date produces a completely different SHA-256 digest. Do not accept this file as authentic.
                      </Alert>

                      <div className="space-y-3 text-xs">
                        <div className="rounded-md bg-danger-soft/60 border border-danger-line p-3">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-danger block mb-1">
                            Uploaded PDF SHA-256 Digest (Altered File)
                          </span>
                          <code className="font-mono text-[11.5px] text-danger break-all select-all">
                            {result.computedHash || 'Mismatch'}
                          </code>
                        </div>

                        <div className="rounded-md bg-success-soft/60 border border-success-line p-3">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-success block mb-1">
                            Official On-Chain SHA-256 Digest ({result.id})
                          </span>
                          <code className="font-mono text-[11.5px] text-success break-all select-all">
                            {result.expectedHash || 'Anchored On-Chain Digest'}
                          </code>
                        </div>
                      </div>
                    </div>
                  )}

                  {(result.status === 'NOT_FOUND' || result.status === 'ERROR') && (
                    <div className="space-y-3 text-xs text-muted">
                      <div className="rounded-md bg-sunken border border-line p-3">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-2 block">
                          Queried Identifier / File
                        </span>
                        <code className="font-mono text-xs text-ink mt-1 block break-all">
                          {result.id}
                        </code>
                        {result.computedHash && (
                          <p className="font-mono text-[11px] text-muted mt-1 break-all">
                            Computed SHA-256: {result.computedHash}
                          </p>
                        )}
                      </div>
                      <p>
                        Verify that the Certificate ID matches the format <code className="font-mono text-ink">PUB-DEG-YYYY-XXXXXX</code> or upload the unmodified PDF issued by the university registrar.
                      </p>
                    </div>
                  )}
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Full Certificate Preview Modal */}
      <Dialog
        open={previewOpen && Boolean(result && (result.status === 'VALID' || result.status === 'REVOKED'))}
        onClose={() => setPreviewOpen(false)}
        size="xl"
        title={result ? `Certificate Specimen — ${result.id}` : 'Certificate Preview'}
        description="Official academic record rendered from verified ledger metadata."
        footer={
          result ? (
            <>
              <Button variant="secondary" onClick={() => setPreviewOpen(false)}>
                Close
              </Button>
              <a
                href={`/api/certificates/${encodeURIComponent(result.id)}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 h-9.5 px-4 text-sm font-medium rounded-md bg-brand text-white hover:bg-brand-hover"
              >
                <Download className="size-4" />
                <span>Download Official PDF</span>
              </a>
            </>
          ) : undefined
        }
      >
        {result && (
          <CertificateDocumentPreview
            certificate={{
              id: result.id,
              type: result.type || 'Degree Certificate',
              studentName: result.name,
              studentId: result.studentId || 'Verified Graduate',
              program: result.program || result.degree,
              degreeName: result.degree,
              session: result.session || '—',
              cgpa: result.cgpa || '—',
              issueDate: result.issueDate || '—',
              sha256Hash: result.sha256Hash,
              txHash: result.txHash,
              blockNumber: result.numericBlock,
              status: result.status === 'REVOKED' ? 'revoked' : 'valid',
              revocationReason: result.revocationReason,
            }}
          />
        )}
      </Dialog>
    </section>
  );
};
