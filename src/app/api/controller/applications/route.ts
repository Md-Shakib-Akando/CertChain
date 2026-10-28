import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { AuditLog } from '@/models/AuditLog';
import { addIssuerOnChainServer } from '@/lib/web3/serverWeb3';

// GET /api/controller/applications
export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    const query = searchParams.get('q')?.trim() || '';
    const statusFilter = searchParams.get('status')?.trim() || '';

    const filterObj: Record<string, unknown> = {
      role: 'issuer',
    };

    if (statusFilter && statusFilter !== 'all') {
      filterObj.status = statusFilter;
    }

    if (query) {
      filterObj.$or = [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { employeeId: { $regex: query, $options: 'i' } },
        { department: { $regex: query, $options: 'i' } },
      ];
    }

    const issuers = await User.find(filterObj)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .lean();

    const formattedApplications = issuers.map((u) => ({
      id: String(u._id),
      name: u.name,
      email: u.email,
      department: u.department || 'Office of the Registrar',
      designation: u.designation || 'Assistant Registrar / Issuer',
      employeeId: u.employeeId || 'EMP-UNSET',
      requestedRole: 'Registrar / Issuer',
      submittedAt: u.createdAt
        ? new Date(u.createdAt).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'Submitted',
      status: (u.status === 'approved' || u.status === 'active'
        ? 'approved'
        : u.status === 'rejected'
        ? 'rejected'
        : 'pending') as 'pending' | 'approved' | 'rejected' | 'more_info_required',
      walletAddress: u.walletAddress,
      isWalletVerified: Boolean(u.isWalletVerified),
      contractAuthorization: (u.status === 'active' || u.status === 'approved'
        ? 'authorized'
        : u.status === 'pending'
        ? 'pending'
        : 'unauthorized') as 'authorized' | 'unauthorized' | 'pending' | 'unknown',
      accountStatus: (u.status === 'suspended' ? 'suspended' : 'active') as 'active' | 'suspended',
      issuedCertificatesCount: 0,
      rejectionReason: u.rejectionReason,
      requestId: u.requestId,
      notes: (u as { moreInfoNotes?: string }).moreInfoNotes,
    }));

    return NextResponse.json({
      success: true,
      applications: formattedApplications,
    });
  } catch (error) {
    console.error('Failed to fetch issuer applications:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch issuer applications.',
        details: error instanceof Error ? error.message : 'Database error',
      },
      { status: 500 }
    );
  }
}

// POST /api/controller/applications - Approve, Reject, or Request More Info
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const {
      applicationId,
      action,
      reason,
      infoNotes,
      controllerEmail = 'controller@pub.edu.bd',
      txHash,
    } = body;

    if (!applicationId || !action) {
      return NextResponse.json(
        { error: 'Application ID and action are required.' },
        { status: 400 }
      );
    }

    const applicant = await User.findById(applicationId);
    if (!applicant) {
      return NextResponse.json({ error: 'Application not found.' }, { status: 404 });
    }

    if (action === 'approve') {
      let onChainTx = txHash;
      if (applicant.walletAddress && (!onChainTx || onChainTx.startsWith('0xsimulated_') || onChainTx.length !== 66)) {
        const chainRes = await addIssuerOnChainServer(applicant.walletAddress);
        onChainTx = chainRes.txHash;
      }

      applicant.status = 'active';
      applicant.approvedAt = new Date();
      await applicant.save();

      // Log immutable audit event per PDF
      await AuditLog.create({
        actorEmail: controllerEmail,
        actorRole: 'controller',
        action: 'IssuerAuthorized',
        targetType: 'issuer',
        targetId: applicant._id.toString(),
        targetReference: `${applicant.name} (${applicant.email})`,
        outcome: 'success',
        details: `Issuer application authorized by Controller and registered in smart contract. Designation: ${applicant.designation || 'Issuer'}. Wallet: ${applicant.walletAddress || 'None'}. On-chain Tx: ${onChainTx || 'Anchored'}.`,
        transactionHash: onChainTx || undefined,
        ipAddress: '127.0.0.1',
      });

      return NextResponse.json({
        success: true,
        message: `Issuer account for ${applicant.name} officially authorized on-chain!`,
        application: {
          id: applicant._id.toString(),
          status: 'approved',
          accountStatus: 'active',
          contractAuthorization: 'authorized',
          transactionHash: onChainTx,
        },
      });
    } else if (action === 'reject') {
      if (!reason || !reason.trim()) {
        return NextResponse.json(
          { error: 'A specific reason is mandatory when rejecting an application.' },
          { status: 400 }
        );
      }

      applicant.status = 'rejected';
      applicant.rejectionReason = reason.trim();
      await applicant.save();

      // Log audit event
      await AuditLog.create({
        actorEmail: controllerEmail,
        actorRole: 'controller',
        action: 'IssuerApplicationRejected',
        targetType: 'issuer',
        targetId: applicant._id.toString(),
        targetReference: `${applicant.name} (${applicant.email})`,
        outcome: 'failure',
        details: `Application rejected by Controller. Reason: ${reason.trim()}`,
        ipAddress: '127.0.0.1',
      });

      return NextResponse.json({
        success: true,
        message: `Issuer application for ${applicant.name} has been rejected.`,
        application: {
          id: applicant._id.toString(),
          status: 'rejected',
          rejectionReason: reason.trim(),
        },
      });
    } else if (action === 'request_info') {
      if (!infoNotes || !infoNotes.trim()) {
        return NextResponse.json(
          { error: 'Clarification notes are required to request more information.' },
          { status: 400 }
        );
      }

      (applicant as unknown as { moreInfoNotes?: string }).moreInfoNotes = infoNotes.trim();
      await applicant.save();

      await AuditLog.create({
        actorEmail: controllerEmail,
        actorRole: 'controller',
        action: 'IssuerInfoRequested',
        targetType: 'issuer',
        targetId: applicant._id.toString(),
        targetReference: `${applicant.name} (${applicant.email})`,
        outcome: 'warning',
        details: `Additional documentation requested by Controller: ${infoNotes.trim()}`,
        ipAddress: '127.0.0.1',
      });

      return NextResponse.json({
        success: true,
        message: `Requested additional information from ${applicant.name}.`,
      });
    } else {
      return NextResponse.json({ error: 'Invalid action specified.' }, { status: 400 });
    }
  } catch (error) {
    console.error('Failed to process issuer application action:', error);
    return NextResponse.json(
      {
        error: 'Internal server error while processing application.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
