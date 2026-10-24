async function test() {
  console.log('--- 1. Testing Student Directory API ---');
  const getStudRes = await fetch('http://localhost:3000/api/students');
  const getStudData = await getStudRes.json();
  console.log('GET /api/students status:', getStudRes.status, 'Total found:', getStudData.students?.length);

  const postStudRes = await fetch('http://localhost:3000/api/students', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentId: `TEST-${Date.now().toString().slice(-6)}`,
      name: 'Tamim Iqbal',
      email: `tamim_${Date.now().toString().slice(-4)}@pub.ac.bd`,
      department: 'Computer Science & Engineering',
      program: 'B.Sc. in Computer Science & Engineering',
      batch: '44th',
      session: '2022 - 2026',
      cgpa: '3.95',
    }),
  });
  const postStudData = await postStudRes.json();
  console.log('POST /api/students status:', postStudRes.status, 'Message:', postStudData.message);
  if (!postStudData.success) {
    console.error('Student creation failed!');
  } else {
    console.log('PASS: Student record created successfully!');
  }

  console.log('\n--- 2. Testing Real Batch CSV Issuance API (On-Chain) ---');
  const batchRes = await fetch('http://localhost:3000/api/certificates/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      rows: [
        {
          studentId: `BATCH-01-${Date.now().toString().slice(-4)}`,
          studentName: 'Nusrat Jahan',
          studentEmail: 'nusrat@pub.ac.bd',
          program: 'B.Sc. in Computer Science & Engineering',
          session: '2020 - 2024',
          cgpa: '3.91',
          type: 'Degree Certificate',
        },
        {
          studentId: `BATCH-02-${Date.now().toString().slice(-4)}`,
          studentName: 'Mahmudul Hasan',
          studentEmail: 'mahmud@pub.ac.bd',
          program: 'B.Sc. in Computer Science & Engineering',
          session: '2020 - 2024',
          cgpa: '3.84',
          type: 'Degree Certificate',
        },
      ],
    }),
  });
  const batchData = await batchRes.json();
  console.log('POST /api/certificates/batch status:', batchRes.status);
  console.log('Processed:', batchData.processedCount, 'Failed:', batchData.failedCount);
  console.log('Blockchain Tx Hash:', batchData.txHash);
  console.log('Block Number:', batchData.blockNumber);

  if (batchData.success && batchData.processedCount === 2) {
    console.log('PASS: Real Batch Certificate Issuance on Blockchain is working!');
  } else {
    console.error('FAILED: Batch issuance failed!', batchData);
  }

  console.log('\n--- 3. Testing Issuer Audit Trail API ---');
  const auditRes = await fetch('http://localhost:3000/api/issuer/audit-logs');
  const auditData = await auditRes.json();
  console.log('GET /api/issuer/audit-logs status:', auditRes.status);
  console.log('Audit events count:', auditData.logs?.length);
  console.log('Recent 2 events:', auditData.logs?.slice(0, 2).map(l => ({ action: l.action, target: l.targetReference, tx: l.transactionHash })));

  if (auditData.success && auditData.logs?.length > 0) {
    console.log('PASS: Real Audit Trail is recording and returning events!');
  } else {
    console.error('FAILED: Audit trail failed!', auditData);
  }
}

test().catch(console.error);
