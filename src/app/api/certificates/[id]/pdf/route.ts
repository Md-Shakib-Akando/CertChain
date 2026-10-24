import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Certificate } from '@/models/Certificate';
import { generateCertificatePdf } from '@/lib/pdf/certificateGenerator';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const cleanId = decodeURIComponent(id).trim();

    const cert = await Certificate.findOne({ id: cleanId });
    if (!cert) {
      return new NextResponse('Certificate not found', { status: 404 });
    }

    let pdfBytes: Uint8Array;

    if (cert.pdfBase64) {
      pdfBytes = Buffer.from(cert.pdfBase64, 'base64');
    } else {
      // Fallback: generate and cache
      const origin = req.nextUrl.origin || 'http://localhost:3000';
      const gen = await generateCertificatePdf({
        certId: cert.id,
        type: cert.type,
        studentName: cert.studentName,
        studentId: cert.studentId,
        program: cert.program,
        session: cert.session,
        cgpa: cert.cgpa,
        issueDate: cert.issueDate,
        verifyBaseUrl: origin,
      });
      pdfBytes = gen.pdfBytes;

      // Cache it permanently in MongoDB collection
      await Certificate.collection.updateOne(
        { id: cert.id },
        { $set: { pdfBase64: gen.pdfBase64, sha256Hash: gen.sha256Hash } }
      );
    }

    // Convert to ArrayBuffer for NextResponse body
    const arrayBuffer = pdfBytes.buffer.slice(
      pdfBytes.byteOffset,
      pdfBytes.byteOffset + pdfBytes.byteLength
    );

    return new NextResponse(arrayBuffer as ArrayBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${cert.id}.pdf"`,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error streaming PDF:', error);
    return new NextResponse('Failed to generate PDF', { status: 500 });
  }
}
