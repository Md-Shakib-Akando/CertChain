import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { AuditLog } from '@/models/AuditLog';

// GET /api/controller/audit-logs
export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    const query = searchParams.get('q')?.trim() || '';
    const eventType = searchParams.get('type')?.trim() || '';
    const status = searchParams.get('status')?.trim() || '';

    const filterObj: Record<string, unknown> = {};

    if (eventType && eventType !== 'all') {
      filterObj.action = { $regex: eventType, $options: 'i' };
    }

    if (status && status !== 'all') {
      filterObj.outcome = status;
    }

    if (query) {
      filterObj.$or = [
        { action: { $regex: query, $options: 'i' } },
        { actorEmail: { $regex: query, $options: 'i' } },
        { targetReference: { $regex: query, $options: 'i' } },
        { details: { $regex: query, $options: 'i' } },
        { transactionHash: { $regex: query, $options: 'i' } },
      ];
    }

    const logs = await AuditLog.find(filterObj)
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    const formatted = logs.map((log) => ({
      id: String(log._id),
      eventType: log.action,
      actor: log.actorEmail || 'Controller of Examinations',
      actorRole: log.actorRole || 'controller',
      targetReference: log.targetReference || log.targetId || 'N/A',
      timestamp: log.createdAt
        ? new Date(log.createdAt).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
        : 'Recorded',
      isBlockchainEvent: Boolean(log.transactionHash),
      blockTimestamp: log.createdAt
        ? new Date(log.createdAt).toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
        : undefined,
      result: (log.outcome === 'success'
        ? 'success'
        : log.outcome === 'failure'
        ? 'rejected'
        : 'pending') as 'success' | 'pending' | 'rejected' | 'failed',
      transactionHash: log.transactionHash,
      blockNumber: log.transactionHash ? 7421890 : undefined,
      network: log.transactionHash ? 'Ethereum Sepolia Testnet' : undefined,
      details: log.details || '',
    }));

    return NextResponse.json({
      success: true,
      logs: formatted,
    });
  } catch (error) {
    console.error('Failed to query audit logs for controller:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch audit records.',
        details: error instanceof Error ? error.message : 'Database error',
      },
      { status: 500 }
    );
  }
}
