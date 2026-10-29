import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Certificate } from '@/models/Certificate';
import { AuditLog } from '@/models/AuditLog';
import { generateCertificatePdf } from '@/lib/pdf/certificateGenerator';
import { batchIssueOnChainServer } from '@/lib/web3/serverWeb3';

export interface BatchItemInput {
  studentId: string;
  studentName: string;
  studentEmail?: string;
  program: string;
  session: string;
  batch?: string;
  cgpa: string;
  type?: string;
}

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

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const rows: BatchItemInput[] = body.rows || [];

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No student rows provided for batch issuance.' },
        { status: 400 }
      );
    }

    if (rows.length > 500) {
      return NextResponse.json(
        { success: false, message: 'Maximum 500 rows per batch upload allowed.' },
        { status: 400 }
      );
    }

    const origin = req.nextUrl.origin || 'http://localhost:3000';
    const year = new Date().getFullYear();

    // Find highest existing sequence number across all certificates in MongoDB
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

    const validRows: Array<{
      input: BatchItemInput;
      normalizedType: 'Degree Certificate' | 'Academic Transcript' | 'Provisional Certificate';
      certId: string;
      pdfBase64: string;
      sha256Hash: string;
      bytes32Hash: string;
      issueDate: string;
    }> = [];

    const failedRows: Array<{ row: number; studentId: string; reason: string }> = [];

    // Step 1: Validate rows and generate PDFs
    let currentSeq = maxSeq;
    for (let i = 0; i < rows.length; i++) {
      const rowNum = i + 1;
      const r = rows[i];

      if (!r.studentId?.trim() || !r.studentName?.trim() || !r.program?.trim()) {
        failedRows.push({
          row: rowNum,
          studentId: r.studentId || 'UNKNOWN',
          reason: 'Missing mandatory fields (Student ID, Name, or Program)',
        });
        continue;
      }

      const cleanId = r.studentId.trim().toUpperCase();
      const normalizedType = normalizeCertificateType(r.type);
      const typePrefix =
        normalizedType === 'Academic Transcript'
          ? 'TRN'
          : normalizedType === 'Provisional Certificate'
          ? 'PRO'
          : 'DEG';

      let certId = '';
      while (true) {
        currentSeq++;
        const seqStr = String(currentSeq).padStart(6, '0');
        const candidateId = `PUB-${typePrefix}-${year}-${seqStr}`;
        if (
          !existingIds.has(candidateId) &&
          !existingIds.has(`PUB-DEG-${year}-${seqStr}`) &&
          !existingIds.has(`PUB-PRO-${year}-${seqStr}`) &&
          !existingIds.has(`PUB-TRN-${year}-${seqStr}`)
        ) {
          certId = candidateId;
          existingIds.add(candidateId);
          break;
        }
      }

      const issueDate = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

      try {
        const { pdfBase64, sha256Hash, bytes32Hash } = await generateCertificatePdf({
          certId,
          type: normalizedType,
          studentName: r.studentName.trim(),
          studentId: cleanId,
          program: r.program.trim(),
          session: r.session?.trim() || '2020 - 2024',
          cgpa: r.cgpa?.trim() || '3.75',
          issueDate,
          verifyBaseUrl: origin,
        });

        validRows.push({
          input: r,
          normalizedType,
          certId,
          pdfBase64,
          sha256Hash,
          bytes32Hash,
          issueDate,
        });
      } catch (genErr) {
        failedRows.push({
          row: rowNum,
          studentId: cleanId,
          reason: `PDF generation failed: ${(genErr as Error).message}`,
        });
      }
    }

    if (validRows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'All submitted rows failed validation.',
          processedCount: 0,
          failedCount: failedRows.length,
          failedRows,
        },
        { status: 422 }
      );
    }

    // Step 2: Batch issue on-chain in Smart Contract
    const chainItems = validRows.map((v) => ({
      certId: v.certId,
      sha256Hex: v.bytes32Hash,
    }));

    const chainResult = await batchIssueOnChainServer(chainItems);

    // Step 3: Insert into MongoDB
    const certDocs = validRows.map((v) => {
      const cleanEmail = v.input.studentEmail?.trim()
        ? v.input.studentEmail.trim().toLowerCase()
        : undefined;
      return {
        id: v.certId,
        type: v.normalizedType,
        program: v.input.program.trim(),
        session: v.input.session?.trim() || '2020 - 2024',
        batch: v.input.batch?.trim() || '42nd',
        issueDate: v.issueDate,
        status: 'valid' as const,
        sha256Hash: v.sha256Hash,
        txHash: chainResult.txHash,
        blockNumber: chainResult.blockNumber,
        issuerAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        network: 'Hardhat Local / Ethereum Sepolia',
        degreeName: v.input.program.trim(),
        studentName: v.input.studentName.trim(),
        studentId: v.input.studentId.trim().toUpperCase(),
        ...(cleanEmail ? { studentEmail: cleanEmail } : {}),
        cgpa: v.input.cgpa?.trim() || '3.75',
        version: 1,
        pdfBase64: v.pdfBase64,
      };
    });

    await Certificate.insertMany(certDocs, { ordered: false });

    // Step 4: Audit Log
    try {
      await AuditLog.create({
        actorRole: 'issuer',
        action: 'BATCH_CERTIFICATES_ISSUED',
        targetType: 'batch',
        targetId: chainResult.txHash,
        targetReference: `${validRows.length} Certificates`,
        outcome: 'success',
        details: `Batch issued ${validRows.length} certificates on-chain. Tx: ${chainResult.txHash}. Block: ${chainResult.blockNumber}`,
        transactionHash: chainResult.txHash,
        ipAddress: '127.0.0.1',
      });
    } catch (auditErr) {
      console.warn('Non-fatal audit log error:', auditErr);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully issued ${validRows.length} certificates on blockchain!`,
      processedCount: validRows.length,
      failedCount: failedRows.length,
      txHash: chainResult.txHash,
      blockNumber: chainResult.blockNumber,
      certificates: validRows.map((v) => ({
        id: v.certId,
        studentName: v.input.studentName,
        studentId: v.input.studentId,
        sha256Hash: v.sha256Hash,
      })),
      failedRows,
    });
  } catch (error) {
    console.error('Batch issuance error:', error);
    return NextResponse.json(
      { success: false, message: 'Batch issuance failed: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
