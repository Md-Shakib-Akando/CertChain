import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Certificate } from '@/models/Certificate';
import { AuditLog } from '@/models/AuditLog';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { hash, certId } = body;

    if (!hash || typeof hash !== 'string') {
      return NextResponse.json(
        { success: false, status: 'ERROR', message: 'SHA-256 hash string is required' },
        { status: 400 }
      );
    }

    const cleanHash = hash.replace(/^0x/i, '').toLowerCase().trim();
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const ua = req.headers.get('user-agent') || 'PDF Verifier';

    // 1. First look up directly by sha256Hash
    const matchingCert = await Certificate.findOne({
      sha256Hash: { $regex: new RegExp(`^${cleanHash}$`, 'i') },
    }).select('-pdfBase64');

    if (matchingCert) {
      const isRevoked = matchingCert.status === 'revoked';

      try {
        await AuditLog.create({
          actorRole: 'verifier',
          action: isRevoked ? 'CERTIFICATE_VERIFIED_REVOKED' : 'CERTIFICATE_VERIFIED_VALID',
          targetType: 'certificate',
          targetId: matchingCert.id,
          targetReference: `${matchingCert.studentName} (${matchingCert.id})`,
          outcome: isRevoked ? 'warning' : 'success',
          details: `PDF cryptographic fingerprint verified directly via SHA-256 hash (${cleanHash.slice(0, 16)}...). Status: ${isRevoked ? 'REVOKED' : 'VALID'}.`,
          transactionHash: matchingCert.txHash,
          ipAddress: typeof ip === 'string' ? ip.split(',')[0].trim() : '127.0.0.1',
          userAgent: ua,
        });
      } catch (logErr) {
        console.warn('AuditLog error:', logErr);
      }

      return NextResponse.json({
        success: true,
        status: isRevoked ? 'REVOKED' : 'VALID',
        certificate: {
          id: matchingCert.id,
          studentName: matchingCert.studentName,
          studentId: matchingCert.studentId,
          degree: matchingCert.degreeName || matchingCert.program,
          program: matchingCert.program,
          session: matchingCert.session,
          cgpa: matchingCert.cgpa,
          type: matchingCert.type,
          issueDate: matchingCert.issueDate,
          sha256Hash: matchingCert.sha256Hash,
          txHash: matchingCert.txHash,
          blockNumber: matchingCert.blockNumber,
          issuerAddress: matchingCert.issuerAddress,
          network: matchingCert.network,
          revocationDate: matchingCert.revocationDate,
          revocationReason: matchingCert.revocationReason,
        },
      });
    }

    // 2. If hash didn't match directly, but a certId was provided (or can be checked):
    if (certId) {
      const cleanCertId = certId.trim().toUpperCase();
      const existingCert = await Certificate.findOne({
        id: { $regex: new RegExp(`^${cleanCertId}$`, 'i') },
      }).select('-pdfBase64');

      if (existingCert) {
        // Document has been tampered with!
        try {
          await AuditLog.create({
            actorRole: 'verifier',
            action: 'SECURITY_ALERT_TAMPERING_DETECTED',
            targetType: 'certificate',
            targetId: existingCert.id,
            targetReference: `${existingCert.studentName} (${existingCert.id})`,
            outcome: 'failure',
            details: `SECURITY ALERT: Cryptographic mismatch detected for Certificate ${existingCert.id}! Uploaded file hash (${cleanHash.slice(0, 16)}...) does NOT match authentic on-chain hash (${existingCert.sha256Hash.slice(0, 16)}...). File modified or forged.`,
            transactionHash: existingCert.txHash,
            ipAddress: typeof ip === 'string' ? ip.split(',')[0].trim() : '127.0.0.1',
            userAgent: ua,
          });
        } catch {}

        return NextResponse.json({
          success: false,
          status: 'INVALID_MODIFIED',
          message: 'Security Alert: Cryptographic fingerprint mismatch. Document has been modified or forged.',
          computedHash: cleanHash,
          expectedHash: existingCert.sha256Hash,
          certificateId: existingCert.id,
          studentName: existingCert.studentName,
        });
      }
    }

    // 3. Not found anywhere
    try {
      await AuditLog.create({
        actorRole: 'verifier',
        action: 'CERTIFICATE_HASH_NOT_FOUND',
        targetType: 'certificate',
        targetId: cleanHash.slice(0, 16),
        targetReference: cleanHash,
        outcome: 'failure',
        details: `Public PDF verification failed: Fingerprint ${cleanHash} not registered on blockchain.`,
        ipAddress: typeof ip === 'string' ? ip.split(',')[0].trim() : '127.0.0.1',
      });
    } catch {}

    return NextResponse.json({
      success: false,
      status: 'NOT_FOUND',
      message: 'No matching certificate found with this cryptographic fingerprint on the blockchain.',
      computedHash: cleanHash,
    }, { status: 404 });
  } catch (error) {
    console.error('Error verifying certificate by hash:', error);
    return NextResponse.json(
      { success: false, status: 'ERROR', message: 'Verification failed' },
      { status: 500 }
    );
  }
}
