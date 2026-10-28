import { connectDB } from '../src/lib/mongodb.ts';
import { Certificate } from '../src/models/Certificate.ts';
import { generateCertificatePdf } from '../src/lib/pdf/certificateGenerator.ts';

async function backfill() {
  await connectDB();
  const certs = await Certificate.find({}).lean();
  console.log('Total certs found:', certs.length);

  for (const cert of certs) {
    console.log('Processing:', cert.id);
    const gen = await generateCertificatePdf({
      certId: cert.id,
      type: cert.type,
      studentName: cert.studentName,
      studentId: cert.studentId,
      program: cert.program,
      session: cert.session,
      cgpa: cert.cgpa,
      issueDate: cert.issueDate,
      verifyBaseUrl: 'http://localhost:3000',
    });

    await Certificate.collection.updateOne(
      { id: cert.id },
      {
        $set: {
          pdfBase64: gen.pdfBase64,
          sha256Hash: gen.sha256Hash,
        },
      }
    );
    console.log('Updated', cert.id, 'with hash:', gen.sha256Hash, 'length:', gen.pdfBase64.length);
  }

  console.log('All certificates backfilled successfully!');
  process.exit(0);
}

backfill().catch((err) => {
  console.error(err);
  process.exit(1);
});
