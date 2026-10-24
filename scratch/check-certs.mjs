import { connectDB } from '../src/lib/mongodb.js';
import { Certificate } from '../src/models/Certificate.js';
import crypto from 'crypto';

async function checkCerts() {
  await connectDB();
  const certs = await Certificate.find({}).lean();
  console.log(`Found ${certs.length} certificates:`);
  for (const c of certs) {
    console.log(`--- Certificate: ${c.id} ---`);
    console.log(`Status: ${c.status}`);
    console.log(`sha256Hash stored in DB: ${c.sha256Hash}`);
    console.log(`Has pdfBase64: ${Boolean(c.pdfBase64)}`);
    if (c.pdfBase64) {
      const bytes = Buffer.from(c.pdfBase64, 'base64');
      const realHash = crypto.createHash('sha256').update(bytes).digest('hex');
      console.log(`Recomputed SHA-256 of stored pdfBase64: ${realHash}`);
      console.log(`Matches stored hash? ${realHash === c.sha256Hash}`);
    }
  }
  process.exit(0);
}

checkCerts().catch(console.error);
