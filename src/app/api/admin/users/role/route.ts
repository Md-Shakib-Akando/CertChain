import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { AuditLog } from '@/models/AuditLog';

// POST /api/admin/users/role
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { userId, newRole, reason, actorEmail = 'admin@pub.edu.bd' } = body;

    if (!userId || !newRole) {
      return NextResponse.json(
        { error: 'User ID and new role are required.' },
        { status: 400 }
      );
    }

    const validRoles = ['admin', 'controller', 'issuer', 'student'];
    if (!validRoles.includes(newRole)) {
      return NextResponse.json(
        { error: `Invalid role specified. Valid roles: ${validRoles.join(', ')}` },
        { status: 400 }
      );
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // Safeguard: Prevent demoting the last active Super Admin
    if (targetUser.role === 'admin' && newRole !== 'admin') {
      const activeAdminCount = await User.countDocuments({
        role: 'admin',
        status: 'active',
      });
      if (activeAdminCount <= 1) {
        return NextResponse.json(
          {
            error:
              'Safety Constraint: Cannot demote the last functioning Super Admin on the platform.',
          },
          { status: 403 }
        );
      }
    }

    const previousRole = targetUser.role;
    targetUser.role = newRole;
    await targetUser.save();

    // Record immutable audit event
    await AuditLog.create({
      actorEmail,
      actorRole: 'admin',
      action: 'UserRoleUpdated',
      targetType: 'user',
      targetId: targetUser._id.toString(),
      targetReference: `${targetUser.name} (${targetUser.email})`,
      outcome: 'success',
      details: reason
        ? `${reason} (Changed from ${previousRole} to ${newRole})`
        : `Role changed from ${previousRole} to ${newRole}`,
      ipAddress: '127.0.0.1',
    });

    return NextResponse.json({
      success: true,
      message: `Role for ${targetUser.name} successfully updated to ${newRole}.`,
      user: {
        id: targetUser._id.toString(),
        role: targetUser.role,
      },
    });
  } catch (error) {
    console.error('Failed to change user role:', error);
    return NextResponse.json(
      { error: 'Internal server error while changing user role.' },
      { status: 500 }
    );
  }
}
