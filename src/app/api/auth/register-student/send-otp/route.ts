import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { StudentRecord } from '@/models/StudentRecord';
import { OtpVerification } from '@/models/OtpVerification';
import { sendBrevoOtpEmail } from '@/lib/brevo';
import { matchStudentRecord } from '@/lib/studentRecordMatcher';

// POST /api/auth/register-student/send-otp
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, studentId, department, batch, email } = body;

    // 1. Mandatory fields check
    if (!name?.trim() || !studentId?.trim() || !department?.trim() || !batch?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    await connectDB();

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedStudentId = studentId.trim().toUpperCase();

    // 2. Check if student has already registered an account
    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { studentId: normalizedStudentId }],
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this Student ID or Email is already registered. Please proceed to Sign In.' },
        { status: 409 }
      );
    }

    // 3. Find record in official MongoDB student-record collection
    const officialRecord = await StudentRecord.findOne({
      $or: [{ studentId: normalizedStudentId }, { email: normalizedEmail }],
    });

    if (!officialRecord) {
      // Return simple "Invalid Student" with zero leaked details
      return NextResponse.json(
        { error: 'Invalid Student' },
        { status: 403 }
      );
    }

    // 4. Validate all submitted fields match the student-record collection
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
      // Return simple "Invalid Student" with zero leaked details
      return NextResponse.json(
        { error: 'Invalid Student' },
        { status: 403 }
      );
    }

    // 5. Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 6. Delete previous OTPs for this student/email to avoid confusion
    await OtpVerification.deleteMany({
      $or: [{ email: normalizedEmail }, { studentId: normalizedStudentId }],
    });

    // 7. Store OTP in MongoDB with 10-minute expiry
    await OtpVerification.create({
      email: normalizedEmail,
      studentId: normalizedStudentId,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    // 8. Dispatch OTP email directly to the student via Brevo Free Plan API
    await sendBrevoOtpEmail({
      toEmail: normalizedEmail,
      toName: officialRecord.name,
      otp,
      studentId: officialRecord.studentId,
    });

    // Note: Do NOT expose devOtp or sensitive details in response
    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${normalizedEmail}.`,
    });
  } catch (error) {
    console.error('Send OTP registration error:', error);
    return NextResponse.json(
      {
        error: 'Server error while sending OTP.',
      },
      { status: 500 }
    );
  }
}
