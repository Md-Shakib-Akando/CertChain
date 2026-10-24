import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Certificate } from '@/models/Certificate';
import { AuditLog } from '@/models/AuditLog';
import { generateCertificatePdf } from '@/lib/pdf/certificateGenerator';
import { issueOnChainServer } from '@/lib/web3/serverWeb3';

/**
 * GET /api/certificates
 * Search and filter registered academic certificates
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const studentId = searchParams.get('studentId');

    // Build query filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (status && status !== 'all') {
      filter.status = status.toLowerCase();
    }
    if (type && type !== 'all') {
      filter.type = type;
    }
    if (studentId) {
      filter.studentId = new RegExp(studentId, 'i');
    }
    if (search) {
      filter.$or = [
        { id: new RegExp(search, 'i') },
        { studentName: new RegExp(search, 'i') },
        { studentId: new RegExp(search, 'i') },
        { program: new RegExp(search, 'i') },
      ];
    }

    // Exclude large pdfBase64 from list for performance
    const certificates = await Certificate.find(filter)
      .select('-pdfBase64')
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json({
      success: true,
      count: certificates.length,
      certificates,
    });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve certificates', error: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/certificates
 * Issue an authentic certificate (generates PDF, computes SHA-256, anchors on-chain, stores in DB)
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const {
      studentName,
      studentId,
      studentEmail,
      program,
      session,
      batch = '42nd',
      cgpa = '3.88',
      type = 'Degree Certificate',
      issueDate = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      issuerAddress = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    } = body;

    if (!studentName || !studentId || !program || !session) {
      return NextResponse.json(
        { success: false, message: 'Missing required student or academic parameters' },
        { status: 400 }
      );
    }

    // Allocate Unique Certificate ID: PUB-{TYPE}-{YEAR}-{SEQUENCE}
    const typePrefix =
      type === 'Academic Transcript' ? 'TRN' : type === 'Provisional Certificate' ? 'PRO' : 'DEG';
    const year = new Date().getFullYear();
    const count = await Certificate.countDocuments();
    const seq = String(count + 101).padStart(6, '0');
    const certId = `PUB-${typePrefix}-${year}-${seq}`;

    // Base URL for QR code
    const origin = req.nextUrl.origin || 'http://localhost:3000';

    // 1. Generate Authentic PDF & Compute SHA-256 Hash
    const { pdfBase64, sha256Hash, bytes32Hash } = await generateCertificatePdf({
      certId,
      type,
      studentName,
      studentId: studentId.toUpperCase(),
      program,
      session,
      cgpa,
      issueDate,
      verifyBaseUrl: origin,
    });

    // 2. Submit on-chain issue transaction
    const chainResult = await issueOnChainServer(certId, bytes32Hash);

    // 3. Save to MongoDB
    const newCertificate = await Certificate.create({
      id: certId,
      type,
      program,
      session,
      batch,
      issueDate,
      status: 'valid',
      sha256Hash,
      txHash: chainResult.txHash,
      blockNumber: chainResult.blockNumber,
      issuerAddress,
      network: 'Hardhat Local / Ethereum Sepolia',
      degreeName: program,
      studentName,
      studentId: studentId.toUpperCase(),
      studentEmail: studentEmail?.toLowerCase(),
      cgpa,
      version: 1,
      pdfBase64,
    });

    // Ensure raw base64 is immediately persisted in collection
    await Certificate.collection.updateOne(
      { id: certId },
      { $set: { pdfBase64 } }
    );

    // 4. Record Audit Log
    try {
      await AuditLog.create({
        actorRole: 'issuer',
        action: 'CERTIFICATE_ISSUED',
        targetType: 'certificate',
        targetId: certId,
        targetReference: studentName,
        outcome: 'success',
        details: `Issued ${type} to ${studentName} (${studentId}). On-Chain Tx: ${chainResult.txHash}`,
        transactionHash: chainResult.txHash,
      });
    } catch (auditErr) {
      console.warn('Non-fatal: Audit log write failed', auditErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Certificate successfully generated and anchored to blockchain ledger!',
      certificate: {
        id: newCertificate.id,
        studentName: newCertificate.studentName,
        studentId: newCertificate.studentId,
        type: newCertificate.type,
        program: newCertificate.program,
        session: newCertificate.session,
        cgpa: newCertificate.cgpa,
        issueDate: newCertificate.issueDate,
        sha256Hash: newCertificate.sha256Hash,
        txHash: newCertificate.txHash,
        blockNumber: newCertificate.blockNumber,
        status: newCertificate.status,
      },
      downloadUrl: `/api/certificates/${certId}/pdf`,
      verificationUrl: `/verify?id=${certId}`,
    });
  } catch (error) {
    console.error('Error in certificate issuance:', error);
    return NextResponse.json(
      { success: false, message: 'Issuance failed', error: (error as Error).message },
      { status: 500 }
    );
  }
}
