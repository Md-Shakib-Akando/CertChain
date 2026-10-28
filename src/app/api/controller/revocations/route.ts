import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { RevocationRequest } from '@/models/RevocationRequest';
import { Certificate } from '@/models/Certificate';
import { AuditLog } from '@/models/AuditLog';
import { revokeOnChainServer } from '@/lib/web3/serverWeb3';

// GET /api/controller/revocations
export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    const query = searchParams.get('q')?.trim() || '';
    const statusFilter = searchParams.get('status')?.trim() || '';

    const filterObj: Record<string, unknown> = {};

    if (statusFilter && statusFilter !== 'all') {
      filterObj.workflowStatus = statusFilter;
    }

    if (query) {
      filterObj.$or = [
        { certificateId: { $regex: query, $options: 'i' } },
        { studentName: { $regex: query, $options: 'i' } },
        { studentId: { $regex: query, $options: 'i' } },
        { requestingIssuerName: { $regex: query, $options: 'i' } },
        { reason: { $regex: query, $options: 'i' } },
      ];
    }

    const requests = await RevocationRequest.find(filterObj)
      .sort({ requestedAt: -1 })
      .lean();

    const formatted = requests.map((r) => ({
      id: String(r._id),
      certificateId: r.certificateId,
      certificateType: r.certificateType,
      studentName: r.studentName,
      studentId: r.studentId,
      program: r.program,
      issueDate: r.issueDate,
      originalTxHash: r.originalTxHash,
      sha256Hash: r.sha256Hash,
      requestingIssuer: {
        name: r.requestingIssuerName,
        email: r.requestingIssuerEmail,
        department: r.requestingIssuerDepartment,
        authorizationStatus: r.requestingIssuerStatus,
        wallet: r.requestingIssuerWallet,
      },
      reason: r.reason,
      evidenceNotes: r.evidenceNotes,
      requestedAt: r.requestedAt
        ? new Date(r.requestedAt).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'Pending',
      currentStatus: r.currentCertificateStatus,
      workflowStatus: r.workflowStatus,
      transactionHash: r.transactionHash,
      blockNumber: r.blockNumber,
      controllerSignerEmail: r.controllerSignerEmail,
      controllerSignerWallet: r.controllerSignerWallet,
      controllerSignedAt: r.controllerSignedAt
        ? new Date(r.controllerSignedAt).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : undefined,
      controllerSignatureHash: r.controllerSignatureHash,
      rejectionReason: r.rejectionReason,
      failureReason: r.failureReason,
    }));

    return NextResponse.json({
      success: true,
      revocations: formatted,
    });
  } catch (error) {
    console.error('Failed to fetch revocation requests:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch revocation requests.',
        details: error instanceof Error ? error.message : 'Database error',
      },
      { status: 500 }
    );
  }
}

