import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';

// GET /api/admin/registrations
export async function GET() {
  try {
    await connectDB();
    const users = await User.find({})
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    const totalStudents = users.filter((u) => u.role === 'student').length;
    const totalIssuers = users.filter((u) => u.role === 'issuer').length;
    const pendingRequests = users.filter((u) => u.status === 'pending').length;

    return NextResponse.json(
      {
        success: true,
        stats: {
          totalUsers: users.length,
          totalStudents,
          totalIssuers,
          pendingRequests,
        },
        users,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to fetch registrations:', error);
    return NextResponse.json(
      {
        error:
          'Failed to connect to MongoDB Atlas. Please ensure IP 0.0.0.0/0 is whitelisted in Atlas Network Access.',
        details: error instanceof Error ? error.message : 'Database error',
      },
      { status: 500 }
    );
  }
}
