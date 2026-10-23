import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { AuditLog } from '@/models/AuditLog';

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    const query = searchParams.get('q')?.trim() || '';
    const roleFilter = searchParams.get('role')?.trim() || '';
    const statusFilter = searchParams.get('status')?.trim() || '';

    const filterObj: Record<string, unknown> = {};

    if (roleFilter && roleFilter !== 'all') {
      filterObj.role = roleFilter;
    }

    if (statusFilter && statusFilter !== 'all') {
      filterObj.status = statusFilter;
    }

    if (query) {
      filterObj.$or = [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { studentId: { $regex: query, $options: 'i' } },
        { employeeId: { $regex: query, $options: 'i' } },
      ];
    }

    const users = await User.find(filterObj)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .lean();

    const formattedUsers = users.map((u) => ({
      id: String(u._id),
      name: u.name,
      email: u.email,
      role: u.role || 'student',
      status: u.status || 'active',
      department: u.department || u.dept || (u.role === 'student' ? 'CSE' : 'Administration'),
      studentId: u.studentId,
      employeeId: u.employeeId,
      designation: u.designation,
      walletAddress: u.walletAddress,
      createdAt: u.createdAt
        ? new Date(u.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : 'Official',
      lastLoginAt: u.lastLoginAt
        ? new Date(u.lastLoginAt).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'Active Session',
    }));

    return NextResponse.json({
      success: true,
      users: formattedUsers,
      total: formattedUsers.length,
    });
  } catch (error) {
    console.error('Failed to query users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users from database.' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users - Permanently delete user from MongoDB database
export async function DELETE(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { userId, reason, actorEmail = 'admin@pub.edu.bd' } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required for deletion.' },
        { status: 400 }
      );
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found in database.' },
        { status: 404 }
      );
    }

    // Safety Constraint: Do not allow deleting the last remaining Super Admin
    if (targetUser.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return NextResponse.json(
          {
            error:
              'Safety Constraint: Cannot delete the only remaining Super Admin on the platform.',
          },
          { status: 403 }
        );
      }
    }

    // Hard delete directly from MongoDB
    await User.findByIdAndDelete(userId);

    // Record permanent audit log
    await AuditLog.create({
      actorEmail,
      actorRole: 'admin',
      action: 'UserPermanentlyDeleted',
      targetType: 'user',
      targetId: String(targetUser._id),
      targetReference: `${targetUser.name} (${targetUser.email})`,
      outcome: 'success',
      details: reason
        ? `Permanently removed from database: ${reason}`
        : 'User account permanently erased from MongoDB by Super Admin.',
      ipAddress: '127.0.0.1',
    });

    return NextResponse.json({
      success: true,
      message: `User ${targetUser.name} (${targetUser.email}) has been permanently deleted from the database.`,
      deletedUserId: String(targetUser._id),
    });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json(
      {
        error: 'Internal server error while deleting user from database.',
        details: error instanceof Error ? error.message : 'Unknown database error',
      },
      { status: 500 }
    );
  }
}
