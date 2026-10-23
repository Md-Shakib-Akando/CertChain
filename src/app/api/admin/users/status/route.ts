import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { AuditLog } from '@/models/AuditLog';

// POST /api/admin/users/status
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { userId, newStatus, reason, actorEmail = 'admin@pub.edu.bd' } = body;

    if (!userId || !newStatus) {
      return NextResponse.json(
        { error: 'User ID and new status are required.' },
        { status: 400 }
      );
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // Safeguard: Prevent suspending the last active Super Admin
    if (targetUser.role === 'admin' && newStatus === 'suspended') {
      const activeAdminCount = await User.countDocuments({
        role: 'admin',
        status: 'active',
      });
      if (activeAdminCount <= 1) {
        return NextResponse.json(
          {
            error:
              'Safety Constraint: Cannot suspend the last functioning Super Admin on the platform.',
          },
          { status: 403 }
        );
      }
    }

    const previousStatus = targetUser.status;
    targetUser.status = newStatus;
    await targetUser.save();

    // Record immutable audit event
    await AuditLog.create({
      actorEmail,
      actorRole: 'admin',
      action: newStatus === 'suspended' ? 'AccountSuspended' : 'AccountReactivated',
      targetType: 'user',
      targetId: targetUser._id.toString(),
      targetReference: `${targetUser.name} (${targetUser.email})`,
      outcome: 'success',
      details: reason || `Status changed from ${previousStatus} to ${newStatus}`,
      ipAddress: '127.0.0.1',
    });

    return NextResponse.json({
      success: true,
      message: `User ${targetUser.name} is now ${newStatus}.`,
      user: {
        id: targetUser._id.toString(),
        status: targetUser.status,
      },
    });
  } catch (error) {
    console.error('Failed to update user status:', error);
    return NextResponse.json(
      { error: 'Internal server error while updating user status.' },
      { status: 500 }
    );
  }
}
