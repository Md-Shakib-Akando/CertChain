import React, { Suspense } from 'react';
import { connection } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/mongodb';
import { ShareLink } from '@/models/ShareLink';
import { Certificate } from '@/models/Certificate';
import { AuditLog } from '@/models/AuditLog';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import {
  Card,
  CardBody,
  StatusBadge,
  HashText,
  explorerTxUrl,
  CertificateDocumentPreview,
  ButtonLink,
  Alert,
  DescriptionList,
  PageSkeleton,
} from '@/components/ui';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  Download,
  Building,
  ArrowRight,
} from 'lucide-react';

async function SharedCredentialContent({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  await connection();
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
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-16 sm:py-24 flex items-center">
        <Card className="w-full text-center">
          <CardBody className="p-8 sm:p-10 space-y-4">
            <div className="size-12 mx-auto rounded-full bg-warning-soft text-warning border border-warning-line flex items-center justify-center">
              <Clock className="size-5" aria-hidden />
            </div>
            <div>
              <StatusBadge status="expired" label="HTTP 410 — Share Link Inactive" size="sm" />
              <h1 className="font-serif text-2xl font-semibold text-ink mt-2">
                Verification Link Expired or Cancelled
              </h1>
              <p className="text-sm text-muted mt-1.5 leading-relaxed max-w-md mx-auto">
                This time-bound credential share link has either passed its expiration window or was revoked by the graduate. You can still verify any official certificate directly using its Certificate ID or PDF file.
              </p>
            </div>
            <div className="pt-2">
              <ButtonLink href="/#verify" variant="primary" rightIcon={<ArrowRight />}>
                Open Public Verification Workbench
              </ButtonLink>
            </div>
          </CardBody>
        </Card>
      </main>
    );
  }

  // 4. Increment view count
  shareLink.viewCount += 1;
  await shareLink.save();

  // 5. Fetch Certificate Details
  const cert = await Certificate.findOne({ id: shareLink.certId }).select('-pdfBase64');
  if (!cert) {
    return (
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-16 flex items-center">
        <Card className="w-full text-center">
          <CardBody className="p-8 space-y-4">
            <StatusBadge status="not_found" />
            <h1 className="font-serif text-xl font-semibold text-ink">
              Referenced Certificate Not Found
            </h1>
            <ButtonLink href="/#verify" variant="secondary">
              Return to Public Verifier
            </ButtonLink>
          </CardBody>
        </Card>
      </main>
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
    <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-6">
      {/* Recipient Context Banner */}
      <div className="rounded-lg bg-surface border border-line px-4 py-3 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-ink">
          <Building className="size-4 text-brand shrink-0" aria-hidden />
          <span>
            Authorized Graduate Share Link for:{' '}
            <strong className="font-semibold">{shareLink.recipientLabel}</strong>
          </span>
        </div>
        <span className="text-muted font-mono">
          Expires:{' '}
          {new Date(shareLink.expiresAt).toLocaleDateString()}{' '}
          {new Date(shareLink.expiresAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}{' '}
          &middot; Views: {shareLink.viewCount}
        </span>
      </div>

      {/* Verification Status Summary Card */}
      <Card className="overflow-hidden">
        <div
          className={`px-6 py-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            isValid
              ? 'bg-success-soft border-success-line'
              : 'bg-danger-soft border-danger-line'
          }`}
        >
          <div className="flex items-start gap-3.5">
            <span
              className={`mt-0.5 size-10 rounded-full flex items-center justify-center shrink-0 ${
                isValid ? 'bg-success text-white' : 'bg-danger text-white'
              }`}
            >
              {isValid ? (
                <ShieldCheck className="size-5" />
              ) : (
                <ShieldAlert className="size-5" />
              )}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <StatusBadge status={isValid ? 'valid' : 'revoked'} size="sm" />
                <span className="font-mono text-xs font-medium text-ink-2">
                  {cert.id}
                </span>
              </div>
              <h1 className="font-serif text-xl sm:text-2xl font-semibold text-ink mt-1">
                {isValid ? 'Official Degree Verified On-Chain' : 'Credential Officially Revoked'}
              </h1>
              <p className="text-xs text-ink-2 mt-0.5">
                {isValid
                  ? 'Authenticated against the Pundra University smart contract registry.'
                  : 'This credential was revoked by the Controller of Examinations and is not valid.'}
              </p>
            </div>
          </div>

          <a
            href={`/api/certificates/${encodeURIComponent(cert.id)}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 h-9.5 px-4 rounded-md bg-brand text-white hover:bg-brand-hover text-sm font-medium shadow-card shrink-0"
          >
            <Download className="size-4" />
            <span>Download Official PDF</span>
          </a>
        </div>

        <CardBody className="p-6 space-y-6">
          {!isValid && cert.revocationReason && (
            <Alert tone="danger" title="Official Revocation Justification">
              {cert.revocationReason}
            </Alert>
          )}

          <DescriptionList
            columns={3}
            items={[
              {
                term: 'Graduate Candidate',
                value: <span className="font-semibold">{cert.studentName}</span>,
              },
              {
                term: 'Student ID',
                value: <span className="font-mono">{cert.studentId}</span>,
              },
              {
                term: 'Document Type',
                value: cert.type,
              },
              {
                term: 'Conferred Program',
                value: <span className="font-medium">{cert.degreeName || cert.program}</span>,
                full: true,
              },
              {
                term: 'Academic Session',
                value: cert.session,
              },
              {
                term: 'Cumulative GPA',
                value: <strong className="text-success tabular">{cert.cgpa} / 4.00</strong>,
              },
              {
                term: 'Issuance Date',
                value: cert.issueDate,
              },
            ]}
          />

          <div className="rounded-md bg-sunken border border-line p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-ink">
                Cryptographic Ledger Proof
              </span>
              <span className="font-mono text-brand font-medium">
                Block #{cert.blockNumber}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-line">
              <span className="text-muted">SHA-256 Digest</span>
              <HashText value={cert.sha256Hash} head={16} tail={14} label="SHA-256 hash" />
            </div>
            {cert.txHash && (
              <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-line">
                <span className="text-muted">Issuance Transaction</span>
                <HashText
                  value={cert.txHash}
                  head={14}
                  tail={12}
                  href={explorerTxUrl(cert.txHash, cert.network || 'sepolia')}
                  label="transaction hash"
                />
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Formal Certificate Specimen */}
      <CertificateDocumentPreview
        certificate={{
          id: cert.id,
          type: cert.type,
          studentName: cert.studentName,
          studentId: cert.studentId,
          program: cert.program,
          degreeName: cert.degreeName,
          session: cert.session,
          cgpa: cert.cgpa,
          issueDate: cert.issueDate,
          sha256Hash: cert.sha256Hash,
          txHash: cert.txHash,
          blockNumber: cert.blockNumber,
          status: cert.status,
          revocationReason: cert.revocationReason,
        }}
      />
    </main>
  );
}

export default function SharedCredentialPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-canvas paper-grain text-ink">
      <Header />
      <Suspense
        fallback={
          <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14">
            <PageSkeleton rows={4} />
          </main>
        }
      >
        <SharedCredentialContent params={params} />
      </Suspense>
      <Footer />
    </div>
  );
}
