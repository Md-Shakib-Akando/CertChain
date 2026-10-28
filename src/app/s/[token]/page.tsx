import React from 'react';
import Link from 'next/link';
import crypto from 'crypto';
import { connectDB } from '@/lib/mongodb';
import { ShareLink } from '@/models/ShareLink';
import { Certificate } from '@/models/Certificate';
import { AuditLog } from '@/models/AuditLog';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  Download,
  Building,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SharedCredentialPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  await connectDB();

  // 1. Hash incoming token to match database
  const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');

  // 2. Query ShareLink
  const shareLink = await ShareLink.findOne({ tokenHash });

  // 3. Handle 410 Expired or Revoked
  const isExpired = shareLink && new Date() > new Date(shareLink.expiresAt);
  const isRevoked = shareLink && shareLink.status === 'revoked';

  if (!shareLink || isExpired || isRevoked) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0B1F3A]">
        <Header />
        <main className="flex-1 max-w-lg w-full mx-auto px-4 py-20 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-8 h-8" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            HTTP 410 — Link Inactive
          </span>
          <h1 className="text-2xl font-extrabold text-[#0B1F3A]">
            Verification Link Expired or Revoked
          </h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            This time-limited credential link has reached its designated expiration time or was securely cancelled by the student graduate.
          </p>
          <div className="pt-4">
            <Link
              href="/#verify"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-[#2563EB] text-white text-xs font-bold hover:bg-blue-600 shadow-md"
            >
              Verify via Official Verification Section &rarr;
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // 4. Increment view count
  shareLink.viewCount += 1;
  await shareLink.save();

  // 5. Fetch Certificate Details
  const cert = await Certificate.findOne({ id: shareLink.certId }).select('-pdfBase64');
  if (!cert) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
        <Header />
        <main className="flex-1 p-20 text-center">Certificate record not found.</main>
        <Footer />
      </div>
    );
  }

  const isValid = cert.status === 'valid';

  // Record audit log for employer verification
  try {
    await AuditLog.create({
      actorRole: 'employer',
      action: 'TIME_LIMITED_LINK_VERIFIED',
      targetType: 'certificate',
      targetId: cert.id,
      targetReference: `${shareLink.recipientLabel} (${cert.studentName})`,
      outcome: isValid ? 'success' : 'warning',
      details: `Employer opened time-limited verification link generated for "${shareLink.recipientLabel}". View count: ${shareLink.viewCount}. Status: ${cert.status}.`,
      transactionHash: cert.txHash,
    });
  } catch (err) {
    console.warn('AuditLog write error on shared link view:', err);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0B1F3A]">
      <Header />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-12 space-y-6">
        {/* Recipient Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between text-xs text-blue-900">
          <div className="flex items-center gap-2.5">
            <Building className="w-4 h-4 text-[#2563EB]" />
            <span>
              Direct Student Verification for: <b>{shareLink.recipientLabel}</b>
            </span>
          </div>
          <span className="text-[11px] text-blue-700">
            Valid until: {new Date(shareLink.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
            {new Date(shareLink.expiresAt).toLocaleDateString()}
          </span>
        </div>

        {/* Credential Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
          {/* Header Banner */}
          <div
            className={`p-6 sm:p-7 text-white flex items-center justify-between ${
              isValid ? 'bg-gradient-to-r from-emerald-700 to-teal-800' : 'bg-gradient-to-r from-amber-600 to-red-700'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                {isValid ? <ShieldCheck className="w-7 h-7 text-white" /> : <ShieldAlert className="w-7 h-7 text-white" />}
              </div>
              <div>
                <span className="text-white/80 text-xs font-bold uppercase tracking-wider">
                  ● Blockchain Authenticated Credential
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  {isValid ? 'Official Degree Verified' : 'Credential Revoked'}
                </h2>
              </div>
            </div>

            <a
              href={`/api/certificates/${cert.id}/pdf`}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-emerald-800 font-bold text-xs hover:bg-emerald-50 shadow"
            >
              <Download className="w-4 h-4" />
              <span>Download Official PDF</span>
            </a>
          </div>

          {/* Details */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <span className="text-[11px] text-slate-400 font-bold uppercase">Graduate Candidate</span>
                <p className="text-base font-bold text-[#0B1F3A] mt-0.5">{cert.studentName}</p>
                <span className="text-[11px] text-slate-500">Student ID: {cert.studentId}</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <span className="text-[11px] text-slate-400 font-bold uppercase">Certificate ID</span>
                <p className="text-base font-mono font-bold text-[#2563EB] mt-0.5">{cert.id}</p>
                <span className="text-[11px] text-slate-500">Document Type: {cert.type}</span>
              </div>

              <div className="sm:col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <span className="text-[11px] text-slate-400 font-bold uppercase">Academic Conferred Program</span>
                <p className="text-base font-bold text-[#0B1F3A] mt-0.5">{cert.degreeName || cert.program}</p>
                <div className="flex flex-wrap gap-4 text-xs text-slate-600 mt-2">
                  <span>Session: <b>{cert.session}</b></span>
                  <span>CGPA: <b className="text-emerald-700">{cert.cgpa} / 4.00</b></span>
                  <span>Issued Date: <b>{cert.issueDate}</b></span>
                </div>
              </div>
            </div>

            {/* Blockchain Fingerprint */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 font-sans text-[11px]">
                <span className="font-bold">Cryptographic SHA-256 Fingerprint:</span>
                <span>Block #{cert.blockNumber}</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-700 break-all text-[11px]">
                {cert.sha256Hash}
              </div>
            </div>

            {/* Mobile Download button */}
            <div className="sm:hidden pt-2">
              <a
                href={`/api/certificates/${cert.id}/pdf`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-xl bg-[#2563EB] text-white font-bold text-xs flex items-center justify-center gap-2 shadow"
              >
                <Download className="w-4 h-4" />
                <span>Download Official Certificate PDF</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
