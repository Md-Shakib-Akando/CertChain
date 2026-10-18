'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Search,
  QrCode,
  Loader2,
  Camera,
  Upload,
  
  ShieldCheck,
  ShieldAlert,
  X,
} from 'lucide-react';
import verificationImage from '../../../public/images/verification.jpeg';

export const QuickVerification: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'id' | 'qr' | 'pdf'>('id');
  const [certIdInput, setCertIdInput] = useState<string>('PUB-CERT-2024-001');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);

  // Popup Modal Verification Result
  const [modalResult, setModalResult] = useState<{
    id: string;
    name: string;
    degree: string;
    status: 'VALID' | 'REVOKED';
    session?: string;
    cgpa?: string;
    issueDate?: string;
    txHash: string;
    blockNumber: string;
  } | null>(null);

  const handleVerify = (idToSearch: string) => {
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      const cleanId = idToSearch.trim().toUpperCase();
      if (cleanId.includes('REVOKED') || cleanId.includes('2025')) {
        setModalResult({
          id: cleanId,
          name: 'Tariq Islam',
          degree: 'Master of Business Administration',
          status: 'REVOKED',
          session: '2021 - 2023',
          issueDate: 'October 12, 2023',
          txHash: '0x9d4e28bf610c4a89e17b8f9a0c1d2e3f4a5b6c7d',
          blockNumber: '#17,820,119',
        });
      } else {
        setModalResult({
          id: cleanId || 'PUB-CERT-2024-001',
          name: 'Md. Shakib Akando',
          degree: 'Bachelor of Science in Computer Science & Engineering',
          status: 'VALID',
          session: '2020 - 2024',
          cgpa: '3.88 / 4.00',
          issueDate: 'March 15, 2024',
          txHash: '0x8f3c7a19d45e02b6e1f7c89a012d34e56789c29b',
          blockNumber: '#19,402,817',
        });
      }
    }, 600);
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setModalResult({
        id: 'PUB-CERT-2024-001',
        name: 'Md. Shakib Akando',
        degree: 'Bachelor of Science in Computer Science & Engineering',
        status: 'VALID',
        session: '2020 - 2024',
        cgpa: '3.88 / 4.00',
        issueDate: 'March 15, 2024',
        txHash: '0x8f3c7a19d45e02b6e1f7c89a012d34e56789c29b',
        blockNumber: '#19,402,817',
      });
    }, 600);
  };

  return (
    <section id="verify" className="bg-[#F0F4F9] py-16 sm:py-24 border-b border-slate-200 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Header, Tabs, Form Fields */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Tag Pill */}
            <div>
              <span className="text-xs font-bold tracking-wider uppercase text-[#2563EB] bg-blue-50 px-3.5 py-1.5 rounded-full inline-block border border-blue-100">
                Fast & Easy
              </span>
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B2545] tracking-tight">
                Quick Verification
              </h2>
              <p className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-xl">
                Verify any academic certificate in seconds using one of the methods below. No account required.
              </p>
            </div>

            {/* Verification Method Tabs (Pills) */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('id')}
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'id'
                    ? 'bg-blue-50 text-[#2563EB] border-2 border-[#2563EB] shadow-sm'
                    : 'bg-white border border-slate-300 text-slate-600 hover:text-slate-900 hover:border-slate-400'
                }`}
              >
                Certificate ID
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('qr')}
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'qr'
                    ? 'bg-blue-50 text-[#2563EB] border-2 border-[#2563EB] shadow-sm'
                    : 'bg-white border border-slate-300 text-slate-600 hover:text-slate-900 hover:border-slate-400'
                }`}
              >
                Scan QR Code
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('pdf')}
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'pdf'
                    ? 'bg-blue-50 text-[#2563EB] border-2 border-[#2563EB] shadow-sm'
                    : 'bg-white border border-slate-300 text-slate-600 hover:text-slate-900 hover:border-slate-400'
                }`}
              >
                Upload PDF
              </button>
            </div>

            {/* TAB 1: Certificate ID Search Field */}
            {activeTab === 'id' && (
              <div className="space-y-3 pt-1">
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
                      placeholder="Enter Certificate ID (e.g. PUB-CERT-2024-001)"
                      className="w-full pl-4 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm sm:text-base placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 shadow-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="w-full sm:w-auto px-7 py-3.5 bg-[#2563EB] hover:bg-blue-600 active:scale-95 text-white font-semibold text-sm sm:text-base rounded-xl transition-all shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    {isVerifying ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    <span>Verify</span>
                  </button>
                </form>

                {/* Quick Preset Buttons for testing */}
                <div className="flex items-center gap-2 text-xs text-slate-500 pt-1 flex-wrap">
                  <span className="text-[11px] font-semibold text-slate-400">Quick test:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCertIdInput('PUB-CERT-2024-001');
                      handleVerify('PUB-CERT-2024-001');
                    }}
                    className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] cursor-pointer"
                  >
                    PUB-CERT-2024-001 (Valid)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCertIdInput('PUB-DEG-2025-000842-3X');
                      handleVerify('PUB-DEG-2025-000842-3X');
                    }}
                    className="px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 text-red-700 font-mono text-[11px] cursor-pointer"
                  >
                    PUB-DEG-2025... (Revoked)
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: Clean & Compact QR Code Scanner View */}
            {activeTab === 'qr' && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-4">
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
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center border border-blue-100">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#0B2545]">
                        Scan QR Code
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Scan the certificate QR code with your device camera
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Ready
                  </span>
                </div>

                {/* Clean Compact Scanner Target */}
                <div className="relative w-full bg-gradient-to-b from-blue-50/40 via-slate-50/50 to-white rounded-xl border border-blue-100/70 p-5 flex flex-col items-center justify-center text-center overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(#2563eb_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none" />

                  {/* QR Target Viewfinder */}
                  <div className="relative w-32 h-32 bg-white rounded-xl shadow-xs border border-slate-200/80 flex items-center justify-center p-3 z-10">
                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#2563EB] rounded-tl" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#2563EB] rounded-tr" />
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#2563EB] rounded-bl" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#2563EB] rounded-br" />

                    <div
                      className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-[#2563EB] to-transparent shadow-[0_0_8px_rgba(37,99,235,0.8)] z-20 pointer-events-none"
                      style={{
                        animation: isVerifying
                          ? 'cleanScanLine 0.9s ease-in-out infinite'
                          : 'cleanScanLine 2.5s ease-in-out infinite',
                      }}
                    />

                    <QrCode className="w-20 h-20 text-slate-700/85" />
                  </div>

                  <p className="mt-3 text-[11px] text-slate-600 font-medium z-10">
                    Align the certificate QR code with the camera frame
                  </p>
                </div>

                {/* Primary Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    disabled={isVerifying}
                    onClick={() => handleVerify('PUB-CERT-2024-001')}
                    className="py-2.5 px-3.5 rounded-xl bg-[#2563EB] hover:bg-blue-600 active:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
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

                  <label className="py-2.5 px-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs">
                    <Upload className="w-4 h-4 text-slate-500" />
                    <span>Upload QR Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleVerify('PUB-CERT-2024-001');
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Quick Test Samples */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                  <span className="text-[11px] font-semibold text-slate-400">Quick test:</span>
                  <button
                    type="button"
                    onClick={() => handleVerify('PUB-CERT-2024-001')}
                    className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] cursor-pointer"
                  >
                    PUB-CERT-2024-001 (Valid)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVerify('PUB-DEG-2025-000842-3X')}
                    className="px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 text-red-700 font-mono text-[11px] cursor-pointer"
                  >
                    PUB-DEG-2025... (Revoked)
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: PDF Document Dropzone */}
            {activeTab === 'pdf' && (
              <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-500 transition-colors text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    Upload Degree Certificate PDF
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Client-side SHA-256 fingerprint verified against ledger.
                  </p>
                </div>
                <label className="inline-block px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white text-xs font-semibold cursor-pointer shadow-md">
                  {isVerifying ? 'Verifying PDF...' : 'Browse PDF File'}
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* Helper Subtext */}
            <p className="text-xs text-slate-400">
              You can also scan the QR code on the certificate or upload the PDF file.
            </p>

          </div>

          {/* Right Column: Enlarged Prominent Image Display */}
          <div className="lg:col-span-6 relative flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-[620px] lg:max-w-none lg:w-[130%] xl:w-[140%] lg:-mr-16 xl:-mr-24 lg:scale-115 xl:scale-125 origin-center lg:origin-left transition-transform duration-300">
              <Image
                src={verificationImage}
                alt="Certificate Quick Verification"
                priority
                className="w-full h-auto object-contain "
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setModalResult(null)}
        >
          <div
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden transform animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Banner */}
            <div
              className={`p-6 sm:p-7 text-white relative overflow-hidden ${
                modalResult.status === 'VALID'
                  ? 'bg-gradient-to-br from-[#10233F] via-[#1B365D] to-[#2563EB]'
                  : 'bg-gradient-to-br from-[#3B0D0D] via-[#7F1D1D] to-[#DC2626]'
              }`}
            >
              {/* Subtle background glow */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

              {/* Close button */}
              <button
                type="button"
                onClick={() => setModalResult(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                    modalResult.status === 'VALID'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}
                >
                  {modalResult.status === 'VALID' ? (
                    <ShieldCheck className="w-7 h-7" />
                  ) : (
                    <ShieldAlert className="w-7 h-7" />
                  )}
                </div>
                <div>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase ${
                      modalResult.status === 'VALID'
                        ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
                        : 'bg-red-400/20 text-red-200 border border-red-400/30'
                    }`}
                  >
                    {modalResult.status === 'VALID' ? '● Verified Authentic' : '● Revoked Record'}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                    {modalResult.status === 'VALID'
                      ? 'Certificate Authenticity Verified'
                      : 'Certificate Is Revoked'}
                  </h3>
                </div>
              </div>

              <p className="text-xs text-slate-200/90 leading-relaxed max-w-md">
                {modalResult.status === 'VALID'
                  ? 'Cryptographic SHA-256 fingerprint authenticated against the Pundra University immutable blockchain ledger.'
                  : 'Warning: This credential was revoked by the University Controller of Examinations and is no longer valid.'}
              </p>
            </div>

            {/* Modal Body: Certificate Details */}
            <div className="p-6 sm:p-7 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Recipient */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                    Graduate Name
                  </span>
                  <span className="text-sm font-bold text-[#10233F] mt-0.5 block">
                    {modalResult.name}
                  </span>
                </div>

                {/* Certificate ID */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                    Certificate ID
                  </span>
                  <span className="text-xs sm:text-sm font-mono font-bold text-[#2563EB] mt-0.5 block">
                    {modalResult.id}
                  </span>
                </div>

                {/* Academic Degree */}
                <div className="sm:col-span-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                    Academic Degree Awarded
                  </span>
                  <span className="text-sm font-bold text-[#10233F] mt-0.5 block">
                    {modalResult.degree}
                  </span>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 mt-1.5 font-medium">
                    <span>Institution: PUST</span>
                    {modalResult.session && <span>Session: {modalResult.session}</span>}
                    {modalResult.cgpa && (
                      <span className="font-semibold text-emerald-700">CGPA: {modalResult.cgpa}</span>
                    )}
                    <span>Issued: {modalResult.issueDate}</span>
                  </div>
                </div>

                {/* Blockchain Proof */}
                <div className="sm:col-span-2 p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 text-[11px] space-y-1.5">
                  <div className="flex items-center justify-between text-blue-900 font-bold">
                    <span>On-Chain Ledger Anchor</span>
                    <span className="font-mono text-[10px] text-blue-700">{modalResult.blockNumber}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 font-mono text-slate-600 bg-white/80 p-2 rounded-lg border border-blue-100">
                    <span className="truncate">{modalResult.txHash}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(modalResult.txHash);
                        setCopiedHash(true);
                        setTimeout(() => setCopiedHash(false), 2000);
                      }}
                      className="text-xs text-[#2563EB] hover:text-blue-800 font-sans font-semibold shrink-0 cursor-pointer"
                    >
                      {copiedHash ? 'Copied!' : 'Copy Hash'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalResult(null)}
                  className="w-full py-3 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer text-center"
                >
                  Done & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
