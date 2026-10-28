import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { Certificate } from '@/models/Certificate';
import { AuditLog } from '@/models/AuditLog';

/**
 * GET /api/students
 * Retrieve or search registered student records
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q') || searchParams.get('search') || '';
    const dept = searchParams.get('dept');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = { role: 'student' };

    if (search.trim()) {
      filter.$or = [
        { name: new RegExp(search.trim(), 'i') },
        { studentId: new RegExp(search.trim(), 'i') },
        { email: new RegExp(search.trim(), 'i') },
        { department: new RegExp(search.trim(), 'i') },
      ];
    }

    if (dept && dept !== 'all') {
      filter.department = new RegExp(dept, 'i');
    }

    const students = await User.find(filter)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    // Attach count of issued certificates for each student
    const studentIds = students.map((s) => s.studentId).filter(Boolean);
    const certCounts = await Certificate.aggregate([
      { $match: { studentId: { $in: studentIds } } },
      { $group: { _id: '$studentId', count: { $sum: 1 } } },
    ]);

    const countMap = new Map(certCounts.map((c) => [c._id, c.count]));

    const enrichedStudents = students.map((s) => ({
      ...s,
      id: String(s._id),
      certificateCount: s.studentId ? countMap.get(s.studentId) || 0 : 0,
    }));

    return NextResponse.json({
      success: true,
      students: enrichedStudents,
      total: enrichedStudents.length,
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch student directory' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/students
 * Create a new student academic record
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const {
      studentId,
      name,
      email,
      department = 'Computer Science & Engineering',
      program = 'B.Sc. in Computer Science & Engineering',
      batch = '42nd',
      session = '2020 - 2024',
      cgpa = '3.80',
      phone,
    } = body;

    if (!studentId || !name || !email) {
      return NextResponse.json(
        { success: false, message: 'Student ID, Name, and Email are mandatory.' },
        { status: 400 }
      );
    }

    const cleanId = studentId.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();

    // Check duplicates
    const existing = await User.findOne({
      $or: [{ studentId: cleanId }, { email: cleanEmail }],
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message:
            existing.studentId === cleanId
              ? `Student with ID ${cleanId} already exists.`
              : `A user with email ${cleanEmail} is already registered.`,
        },
        { status: 409 }
      );
    }

    // Default student record
    const student = await User.create({
      studentId: cleanId,
      name: name.trim(),
      email: cleanEmail,
      role: 'student',
      status: 'active',
      department,
      dept: department,
      program,
      batch,
      session,
      cgpa,
      phone,
      academicStatus: 'Graduated',
      passwordHash: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6x8ecgy5pLBIgkNyfvTm', // Default initial hash (Student@123)
    });

    // Record in Audit Trail
    try {
      await AuditLog.create({
        actorRole: 'issuer',
        action: 'STUDENT_RECORD_CREATED',
        targetType: 'student',
        targetId: cleanId,
        targetReference: name.trim(),
        outcome: 'success',
        details: `Created student record for ${name.trim()} (${cleanId}), Department: ${department}, Batch: ${batch}`,
        ipAddress: '127.0.0.1',
      });
    } catch (auditErr) {
      console.warn('Non-fatal: Audit log write failed', auditErr);
    }

    return NextResponse.json({
      success: true,
      message: `Student record for ${name.trim()} (${cleanId}) created successfully!`,
      student: {
        id: String(student._id),
        studentId: student.studentId,
        name: student.name,
        email: student.email,
        department: student.department,
        program: student.program,
        batch: student.batch,
        session: student.session,
        cgpa: student.cgpa,
      },
    });
  } catch (error) {
    console.error('Error creating student record:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create student record: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
