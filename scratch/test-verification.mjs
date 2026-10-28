import crypto from 'crypto';

async function test() {
  console.log('--- 1. Testing Verification by ID ---');
  const res1 = await fetch('http://localhost:3000/api/public/verify/PUB-DEG-2026-000105');
  const data1 = await res1.json();
  console.log('Status code:', res1.status);
  console.log('Result status:', data1.status);
  console.log('Certificate ID:', data1.certificate?.id);
  console.log('Student Name:', data1.certificate?.studentName);
  console.log('Expected Hash:', data1.certificate?.sha256Hash);

  if (data1.status !== 'VALID') {
    console.error('FAILED: Status should be VALID!');
  } else {
    console.log('PASS: Certificate ID verified as VALID!');
  }

  console.log('\n--- 2. Testing PDF Download & SHA-256 Hashing ---');
  const res2 = await fetch('http://localhost:3000/api/certificates/PUB-DEG-2026-000105/pdf');
  const arrayBuffer = await res2.arrayBuffer();
  const pdfBytes = Buffer.from(arrayBuffer);
  console.log('Downloaded PDF byte length:', pdfBytes.length);
  const downloadedHash = crypto.createHash('sha256').update(pdfBytes).digest('hex');
  console.log('Downloaded file hash:', downloadedHash);

  if (downloadedHash === data1.certificate?.sha256Hash) {
    console.log('PASS: Downloaded PDF hash EXACTLY matches on-chain registry hash!');
  } else {
    console.error('FAILED: Hash mismatch!', downloadedHash, '!==', data1.certificate?.sha256Hash);
  }

  console.log('\n--- 3. Testing Verify by Hash API ---');
  const res3 = await fetch('http://localhost:3000/api/public/verify/hash', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hash: downloadedHash, certId: 'PUB-DEG-2026-000105' }),
  });
  const data3 = await res3.json();
  console.log('Hash verification status:', data3.status);

  if (data3.status === 'VALID') {
    console.log('PASS: PDF Hash verification is 100% VALID!');
  } else {
    console.error('FAILED: Hash verification failed!', data3);
  }

  console.log('\n--- 4. Testing Tamper Detection ---');
  // Alter 1 character/byte in the downloaded PDF
  const tamperedPdf = Buffer.from(pdfBytes);
  tamperedPdf[100] = tamperedPdf[100] ^ 0xff; // Flip bits
  const tamperedHash = crypto.createHash('sha256').update(tamperedPdf).digest('hex');
  console.log('Tampered PDF hash:', tamperedHash);

  const res4 = await fetch('http://localhost:3000/api/public/verify/hash', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hash: tamperedHash, certId: 'PUB-DEG-2026-000105' }),
  });
  const data4 = await res4.json();
  console.log('Tampered verification status:', data4.status);
  console.log('Tamper alert message:', data4.message);

  if (data4.status === 'INVALID_MODIFIED') {
    console.log('PASS: Tampering properly detected with INVALID_MODIFIED!');
  } else {
    console.error('FAILED: Tamper detection failed!', data4);
  }
}

test().catch(console.error);
