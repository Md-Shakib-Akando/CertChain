import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { AuditLog } from '@/models/AuditLog';

// GET /api/auth/setup-password?token=...
export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token')?.trim();

    if (!token) {
      return NextResponse.json(
        { error: 'Invitation token is missing from the request URL.' },
        { status: 400 }
      );
    }

    let user = await User.findOne({ invitationToken: token });
    if (!user) {
      const rawUser = await User.collection.findOne({ invitationToken: token });
      if (rawUser) {
        user = await User.findById(rawUser._id);
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'This invitation link is invalid or has already been used.' },
        { status: 404 }
      );
    }

    if (user.invitationExpiresAt && new Date(user.invitationExpiresAt).getTime() < Date.now()) {
      return NextResponse.json(
        { error: 'This invitation link has expired (valid for 24 hours). Please contact the Super Admin.' },
        { status: 410 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department || 'Office of the Controller of Examinations',
        designation: user.designation || 'Controller of Examinations',
      },
    });
  } catch (error) {
    console.error('Validate setup password token error:', error);
    return NextResponse.json(
      { error: 'Server error while validating invitation token.' },
      { status: 500 }
    );
  }
}

// POST /api/auth/setup-password
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { token, password } = body;

    if (!token?.trim()) {
      return NextResponse.json(
        { error: 'Invitation token is required.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters in length.' },
        { status: 400 }
      );
    }

    const cleanToken = token.trim();
    let user = await User.findOne({ invitationToken: cleanToken });
    if (!user) {
      const rawUser = await User.collection.findOne({ invitationToken: cleanToken });
      if (rawUser) {
        user = await User.findById(rawUser._id);
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'This invitation link is invalid or has already been used.' },
        { status: 404 }
      );
    }

    if (user.invitationExpiresAt && new Date(user.invitationExpiresAt).getTime() < Date.now()) {
      return NextResponse.json(
        { error: 'This invitation link has expired. Please contact the Super Admin.' },
        { status: 410 }
      );
    }

    // Hash and store the new master password
    const passwordHash = await bcrypt.hash(password, 10);
    user.passwordHash = passwordHash;
    user.status = 'active';
    user.invitationToken = undefined;
    user.invitationExpiresAt = undefined;
    await user.save();

    // Direct collection update failsafe
    await User.collection.updateOne(
      { _id: user._id },
      {
        $set: {
          passwordHash,
          status: 'active',
        },
        $unset: {
          invitationToken: '',
          invitationExpiresAt: '',
        },
      }
    );

    await AuditLog.create({
      actorEmail: user.email,
      actorRole: user.role,
      action: 'ControllerPasswordSetupCompleted',
      targetType: 'user',
      targetId: user._id.toString(),
      targetReference: `${user.name} (${user.email})`,
      outcome: 'success',
      details: 'Controller of Examinations successfully configured account master password.',
      ipAddress: '127.0.0.1',
    });

    return NextResponse.json({
      success: true,
      message: 'Master password configured successfully! You can now log in to the Controller Desk.',
    });
  } catch (error) {
    console.error('Setup password error:', error);
    return NextResponse.json(
      { error: 'Internal server error while configuring password.' },
      { status: 500 }
    );
  }
}
