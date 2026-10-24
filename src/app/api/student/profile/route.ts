import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { StudentRecord } from '@/models/StudentRecord';
import { Certificate } from '@/models/Certificate';

// Helper to extract session user identity from request
function getSessionIdentity(request: Request) {
  // 1. From cookie 'certchain_user'
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/(?:^|;\s*)certchain_user=([^;]*)/);
  if (match && match[1]) {
    try {
      const decoded = decodeURIComponent(match[1]);
      const parsed = JSON.parse(decoded);
      if (parsed && (parsed.email || parsed.id || parsed.studentId)) {
        return parsed;
      }
    } catch {
      // ignore JSON parse error
    }
  }

  // 2. From query string (e.g. ?email=... or ?studentId=...)
  const url = new URL(request.url);
  const emailQuery = url.searchParams.get('email');
  const studentIdQuery = url.searchParams.get('studentId');
  if (emailQuery || studentIdQuery) {
    return {
      email: emailQuery || undefined,
      studentId: studentIdQuery || undefined,
    };
  }

  // 3. From header
  const headerEmail = request.headers.get('x-user-email');
  if (headerEmail) {
    return { email: headerEmail };
  }

  return null;
}

// GET /api/student/profile
export async function GET(request: Request) {
  try {
    const identity = getSessionIdentity(request);

    if (!identity) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: No active student session found.' },
        { status: 401 }
      );
    }

    await connectDB();

    // Query user in MongoDB
    let user = null;
    if (identity.email) {
      user = await User.findOne({ email: identity.email.trim().toLowerCase() });
    }
    if (!user && identity.studentId) {
      user = await User.findOne({ studentId: identity.studentId.trim().toUpperCase() });
    }
    if (!user && identity.id) {
      user = await User.findById(identity.id);
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Student record not found in MongoDB database.' },
        { status: 404 }
      );
    }

    // Query official record from student-record collection for authoritative academic data
    const studentRecord = await StudentRecord.findOne({
      $or: [
        ...(user.studentId ? [{ studentId: user.studentId.trim() }] : []),
        ...(user.email ? [{ email: user.email.trim().toLowerCase() }] : []),
      ],
    });

    const studentDept = studentRecord?.dept || studentRecord?.department || user.department || user.dept || '';
    const studentBatch = studentRecord?.batch || user.batch || '';
    const studentProgram = studentRecord?.program || user.program || (studentDept ? `B.Sc. in ${studentDept}` : '');
    const studentSession = studentRecord?.session || user.session || '';

    // Format full academic profile strictly from database
    const profile = {
      id: user._id.toString(),
      name: user.name || studentRecord?.name || '',
      studentId: user.studentId || studentRecord?.studentId || '',
      department: studentDept,
      program: studentProgram,
      batch: studentBatch,
      session: studentSession,
      email: user.email || studentRecord?.email || '',
      phone: studentRecord?.phone || user.phone || '',
      cgpa: studentRecord?.cgpa || user.cgpa || '',
      enrollmentDate: studentRecord?.enrollmentDate || user.enrollmentDate || '',
      graduationDate: studentRecord?.graduationDate || user.graduationDate || '',
      status: (studentRecord?.status as 'Graduated' | 'Active') || (user.academicStatus as 'Graduated' | 'Active') || 'Active',
      lastLoginTime: user.lastLoginAt
        ? `${new Date(user.lastLoginAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })} at ${new Date(user.lastLoginAt).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })}`
        : `${new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}`,
    };

    // Query genuine student certificates from MongoDB
    const certDocs = await Certificate.find({
      $or: [
        ...(user.studentId ? [{ studentId: user.studentId }] : []),
        { studentEmail: user.email.toLowerCase() },
      ],
    }).sort({ createdAt: -1 });

    const certificates = (certDocs || []).map((c) => ({
      id: c.id,
      type: c.type,
      program: c.program || profile.program,
      session: c.session || profile.session,
      batch: c.batch || profile.batch,
      issueDate: c.issueDate,
      status: c.status,
      sha256Hash: c.sha256Hash,
      txHash: c.txHash,
      blockNumber: c.blockNumber,
      issuerAddress: c.issuerAddress,
      network: c.network,
      degreeName: c.degreeName,
      studentName: c.studentName || profile.name,
      studentId: c.studentId || profile.studentId,
      studentEmail: c.studentEmail || profile.email,
      cgpa: c.cgpa || profile.cgpa,
      version: c.version || 1,
      revocationDate: c.revocationDate,
      revocationReason: c.revocationReason,
      revocationTxHash: c.revocationTxHash,
      supersededBy: c.supersededBy,
    }));


    return NextResponse.json({
      success: true,
      profile,
      certificates,
    });
  } catch (error) {
    console.error('Error fetching student profile from database:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Database error fetching student profile.',
      },
      { status: 500 }
    );
  }
}
