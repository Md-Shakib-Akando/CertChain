import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { AuditLog } from '@/models/AuditLog';

/**
 * GET /api/issuer/audit-logs
 * Fetch immutable audit trail events for Registrar / Issuer
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q') || '';
    const action = searchParams.get('action');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (action && action !== 'all') {
      filter.action = action;
    }

    if (search.trim()) {
      filter.$or = [
        { targetId: new RegExp(search.trim(), 'i') },
        { targetReference: new RegExp(search.trim(), 'i') },
        { details: new RegExp(search.trim(), 'i') },
        { transactionHash: new RegExp(search.trim(), 'i') },
      ];
    }

    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({
      success: true,
      count: logs.length,
      logs: logs.map((l) => ({
        id: String(l._id),
        action: l.action,
        actorRole: l.actorRole,
        actorEmail: l.actorEmail || 'registrar@pub.ac.bd',
        targetType: l.targetType,
        targetId: l.targetId,
        targetReference: l.targetReference,
        outcome: l.outcome,
        details: l.details,
        transactionHash: l.transactionHash,
        ipAddress: l.ipAddress || '127.0.0.1',
        timestamp: l.createdAt ? new Date(l.createdAt).toLocaleString('en-US') : 'Recent',
      })),
    });
  } catch (error) {
    console.error('Error fetching issuer audit logs:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}
