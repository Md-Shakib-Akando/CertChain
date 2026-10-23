import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { AuditLog } from '@/models/AuditLog';

export const dynamic = 'force-dynamic';

// GET /api/admin/audit-logs
export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    const query = searchParams.get('q')?.trim() || '';
    const role = searchParams.get('role')?.trim() || '';
    const action = searchParams.get('action')?.trim() || '';

    const filterObj: Record<string, unknown> = {};

    if (role && role !== 'all') {
      filterObj.actorRole = role;
    }

    if (action && action !== 'all') {
      filterObj.action = action;
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

    const formattedLogs = logs.map((log) => ({
      id: String(log._id),
      timestamp: log.createdAt
        ? new Date(log.createdAt).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'Recent',
      actorEmail: log.actorEmail || 'system@pub.edu.bd',
      actorRole: log.actorRole || 'system',
      action: log.action,
      targetType: log.targetType,
      targetId: log.targetId,
      targetReference: log.targetReference || log.targetId || 'N/A',
      outcome: log.outcome || 'success',
      details: log.details || '',
      ipAddress: log.ipAddress || '127.0.0.1',
      transactionHash: log.transactionHash,
    }));

    return NextResponse.json({
      success: true,
      logs: formattedLogs,
      total: formattedLogs.length,
    });
  } catch (error) {
    console.error('Failed to query audit logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit logs from database.' },
      { status: 500 }
    );
  }
}
