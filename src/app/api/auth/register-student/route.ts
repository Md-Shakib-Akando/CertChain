import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';

// POST /api/auth/register-student
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, studentId, password } = body;

    // 1. Mandatory fields validation
    if (!name?.trim() || !email?.trim() || !studentId?.trim() || !password) {
      return NextResponse.json(
        { error: 'All fields (Name, University Email, Student ID, Password) are required.' },
        { status: 400 }
      );
    }

    // 2. Connect to MongoDB
    try {
      await connectDB();
    } catch (dbError) {
      console.error('MongoDB Connection Error:', dbError);
      return NextResponse.json(
        {
          error:
            'MongoDB connection failed. Please ensure MongoDB is running (e.g. mongod or MongoDB Compass) or update MONGODB_URI in .env.local.',
          details: dbError instanceof Error ? dbError.message : 'Database offline',
        },
        { status: 503 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedStudentId = studentId.trim().toUpperCase();

    // 3. Conflict checks
    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return NextResponse.json(
        { error: 'An account with this university email already exists.' },
        { status: 409 }
      );
    }

    const existingStudentId = await User.findOne({ studentId: normalizedStudentId });
    if (existingStudentId) {
      return NextResponse.json(
        { error: `Student ID "${normalizedStudentId}" is already registered.` },
        { status: 409 }
      );
    }

    // 4. Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 5. Save student directly to MongoDB (Active role, NO crypto wallet required)
    const newStudent = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      studentId: normalizedStudentId,
      passwordHash,
      role: 'student',
      status: 'active', // Active immediately
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Student account registered successfully in MongoDB.',
        data: {
          id: newStudent._id,
          name: newStudent.name,
          email: newStudent.email,
          studentId: newStudent.studentId,
          role: newStudent.role,
          status: newStudent.status,
          createdAt: newStudent.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Student registration error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error while registering student.',
      },
      { status: 500 }
    );
  }
}
