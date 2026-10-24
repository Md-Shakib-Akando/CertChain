import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Certificate } from '@/models/Certificate';

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

    // 1. First look up directly by sha256Hash
    const matchingCert = await Certificate.findOne({
      sha256Hash: { $regex: new RegExp(`^${cleanHash}$`, 'i') },
    }).select('-pdfBase64');

    if (matchingCert) {
      const isRevoked = matchingCert.status === 'revoked';
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
