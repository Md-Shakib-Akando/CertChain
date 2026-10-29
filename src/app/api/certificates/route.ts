import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Certificate } from '@/models/Certificate';
import { AuditLog } from '@/models/AuditLog';
import { generateCertificatePdf } from '@/lib/pdf/certificateGenerator';
import { issueOnChainServer, verifyOnChainServer } from '@/lib/web3/serverWeb3';

function normalizeCertificateType(
  rawType?: string
): 'Degree Certificate' | 'Academic Transcript' | 'Provisional Certificate' {
  const lower = (rawType || '').trim().toLowerCase();
  if (lower.includes('transcript') || lower === 'trn') {
    return 'Academic Transcript';
  }
  if (lower.includes('provisional') || lower === 'pro') {
    return 'Provisional Certificate';
  }
  return 'Degree Certificate';
}

/**
 * Compute the next guaranteed-unique sequence number across all existing certificates
 * in MongoDB (and on-chain if node is online) so deleted or out-of-order records never cause E11000 collisions.
 */
async function allocateUniqueCertId(
  typePrefix: 'DEG' | 'PRO' | 'TRN',
  year: number,
  extraOffset = 0
): Promise<string> {
  const existingDocs = await Certificate.find({}, { id: 1 }).lean();
  const existingIds = new Set<string>();
  let maxSeq = existingDocs.length + 100;

  for (const doc of existingDocs) {
    if (!doc.id) continue;
    const upper = String(doc.id).trim().toUpperCase();
    existingIds.add(upper);

    const match = upper.match(/^PUB-(?:DEG|PRO|TRN|CRT)-\d{4}-(\d+)$/);
    if (match) {
      const parsedSeq = parseInt(match[1], 10);
      if (!Number.isNaN(parsedSeq) && parsedSeq > maxSeq) {
        maxSeq = parsedSeq;
      }
    }
  }

  let candidateSeq = maxSeq + 1 + extraOffset;
  while (true) {
    const seqStr = String(candidateSeq).padStart(6, '0');
    const candidateId = `PUB-${typePrefix}-${year}-${seqStr}`;
    const anyPrefixCollision =
      existingIds.has(candidateId) ||
      existingIds.has(`PUB-DEG-${year}-${seqStr}`) ||
      existingIds.has(`PUB-PRO-${year}-${seqStr}`) ||
      existingIds.has(`PUB-TRN-${year}-${seqStr}`);

    if (!anyPrefixCollision) {
      const onChain = await verifyOnChainServer(candidateId);
      if (!onChain.exists) {
        return candidateId;
      }
    }
    candidateSeq++;
  }
}

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
      type: rawType = 'Degree Certificate',
      issueDate = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      issuerAddress = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    } = body;

    if (!studentName?.trim() || !studentId?.trim() || !program?.trim() || !session?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Missing required student or academic parameters' },
        { status: 400 }
      );
    }

    const type = normalizeCertificateType(rawType);
    const typePrefix: 'DEG' | 'PRO' | 'TRN' =
      type === 'Academic Transcript' ? 'TRN' : type === 'Provisional Certificate' ? 'PRO' : 'DEG';
    const year = new Date().getFullYear();
    const origin = req.nextUrl.origin || 'http://localhost:3000';
    const cleanStudentName = String(studentName).trim();
    const cleanStudentId = String(studentId).trim().toUpperCase();
    const cleanProgram = String(program).trim();
    const cleanSession = String(session).trim();
    const cleanCgpa = String(cgpa || '3.88').trim();
    const cleanEmail =
      typeof studentEmail === 'string' && studentEmail.trim()
        ? studentEmail.trim().toLowerCase()
        : undefined;

    let newCertificate = null;
    let certId = '';
    let chainResult = { txHash: '', blockNumber: 0 };

    // Retry loop to guard against any concurrent sequence collision
    for (let attempt = 0; attempt < 5; attempt++) {
      certId = await allocateUniqueCertId(typePrefix, year, attempt);

      // 1. Generate Authentic PDF & Compute SHA-256 Hash
      const { pdfBase64, sha256Hash, bytes32Hash } = await generateCertificatePdf({
        certId,
        type,
        studentName: cleanStudentName,
        studentId: cleanStudentId,
        program: cleanProgram,
        session: cleanSession,
        cgpa: cleanCgpa,
        issueDate,
        verifyBaseUrl: origin,
      });

      // 2. Submit on-chain issue transaction
      chainResult = await issueOnChainServer(certId, bytes32Hash);

      // 3. Save to MongoDB
      try {
        newCertificate = await Certificate.create({
          id: certId,
          type,
          program: cleanProgram,
          session: cleanSession,
          batch: String(batch || '42nd').trim(),
          issueDate,
          status: 'valid',
          sha256Hash,
          txHash: chainResult.txHash,
          blockNumber: chainResult.blockNumber,
          issuerAddress,
          network: 'Hardhat Local / Ethereum Sepolia',
          degreeName: cleanProgram,
          studentName: cleanStudentName,
          studentId: cleanStudentId,
          ...(cleanEmail ? { studentEmail: cleanEmail } : {}),
          cgpa: cleanCgpa,
          version: 1,
          pdfBase64,
        });

        // Ensure raw base64 is immediately persisted in collection
        await Certificate.collection.updateOne(
          { id: certId },
          { $set: { pdfBase64 } }
        );
        break;
      } catch (dbErr) {
        const errMsg = (dbErr as Error).message || '';
        if (errMsg.includes('E11000') && attempt < 4) {
          continue;
        }
        throw dbErr;
      }
    }

    if (!newCertificate) {
      throw new Error('Could not allocate a unique Certificate ID after multiple attempts.');
    }

    // 4. Record Audit Log
    try {
      await AuditLog.create({
        actorRole: 'issuer',
        action: 'CERTIFICATE_ISSUED',
        targetType: 'certificate',
        targetId: certId,
        targetReference: cleanStudentName,
        outcome: 'success',
        details: `Issued ${type} to ${cleanStudentName} (${cleanStudentId}). On-Chain Tx: ${chainResult.txHash}`,
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
      {
        success: false,
        message: `Issuance failed: ${(error as Error).message}`,
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
