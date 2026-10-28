'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import jsQR from 'jsqr';
import {
  Search,
  QrCode,
  Loader2,
  Camera,
  Upload,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  X,
  CameraOff,
} from 'lucide-react';
import verificationImage from '../../../public/images/verification.jpeg';

export const QuickVerification: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'id' | 'qr' | 'pdf'>('id');
  const [certIdInput, setCertIdInput] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);

  // Real Camera Scanner State
  const [isScanningCamera, setIsScanningCamera] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isScanningCameraRef = useRef<boolean>(false);
  const animFrameIdRef = useRef<number | null>(null);

  // Popup Modal Verification Result
  const [modalResult, setModalResult] = useState<{
    id: string;
    name: string;
    degree: string;
    status: 'VALID' | 'REVOKED' | 'NOT_FOUND' | 'INVALID_MODIFIED';
    session?: string;
    cgpa?: string;
    issueDate?: string;
    txHash: string;
    blockNumber: string;
    revocationReason?: string;
    message?: string;
    computedHash?: string;
    expectedHash?: string;
  } | null>(null);

  // Extract Certificate ID from QR string (handles URLs or direct IDs)
  const extractCertIdFromQr = (text: string): string => {
    const trimmed = text.trim();
    try {
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        const url = new URL(trimmed);
        const queryId = url.searchParams.get('id');
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

    try {
      const res = await fetch(`/api/public/verify/${encodeURIComponent(cleanId)}`);
      const data = await res.json();

      if (res.ok && data.success && data.certificate) {
        setModalResult({
          id: data.certificate.id,
          name: data.certificate.studentName,
          degree: data.certificate.degree,
          status: data.status,
          session: data.certificate.session,
          cgpa: data.certificate.cgpa,
          issueDate: data.certificate.issueDate,
          txHash: data.certificate.txHash,
          blockNumber: `#${data.certificate.blockNumber}`,
          revocationReason: data.certificate.revocationReason,
        });
      } else {
        // Real NOT FOUND result from database / smart contract
        setModalResult({
          id: cleanId,
          name: 'N/A',
          degree: 'N/A',
          status: 'NOT_FOUND',
          message: data.message || `No certificate record found with ID "${cleanId}" on the blockchain ledger.`,
          txHash: '',
          blockNumber: '',
        });
      }
    } catch {
      setModalResult({
        id: cleanId,
        name: 'N/A',
        degree: 'N/A',
        status: 'NOT_FOUND',
        message: 'Could not connect to the verification ledger service. Please check your network connection.',
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
      const queryId = params.get('id');
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

  // Frame scanner loop
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

  // Start real webcam scanner
  const startCamera = async () => {
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
      alert('Unable to access camera. Please allow camera permissions or upload a QR image.');
    }
  };

  // Stop camera when leaving QR tab or unmounting
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
            setModalResult({
              id: file.name,
              name: 'N/A',
              degree: 'N/A',
              status: 'NOT_FOUND',
              message: 'No readable QR code found in the uploaded image. Please ensure the QR code is clearly visible and well-lit.',
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
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
        setModalResult({
          id: data.certificate.id,
          name: data.certificate.studentName,
          degree: data.certificate.degree,
          status: data.status,
          session: data.certificate.session,
          cgpa: data.certificate.cgpa,
          issueDate: data.certificate.issueDate,
          txHash: data.certificate.txHash,
          blockNumber: `#${data.certificate.blockNumber}`,
          revocationReason: data.certificate.revocationReason,
        });
      } else if (data.status === 'INVALID_MODIFIED') {
        setModalResult({
          id: data.certificateId || extractedCertId,
          name: data.studentName || 'Official Student Record',
          degree: 'N/A',
          status: 'INVALID_MODIFIED',
          message: data.message || 'Security Alert: Cryptographic fingerprint mismatch. Document has been modified or forged.',
          txHash: '',
          blockNumber: '',
          computedHash: data.computedHash,
          expectedHash: data.expectedHash,
        });
      } else {
        setModalResult({
          id: file.name,
          name: 'N/A',
          degree: 'N/A',
          status: 'NOT_FOUND',
          message: data.message || 'No matching certificate found with this cryptographic fingerprint on the blockchain.',
          txHash: '',
          blockNumber: '',
        });
      }
    } catch {
      setModalResult({
        id: file.name,
        name: 'N/A',
        degree: 'N/A',
        status: 'NOT_FOUND',
        message: 'Failed to process PDF document client-side.',
        txHash: '',
        blockNumber: '',
      });
    } finally {
      setIsVerifying(false);
      e.target.value = '';
    }
  };

  return (
    <section id="verify" className="bg-[#080D18] aurora-bg py-20 sm:py-28 border-b border-white/10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          
          {/* Left Column: Header, Tabs, Form Fields */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Tag Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 shadow-inner">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[11px] font-bold tracking-widest uppercase text-cyan-300">
                Instant Zero-Gas Verification
              </span>
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F1F5F9] tracking-tight">
                Public Certificate Verification
              </h2>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl font-normal">
                Verify any academic certificate in seconds using one of the three methods below. Direct cryptographic comparison against the immutable blockchain ledger.
              </p>
            </div>

            {/* Verification Method Tabs (Pills) */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setActiveTab('id');
                }}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'id'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 border border-cyan-400/40'
                    : 'bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                Certificate ID
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('qr')}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'qr'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 border border-cyan-400/40'
                    : 'bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                Scan QR Code
              </button>

              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setActiveTab('pdf');
                }}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'pdf'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 border border-cyan-400/40'
                    : 'bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                Upload PDF
              </button>
            </div>

            {/* TAB 1: Real Certificate ID Search Field */}
            {activeTab === 'id' && (
              <div className="space-y-3 pt-2">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (certIdInput.trim()) {
                      handleVerify(certIdInput);
                    }
                  }}
                  className="flex flex-col sm:flex-row items-center gap-2.5"
                >
                  <div className="relative w-full">
                    <input
                      id="cert-id-search-input"
                      type="text"
                      value={certIdInput}
                      onChange={(e) => setCertIdInput(e.target.value)}
                      placeholder="e.g. PUB-DEG-2026-000105"
                      className="w-full pl-4 pr-4 py-3.5 bg-[#0D1424] border border-white/15 rounded-xl text-white text-sm sm:text-base placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 shadow-inner font-mono font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifying || !certIdInput.trim()}
                    className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 active:scale-95 text-white font-semibold text-sm sm:text-base rounded-xl transition-all shadow-lg shadow-cyan-600/25 flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border border-cyan-400/30"
                  >
                    {isVerifying ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    <span>Verify</span>
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: Real Camera & Image QR Code Scanner View */}
            {activeTab === 'qr' && (
              <div className="bg-[#0D1424] rounded-2xl border border-white/15 shadow-xl p-5 sm:p-6 space-y-4">
                <style>{`
                  @keyframes cleanScanLine {
                    0% { top: 12%; opacity: 0.8; }
                    50% { top: 84%; opacity: 1; }
                    100% { top: 12%; opacity: 0.8; }
                  }
                `}</style>

                {/* Header & Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-400/20">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#F1F5F9]">
                        Scan QR Code
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Scan with device camera or upload a QR image
                      </p>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                    isScanningCamera
                      ? 'bg-blue-500/20 text-cyan-300 border-cyan-400/30'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isScanningCamera ? 'bg-cyan-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
                    {isScanningCamera ? 'Scanning...' : 'Ready'}
                  </span>
                </div>

                {/* Video / Viewfinder Area */}
                <div className="relative w-full bg-gradient-to-b from-[#121C2E] to-[#080D18] rounded-xl border border-white/10 p-4 flex flex-col items-center justify-center text-center overflow-hidden min-h-[190px]">
                  <div className="absolute inset-0 bg-[radial-gradient(#22d3ee_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none" />

                  {isScanningCamera ? (
                    <div className="relative w-full max-w-[280px] h-44 rounded-xl overflow-hidden bg-black flex items-center justify-center shadow-lg border border-cyan-400/30">
                      <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        playsInline
                        muted
                      />
                      {/* Scanning Line Animation */}
                      <div
                        className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-[#22D3EE] to-transparent shadow-[0_0_8px_rgba(34,211,238,0.8)] z-20 pointer-events-none"
                        style={{
                          animation: 'cleanScanLine 1.5s ease-in-out infinite',
                        }}
                      />
                    </div>
                  ) : (
                    /* Default QR Viewfinder */
                    <div className="relative w-28 h-28 bg-[#121C2E] rounded-xl shadow-lg border border-white/15 flex items-center justify-center p-3 z-10">
                      <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-cyan-400 rounded-tl" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-cyan-400 rounded-tr" />
                      <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-cyan-400 rounded-bl" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-cyan-400 rounded-br" />

                      <div
                        className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-[#22D3EE] to-transparent shadow-[0_0_8px_rgba(34,211,238,0.8)] z-20 pointer-events-none"
                        style={{
                          animation: 'cleanScanLine 2.5s ease-in-out infinite',
                        }}
                      />

                      <QrCode className="w-16 h-16 text-slate-300" />
                    </div>
                  )}

                  <p className="mt-3 text-[11px] text-slate-300 font-medium z-10">
                    {isScanningCamera
                      ? 'Point your camera directly at the certificate QR code'
                      : 'Align the certificate QR code with the camera frame'}
                  </p>
                </div>

                {/* Primary Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {isScanningCamera ? (
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="py-2.5 px-3.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold text-xs shadow-md shadow-red-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CameraOff className="w-4 h-4" />
                      <span>Stop Camera</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isVerifying}
                      onClick={startCamera}
                      className="py-2.5 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-xs shadow-lg shadow-blue-600/25 border border-cyan-400/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4" />
                          <span>Scan Camera QR</span>
                        </>
                      )}
                    </button>
                  )}

                  <label className="py-2.5 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                    <Upload className="w-4 h-4 text-slate-400" />
                    <span>Upload QR Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQrImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* TAB 3: Real PDF Document Dropzone */}
            {activeTab === 'pdf' && (
              <div className="bg-[#0D1424] p-6 rounded-2xl border-2 border-dashed border-white/20 hover:border-cyan-400 transition-colors text-center space-y-3 shadow-xl">
                <div className="w-12 h-12 mx-auto rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-400/20">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#F1F5F9]">
                    Upload Academic Certificate PDF
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Client-side SHA-256 fingerprint verified directly against the blockchain ledger.
                  </p>
                </div>
                <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer shadow-lg shadow-blue-600/25 border border-cyan-400/30 transition-all">
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying PDF...</span>
                    </>
                  ) : (
                    <span>Browse PDF File</span>
                  )}
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfUpload}
                    disabled={isVerifying}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* Helper Subtext */}
            <p className="text-xs text-slate-400">
              You can also scan the QR code on the certificate or upload the official PDF file.
            </p>

          </div>

          {/* Right Column: Enlarged Prominent Image Display (ONLY the image) */}
          <div className="lg:col-span-6 relative flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-[620px] lg:max-w-none lg:w-[130%] xl:w-[140%] lg:-mr-16 xl:-mr-24 lg:scale-115 xl:scale-125 origin-center lg:origin-left transition-transform duration-300">
              <Image
                src={verificationImage}
                alt="Certificate Quick Verification"
                priority
                className="w-full h-auto object-contain"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Verification Result Popup Modal */}
      {modalResult && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setModalResult(null)}
        >
          <div
            className="relative w-full max-w-lg bg-[#0D1424] text-white rounded-3xl shadow-2xl border border-white/15 overflow-hidden transform animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Banner */}
            <div
              className={`p-6 sm:p-7 text-white relative overflow-hidden ${
                modalResult.status === 'VALID'
                  ? 'bg-gradient-to-br from-[#064E3B] via-[#047857] to-[#10B981]'
                  : modalResult.status === 'REVOKED'
                  ? 'bg-gradient-to-br from-[#78350F] via-[#B45309] to-[#D97706]'
                  : modalResult.status === 'INVALID_MODIFIED'
                  ? 'bg-gradient-to-br from-[#7F1D1D] via-[#991B1B] to-[#EF4444]'
                  : 'bg-gradient-to-br from-[#1F2937] via-[#374151] to-[#4B5563]'
              }`}
            >
              {/* Subtle background glow */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

              {/* Close button */}
              <button
                type="button"
                onClick={() => setModalResult(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/30 text-white/90 hover:text-white transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                    modalResult.status === 'VALID'
                      ? 'bg-white/20 backdrop-blur-md text-white'
                      : modalResult.status === 'REVOKED'
                      ? 'bg-white/20 backdrop-blur-md text-white'
                      : 'bg-white/20 backdrop-blur-md text-white'
                  }`}
                >
                  {modalResult.status === 'VALID' ? (
                    <ShieldCheck className="w-7 h-7 text-white" />
                  ) : modalResult.status === 'REVOKED' ? (
                    <ShieldAlert className="w-7 h-7 text-white" />
                  ) : (
                    <AlertTriangle className="w-7 h-7 text-white" />
                  )}
                </div>
                <div>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase ${
                      modalResult.status === 'VALID'
                        ? 'bg-emerald-300/20 text-emerald-100 border border-emerald-300/30'
                        : modalResult.status === 'REVOKED'
                        ? 'bg-amber-300/20 text-amber-100 border border-amber-300/30'
                        : 'bg-red-300/20 text-red-100 border border-red-300/30'
                    }`}
                  >
                    {modalResult.status === 'VALID'
                      ? '● Verified Authentic'
                      : modalResult.status === 'REVOKED'
                      ? '● Revoked Certificate'
                      : modalResult.status === 'INVALID_MODIFIED'
                      ? '● Tampered Document'
                      : '● Not Found'}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                    {modalResult.status === 'VALID'
                      ? 'Certificate Verified'
                      : modalResult.status === 'REVOKED'
                      ? 'Certificate Revoked'
                      : modalResult.status === 'INVALID_MODIFIED'
                      ? 'Verification Failed: Tamper Detected'
                      : 'Record Not Found'}
                  </h3>
                </div>
              </div>

              <p className="text-xs text-white/90 leading-relaxed max-w-md">
                {modalResult.status === 'VALID'
                  ? 'Cryptographic SHA-256 fingerprint authenticated against the immutable Ethereum Sepolia ledger. The certificate data has not been modified or tampered with since issuance.'
                  : modalResult.status === 'REVOKED'
                  ? 'Warning: This credential was revoked by the University Controller of Examinations and is no longer valid for official academic or employment verification.'
                  : modalResult.status === 'INVALID_MODIFIED'
                  ? (modalResult.message || 'Warning: The cryptographic SHA-256 hash does not match the ledger record. This document has been altered or forged.')
                  : (modalResult.message || 'No certificate record with this identifier was found on the blockchain ledger.')}
              </p>
            </div>

            {/* Modal Body: Certificate Details */}
            <div className="p-6 sm:p-7 space-y-4 bg-[#0D1424]">
              {modalResult.status === 'NOT_FOUND' ? (
                <div className="bg-[#121C2E] p-4 rounded-xl border border-white/10 text-xs space-y-2 text-slate-300">
                  <p className="font-semibold text-white">Searched Identifier:</p>
                  <p className="font-mono bg-[#080D18] p-2 rounded border border-white/10 text-cyan-300 break-all">
                    {modalResult.id}
                  </p>
                  <p className="text-slate-400 pt-1">
                    Please ensure the Certificate ID is typed correctly, or scan the official QR code found on the certificate.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Recipient */}
                  <div className="bg-[#121C2E] p-3 rounded-xl border border-white/10">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                      Graduate Name
                    </span>
                    <span className="text-sm font-bold text-white mt-0.5 block">
                      {modalResult.name}
                    </span>
                  </div>

                  {/* Certificate ID */}
                  <div className="bg-[#121C2E] p-3 rounded-xl border border-white/10">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                      Certificate ID
                    </span>
                    <span className="text-xs sm:text-sm font-mono font-bold text-cyan-300 mt-0.5 block">
                      {modalResult.id}
                    </span>
                  </div>

                  {/* Academic Degree & Institution */}
                  <div className="sm:col-span-2 bg-[#121C2E] p-3.5 rounded-xl border border-white/10">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                      Academic Degree Awarded
                    </span>
                    <span className="text-sm font-bold text-white mt-0.5 block">
                      {modalResult.degree}
                    </span>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 mt-1.5 font-medium">
                      <span>Institution: Pundra University of Science &amp; Technology (PUST)</span>
                      {modalResult.session && <span>Session: {modalResult.session}</span>}
                      {modalResult.cgpa && (
                        <span className="font-semibold text-emerald-400">CGPA: {modalResult.cgpa}</span>
                      )}
                      {modalResult.issueDate && <span>Issued: {modalResult.issueDate}</span>}
                    </div>

                    {modalResult.revocationReason && (
                      <div className="mt-2.5 pt-2 border-t border-amber-500/20 text-amber-300 text-xs font-semibold">
                        Reason for Revocation: {modalResult.revocationReason}
                      </div>
                    )}
                  </div>

                  {/* Blockchain Proof & Explorer Link */}
                  {modalResult.txHash && (
                    <div className="sm:col-span-2 p-3.5 rounded-xl bg-blue-500/10 border border-cyan-400/30 text-[11px] space-y-1.5">
                      <div className="flex items-center justify-between text-cyan-300 font-bold">
                        <span>On-Chain Ledger Anchor</span>
                        <span className="font-mono text-[10px] text-cyan-400">{modalResult.blockNumber}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 font-mono text-slate-300 bg-[#080D18] p-2 rounded-lg border border-white/10">
                        <span className="truncate">{modalResult.txHash}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard?.writeText(modalResult.txHash);
                              setCopiedHash(true);
                              setTimeout(() => setCopiedHash(false), 2000);
                            }}
                            className="text-xs text-cyan-400 hover:text-cyan-300 font-sans font-semibold cursor-pointer"
                          >
                            {copiedHash ? 'Copied!' : 'Copy'}
                          </button>
                          {modalResult.txHash.startsWith('0x') && (
                            <a
                              href={`https://sepolia.etherscan.io/tx/${modalResult.txHash}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-blue-400 hover:text-blue-300 font-sans font-semibold underline cursor-pointer"
                            >
                              Explorer &rarr;
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tamper Detection Cryptographic Comparison */}
                  {modalResult.status === 'INVALID_MODIFIED' && (
                    <div className="sm:col-span-2 p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-xs space-y-2.5">
                      <div className="flex items-center gap-1.5 text-red-300 font-bold">
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                        <span>Cryptographic Hash Mismatch (Tamper Detected)</span>
                      </div>
                      <div className="space-y-2 font-mono text-[11px]">
                        <div>
                          <span className="text-[10px] uppercase font-sans font-semibold text-red-400 block mb-0.5">
                            Computed File Hash (Uploaded File):
                          </span>
                          <div className="bg-[#080D18] p-2 rounded-lg border border-red-500/30 text-red-400 break-all select-all">
                            {modalResult.computedHash || 'Mismatch Detected'}
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-sans font-semibold text-emerald-400 block mb-0.5">
                            Anchored Ledger Hash (Official Record):
                          </span>
                          <div className="bg-[#080D18] p-2 rounded-lg border border-emerald-500/30 text-emerald-400 break-all select-all">
                            {modalResult.expectedHash || 'Anchored On-Chain Fingerprint'}
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] text-red-300/80 font-sans leading-tight pt-0.5">
                        Security Notice: Even a 1-character alteration in student name, CGPA, or degree text fundamentally changes the SHA-256 fingerprint, triggering instant fraud prevention.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Modal Footer Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalResult(null)}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/25 border border-cyan-400/30 transition-all cursor-pointer text-center"
                >
                  Done &amp; Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
