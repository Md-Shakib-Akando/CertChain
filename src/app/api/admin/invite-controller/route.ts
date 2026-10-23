import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { AuditLog } from '@/models/AuditLog';
import { sendBrevoControllerInvitationEmail } from '@/lib/brevo';

// POST /api/admin/invite-controller
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const {
      name,
      email,
      department = 'Office of the Controller of Examinations',
      actorEmail = 'admin@pub.edu.bd',
    } = body;

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: 'Controller name and official university email are required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Determine application origin for setup link
    const hostHeader = request.headers.get('host') || 'localhost:3000';
    const originHeader = request.headers.get('origin');
    const protocol = hostHeader.includes('localhost') ? 'http' : 'https';
    const origin = originHeader || `${protocol}://${hostHeader}`;

    // Cryptographically secure invitation token valid for 24 hours
    const invitationToken = crypto.randomBytes(32).toString('hex');
    const invitationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const setupLink = `${origin}/auth/setup-password?token=${invitationToken}`;

    // Check if user already exists
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      if (existing.role === 'controller' && existing.status === 'active' && !existing.invitationToken) {
        return NextResponse.json(
          { error: 'An active Controller of Examinations account already exists with this email.' },
          { status: 409 }
        );
      }

      // Upgrade role or re-issue invitation
      existing.role = 'controller';
      existing.status = 'pending';
      existing.department = department.trim();
      existing.invitationToken = invitationToken;
      existing.invitationExpiresAt = invitationExpiresAt;
      await existing.save();

      // Direct collection update failsafe
      await User.collection.updateOne(
        { _id: existing._id },
        {
          $set: {
            role: 'controller',
            status: 'pending',
            department: department.trim(),
            invitationToken,
            invitationExpiresAt,
          },
        }
      );

      // Dispatch invitation email via Brevo
      const emailResult = await sendBrevoControllerInvitationEmail({
        toEmail: normalizedEmail,
        toName: existing.name,
        setupLink,
        expiresHours: 24,
      });

      await AuditLog.create({
        actorEmail,
        actorRole: 'admin',
        action: 'ControllerAccountProvisioned',
        targetType: 'user',
        targetId: existing._id.toString(),
        targetReference: `${existing.name} (${existing.email})`,
        outcome: 'success',
        details: `Invitation link dispatched via Brevo (${emailResult.isSimulated ? 'Simulated' : 'Delivered'}).`,
        ipAddress: '127.0.0.1',
      });

      return NextResponse.json({
        success: true,
        message: `Invitation email successfully dispatched to ${existing.email}.`,
        email: existing.email,
        isSimulated: emailResult.isSimulated,
      });
    }

    // Provision new Controller record with pending password setup
    const placeholderSecret = crypto.randomBytes(24).toString('hex');
    const passwordHash = await bcrypt.hash(placeholderSecret, 10);

    const newController = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      department: department.trim(),
      designation: 'Controller of Examinations',
      passwordHash,
      role: 'controller',
      status: 'pending',
      employeeId: `EMP-CTRL-${Math.floor(100 + Math.random() * 900)}`,
      invitationToken,
      invitationExpiresAt,
    });

    // Direct collection update failsafe
    await User.collection.updateOne(
      { _id: newController._id },
      {
        $set: {
          invitationToken,
          invitationExpiresAt,
        },
      }
    );

    // Dispatch invitation email via Brevo
    const emailResult = await sendBrevoControllerInvitationEmail({
      toEmail: normalizedEmail,
      toName: name.trim(),
      setupLink,
      expiresHours: 24,
    });

    await AuditLog.create({
      actorEmail,
      actorRole: 'admin',
      action: 'ControllerAccountProvisioned',
      targetType: 'user',
      targetId: newController._id.toString(),
      targetReference: `${newController.name} (${newController.email})`,
      outcome: 'success',
      details: `Created Controller account and dispatched setup invitation email (${emailResult.isSimulated ? 'Simulated' : 'Delivered'}).`,
      ipAddress: '127.0.0.1',
    });

    return NextResponse.json({
      success: true,
      message: `Invitation email successfully dispatched to ${normalizedEmail}.`,
      email: normalizedEmail,
      isSimulated: emailResult.isSimulated,
    });
  } catch (error) {
    console.error('Failed to provision controller:', error);
    return NextResponse.json(
      { error: 'Internal server error while provisioning controller account.' },
      { status: 500 }
    );
  }
}
