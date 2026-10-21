export interface StudentCertificate {
  id: string; // Unique ID, e.g. PUB-DEG-2026-000123
  type: 'Degree Certificate' | 'Provisional Certificate' | 'Academic Transcript';
  program: string; // e.g. BSc in CSE
  session: string; // e.g. 2022-23
  batch: string; // e.g. 54th Batch
  issueDate: string; // on-chain issue date
  status: 'valid' | 'revoked';
  sha256Hash: string; // Cryptographic hash
  txHash: string; // Blockchain issuance transaction
  blockNumber: number;
  issuerAddress: string;
  network: string; // e.g. Ethereum Sepolia
  degreeName: string;
  studentName: string;
  studentId: string;
  cgpa: string;
  revocationDate?: string;
  revocationReason?: string;
  revocationTxHash?: string;
  version?: number;
  supersededBy?: string;
}

export interface StudentShareLink {
  id: string;
  certId: string;
  certType: string;
  token: string;
  recipientLabel: string; // e.g. 'Dhaka Bank HR'
  createdAt: string;
  expiresAt: string;
  expiryHours: number;
  viewCount: number;
  maxViews: number | null; // null = unlimited
  includeDetails: boolean; // transcript/grades toggle
  status: 'active' | 'expired' | 'cancelled';
  fullUrl: string;
}

export interface StudentAuditEvent {
  id: string;
  timestamp: string;
  eventType: 'CertificateIssued' | 'CertificateRevoked' | 'ShareLinkCreated' | 'ShareLinkCancelled' | 'LinkOpened' | 'VerifiedByCertificateID' | 'VerifiedByQR';
  title: string;
  description: string;
  certId: string;
  method?: 'QR Scan' | 'Direct ID Search' | 'PDF Upload' | 'Share Link';
  txHash?: string;
  actorRole?: string;
}

export interface StudentProfileData {
  name: string;
  studentId: string;
  department: string;
  program: string;
  batch: string;
  session: string;
  email: string;
  cgpa: string;
  enrollmentDate: string;
  graduationDate: string;
  status: 'Graduated' | 'Active';
  lastLoginTime: string;
}

export const initialStudentData: StudentProfileData = {
  name: '',
  studentId: '',
  department: '',
  program: '',
  batch: '',
  session: '',
  email: '',
  cgpa: '',
  enrollmentDate: '',
  graduationDate: '',
  status: 'Active',
  lastLoginTime: '',
};

export const initialCertificates: StudentCertificate[] = [];
export const initialShareLinks: StudentShareLink[] = [];
export const initialAuditLogs: StudentAuditEvent[] = [];

