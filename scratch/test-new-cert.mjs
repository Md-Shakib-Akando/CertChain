import crypto from 'crypto';

async function test() {
  console.log('--- 1. Issuing a new certificate ---');
  const issueRes = await fetch('http://localhost:3000/api/certificates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentName: 'Arafat Rahman',
      studentId: '0322410105101099',
      studentEmail: 'arafat@example.com',
      program: 'B.Sc. in Computer Science & Engineering',
      session: '2024 - 2028',
      batch: '42nd',
      cgpa: '3.92',
      type: 'Degree Certificate',
    }),
  });

  const issueData = await issueRes.json();
  console.log('Issue status:', issueRes.status);
  console.log('Issue response:', issueData.success, issueData.certificate?.id, issueData.certificate?.sha256Hash);

  if (!issueData.success) {
    console.error('FAILED to issue certificate:', issueData);
    process.exit(1);
  }

  const certId = issueData.certificate.id;
  const issuedHash = issueData.certificate.sha256Hash;

  console.log('\n--- 2. Verifying by ID ---');
  const verifyRes = await fetch(`http://localhost:3000/api/public/verify/${certId}`);
  const verifyData = await verifyRes.json();
  console.log('ID verification status:', verifyData.status);
  if (verifyData.status !== 'VALID') {
    console.error('FAILED: New certificate ID should be VALID!');
  } else {
    console.log('PASS: New certificate verified as VALID!');
  }

  console.log('\n--- 3. Downloading PDF and checking hash ---');
  const pdfRes = await fetch(`http://localhost:3000/api/certificates/${certId}/pdf`);
  const arrayBuffer = await pdfRes.arrayBuffer();
  const pdfBytes = Buffer.from(arrayBuffer);
  const pdfHash = crypto.createHash('sha256').update(pdfBytes).digest('hex');
  console.log('Downloaded bytes:', pdfBytes.length);
  console.log('Issued hash:    ', issuedHash);
  console.log('Downloaded hash:', pdfHash);

  if (pdfHash === issuedHash) {
    console.log('PASS: Brand new certificate has ZERO drift between issuance and download!');
  } else {
    console.error('FAILED: Drift detected on new certificate!');
  }

  console.log('\n--- 4. Verifying downloaded PDF via Hash API ---');
  const hashRes = await fetch('http://localhost:3000/api/public/verify/hash', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hash: pdfHash, certId }),
  });
  const hashData = await hashRes.json();
  console.log('Hash verification status:', hashData.status);

  if (hashData.status === 'VALID') {
    console.log('PASS: Uploaded PDF is 100% VALID!');
  } else {
    console.error('FAILED: Uploaded PDF failed verification!');
  }
}

test().catch(console.error);
