import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';

// POST /api/auth/login
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email?.trim() || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    await connectDB();

    const identifier = email.trim();
    const normalizedEmail = identifier.toLowerCase();

    // Support login via Email, Student ID, or Employee ID
    const user = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { studentId: identifier },
        { studentId: identifier.toUpperCase() },
        { employeeId: identifier },
        { employeeId: identifier.toUpperCase() },
      ],
    });

    if (!user) {
      return NextResponse.json(
        { error: `No account found for "${identifier}". Please check your Email, Student ID, or Employee ID.` },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid password. Please check your credentials.' },
        { status: 401 }
      );
    }

    // Check if staff issuer account is still pending
    if (user.role === 'issuer' && user.status === 'pending') {
      return NextResponse.json(
        {
          success: false,
          isPending: true,
          error: `Your staff account request (${user.requestId || 'Pending'}) is awaiting Controller verification and Smart Contract authorization.`,
          user: {
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            requestId: user.requestId,
          },
        },
        { status: 403 }
      );
    }

    // Check if account is suspended
    if (user.status === 'suspended') {
      return NextResponse.json(
        {
          error: 'Your account has been suspended by system administration. Please contact support.',
        },
        { status: 403 }
      );
    }

    // Determine redirect destination based on role
    let redirectUrl = '/dashboard/student';
    if (user.role === 'admin' || user.role === 'super_admin') {
      redirectUrl = '/admin/dashboard';
    } else if (user.role === 'controller') {
      redirectUrl = '/dashboard/controller';
    } else if (user.role === 'issuer') {
      redirectUrl = '/dashboard/issuer';
    } else if (user.role === 'student') {
      redirectUrl = '/dashboard/student';
    }

    const userData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      department: user.department,
      walletAddress: user.walletAddress,
      studentId: user.studentId,
      employeeId: user.employeeId,
    };

    const response = NextResponse.json(
      {
        success: true,
        message: `Welcome back, ${user.name}!`,
        user: userData,
        redirectUrl,
      },
      { status: 200 }
    );

    response.cookies.set({
      name: 'certchain_user',
      value: JSON.stringify(userData),
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Login authentication error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Authentication service error.',
      },
      { status: 500 }
    );
  }
}
