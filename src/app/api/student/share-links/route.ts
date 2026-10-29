import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/mongodb';
import { ShareLink } from '@/models/ShareLink';
import { Certificate } from '@/models/Certificate';
import { AuditLog } from '@/models/AuditLog';

/**
 * GET /api/student/share-links
 * List share links for student
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId') || searchParams.get('email');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};
    if (studentId) {
      filter.createdBy = studentId;
    }

    const links = await ShareLink.find(filter).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, links });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch share links', error: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/student/share-links
 * Generate a new time-limited share token
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const {
      certId,
      certType,
      createdBy = 'STUDENT',
      recipientLabel = 'Prospective Employer',
      durationHours = 24,
      maxViews = null,
      includeDetails = false,
    } = body;

    if (!certId) {
      return NextResponse.json({ success: false, message: 'Certificate ID is required' }, { status: 400 });
    }

    const cert = await Certificate.findOne({ id: certId });
    if (!cert) {
      return NextResponse.json({ success: false, message: 'Certificate not found' }, { status: 404 });
    }

    const resolvedCreatedBy =
      createdBy && createdBy !== 'STUDENT'
        ? createdBy
        : cert.studentId || cert.studentEmail || 'STUDENT';
    const resolvedCertType = certType || cert.type || 'Degree Certificate';

    // 1. Generate 32 secure random bytes for token
    const token = crypto.randomBytes(32).toString('hex');

    // 2. Compute SHA-256 of the token (only hash stored in DB per PRD Section 11.5)
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // 3. Compute Expiration Date
    const expiresAt = new Date(Date.now() + durationHours * 3600 * 1000);

    // 4. Save to Database
    const newShareLink = await ShareLink.create({
      certId,
      certType: resolvedCertType,
      token,
      tokenHash,
      createdBy: resolvedCreatedBy,
      recipientLabel,
      durationHours,
      expiresAt,
      maxViews,
      includeDetails: Boolean(includeDetails),
      status: 'active',
      viewCount: 0,
    });

    // 5. Audit Log
    try {
      await AuditLog.create({
        actorRole: 'student',
        action: 'SHARE_LINK_CREATED',
        targetType: 'certificate',
        targetId: certId,
        targetReference: recipientLabel,
        outcome: 'success',
        details: `Generated ${durationHours}h employer share link for ${recipientLabel}`,
      });
    } catch {}

    const origin = req.nextUrl.origin || 'http://localhost:3000';
    const shareUrl = `${origin}/s/${token}`;

    return NextResponse.json({
      success: true,
      shareLink: {
        id: newShareLink._id,
        certId: newShareLink.certId,
        recipientLabel: newShareLink.recipientLabel,
        expiresAt: newShareLink.expiresAt,
        durationHours: newShareLink.durationHours,
        status: newShareLink.status,
      },
      shareUrl,
      token,
    });
  } catch (error) {
    console.error('Error generating share link:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create share link', error: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/student/share-links
 * Revoke an active share link
 */
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const linkId = searchParams.get('id');

    if (!linkId) {
      return NextResponse.json({ success: false, message: 'Link ID is required' }, { status: 400 });
    }

    const updated = await ShareLink.findByIdAndUpdate(
      linkId,
      { status: 'revoked', revokedAt: new Date() },
      { new: true }
    );

    if (updated) {
      try {
        await AuditLog.create({
          actorRole: 'student',
          action: 'SHARE_LINK_CANCELLED',
          targetType: 'certificate',
          targetId: updated.certId,
          targetReference: updated.recipientLabel,
          outcome: 'success',
          details: `Student revoked public access token for ${updated.recipientLabel} (${updated.certId}). URL rendered inactive.`,
        });
      } catch {}
    }

    return NextResponse.json({ success: true, message: 'Share link revoked', link: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to revoke share link', error: (error as Error).message },
      { status: 500 }
    );
  }
}
