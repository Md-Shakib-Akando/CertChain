'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { SealMark } from '@/components/brand/Logo';
import { cn } from '@/lib/cn';

export interface CertificatePreviewData {
  id: string;
  type?: string;
  studentName: string;
  studentId: string;
  program: string;
  degreeName?: string;
  session: string;
  cgpa: string;
  issueDate: string;
  sha256Hash?: string;
  txHash?: string;
  blockNumber?: number;
  status?: 'valid' | 'revoked' | string;
  revocationReason?: string;
  revocationDate?: string;
  qrDataUrl?: string;
}

export interface CertificateDocumentPreviewProps {
  certificate?: CertificatePreviewData;
  certId?: string;
  type?: string;
  studentName?: string;
  studentId?: string;
  degree?: string;
  department?: string;
  program?: string;
  session?: string;
  cgpa?: string;
  issuedAt?: string;
  issueDate?: string;
  txHash?: string;
  pdfHash?: string;
  sha256Hash?: string;
  revoked?: boolean;
  revocationReason?: string;
  qrDataUrl?: string;
  qrCodeDataUrl?: string;
  id?: string;
  className?: string;
}

/**
 * Formal, print-ready academic certificate preview that mirrors the generated A4 landscape PDF
 * (`src/lib/pdf/certificateGenerator.ts`) in typography, layout, double borders, and signatories.
 */
