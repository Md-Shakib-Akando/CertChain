import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Certificate } from '@/models/Certificate';
import { RevocationRequest } from '@/models/RevocationRequest';
import { AuditLog } from '@/models/AuditLog';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const cleanId = decodeURIComponent(id).trim();

    const body = await req.json();
    const {
      reason,
      evidenceNotes = '',
      issuerName = 'Registrar Office',
      issuerEmail = 'registrar@pub.ac.bd',
    } = body;

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Revocation reason is required' },
        { status: 400 }
      );
    }

    const cert = await Certificate.findOne({ id: cleanId });
    if (!cert) {
      return NextResponse.json({ success: false, message: 'Certificate not found' }, { status: 404 });
    }

    if (cert.status === 'revoked') {
      return NextResponse.json(
        { success: false, message: 'Certificate is already revoked' },
        { status: 400 }
      );
    }

    // Check if there is already an active pending request
    const existingReq = await RevocationRequest.findOne({
      certificateId: cleanId,
      workflowStatus: { $in: ['pending_review', 'awaiting_signature'] },
    });

    if (existingReq) {
      return NextResponse.json(
        { success: false, message: 'A revocation request is already pending review for this certificate' },
        { status: 409 }
      );
    }

    // Create Revocation Proposal
    const revocationProposal = await RevocationRequest.create({
      certificateId: cleanId,
      certificateType: cert.type,
      studentName: cert.studentName,
      studentId: cert.studentId,
      program: cert.program,
      issueDate: cert.issueDate,
      originalTxHash: cert.txHash,
      sha256Hash: cert.sha256Hash,
      requestingIssuerName: issuerName,
      requestingIssuerEmail: issuerEmail,
      reason,
      evidenceNotes,
      workflowStatus: 'pending_review',
      currentCertificateStatus: 'pending_revocation',
    });

    // Write Audit Log
    try {
      await AuditLog.create({
        actorRole: 'issuer',
        action: 'REVOCATION_PROPOSED',
        targetType: 'certificate',
        targetId: cleanId,
        targetReference: cert.studentName,
        outcome: 'warning',
        details: `Revocation proposed by ${issuerName}: ${reason}`,
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: 'Revocation request submitted. Awaiting Controller of Examinations cryptographic co-signature.',
      revocationRequest: revocationProposal,
    });
  } catch (error) {
    console.error('Error submitting revocation request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit revocation request', error: (error as Error).message },
      { status: 500 }
    );
  }
}