// POST /api/controller/revocations - Handle action on revocation request
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const {
      requestId,
      action,
      reason,
      signature,
      signerWallet,
      txHash,
      blockNumber,
      controllerEmail = 'controller@pub.edu.bd',
    } = body;

    if (!requestId || !action) {
      return NextResponse.json(
        { error: 'Revocation Request ID and action are required.' },
        { status: 400 }
      );
    }

    const revReq = await RevocationRequest.findById(requestId);
    if (!revReq) {
      return NextResponse.json({ error: 'Revocation request not found.' }, { status: 404 });
    }

    if (action === 'reject') {
      if (!reason || !reason.trim()) {
        return NextResponse.json(
          { error: 'A rejection reason is mandatory when rejecting a revocation request.' },
          { status: 400 }
        );
      }

      revReq.workflowStatus = 'rejected';
      revReq.rejectionReason = reason.trim();
      revReq.rejectedBy = controllerEmail;
      revReq.rejectedAt = new Date();
      // Ensure certificate remains unchanged per PDF Section 6.3: "Rejection must not revoke the certificate"
      revReq.currentCertificateStatus = 'valid';
      await revReq.save();

      // Ensure Certificate document in DB remains valid
      await Certificate.updateOne(
        { id: revReq.certificateId },
        { $set: { status: 'valid' } }
      );

      // Log in immutable audit trail
      await AuditLog.create({
        actorEmail: controllerEmail,
        actorRole: 'controller',
        action: 'CertificateRevocationRejected',
        targetType: 'certificate',
        targetId: revReq.certificateId,
        targetReference: `Certificate ${revReq.certificateId} (${revReq.studentName})`,
        outcome: 'failure',
        details: `Controller rejected certificate revocation request. Reason: ${reason.trim()}`,
        ipAddress: '127.0.0.1',
      });

      return NextResponse.json({
        success: true,
        message: `Revocation request for ${revReq.certificateId} rejected. Certificate status remains Valid.`,
        revocation: {
          id: revReq._id.toString(),
          workflowStatus: 'rejected',
          currentStatus: 'valid',
          rejectionReason: reason.trim(),
        },
      });
    } else if (action === 'approve_cosign') {
      // Step 1: Controller attaches cryptographic signature
      revReq.workflowStatus = 'awaiting_signature';
      revReq.controllerSignerEmail = controllerEmail;
      revReq.controllerSignerWallet = signerWallet || revReq.controllerSignerWallet;
      revReq.controllerSignedAt = new Date();
      if (signature) {
        revReq.controllerSignatureHash = signature;
        revReq.workflowStatus = 'submitted';
      }
      await revReq.save();

      await AuditLog.create({
        actorEmail: controllerEmail,
        actorRole: 'controller',
        action: 'CertificateRevocationCoSigned',
        targetType: 'certificate',
        targetId: revReq.certificateId,
        targetReference: `Certificate ${revReq.certificateId} (${revReq.studentName})`,
        outcome: 'success',
        details: `Controller co-signed revocation intent. Wallet: ${signerWallet || 'Web3'}. Signature: ${signature ? `${signature.slice(0, 16)}...` : 'Pending broadcast'}`,
        ipAddress: '127.0.0.1',
      });

      return NextResponse.json({
        success: true,
        message: 'Cryptographic co-signature recorded. Ready for on-chain broadcast.',
        revocation: {
          id: revReq._id.toString(),
          workflowStatus: revReq.workflowStatus,
          controllerSignatureHash: revReq.controllerSignatureHash,
        },
      });
    } else if (action === 'submit_tx') {
      if (!txHash) {
        return NextResponse.json({ error: 'Transaction hash is required.' }, { status: 400 });
      }

      revReq.workflowStatus = 'submitted';
      revReq.transactionHash = txHash;
      await revReq.save();

      await AuditLog.create({
        actorEmail: controllerEmail,
        actorRole: 'controller',
        action: 'RevocationTxSubmitted',
        targetType: 'blockchain',
        targetId: revReq.certificateId,
        targetReference: `Certificate ${revReq.certificateId}`,
        outcome: 'warning',
        details: `Smart contract revocation transaction submitted to blockchain. Awaiting confirmation.`,
        transactionHash: txHash,
        ipAddress: '127.0.0.1',
      });

      return NextResponse.json({
        success: true,
        message: 'Revocation transaction broadcast to Ethereum Sepolia. Awaiting block confirmation.',
        revocation: {
          id: revReq._id.toString(),
          workflowStatus: 'submitted',
          transactionHash: txHash,
        },
      });
    } else if (action === 'confirm_tx') {
      let finalTxHash = txHash || revReq.transactionHash;
      let finalBlockNumber = blockNumber;

      // Ensure real smart contract revocation is executed on-chain
      if (!finalTxHash || finalTxHash.startsWith('0xsimulated_') || finalTxHash.length !== 66) {
        const onChainResult = await revokeOnChainServer(revReq.certificateId, revReq.reason);
        finalTxHash = onChainResult.txHash;
        finalBlockNumber = onChainResult.blockNumber;
      }

      finalBlockNumber = finalBlockNumber || 7421898;

      revReq.workflowStatus = 'confirmed';
      revReq.currentCertificateStatus = 'revoked';
      revReq.transactionHash = finalTxHash;
      revReq.blockNumber = finalBlockNumber;
      await revReq.save();

      // Update actual Certificate in MongoDB database
      await Certificate.updateOne(
        { id: revReq.certificateId },
        {
          $set: {
            status: 'revoked',
            revocationDate: new Date().toISOString(),
            revocationReason: revReq.reason,
            revocationTxHash: finalTxHash,
          },
        }
      );

      // Log in immutable audit trail
      await AuditLog.create({
        actorEmail: controllerEmail,
        actorRole: 'controller',
        action: 'CertificateRevocationConfirmed',
        targetType: 'certificate',
        targetId: revReq.certificateId,
        targetReference: `Certificate ${revReq.certificateId} (${revReq.studentName})`,
        outcome: 'success',
        details: `Revocation confirmed on-chain in Block #${finalBlockNumber}. Reason: ${revReq.reason}`,
        transactionHash: finalTxHash,
        ipAddress: '127.0.0.1',
      });

      return NextResponse.json({
        success: true,
        message: `Certificate ${revReq.certificateId} successfully revoked on-chain! Block #${finalBlockNumber}.`,
        revocation: {
          id: revReq._id.toString(),
          workflowStatus: 'confirmed',
          currentStatus: 'revoked',
          transactionHash: finalTxHash,
          blockNumber: finalBlockNumber,
        },
      });
    } else if (action === 'fail_tx') {
      revReq.workflowStatus = 'failed';
      revReq.failureReason = reason || 'Transaction reverted or wallet rejected signature.';
      revReq.retryCount = (revReq.retryCount || 0) + 1;
      await revReq.save();

      await AuditLog.create({
        actorEmail: controllerEmail,
        actorRole: 'controller',
        action: 'RevocationTxFailed',
        targetType: 'blockchain',
        targetId: revReq.certificateId,
        targetReference: `Certificate ${revReq.certificateId}`,
        outcome: 'failure',
        details: `Revocation attempt failed: ${revReq.failureReason}. Safe retry available.`,
        ipAddress: '127.0.0.1',
      });

      return NextResponse.json({
        success: true,
        message: 'Revocation marked as failed. Safe retry is available.',
        revocation: {
          id: revReq._id.toString(),
          workflowStatus: 'failed',
          failureReason: revReq.failureReason,
        },
      });
    } else {
      return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 });
    }
  } catch (error) {
    console.error('Failed to process revocation action:', error);
    return NextResponse.json(
      {
        error: 'Internal server error while processing revocation.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
