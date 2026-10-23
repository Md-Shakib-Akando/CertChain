import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import fs from 'fs';

let mongoUri = process.env.MONGODB_URI;
if (!mongoUri && fs.existsSync('.env.local')) {
  const content = fs.readFileSync('.env.local', 'utf-8');
  const match = content.match(/MONGODB_URI=(.+)/);
  if (match) mongoUri = match[1].trim();
}

async function seed() {
  await mongoose.connect(mongoUri);
  const db = mongoose.connection.db;

  const defaultPasswordHash = await bcrypt.hash('Issuer@123456', 10);

  // 1. Seed Demo Issuers
  const issuers = [
    {
      name: 'Dr. Rafiqul Islam',
      email: 'rafiqul.registrar@pub.edu.bd',
      passwordHash: defaultPasswordHash,
      role: 'issuer',
      status: 'pending',
      department: 'Office of the Registrar',
      designation: 'Deputy Registrar (Examinations)',
      employeeId: 'PUB-REG-2024-001',
      walletAddress: '0x71C8360d8B667F8D69A1C50824b07114A5703E64',
      requestId: 'REQ-PUB-2026-4821',
      isWalletVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Prof. Anisur Rahman',
      email: 'anisur.examinations@pub.edu.bd',
      passwordHash: defaultPasswordHash,
      role: 'issuer',
      status: 'pending',
      department: 'Department of Computer Science & Engineering',
      designation: 'Head of Department / Academic Issuer',
      employeeId: 'PUB-CSE-2023-019',
      walletAddress: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4df',
      requestId: 'REQ-PUB-2026-9042',
      isWalletVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Shamima Akter',
      email: 'shamima.academic@pub.edu.bd',
      passwordHash: defaultPasswordHash,
      role: 'issuer',
      status: 'active',
      department: 'Academic Council Secretariat',
      designation: 'Assistant Controller',
      employeeId: 'PUB-SEC-2022-045',
      walletAddress: '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955',
      requestId: 'REQ-PUB-2025-1102',
      isWalletVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Md. Tariqul Hasan',
      email: 'tariqul.archive@pub.edu.bd',
      passwordHash: defaultPasswordHash,
      role: 'issuer',
      status: 'suspended',
      department: 'University Archives & Records',
      designation: 'Senior Records Officer',
      employeeId: 'PUB-ARC-2021-088',
      walletAddress: '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f',
      requestId: 'REQ-PUB-2024-7731',
      isWalletVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  for (const iss of issuers) {
    await db.collection('users').updateOne(
      { email: iss.email },
      { $set: iss },
      { upsert: true }
    );
  }

  // 2. Seed Sample Revocation Requests
  const revocations = [
    {
      certificateId: 'PUB-CERT-2026-0041',
      certificateType: 'Degree Certificate',
      studentName: 'Tariq Al-Mansoor',
      studentId: 'PUB-CSE-2101004',
      program: 'B.Sc. in Computer Science and Engineering',
      issueDate: '2026-01-15',
      originalTxHash: '0x7bfa637f9ef8d1544a053c89679f2ea69d77491ff297d2e053a496b0142b918a',
      sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      requestingIssuerName: 'Shamima Akter',
      requestingIssuerEmail: 'shamima.academic@pub.edu.bd',
      requestingIssuerDepartment: 'Academic Council Secretariat',
      requestingIssuerWallet: '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955',
      requestingIssuerStatus: 'authorized',
      reason: 'Typographical error in student legal surname and major track specification.',
      evidenceNotes: 'Official affidavit submitted by student with National ID card verification. Academic council committee approved revised credential issuance.',
      requestedAt: new Date(Date.now() - 3600000 * 4),
      currentCertificateStatus: 'pending_revocation',
      workflowStatus: 'pending_review',
      isDemo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      certificateId: 'PUB-TRANS-2025-0892',
      certificateType: 'Academic Transcript',
      studentName: 'Nusrat Jahan Chowdhury',
      studentId: 'PUB-EEE-2001018',
      program: 'B.Sc. in Electrical and Electronic Engineering',
      issueDate: '2025-11-20',
      originalTxHash: '0x4f260389a9be815d63f0d2c771b9c8d5e18237bca609457e5e347ad194f09231',
      sha256Hash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
      requestingIssuerName: 'Prof. Anisur Rahman',
      requestingIssuerEmail: 'anisur.examinations@pub.edu.bd',
      requestingIssuerDepartment: 'Department of Electrical Engineering',
      requestingIssuerWallet: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4df',
      requestingIssuerStatus: 'authorized',
      reason: 'Recalculation of Semester 7 grade after re-scrutiny approval by Faculty Dean.',
      evidenceNotes: 'Faculty Examination Syndicate resolution document #PUB-EXAM-2026-89 signed on Feb 10.',
      requestedAt: new Date(Date.now() - 3600000 * 24),
      currentCertificateStatus: 'pending_revocation',
      workflowStatus: 'awaiting_signature',
      isDemo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      certificateId: 'PUB-PROV-2026-0129',
      certificateType: 'Provisional Certificate',
      studentName: 'Tanvir Hossain',
      studentId: 'PUB-BBA-2101032',
      program: 'Bachelor of Business Administration',
      issueDate: '2026-02-01',
      originalTxHash: '0x99245fa8e1b6f0e74f23a85b9e07894312d8a9f654b0c2e91148e652a97ef142',
      sha256Hash: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
      requestingIssuerName: 'Shamima Akter',
      requestingIssuerEmail: 'shamima.academic@pub.edu.bd',
      requestingIssuerDepartment: 'Academic Council Secretariat',
      requestingIssuerWallet: '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955',
      requestingIssuerStatus: 'authorized',
      reason: 'Superseded by original degree certificate following convocation.',
      requestedAt: new Date(Date.now() - 3600000 * 48),
      currentCertificateStatus: 'revoked',
      workflowStatus: 'confirmed',
      controllerSignerEmail: 'controller@pub.edu.bd',
      controllerSignedAt: new Date(Date.now() - 3600000 * 46),
      transactionHash: '0x889214abce51670984126dfa785231cbf094621378daef52918340156cb21974',
      blockNumber: 7421885,
      network: 'Ethereum Sepolia Testnet',
      isDemo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  for (const rev of revocations) {
    await db.collection('revocationrequests').updateOne(
      { certificateId: rev.certificateId },
      { $set: rev },
      { upsert: true }
    );
  }

  // 3. Seed sample AuditLog
  const logs = [
    {
      actorEmail: 'controller.pub@gmail.com',
      actorRole: 'controller',
      action: 'CertificateRevocationConfirmed',
      targetType: 'certificate',
      targetId: 'PUB-PROV-2026-0129',
      targetReference: 'Certificate PUB-PROV-2026-0129 (Tanvir Hossain)',
      outcome: 'success',
      details: 'Confirmed on-chain in Block #7421885. Reason: Superseded by original degree certificate following convocation.',
      transactionHash: '0x889214abce51670984126dfa785231cbf094621378daef52918340156cb21974',
      ipAddress: '127.0.0.1',
      createdAt: new Date(),
    },
    {
      actorEmail: 'controller.pub@gmail.com',
      actorRole: 'controller',
      action: 'IssuerAuthorized',
      targetType: 'issuer',
      targetId: 'PUB-SEC-2022-045',
      targetReference: 'Shamima Akter (shamima.academic@pub.edu.bd)',
      outcome: 'success',
      details: 'Authorized issuer account. Department: Academic Council Secretariat.',
      transactionHash: '0x629a8f27891240cde4b9012487abcdf18923485712efc4091a9238475812e9b0',
      ipAddress: '127.0.0.1',
      createdAt: new Date(Date.now() - 3600000 * 12),
    },
  ];

  for (const log of logs) {
    await db.collection('auditlogs').insertOne(log);
  }

  console.log('Successfully seeded Controller test records!');
  process.exit(0);
}

seed().catch(console.error);
