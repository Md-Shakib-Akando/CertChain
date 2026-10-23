import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { Certificate } from '@/models/Certificate';
import { AuditLog } from '@/models/AuditLog';
import { RevocationRequest } from '@/models/RevocationRequest';

export async function GET() {
  try {
    await connectDB();

    const [
      activeIssuers,
      pendingIssuerApplications,
      pendingRevocations,
      confirmedRevocations,
      totalCertificatesInSystem,
      pendingAppsList,
      pendingRevocationsList,
      recentAuditLogs,
    ] = await Promise.all([
      User.countDocuments({ role: 'issuer', status: { $in: ['active', 'approved'] } }),
      User.countDocuments({ role: 'issuer', status: 'pending' }),
      RevocationRequest.countDocuments({
        workflowStatus: { $in: ['pending_review', 'awaiting_signature', 'submitted'] },
      }),
      RevocationRequest.countDocuments({ workflowStatus: 'confirmed' }),
      Certificate.countDocuments({}),
      User.find({ role: 'issuer', status: 'pending' })
        .select('name email department designation employeeId createdAt requestId')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      RevocationRequest.find({
        workflowStatus: { $in: ['pending_review', 'awaiting_signature', 'submitted'] },
      })
        .sort({ requestedAt: -1 })
        .limit(5)
        .lean(),
      AuditLog.find({
        $or: [
          { actorRole: 'controller' },
          { targetType: { $in: ['certificate', 'issuer', 'revocation'] } },
          { action: { $regex: /issuer|revoke|cosign|certificate/i } },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    // Build Prioritized Pending Actions List
    const pendingActions = [
      ...pendingRevocationsList.map((rev) => ({
        id: String(rev._id),
        type: 'revocation_request' as const,
        title: `Revocation Co-signature: ${rev.certificateId}`,
        subtitle: `Reason: ${rev.reason} (by ${rev.requestingIssuerName})`,
        targetRef: rev.certificateId,
        submittedAt: rev.requestedAt
          ? new Date(rev.requestedAt).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : 'Pending',
        priority: 'high' as const,
        actionTab: 'co-signature-center' as const,
      })),
      ...pendingAppsList.map((app) => ({
        id: String(app._id),
        type: 'issuer_application' as const,
        title: `Issuer Application: ${app.name}`,
        subtitle: `${app.designation || 'Staff'} - ${app.department || 'Academic'}`,
        targetRef: app.employeeId || app.requestId || 'APP-ID',
        submittedAt: app.createdAt
          ? new Date(app.createdAt).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : 'Pending',
        priority: 'medium' as const,
        actionTab: 'issuer-approvals' as const,
      })),
    ];

    // Format recent activity
    const recentActivity = recentAuditLogs.map((log) => ({
      id: String(log._id),
      title: log.action,
      description: log.details || `${log.action} performed on ${log.targetReference || 'system'}`,
      timestamp: log.createdAt
        ? new Date(log.createdAt).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'Recent',
      status: (log.outcome === 'success'
        ? 'success'
        : log.outcome === 'failure'
        ? 'failed'
        : 'pending') as 'success' | 'rejected' | 'failed' | 'pending',
      txHash: log.transactionHash,
    }));

    return NextResponse.json({
      success: true,
      stats: {
        activeIssuers,
        pendingIssuerApplications,
        pendingRevocations,
        confirmedRevocations,
        totalCertificatesInSystem,
        blockchainNetwork: {
          state: 'connected',
          networkName: 'Ethereum Sepolia Testnet',
          chainId: 11155111,
          contractAddress: '0x356A180CBD7F68897E815F54EB730CE85FD731D7',
          latestBlock: 7421890,
          lastSyncTime: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
          explorerUrl: 'https://sepolia.etherscan.io',
        },
      },
      pendingActions,
      recentActivity,
    });
  } catch (error) {
    console.error('Failed to query controller stats:', error);
    return NextResponse.json(
      {
        error: 'Failed to query database for controller stats.',
        details: error instanceof Error ? error.message : 'Database offline',
      },
      { status: 500 }
    );
  }
}
