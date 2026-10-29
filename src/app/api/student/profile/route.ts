import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { StudentRecord } from '@/models/StudentRecord';
import { Certificate } from '@/models/Certificate';
import { ShareLink } from '@/models/ShareLink';
import { AuditLog } from '@/models/AuditLog';

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

    const certIds = certificates.map((c) => c.id);
    const certTypeByCertId = new Map(certificates.map((c) => [c.id, c.type]));

    // Query share links belonging to this student or their certificates
    const shareOrConditions = [
      ...(certIds.length > 0 ? [{ certId: { $in: certIds } }] : []),
      ...(profile.studentId ? [{ createdBy: profile.studentId }] : []),
      ...(profile.email ? [{ createdBy: profile.email.toLowerCase() }] : []),
    ];

    const shareLinkDocs =
      shareOrConditions.length > 0
        ? await ShareLink.find({ $or: shareOrConditions }).sort({ createdAt: -1 })
        : [];

    const origin = new URL(request.url).origin || 'http://localhost:3000';
    const now = new Date();

    const shareLinks = (shareLinkDocs || []).map((doc) => {
      const isExpiredByTime = now > new Date(doc.expiresAt);
      const isMaxedOut =
        typeof doc.maxViews === 'number' && doc.maxViews > 0 && doc.viewCount >= doc.maxViews;

      let uiStatus: 'active' | 'expired' | 'cancelled' = 'active';
      if (doc.status === 'revoked') {
        uiStatus = 'cancelled';
      } else if (doc.status === 'expired' || isExpiredByTime || isMaxedOut) {
        uiStatus = 'expired';
      }

      const tokenValue = doc.token || doc.tokenHash;

      return {
        id: doc._id.toString(),
        certId: doc.certId,
        certType: doc.certType || certTypeByCertId.get(doc.certId) || 'Degree Certificate',
        token: tokenValue,
        recipientLabel: doc.recipientLabel || 'General Verification',
        createdAt: new Date(doc.createdAt).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        expiresAt: new Date(doc.expiresAt).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        expiryHours: doc.durationHours || 24,
        viewCount: doc.viewCount || 0,
        maxViews: doc.maxViews ?? null,
        includeDetails: Boolean(doc.includeDetails),
        status: uiStatus,
        fullUrl: `${origin}/s/${tokenValue}`,
      };
    });

    // Query audit trail events for this student's certificates
    const auditDocs =
      certIds.length > 0
        ? await AuditLog.find({ targetId: { $in: certIds } }).sort({ createdAt: -1 }).limit(50)
        : [];

    const auditLogs = (auditDocs || []).map((log) => {
      const actionUpper = (log.action || '').toUpperCase();
      let eventType:
        | 'CertificateIssued'
        | 'CertificateRevoked'
        | 'ShareLinkCreated'
        | 'ShareLinkCancelled'
        | 'LinkOpened'
        | 'VerifiedByCertificateID'
        | 'VerifiedByQR' = 'VerifiedByCertificateID';
      let title = log.action || 'Audit Event';
      let method: 'QR Scan' | 'Direct ID Search' | 'PDF Upload' | 'Share Link' | undefined;

      if (actionUpper.includes('ISSUED')) {
        eventType = 'CertificateIssued';
        title = 'Credential Issued & Anchored On-Chain';
      } else if (actionUpper.includes('REVOKED') || actionUpper.includes('CO_SIGNED')) {
        eventType = 'CertificateRevoked';
        title = 'Credential Revoked On-Chain';
      } else if (actionUpper.includes('SHARE_LINK_CREATED')) {
        eventType = 'ShareLinkCreated';
        title = 'Time-Limited Share Link Created';
        method = 'Share Link';
      } else if (actionUpper.includes('SHARE_LINK_CANCELLED') || actionUpper.includes('SHARE_LINK_REVOKED')) {
        eventType = 'ShareLinkCancelled';
        title = 'Share Link Cancelled by Student';
        method = 'Share Link';
      } else if (actionUpper.includes('TIME_LIMITED_LINK_VERIFIED')) {
        eventType = 'LinkOpened';
        title = 'Employer Opened Verification Share Link';
        method = 'Share Link';
      } else if (actionUpper.includes('VERIFIED')) {
        const detailsLower = (log.details || '').toLowerCase();
        if (detailsLower.includes('qr')) {
          eventType = 'VerifiedByQR';
          title = 'Credential Verified via QR / ID Lookup';
          method = 'QR Scan';
        } else if (detailsLower.includes('pdf')) {
          eventType = 'VerifiedByCertificateID';
          title = 'Credential Verified via PDF Fingerprint';
          method = 'PDF Upload';
        } else {
          eventType = 'VerifiedByCertificateID';
          title = 'Credential Verified on Public Portal';
          method = 'Direct ID Search';
        }
      }

      return {
        id: log._id.toString(),
        timestamp: new Date(log.createdAt).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        eventType,
        title,
        description: log.details || `${log.action} on ${log.targetId}`,
        certId: log.targetId || certIds[0] || '',
        method,
        txHash: log.transactionHash || undefined,
        actorRole: log.actorRole || undefined,
      };
    });

    return NextResponse.json({
      success: true,
      profile,
      certificates,
      shareLinks,
      auditLogs,
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
