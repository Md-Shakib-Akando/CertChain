import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { StudentRecord } from '@/models/StudentRecord';
import { OtpVerification } from '@/models/OtpVerification';
import { matchStudentRecord } from '@/lib/studentRecordMatcher';

// POST /api/auth/register-student/verify-otp
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, studentId, department, batch, email, otp, password } = body;

    // 1. Mandatory fields check
    if (!name?.trim() || !studentId?.trim() || !department?.trim() || !batch?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 }
      );
    }

    if (!otp?.trim() || otp.trim().length !== 6) {
      return NextResponse.json(
        { error: 'Please enter the 6-digit OTP.' },
        { status: 400 }
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    await connectDB();

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedStudentId = studentId.trim().toUpperCase();

    // 2. Validate OTP from MongoDB
    const validOtpDoc = await OtpVerification.findOne({
      $or: [{ email: normalizedEmail }, { studentId: normalizedStudentId }],
      otp: otp.trim(),
      expiresAt: { $gt: new Date() },
    });

    if (!validOtpDoc) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP code.' },
        { status: 400 }
      );
    }

    // 3. Find official university student record
    const officialRecord = await StudentRecord.findOne({
      $or: [{ studentId: normalizedStudentId }, { email: normalizedEmail }],
    });

    if (!officialRecord) {
      return NextResponse.json(
        { error: 'Invalid Student' },
        { status: 403 }
      );
    }

    // 4. Verify match against official record
    const matchResult = matchStudentRecord(
      {
        name: name.trim(),
        studentId: normalizedStudentId,
        department: department.trim(),
        batch: batch.trim(),
        email: normalizedEmail,
      },
      {
        name: officialRecord.name,
        studentId: officialRecord.studentId,
        dept: officialRecord.dept,
        department: officialRecord.department || officialRecord.dept || '',
        batch: officialRecord.batch,
        email: officialRecord.email,
      }
    );

    if (!matchResult.isMatch) {
      return NextResponse.json(
        { error: 'Invalid Student' },
        { status: 403 }
      );
    }

    // 5. Final check if an account was already created
    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { studentId: normalizedStudentId }],
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email or Student ID already exists. Please Sign In.' },
        { status: 409 }
      );
    }

    // 6. Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 7. Create User in MongoDB users collection with verified official credentials
    const academicStatus: 'Graduated' | 'Active' =
      officialRecord.status === 'Graduated' ? 'Graduated' : 'Active';

    const effectiveDept = officialRecord.dept || officialRecord.department || 'CSE';

    const newStudentUser = await User.create({
      name: officialRecord.name,
      email: officialRecord.email,
      studentId: officialRecord.studentId,
      department: effectiveDept,
      program: officialRecord.program || (effectiveDept === 'CSE' ? 'B.Sc. in Computer Science & Engineering' : `Undergraduate Degree in ${effectiveDept}`),
      batch: officialRecord.batch,
      phone: officialRecord.phone,
      session: officialRecord.session || '2024-2028',
      cgpa: officialRecord.cgpa || '3.89',
      enrollmentDate: officialRecord.enrollmentDate || 'January 10, 2024',
      graduationDate: officialRecord.graduationDate || 'October 15, 2028',
      academicStatus,
      passwordHash,
      role: 'student' as const,
      status: 'active' as const,
    });

    // 8. Update official student record status
    officialRecord.isRegistered = true;
    await officialRecord.save();

    // 9. Clean up used OTP from MongoDB
    await OtpVerification.deleteMany({
      $or: [{ email: normalizedEmail }, { studentId: normalizedStudentId }],
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Registration completed successfully.',
        data: {
          id: newStudentUser._id,
          name: newStudentUser.name,
          email: newStudentUser.email,
          studentId: newStudentUser.studentId,
          department: newStudentUser.department,
          batch: newStudentUser.batch,
          role: newStudentUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Verify OTP and register error:', error);
    return NextResponse.json(
      {
        error: 'Server error while verifying registration.',
      },
      { status: 500 }
    );
  }
}
