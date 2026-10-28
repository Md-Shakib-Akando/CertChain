import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const demoDir = path.join(rootDir, 'demo');

async function exportDemoFiles() {
  if (!fs.existsSync(demoDir)) {
    fs.mkdirSync(demoDir, { recursive: true });
  }

  const { connectDB } = await import('../src/lib/mongodb.ts');
  await connectDB();
  const { Certificate } = await import('../src/models/Certificate.ts');

  // 1. Fetch Authentic Certificate: PUB-DEG-2026-000105
  const cert1 = await Certificate.findOne({ id: 'PUB-DEG-2026-000105' });
  if (!cert1 || !cert1.pdfBase64) {
    throw new Error('PUB-DEG-2026-000105 not found or missing pdfBase64');
  }

  const cert1Bytes = Buffer.from(cert1.pdfBase64, 'base64');
  const cert1Hash = crypto.createHash('sha256').update(cert1Bytes).digest('hex');
  const cert1Path = path.join(demoDir, 'PUB-DEG-2026-000105.pdf');
  fs.writeFileSync(cert1Path, cert1Bytes);
  console.log(`[AUTHENTIC] Created: ${cert1Path}`);
  console.log(`            SHA-256: ${cert1Hash}`);
  console.log(`            Status:  ${cert1.status.toUpperCase()}`);

  // 2. Create Tampered Certificate: PUB-DEG-2026-000105-tampered.pdf
  // We flip bits in a content byte to alter the file without destroying basic PDF file structure
  const tamperedBytes = Buffer.from(cert1Bytes);
  const targetOffset = Math.floor(tamperedBytes.length * 0.75);
  tamperedBytes[targetOffset] = tamperedBytes[targetOffset] ^ 0xaa;
  const tamperedHash = crypto.createHash('sha256').update(tamperedBytes).digest('hex');
  const tamperedPath = path.join(demoDir, 'PUB-DEG-2026-000105-tampered.pdf');
  fs.writeFileSync(tamperedPath, tamperedBytes);
  console.log(`\n[TAMPERED]  Created: ${tamperedPath}`);
  console.log(`            SHA-256: ${tamperedHash}`);
  console.log(`            Expected Hash: ${cert1Hash}`);
  console.log(`            Status:  INVALID_MODIFIED (Security Alert: Tampering Detected)`);

  // 3. Fetch Revoked Certificate: CERT-DEMO-2026-002
  const certRevoked = await Certificate.findOne({ id: 'CERT-DEMO-2026-002' });
  if (certRevoked && certRevoked.pdfBase64) {
    const revokedBytes = Buffer.from(certRevoked.pdfBase64, 'base64');
    const revokedHash = crypto.createHash('sha256').update(revokedBytes).digest('hex');
    const revokedPath = path.join(demoDir, 'CERT-DEMO-2026-002-revoked.pdf');
    fs.writeFileSync(revokedPath, revokedBytes);
    console.log(`\n[REVOKED]   Created: ${revokedPath}`);
    console.log(`            SHA-256: ${revokedHash}`);
    console.log(`            Status:  ${certRevoked.status.toUpperCase()}`);
    console.log(`            Reason:  ${certRevoked.revocationReason}`);
  }

  // 4. Create demo/README.md documentation
  const guideContent = `# PUB CertChain Demonstration Files

This folder contains test certificates designed for hackathon judges, evaluators, and security auditors to test the end-to-end cryptographic integrity, tamper detection, and revocation systems of **PUB CertChain**.

---

## Files Included

| File | Type | Target Cert ID | Graduate Name | Ledger Status | Expected Test Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| \`PUB-DEG-2026-000105.pdf\` | Authentic Certificate | \`PUB-DEG-2026-000105\` | Md. Shakib Akando | **VALID** | **Verified Authentic** (Green Banner, Full Student Data, On-Chain Anchor) |
| \`PUB-DEG-2026-000105-tampered.pdf\` | Tampered / Forged File | \`PUB-DEG-2026-000105\` | Md. Shakib Akando | **INVALID** | **Security Alert: Tamper Detected** (Red Alert, Hash Mismatch Comparison) |
| \`CERT-DEMO-2026-002-revoked.pdf\` | Revoked Certificate | \`CERT-DEMO-2026-002\` | Nusrat Jahan Chowdhury | **REVOKED** | **Certificate Revoked** (Warning Banner, Revocation Date & Syndicate Reason) |

---

## How to Test in Web Application

1. Open the application homepage at **\`http://localhost:3000\`**.
2. Scroll to the **Quick Verification** section (or click **Verify** in the navigation header).
3. Select the **"Upload PDF"** tab.
4. Drag & drop or browse to choose:
   - **Upload \`PUB-DEG-2026-000105.pdf\`**:
     - The browser computes the client-side SHA-256 fingerprint (\`${cert1Hash}\`).
     - Matches the on-chain registry record.
     - Modal pops up with **● Verified Authentic**, Graduate Name, Degree, CGPA, and Transaction Hash.
   - **Upload \`PUB-DEG-2026-000105-tampered.pdf\`**:
     - The browser computes the altered SHA-256 fingerprint (\`${tamperedHash}\`).
     - Detects that this file claims to be \`PUB-DEG-2026-000105\` but its cryptographic hash does not match the immutable ledger record.
     - Modal pops up with **● Tampered File / Security Alert**.
     - Displays the side-by-side comparison:
       - **Computed File Hash (Uploaded File)**: \`${tamperedHash}\`
       - **Anchored Ledger Hash (Official Record)**: \`${cert1Hash}\`
     - Automatically logs a \`SECURITY_ALERT_TAMPERING_DETECTED\` entry to the immutable audit trail with IP address and timestamp.
   - **Upload or search \`CERT-DEMO-2026-002-revoked.pdf\`**:
     - Modal pops up with **● Revoked Record** and displays the University Controller's revocation reason.

---

## How to Test via Automated Verification Script

Run the verification test suite in your terminal:
\`\`\`bash
node scratch/test-verification.mjs
\`\`\`

All cryptographic assertions, SHA-256 comparisons, and tamper alert tests will run and print formatted status outputs.
`;

  fs.writeFileSync(path.join(demoDir, 'README.md'), guideContent);
  console.log(`\n[GUIDE]     Created: ${path.join(demoDir, 'README.md')}`);

  process.exit(0);
}

exportDemoFiles().catch((err) => {
  console.error(err);
  process.exit(1);
});
