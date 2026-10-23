import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { Certificate } from '@/models/Certificate';
import { RevocationRequest } from '@/models/RevocationRequest';
import { AuditLog } from '@/models/AuditLog';

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json().catch(() => ({}));
    const { action = 'seed' } = body;

    if (action === 'clear') {
      await Promise.all([
        User.deleteMany({ email: { $regex: /@demo\.pub\.edu\.bd$/ } }),
        RevocationRequest.deleteMany({ isDemo: true }),
        Certificate.deleteMany({ id: { $regex: /^CERT-DEMO-/ } }),
      ]);
      return NextResponse.json({ success: true, message: 'Demo data cleared.' });
    }

    const defaultPasswordHash = await bcrypt.hash('Issuer@123456', 10);

    // 1. Seed Demo Issuer Applications (Pending, Approved, Suspended)
    const demoIssuersData = [
      {
        name: 'Dr. Rafiqul Islam',
        email: 'rafiqul.registrar@demo.pub.edu.bd',
        passwordHash: defaultPasswordHash,
        role: 'issuer',
        status: 'pending',
        department: 'Office of the Registrar',
        designation: 'Deputy Registrar (Examinations)',
        employeeId: 'PUB-REG-2024-001',
        walletAddress: '0x71C8360d8B667F8D69A1C50824b07114A5703E64',
        requestId: 'REQ-PUB-2026-4821',
        isWalletVerified: true,
      },
      {
        name: 'Prof. Anisur Rahman',
        email: 'anisur.examinations@demo.pub.edu.bd',
        passwordHash: defaultPasswordHash,
        role: 'issuer',
        status: 'pending',
        department: 'Department of Computer Science & Engineering',
        designation: 'Head of Department / Academic Issuer',
        employeeId: 'PUB-CSE-2023-019',
        walletAddress: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4df',
        requestId: 'REQ-PUB-2026-9042',
        isWalletVerified: true,
      },
      {
        name: 'Shamima Akter',
        email: 'shamima.academic@demo.pub.edu.bd',
        passwordHash: defaultPasswordHash,
        role: 'issuer',
        status: 'active',
        department: 'Academic Council Secretariat',
        designation: 'Assistant Controller',
        employeeId: 'PUB-SEC-2022-045',
        walletAddress: '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955',
        requestId: 'REQ-PUB-2025-1102',
        isWalletVerified: true,
      },
      {
        name: 'Md. Tariqul Hasan',
        email: 'tariqul.archive@demo.pub.edu.bd',
        passwordHash: defaultPasswordHash,
        role: 'issuer',
        status: 'suspended',
        department: 'University Archives & Records',
        designation: 'Senior Records Officer',
        employeeId: 'PUB-ARC-2021-088',
        walletAddress: '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f',
        requestId: 'REQ-PUB-2024-7731',
        isWalletVerified: false,
      },
    ];

    for (const issuer of demoIssuersData) {
      await User.findOneAndUpdate(
        { email: issuer.email },
        { $set: issuer },
        { upsert: true, new: true }
      );
    }

    // 2. Seed Sample Certificates for demonstration
    const demoCertificates = [
      {
        id: 'CERT-DEMO-2026-001',
        type: 'Degree Certificate',
        program: 'B.Sc. in Computer Science and Engineering',
        session: '2021-2025',
        batch: '21st Batch',
        issueDate: '2026-01-15',
        status: 'valid',
        sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        txHash: '0x7bfa637f9ef8d1544a053c89679f2ea69d77491ff297d2e053a496b0142b918a',
        blockNumber: 7421880,
        issuerAddress: '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955',
        network: 'Ethereum Sepolia Testnet',
        degreeName: 'Bachelor of Science in Computer Science and Engineering',
        studentName: 'Tariq Al-Mansoor',
        studentId: 'PUB-CSE-2101004',
        studentEmail: 'tariq.mansoor@student.pub.edu.bd',
        cgpa: '3.92',
        version: 1,
      },
      {
        id: 'CERT-DEMO-2026-002',
        type: 'Academic Transcript',
        program: 'B.Sc. in Electrical and Electronic Engineering',
        session: '2020-2024',
        batch: '20th Batch',
        issueDate: '2025-11-20',
        status: 'valid',
        sha256Hash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
        txHash: '0x4f260389a9be815d63f0d2c771b9c8d5e18237bca609457e5e347ad194f09231',
        blockNumber: 7421882,
        issuerAddress: '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955',
        network: 'Ethereum Sepolia Testnet',
        degreeName: 'Bachelor of Science in Electrical and Electronic Engineering',
        studentName: 'Nusrat Jahan Chowdhury',
        studentId: 'PUB-EEE-2001018',
        studentEmail: 'nusrat.jahan@student.pub.edu.bd',
        cgpa: '3.85',
        version: 1,
      },
      {
        id: 'CERT-DEMO-2026-003',
        type: 'Provisional Certificate',
        program: 'Bachelor of Business Administration (BBA)',
        session: '2021-2025',
        batch: '21st Batch',
        issueDate: '2026-02-01',
        status: 'revoked',
        sha256Hash: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
        txHash: '0x99245fa8e1b6f0e74f23a85b9e07894312d8a9f654b0c2e91148e652a97ef142',
        blockNumber: 7421885,
        issuerAddress: '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955',
        network: 'Ethereum Sepolia Testnet',
        degreeName: 'Bachelor of Business Administration',
        studentName: 'Tanvir Hossain',
        studentId: 'PUB-BBA-2101032',
        studentEmail: 'tanvir.hossain@student.pub.edu.bd',
        cgpa: '3.67',
        version: 1,
        revocationDate: '2026-02-18T10:30:00Z',
        revocationReason: 'Superseded by original degree certificate following convocation.',
        revocationTxHash: '0x889214abce51670984126dfa785231cbf094621378daef52918340156cb21974',
      },
    ];

    for (const cert of demoCertificates) {
      await Certificate.findOneAndUpdate(
        { id: cert.id },
        { $set: cert },
        { upsert: true, new: true }
      );
    }

    // 3. Seed Realistic Revocation Requests (with all required workflow states from PDF Section 6.4)
    const demoRevocations = [
      {
        certificateId: 'CERT-DEMO-2026-001',
        certificateType: 'Degree Certificate',
        studentName: 'Tariq Al-Mansoor',
        studentId: 'PUB-CSE-2101004',
        program: 'B.Sc. in Computer Science and Engineering',
        issueDate: '2026-01-15',
        originalTxHash: '0x7bfa637f9ef8d1544a053c89679f2ea69d77491ff297d2e053a496b0142b918a',
        sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        requestingIssuerName: 'Shamima Akter',
        requestingIssuerEmail: 'shamima.academic@demo.pub.edu.bd',
        requestingIssuerDepartment: 'Academic Council Secretariat',
        requestingIssuerWallet: '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955',
        requestingIssuerStatus: 'authorized',
        reason: 'Typographical error in student legal surname and major track specification.',
        evidenceNotes: 'Official affidavit submitted by student with National ID card verification. Academic council committee approved revised credential issuance.',
        requestedAt: new Date(Date.now() - 3600000 * 4), // 4 hours ago
        currentCertificateStatus: 'pending_revocation',
        workflowStatus: 'pending_review',
        isDemo: true,
      },
      {
        certificateId: 'CERT-DEMO-2026-002',
        certificateType: 'Academic Transcript',
        studentName: 'Nusrat Jahan Chowdhury',
        studentId: 'PUB-EEE-2001018',
        program: 'B.Sc. in Electrical and Electronic Engineering',
        issueDate: '2025-11-20',
        originalTxHash: '0x4f260389a9be815d63f0d2c771b9c8d5e18237bca609457e5e347ad194f09231',
        sha256Hash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
        requestingIssuerName: 'Prof. Anisur Rahman',
        requestingIssuerEmail: 'anisur.examinations@demo.pub.edu.bd',
        requestingIssuerDepartment: 'Department of Electrical Engineering',
        requestingIssuerWallet: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4df',
        requestingIssuerStatus: 'authorized',
        reason: 'Recalculation of Semester 7 grade after re-scrutiny approval by Faculty Dean.',
        evidenceNotes: 'Faculty Examination Syndicate resolution document #PUB-EXAM-2026-89 signed on Feb 10.',
        requestedAt: new Date(Date.now() - 3600000 * 24), // 1 day ago
        currentCertificateStatus: 'pending_revocation',
        workflowStatus: 'awaiting_signature',
        isDemo: true,
      },
      {
        certificateId: 'CERT-DEMO-2026-003',
        certificateType: 'Provisional Certificate',
        studentName: 'Tanvir Hossain',
        studentId: 'PUB-BBA-2101032',
        program: 'Bachelor of Business Administration',
        issueDate: '2026-02-01',
        originalTxHash: '0x99245fa8e1b6f0e74f23a85b9e07894312d8a9f654b0c2e91148e652a97ef142',
        sha256Hash: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
        requestingIssuerName: 'Shamima Akter',
        requestingIssuerEmail: 'shamima.academic@demo.pub.edu.bd',
        requestingIssuerDepartment: 'Academic Council Secretariat',
        requestingIssuerWallet: '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955',
        requestingIssuerStatus: 'authorized',
        reason: 'Superseded by original degree certificate following convocation.',
        requestedAt: new Date(Date.now() - 3600000 * 48), // 2 days ago
        currentCertificateStatus: 'revoked',
        workflowStatus: 'confirmed',
        controllerSignerEmail: 'controller@pub.edu.bd',
        controllerSignedAt: new Date(Date.now() - 3600000 * 46),
        transactionHash: '0x889214abce51670984126dfa785231cbf094621378daef52918340156cb21974',
        blockNumber: 7421885,
        network: 'Ethereum Sepolia Testnet',
        isDemo: true,
      },
    ];

    for (const rev of demoRevocations) {
      await RevocationRequest.findOneAndUpdate(
        { certificateId: rev.certificateId },
        { $set: rev },
        { upsert: true, new: true }
      );
    }

    // 4. Seed initial AuditLog entries for Controller
    const demoAuditLogs = [
      {
        actorEmail: 'controller@pub.edu.bd',
        actorRole: 'controller',
        action: 'CertificateRevocationConfirmed',
        targetType: 'certificate',
        targetId: 'CERT-DEMO-2026-003',
        targetReference: 'Certificate CERT-DEMO-2026-003 (Tanvir Hossain)',
        outcome: 'success' as const,
        details: 'Confirmed on-chain in Block #7421885. Reason: Superseded by original degree certificate following convocation.',
        transactionHash: '0x889214abce51670984126dfa785231cbf094621378daef52918340156cb21974',
        ipAddress: '127.0.0.1',
      },
      {
        actorEmail: 'controller@pub.edu.bd',
        actorRole: 'controller',
        action: 'IssuerAuthorized',
        targetType: 'issuer',
        targetId: 'PUB-SEC-2022-045',
        targetReference: 'Shamima Akter (shamima.academic@demo.pub.edu.bd)',
        outcome: 'success' as const,
        details: 'Authorized issuer account. Department: Academic Council Secretariat. Smart contract registration verified.',
        transactionHash: '0x629a8f27891240cde4b9012487abcdf18923485712efc4091a9238475812e9b0',
        ipAddress: '127.0.0.1',
      },
    ];

    for (const log of demoAuditLogs) {
      await AuditLog.create(log);
    }

    return NextResponse.json({
      success: true,
      message: 'Realistic demonstration dataset successfully seeded for Controller Dashboard!',
    });
  } catch (error) {
    console.error('Failed to seed demo data:', error);
    return NextResponse.json(
      {
        error: 'Failed to seed demo records.',
        details: error instanceof Error ? error.message : 'Database error',
      },
      { status: 500 }
    );
  }
}