export function CertificateDocumentPreview({
  certificate,
  certId,
  type,
  studentName,
  studentId,
  degree,
  department,
  program,
  session,
  cgpa,
  issuedAt,
  issueDate,
  txHash,
  pdfHash,
  sha256Hash,
  revoked,
  revocationReason,
  qrDataUrl,
  qrCodeDataUrl,
  id = 'printable-certificate',
  className,
}: CertificateDocumentPreviewProps) {
  const data: CertificatePreviewData = certificate || {
    id: certId || 'DRAFT-PREVIEW',
    type: type || 'Degree Certificate',
    studentName: studentName || '—',
    studentId: studentId || '—',
    program: degree || program || department || '—',
    degreeName: degree,
    session: session || '—',
    cgpa: cgpa || '—',
    issueDate: issuedAt || issueDate || '—',
    sha256Hash: pdfHash || sha256Hash,
    txHash,
    status: revoked ? 'revoked' : 'valid',
    revocationReason,
    qrDataUrl: qrDataUrl || qrCodeDataUrl,
  };

  const [autoQrUrl, setAutoQrUrl] = useState<string>('');
  const explicitQrSrc = qrDataUrl || qrCodeDataUrl || data.qrDataUrl;

  useEffect(() => {
    let active = true;
    if (explicitQrSrc || !data.id || data.id === 'DRAFT-PREVIEW') return;

    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const verifyUrl = `${origin}/?id=${encodeURIComponent(data.id)}#verify`;

    QRCode.toDataURL(verifyUrl, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 256,
      color: {
        dark: '#0B1F3AFF',
        light: '#FFFFFFFF',
      },
    })
      .then((url) => {
        if (active) setAutoQrUrl(url);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [data.id, explicitQrSrc]);

  const isRevoked =
    revoked !== undefined
      ? revoked
      : String(data.status || '').toLowerCase() === 'revoked';
  const docType = (data.type || 'Degree Certificate').toUpperCase();
  const programTitle = data.degreeName || data.program || department;
  const qrSrc = explicitQrSrc || autoQrUrl;

  return (
    <div
      id={id}
      className={cn(
        'relative bg-[#FCFBF7] text-[#141B26] rounded-md shadow-document p-3 sm:p-5 select-none overflow-hidden',
        className
      )}
    >
      {/* Outer Navy Border */}
      <div className="relative border-[3px] border-[#0B1F3A] p-1.5 sm:p-2">
        {/* Inner Gold Border */}
        <div className="relative border border-[#9C7731] px-5 py-6 sm:px-10 sm:py-8">
          {/* Corner Gold Squares */}
          <span className="absolute -top-1 -left-1 size-2 bg-[#9C7731]" aria-hidden />
          <span className="absolute -top-1 -right-1 size-2 bg-[#9C7731]" aria-hidden />
          <span className="absolute -bottom-1 -left-1 size-2 bg-[#9C7731]" aria-hidden />
          <span className="absolute -bottom-1 -right-1 size-2 bg-[#9C7731]" aria-hidden />

          {/* Revoked Stamp Overlay */}
          {isRevoked && (
            <div
              className="pointer-events-none absolute inset-0 flex items-center justify-center z-10"
              aria-hidden
            >
              <div className="border-4 border-danger/70 text-danger/75 font-serif font-bold uppercase tracking-[0.22em] text-2xl sm:text-4xl px-6 py-2 rounded -rotate-12 bg-[#FCFBF7]/85">
                Revoked Credential
              </div>
            </div>
          )}

          {/* Header: University Title & Seal */}
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <SealMark tone="ink" className="size-10" />
            </div>
            <p className="font-serif text-base sm:text-xl font-bold tracking-[0.04em] text-[#0B1F3A] uppercase">
              Pundra University of Science &amp; Technology
            </p>
            <p className="text-[11px] sm:text-xs text-[#64748B] mt-0.5">
              Bogura, Bangladesh &middot; Established under the Private University Act, 2010
            </p>
            <div className="mx-auto mt-3 h-[1.5px] w-48 sm:w-72 bg-[#9C7731]" />
          </div>

          {/* Document Type */}
          <div className="mt-5 text-center">
            <p className="font-serif text-lg sm:text-2xl font-bold tracking-[0.06em] text-[#12325C]">
              {docType}
            </p>
            <p className="mt-2 font-serif italic text-xs sm:text-sm text-[#64748B]">
              This is to certify that
            </p>
          </div>

          {/* Candidate Name & ID */}
          <div className="mt-3 text-center">
            <p className="font-serif text-xl sm:text-3xl font-bold text-[#0B1F3A] tracking-tight">
              {data.studentName || '—'}
            </p>
            <p className="mt-1 text-xs sm:text-[13px] font-semibold text-[#9C7731] font-mono">
              Student ID: {data.studentId || '—'}
            </p>
          </div>

          {/* Conferral Text & Program */}
          <div className="mt-4 text-center max-w-xl mx-auto">
            <p className="font-serif text-xs sm:text-[13.5px] text-[#3B4452] leading-relaxed">
              {data.type === 'Academic Transcript'
                ? 'has successfully completed all prescribed courses and requirements for the degree of'
                : 'having fulfilled all the academic conditions has been conferred the degree of'}
            </p>
            <p className="mt-2 font-serif text-base sm:text-xl font-bold text-[#12325C]">
              {programTitle || '—'}
            </p>
            {department && department !== programTitle && (
              <p className="mt-0.5 text-xs text-[#64748B] font-serif">{department}</p>
            )}
            <p className="mt-2 text-xs sm:text-[13px] font-semibold text-[#1E293B] tabular">
              Academic Session: {data.session || '—'} &nbsp;&middot;&nbsp; Cumulative GPA:{' '}
              <span className="font-bold">{data.cgpa || '—'} / 4.00</span>
            </p>
            <p className="mt-2 font-serif italic text-[11px] sm:text-xs text-[#64748B]">
              Given under the seal of the University and the authority of the Syndicate.
            </p>
          </div>

          {/* Signatories */}
          <div className="mt-7 pt-4 grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="mx-auto w-24 sm:w-32 border-t border-[#64748B] pt-1.5">
                <p className="text-[10.5px] sm:text-xs font-semibold text-[#0B1F3A]">
                  Prepared &amp; Verified
                </p>
                <p className="text-[9.5px] sm:text-[11px] text-[#64748B]">Registrar Office</p>
              </div>
            </div>
            <div>
              <div className="mx-auto w-24 sm:w-36 border-t border-[#64748B] pt-1.5">
                <p className="text-[10.5px] sm:text-xs font-semibold text-[#0B1F3A]">
                  Controller of Examinations
                </p>
                <p className="text-[9.5px] sm:text-[11px] text-[#64748B]">PUB CertChain Authority</p>
              </div>
            </div>
            <div>
              <div className="mx-auto w-24 sm:w-32 border-t border-[#64748B] pt-1.5">
                <p className="text-[10.5px] sm:text-xs font-semibold text-[#0B1F3A]">
                  Vice-Chancellor
                </p>
                <p className="text-[9.5px] sm:text-[11px] text-[#64748B]">Pundra University</p>
              </div>
            </div>
          </div>

          {/* Bottom Ledger Footer + Optional QR */}
          <div className="mt-6 pt-3 border-t border-[#E3DFD5] flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-[10.5px] text-[#3B4452]">
            <div className="space-y-0.5 font-mono min-w-0">
              <p className="font-semibold text-[#0B1F3A]">
                Certificate ID: {data.id || 'DRAFT-PREVIEW'}
              </p>
              <p className="font-sans text-[#64748B]">
                Issue Date: {data.issueDate || '—'} &middot; Anchored on Ethereum
                {data.blockNumber ? ` (Block #${data.blockNumber})` : ''}
              </p>
              {data.sha256Hash && (
                <p className="text-[10px] text-[#64748B] truncate max-w-md" title={data.sha256Hash}>
                  SHA-256: {data.sha256Hash}
                </p>
              )}
            </div>
            {qrSrc && (
              <div className="flex flex-col items-center shrink-0 self-end sm:self-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrSrc}
                  alt={`Verification QR for ${data.id}`}
                  className="size-20 sm:size-24 border border-[#E3DFD5] bg-white p-1.5 [image-rendering:pixelated]"
                />
                <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#0B1F3A]">
                  Scan to Verify
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
