'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import {
  CheckCircle2,
  ShieldCheck,
  Plus,
  ShieldAlert,
  ArrowRight,
  UserCheck,
  FilePlus,
  FileSpreadsheet,
  Download,
  Users,
  Eye,
  ExternalLink,
  Award,
  QrCode,
  RefreshCw,
  Activity,
} from 'lucide-react';
import { IssuerSidebar, IssuerTab } from './IssuerSidebar';
import { IssuerTopHeader } from './IssuerTopHeader';
import { ReportsSection } from './ReportsSection';
import {
  PageHeader,
  StatStrip,
  Card,
  CardHeader,
  Button,
  ButtonLink,
  Badge,
  StatusBadge,
  HashText,
  explorerTxUrl,
  TableToolbar,
  SearchInput,
  Select,
  Input,
  Textarea,
  Field,
  TableContainer,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
  Stepper,
  FileDrop,
  Dialog,
  Alert,
  EmptyState,
  Spinner,
  StateToast,
  CertificateDocumentPreview,
} from '@/components/ui';

interface IssuedCert {
  id: string;
  studentName: string;
  studentId: string;
  type: string;
  program: string;
  session: string;
  cgpa: string;
  issueDate: string;
  status: 'valid' | 'revoked';
  txHash: string;
}

interface StudentRecord {
  id: string;
  studentId: string;
  name: string;
  email: string;
  department: string;
  program: string;
  batch: string;
  session: string;
  cgpa: string;
  certificateCount: number;
}

interface CsvParsedRow {
  studentId: string;
  studentName: string;
  studentEmail: string;
  program: string;
  session: string;
  batch: string;
  cgpa: string;
  type: string;
  isValid: boolean;
  validationError?: string;
}

interface AuditEntry {
  id: string;
  action: string;
  actorRole: string;
  actorEmail: string;
  targetType: string;
  targetId: string;
  targetReference: string;
  outcome: string;
  details: string;
  transactionHash?: string;
  timestamp: string;
}

export const IssuerDashboard: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<IssuerTab>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [certificates, setCertificates] = useState<IssuedCert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Issue Wizard States
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [certType, setCertType] = useState('Degree Certificate');
  const [program, setProgram] = useState('B.Sc. in Computer Science & Engineering');
  const [session, setSession] = useState('2020 - 2024');
  const [cgpa, setCgpa] = useState('3.88');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [issuedResult, setIssuedResult] = useState<IssuedCert | null>(null);
  const [issuedQrUrl, setIssuedQrUrl] = useState<string>('');

  // Certificate Preview Modal with dynamic QR Code
  const [previewCert, setPreviewCert] = useState<IssuedCert | null>(null);
  const [previewCertQrUrl, setPreviewCertQrUrl] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    if (!issuedResult?.id) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    QRCode.toDataURL(`${origin}/?id=${encodeURIComponent(issuedResult.id)}#verify`, {
      width: 256,
      margin: 1,
      color: { dark: '#0B1F3AFF', light: '#FFFFFFFF' },
    })
      .then((url) => {
        if (isMounted) setIssuedQrUrl(url);
      })
      .catch((err) => console.error('Failed to generate issued cert QR:', err));

    return () => {
      isMounted = false;
    };
  }, [issuedResult?.id]);

  useEffect(() => {
    let isMounted = true;
    if (!previewCert?.id) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    QRCode.toDataURL(`${origin}/?id=${encodeURIComponent(previewCert.id)}#verify`, {
      width: 256,
      margin: 1,
      color: { dark: '#0B1F3AFF', light: '#FFFFFFFF' },
    })
      .then((url) => {
        if (isMounted) setPreviewCertQrUrl(url);
      })
      .catch((err) => console.error('Failed to generate preview cert QR:', err));

    return () => {
      isMounted = false;
    };
  }, [previewCert?.id]);

  // Revocation modal state
  const [revokeModalCert, setRevokeModalCert] = useState<IssuedCert | null>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [isSubmittingRevoke, setIsSubmittingRevoke] = useState(false);

  // Student Directory States
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isNewStudentModalOpen, setIsNewStudentModalOpen] = useState(false);
  const [newStudentData, setNewStudentData] = useState({
    studentId: '',
    name: '',
    email: '',
    department: 'Computer Science & Engineering',
    program: 'B.Sc. in Computer Science & Engineering',
    batch: '42nd',
    session: '2020 - 2024',
    cgpa: '3.85',
  });
  const [isSubmittingStudent, setIsSubmittingStudent] = useState(false);

  // Batch CSV Issuance States
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvRows, setCsvRows] = useState<CsvParsedRow[]>([]);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [batchResult, setBatchResult] = useState<{
    processedCount: number;
    failedCount: number;
    txHash?: string;
    blockNumber?: number;
    failedRows?: Array<{ row: number; studentId: string; reason: string }>;
  } | null>(null);

  // Audit Log States
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [auditFilterAction, setAuditFilterAction] = useState('all');
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);

  // Registry Search & Filter
  const [registrySearch, setRegistrySearch] = useState('');
  const [registryStatusFilter, setRegistryStatusFilter] = useState<'all' | 'valid' | 'revoked'>('all');

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchCertificates = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/certificates');
      const data = await res.json();
      if (res.ok && data.success) {
        setCertificates(data.certificates);
      }
    } catch {
      console.error('Failed to fetch certificates');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStudents = useCallback(async (query = '') => {
    try {
      setIsLoadingStudents(true);
      const res = await fetch(`/api/students?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setStudents(data.students);
      }
    } catch {
      console.error('Failed to fetch students');
    } finally {
      setIsLoadingStudents(false);
    }
  }, []);

  const fetchAuditLogs = useCallback(async (action = 'all') => {
    try {
      setIsLoadingAudit(true);
      const res = await fetch(`/api/issuer/audit-logs?action=${encodeURIComponent(action)}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setAuditLogs(data.logs);
      }
    } catch {
      console.error('Failed to fetch audit logs');
    } finally {
      setIsLoadingAudit(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        const [certsRes, studentsRes, auditRes] = await Promise.all([
          fetch('/api/certificates'),
          fetch('/api/students'),
          fetch('/api/issuer/audit-logs'),
        ]);
        const certsData = await certsRes.json();
        const studentsData = await studentsRes.json();
        const auditData = await auditRes.json();
        if (isMounted) {
          if (certsData.success) setCertificates(certsData.certificates);
          if (studentsData.success) setStudents(studentsData.students);
          if (auditData.success) setAuditLogs(auditData.logs);
        }
      } catch {
        // quiet error
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsLoadingStudents(false);
          setIsLoadingAudit(false);
        }
      }
    }
    init();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleIssueSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName,
          studentId,
          studentEmail,
          program,
          session,
          cgpa,
          type: certType,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIssuedResult(data.certificate);
        setWizardStep(4);
        fetchCertificates();
        fetchAuditLogs();
        showToast('Certificate successfully issued and anchored to blockchain!', 'success');
      } else {
        showToast(data.message || 'Issuance failed', 'error');
      }
    } catch (err) {
      showToast('Error during issuance: ' + (err as Error).message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectStudentForIssue = (student: StudentRecord) => {
    setStudentName(student.name);
    setStudentId(student.studentId);
    setStudentEmail(student.email);
    setProgram(student.program || 'B.Sc. in Computer Science & Engineering');
    setSession(student.session || '2020 - 2024');
    setCgpa(student.cgpa || '3.85');
    setWizardStep(2);
    setActiveTab('issue');
    showToast(`Pre-filled academic record for ${student.name}`, 'info');
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentData.studentId || !newStudentData.name || !newStudentData.email) {
      showToast('Student ID, Name, and Email are required.', 'error');
      return;
    }
    setIsSubmittingStudent(true);
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudentData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Student record for ${newStudentData.name} created!`, 'success');
        setIsNewStudentModalOpen(false);
        setNewStudentData({
          studentId: '',
          name: '',
          email: '',
          department: 'Computer Science & Engineering',
          program: 'B.Sc. in Computer Science & Engineering',
          batch: '42nd',
          session: '2020 - 2024',
          cgpa: '3.85',
        });
        fetchStudents();
        fetchAuditLogs();
      } else {
        showToast(data.message || 'Failed to create student record', 'error');
      }
    } catch (err) {
      showToast('Error creating student: ' + (err as Error).message, 'error');
    } finally {
      setIsSubmittingStudent(false);
    }
  };

  const parseCsvFile = (file: File | null) => {
    setCsvFile(file);
    if (!file) {
      setCsvRows([]);
      setBatchResult(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      if (lines.length <= 1) {
        showToast('CSV file is empty or missing data rows.', 'error');
        return;
      }

      const headers = lines[0].toLowerCase().split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
      const idIdx = headers.findIndex((h) => h.includes('id') || h.includes('student_no') || h.includes('roll'));
      const nameIdx = headers.findIndex((h) => h.includes('name'));
      const emailIdx = headers.findIndex((h) => h.includes('email'));
      const progIdx = headers.findIndex((h) => h.includes('program') || h.includes('programme') || h.includes('dept'));
      const sessionIdx = headers.findIndex((h) => h.includes('session'));
      const cgpaIdx = headers.findIndex((h) => h.includes('cgpa') || h.includes('gpa') || h.includes('result'));
      const typeIdx = headers.findIndex((h) => h.includes('type') || h.includes('cert'));

      const parsed: CsvParsedRow[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
        if (cols.length === 0 || cols.every((c) => !c)) continue;

        const sId = (idIdx !== -1 ? cols[idIdx] : cols[0]) || '';
        const sName = (nameIdx !== -1 ? cols[nameIdx] : cols[1]) || '';
        const sEmail = (emailIdx !== -1 ? cols[emailIdx] : cols[2]) || '';
        const sProg = (progIdx !== -1 ? cols[progIdx] : cols[3]) || 'B.Sc. in Computer Science & Engineering';
        const sSession = (sessionIdx !== -1 ? cols[sessionIdx] : cols[4]) || '2020 - 2024';
        const sCgpa = (cgpaIdx !== -1 ? cols[cgpaIdx] : cols[6]) || '3.75';
        const sType = (typeIdx !== -1 ? cols[typeIdx] : cols[5]) || 'Degree Certificate';

        const isValid = Boolean(sId.trim() && sName.trim());
        parsed.push({
          studentId: sId.trim().toUpperCase(),
          studentName: sName.trim(),
          studentEmail: sEmail.trim() || `${sId.trim().toLowerCase()}@pub.ac.bd`,
          program: sProg.trim(),
          session: sSession.trim(),
          batch: '42nd',
          cgpa: sCgpa.trim(),
          type: sType.trim(),
          isValid,
          validationError: !isValid ? 'Missing Student ID or Student Name' : undefined,
        });
      }

      setCsvRows(parsed);
      setBatchResult(null);
      showToast(`Loaded ${parsed.length} rows from CSV file.`, 'info');
    };
    reader.readAsText(file);
  };

  const handleDownloadCsvTemplate = () => {
    const csvSample = `student_id,name,email,program,session,cert_type,cgpa\n0322410105102001,Rahim Ahmed,rahim@pub.ac.bd,B.Sc. in Computer Science & Engineering,2020 - 2024,Degree Certificate,3.92\n0322410105102002,Fatima Begum,fatima@pub.ac.bd,B.Sc. in Computer Science & Engineering,2020 - 2024,Degree Certificate,3.85\n0322410105102003,Tanvir Islam,tanvir@pub.ac.bd,B.Sc. in Electrical & Electronic Engineering,2020 - 2024,Degree Certificate,3.78`;
    const blob = new Blob([csvSample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students_batch_template.csv';
    a.click();
  };

  const handleExecuteBatchIssuance = async () => {
    const validRows = csvRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      showToast('No valid student rows to issue.', 'error');
      return;
    }

    setIsProcessingBatch(true);
    setBatchResult(null);
    try {
      const res = await fetch('/api/certificates/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: validRows }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBatchResult({
          processedCount: data.processedCount,
          failedCount: data.failedCount,
          txHash: data.txHash,
          blockNumber: data.blockNumber,
          failedRows: data.failedRows,
        });
        showToast(`Batch of ${data.processedCount} certificates anchored to Blockchain!`, 'success');
        fetchCertificates();
        fetchAuditLogs();
      } else {
        showToast(data.message || 'Batch issuance failed', 'error');
      }
    } catch (err) {
      showToast('Error during batch issuance: ' + (err as Error).message, 'error');
    } finally {
      setIsProcessingBatch(false);
    }
  };

  const handleRevokeRequestSubmit = async () => {
    if (!revokeModalCert || !revokeReason.trim()) return;
    setIsSubmittingRevoke(true);
    try {
      const res = await fetch(`/api/certificates/${revokeModalCert.id}/revoke-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: revokeReason,
          issuerName: 'Office of the Registrar',
          issuerEmail: 'registrar@pub.ac.bd',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Revocation request forwarded to Controller for co-signature!', 'success');
        setRevokeModalCert(null);
        setRevokeReason('');
        fetchCertificates();
        fetchAuditLogs();
      } else {
        showToast(data.message || 'Failed to submit revocation request', 'error');
      }
    } catch (err) {
      showToast('Error: ' + (err as Error).message, 'error');
    } finally {
      setIsSubmittingRevoke(false);
    }
  };

  const handleLogout = () => {
    clearSessionUser();
    router.push('/login');
  };

  const validCount = certificates.filter((c) => c.status === 'valid').length;
  const revokedCount = certificates.filter((c) => c.status === 'revoked').length;

  const filteredCertificates = certificates.filter((c) => {
    const matchesSearch =
      registrySearch.trim() === '' ||
      c.id.toLowerCase().includes(registrySearch.toLowerCase()) ||
      c.studentName.toLowerCase().includes(registrySearch.toLowerCase()) ||
      c.studentId.toLowerCase().includes(registrySearch.toLowerCase()) ||
      c.program.toLowerCase().includes(registrySearch.toLowerCase());

    const matchesStatus =
      registryStatusFilter === 'all' || c.status === registryStatusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="h-screen overflow-hidden bg-canvas text-ink flex font-sans antialiased">
      <StateToast
        message={toast?.message ?? null}
        tone={toast?.type === 'error' ? 'danger' : toast?.type === 'info' ? 'info' : 'success'}
      />

      <IssuerSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        certificatesCount={certificates.length}
        studentsCount={students.length}
        auditCount={auditLogs.length}
        onLogout={handleLogout}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 h-screen flex flex-col min-w-0 overflow-hidden">
        <IssuerTopHeader
          activeTab={activeTab}
          onRefresh={() => {
            fetchCertificates();
            fetchStudents();
            fetchAuditLogs();
            showToast('Registry refreshed from smart contract and database.', 'info');
          }}
          isLoading={isLoading}
          onLogout={handleLogout}
          onSelectTab={setActiveTab}
          onToggleMobileMenu={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          issuerName="Office of the Registrar"
          issuerEmail="registrar@pub.ac.bd"
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <Card className="bg-night text-night-text border-night-line on-night" padding="lg">
                <div className="max-w-3xl space-y-3">
                  <Badge tone="seal" size="sm">
                    Academic Issuance Authority • Pundra University
                  </Badge>
                  <h2 className="text-2xl sm:text-3xl font-serif font-semibold tracking-tight text-night-text">
                    Registrar Credential Management Portal
                  </h2>
                  <p className="text-night-muted text-sm leading-relaxed">
                    Compile deterministic A4 academic diplomas, transcripts, and provisional certificates, and anchor their SHA-256 digests onto Ethereum Sepolia with zero cryptographic drift.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2.5">
                    <Button
                      variant="seal"
                      size="sm"
                      leftIcon={<FilePlus className="w-4 h-4" />}
                      onClick={() => setActiveTab('issue')}
                    >
                      Issue Single Credential
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<FileSpreadsheet className="w-4 h-4" />}
                      onClick={() => setActiveTab('batch')}
                      className="bg-night-2 text-night-text border-night-line hover:bg-night-3"
                    >
                      Batch CSV Issuance
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<Users className="w-4 h-4" />}
                      onClick={() => setActiveTab('students')}
                      className="bg-night-2 text-night-text border-night-line hover:bg-night-3"
                    >
                      Student Directory
                    </Button>
                  </div>
                </div>
              </Card>

              <StatStrip
                cols={4}
                stats={[
                  {
                    label: 'Total Issued',
                    value: certificates.length,
                    sublabel: 'Anchored on-chain',
                    icon: <Award className="w-4 h-4" />,
                    tone: 'brand',
                    onClick: () => setActiveTab('certificates'),
                  },
                  {
                    label: 'Valid Active',
                    value: validCount,
                    sublabel: 'Cryptographically intact',
                    icon: <CheckCircle2 className="w-4 h-4" />,
                    tone: 'success',
                    onClick: () => setActiveTab('certificates'),
                  },
                  {
                    label: 'Enrolled Students',
                    value: students.length,
                    sublabel: 'Matriculation directory',
                    icon: <UserCheck className="w-4 h-4" />,
                    tone: 'seal',
                    onClick: () => setActiveTab('students'),
                  },
                  {
                    label: 'Revoked',
                    value: revokedCount,
                    sublabel: 'Co-signed revocations',
                    icon: <ShieldAlert className="w-4 h-4" />,
                    tone: revokedCount > 0 ? 'warning' : 'default',
                    onClick: () => setActiveTab('certificates'),
                  },
                ]}
              />

              <Card>
                <CardHeader
                  eyebrow="Live Ledger Feed"
                  title="Recently Issued Credentials"
                  description="Synchronized from Ethereum Sepolia smart contract and institutional MongoDB registry."
                  actions={
                    <Button
                      variant="ghost"
                      size="sm"
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      onClick={() => setActiveTab('certificates')}
                    >
                      View All ({certificates.length})
                    </Button>
                  }
                />

                {isLoading ? (
                  <div className="p-12 flex justify-center">
                    <Spinner size="lg" />
                  </div>
                ) : certificates.length === 0 ? (
                  <EmptyState
                    icon={<Award className="w-5 h-5" />}
                    title="No certificates issued yet"
                    description="Click 'Issue Single Credential' or upload a batch CSV to anchor your first academic diploma."
                    action={
                      <Button variant="primary" size="sm" onClick={() => setActiveTab('issue')}>
                        Issue First Credential
                      </Button>
                    }
                  />
                ) : (
                  <TableContainer className="border-0 rounded-none">
                    <Table>
                      <THead>
                        <TR>
                          <TH>Certificate ID</TH>
                          <TH>Candidate</TH>
                          <TH>Program</TH>
                          <TH>Issued</TH>
                          <TH>Status</TH>
                          <TH align="right">Actions</TH>
                        </TR>
                      </THead>
                      <TBody>
                        {certificates.slice(0, 6).map((cert) => (
                          <TR key={cert.id}>
                            <TD>
                              <span className="font-mono text-xs font-semibold text-brand">
                                {cert.id}
                              </span>
                            </TD>
                            <TD>
                              <div className="font-semibold text-ink text-sm">{cert.studentName}</div>
                              <div className="text-xs font-mono text-muted">{cert.studentId}</div>
                            </TD>
                            <TD>
                              <span className="text-xs text-ink-2">{cert.program}</span>
                            </TD>
                            <TD>
                              <span className="text-xs text-muted">{cert.issueDate}</span>
                            </TD>
                            <TD>
                              <StatusBadge status={cert.status} />
                            </TD>
                            <TD align="right">
                              <div className="inline-flex items-center justify-end gap-1.5">
                                <Button
                                  variant="secondary"
                                  size="xs"
                                  leftIcon={<Eye className="w-3.5 h-3.5" />}
                                  onClick={() => setPreviewCert(cert)}
                                >
                                  Inspect
                                </Button>
                                <ButtonLink
                                  href={`/api/certificates/${cert.id}/pdf`}
                                  target="_blank"
                                  rel="noreferrer"
                                  variant="secondary"
                                  size="xs"
                                  leftIcon={<Download className="w-3.5 h-3.5" />}
                                >
                                  PDF
                                </ButtonLink>
                              </div>
                            </TD>
                          </TR>
                        ))}
                      </TBody>
                    </Table>
                  </TableContainer>
                )}
              </Card>
            </div>
          )}

          {/* TAB 2: STUDENT DIRECTORY */}
          {activeTab === 'students' && (
            <div className="space-y-6">
              <PageHeader
                eyebrow="Matriculation Roll"
                title="Student Academic Directory"
                description="Maintain verified student profiles, graduation batches, and launch single-click credential issuance."
                actions={
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Plus className="w-4 h-4" />}
                    onClick={() => setIsNewStudentModalOpen(true)}
                  >
                    Add Student Record
                  </Button>
                }
              />

              <Card>
                <TableToolbar
                  left={
                    <SearchInput
                      value={studentSearch}
                      onChange={(e) => {
                        setStudentSearch(e.target.value);
                        fetchStudents(e.target.value);
                      }}
                      onClear={() => {
                        setStudentSearch('');
                        fetchStudents('');
                      }}
                      placeholder="Search students by name, Student Roll ID, email, or department..."
                      className="w-full sm:w-96"
                    />
                  }
                  right={
                    <Badge tone="neutral">
                      {students.length} Enrolled Records
                    </Badge>
                  }
                />

                {isLoadingStudents ? (
                  <div className="p-12 flex justify-center">
                    <Spinner size="lg" />
                  </div>
                ) : students.length === 0 ? (
                  <EmptyState
                    icon={<Users className="w-5 h-5" />}
                    title="No student records found"
                    description="No student profiles match your search query. Add a new student record to begin."
                    action={
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<Plus className="w-4 h-4" />}
                        onClick={() => setIsNewStudentModalOpen(true)}
                      >
                        Add New Student
                      </Button>
                    }
                  />
                ) : (
                  <TableContainer className="border-0 rounded-none">
                    <Table>
                      <THead>
                        <TR>
                          <TH>Student Roll ID</TH>
                          <TH>Candidate Name &amp; Email</TH>
                          <TH>Department / Program</TH>
                          <TH>Batch &amp; Session</TH>
                          <TH>CGPA</TH>
                          <TH>Credentials</TH>
                          <TH align="right">Action</TH>
                        </TR>
                      </THead>
                      <TBody>
                        {students.map((st) => (
                          <TR key={st.id}>
                            <TD>
                              <span className="font-mono font-semibold text-xs text-brand">
                                {st.studentId}
                              </span>
                            </TD>
                            <TD>
                              <div className="font-semibold text-ink text-sm">{st.name}</div>
                              <div className="text-xs text-muted">{st.email}</div>
                            </TD>
                            <TD>
                              <span className="text-xs text-ink-2">{st.department || st.program}</span>
                            </TD>
                            <TD>
                              <span className="text-xs text-muted">
                                {st.batch} ({st.session})
                              </span>
                            </TD>
                            <TD>
                              <span className="font-mono font-semibold text-xs text-success">
                                {st.cgpa || 'N/A'}
                              </span>
                            </TD>
                            <TD>
                              <Badge tone="brand" size="xs">
                                {st.certificateCount} Issued
                              </Badge>
                            </TD>
                            <TD align="right">
                              <Button
                                variant="primary"
                                size="xs"
                                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                                onClick={() => handleSelectStudentForIssue(st)}
                              >
                                Issue Cert
                              </Button>
                            </TD>
                          </TR>
                        ))}
                      </TBody>
                    </Table>
                  </TableContainer>
                )}
              </Card>
            </div>
          )}

          {/* TAB 3: SINGLE ISSUANCE WIZARD */}
          {activeTab === 'issue' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <PageHeader
                eyebrow="Cryptographic Credential Compiler"
                title="Single Certificate Issuance"
                description="Generate a deterministic A4 PDF credential with embedded QR verification and anchor its SHA-256 hash on Ethereum Sepolia."
              />

              <Card padding="lg" className="space-y-6">
                <Stepper
                  currentStep={wizardStep - 1}
                  steps={[
                    { label: 'Candidate Identity', description: 'Roll ID & Email' },
                    { label: 'Academic Parameters', description: 'Degree & CGPA' },
                    { label: 'Cryptographic Sign', description: 'Anchor on-chain' },
                    { label: 'Ledger Receipt', description: 'Download PDF' },
                  ]}
                />

                {wizardStep === 1 && (
                  <div className="space-y-4 pt-2">
                    <Field label="Full Candidate Name (As on Matriculation Roll)" required>
                      <Input
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="e.g. Md. Shakib Akando"
                      />
                    </Field>

                    <Field label="Student Identification Roll (Unique)" required>
                      <Input
                        mono
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                        placeholder="e.g. 0322410105101055"
                      />
                    </Field>

                    <Field
                      label="Candidate Institutional Email"
                      optional="optional"
                      hint="Used to link this credential to the student's self-service vault."
                    >
                      <Input
                        type="email"
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                        placeholder="e.g. student@pub.ac.bd"
                      />
                    </Field>

                    <div className="pt-2 flex justify-end">
                      <Button
                        variant="primary"
                        disabled={!studentName.trim() || !studentId.trim()}
                        rightIcon={<ArrowRight className="w-4 h-4" />}
                        onClick={() => setWizardStep(2)}
                      >
                        Continue to Academic Parameters
                      </Button>
                    </div>
                  </div>
                )}

                {wizardStep === 2 && (
                  <div className="space-y-4 pt-2">
                    <Field label="Credential Document Type" required>
                      <Select value={certType} onChange={(e) => setCertType(e.target.value)}>
                        <option value="Degree Certificate">Degree Certificate (Main Parchment)</option>
                        <option value="Provisional Certificate">Provisional Certificate</option>
                        <option value="Academic Transcript">Official Academic Transcript</option>
                      </Select>
                    </Field>

                    <Field label="Academic Degree Program" required>
                      <Select value={program} onChange={(e) => setProgram(e.target.value)}>
                        <option value="B.Sc. in Computer Science & Engineering">
                          B.Sc. in Computer Science &amp; Engineering
                        </option>
                        <option value="B.Sc. in Electrical & Electronic Engineering">
                          B.Sc. in Electrical &amp; Electronic Engineering
                        </option>
                        <option value="B.Sc. in Civil Engineering">B.Sc. in Civil Engineering</option>
                        <option value="Bachelor of Business Administration (BBA)">
                          Bachelor of Business Administration (BBA)
                        </option>
                        <option value="Bachelor of Laws (LL.B Honors)">
                          Bachelor of Laws (LL.B Honors)
                        </option>
                      </Select>
                    </Field>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Academic Session" required>
                        <Input
                          value={session}
                          onChange={(e) => setSession(e.target.value)}
                          placeholder="2020 - 2024"
                        />
                      </Field>

                      <Field label="Cumulative GPA (Out of 4.00)" required>
                        <Input
                          mono
                          value={cgpa}
                          onChange={(e) => setCgpa(e.target.value)}
                          placeholder="3.88"
                        />
                      </Field>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <Button variant="secondary" onClick={() => setWizardStep(1)}>
                        Back
                      </Button>
                      <Button
                        variant="primary"
                        rightIcon={<ArrowRight className="w-4 h-4" />}
                        onClick={() => setWizardStep(3)}
                      >
                        Review &amp; Anchor
                      </Button>
                    </div>
                  </div>
                )}

                {wizardStep === 3 && (
                  <div className="space-y-5 pt-2">
                    <CertificateDocumentPreview
                      certId="PUB-DEG-2026-PREVIEW"
                      studentName={studentName}
                      studentId={studentId}
                      degree={certType}
                      department={program}
                      session={session}
                      cgpa={cgpa}
                      issuedAt="Upon Blockchain Anchor"
                    />

                    <Alert
                      tone="info"
                      icon={<ShieldCheck className="w-4 h-4" />}
                      title="Deterministic PDF Compilation & Blockchain Anchoring"
                    >
                      Confirming will compile the deterministic PDF byte stream, compute its SHA-256 cryptographic digest, and invoke <code className="font-mono">CertChain.issueCertificate()</code> on Ethereum Sepolia.
                    </Alert>

                    <div className="pt-2 flex items-center justify-between">
                      <Button
                        variant="secondary"
                        disabled={isSubmitting}
                        onClick={() => setWizardStep(2)}
                      >
                        Back to Edit
                      </Button>
                      <Button
                        variant="primary"
                        loading={isSubmitting}
                        leftIcon={<ShieldCheck className="w-4 h-4" />}
                        onClick={handleIssueSubmit}
                      >
                        Confirm &amp; Anchor On-Chain
                      </Button>
                    </div>
                  </div>
                )}

                {wizardStep === 4 && issuedResult && (
                  <div className="space-y-5 pt-2">
                    <Alert
                      tone="success"
                      title={`Credential ${issuedResult.id} Anchored to Blockchain`}
                    >
                      The official PDF diploma has been compiled and its SHA-256 fingerprint is permanently recorded on the smart contract ledger.
                    </Alert>

                    <div className="flex flex-col sm:flex-row items-center gap-5 bg-sunken p-5 rounded-xl border border-line">
                      {issuedQrUrl ? (
                        <div className="w-28 h-28 bg-surface p-1.5 rounded-lg border border-line shrink-0 flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={issuedQrUrl}
                            alt={`QR Code for ${issuedResult.id}`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-28 h-28 bg-surface p-2 rounded-lg border border-line shrink-0 flex items-center justify-center">
                          <QrCode className="w-10 h-10 text-muted animate-pulse" />
                        </div>
                      )}
                      <div className="space-y-2 min-w-0 flex-1 text-xs">
                        <div>
                          <span className="text-muted block text-[11px] uppercase tracking-wider font-semibold">
                            Certificate ID
                          </span>
                          <span className="font-mono font-bold text-brand text-sm">
                            {issuedResult.id}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted block text-[11px] uppercase tracking-wider font-semibold">
                            Candidate
                          </span>
                          <span className="text-ink font-semibold">
                            {issuedResult.studentName} ({issuedResult.studentId})
                          </span>
                        </div>
                        <div>
                          <span className="text-muted block text-[11px] uppercase tracking-wider font-semibold">
                            Blockchain Transaction Hash
                          </span>
                          <HashText
                            value={issuedResult.txHash}
                            start={14}
                            end={10}
                            href={explorerTxUrl(issuedResult.txHash)}
                          />
                        </div>
                        <div className="pt-1">
                          <a
                            href={`/?id=${encodeURIComponent(issuedResult.id)}#verify`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-brand hover:underline font-semibold text-xs"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Open Public Verification Record</span>
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setStudentName('');
                          setStudentId('');
                          setIssuedResult(null);
                          setWizardStep(1);
                        }}
                      >
                        Issue Another Credential
                      </Button>
                      <ButtonLink
                        href={`/api/certificates/${issuedResult.id}/pdf`}
                        target="_blank"
                        rel="noreferrer"
                        variant="primary"
                        leftIcon={<Download className="w-4 h-4" />}
                      >
                        Download Official PDF
                      </ButtonLink>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* TAB 4: BATCH CSV ISSUANCE */}
          {activeTab === 'batch' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <PageHeader
                eyebrow="Automated Smart Contract Batching"
                title="Batch CSV Certificate Issuance"
                description="Upload a graduating class spreadsheet to compile deterministic PDFs and anchor all credentials in a single batch workflow."
                actions={
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<Download className="w-4 h-4" />}
                    onClick={handleDownloadCsvTemplate}
                  >
                    Download Sample CSV Template
                  </Button>
                }
              />

              <Card padding="lg" className="space-y-6">
                <FileDrop
                  accept=".csv,text/csv"
                  file={csvFile}
                  onFileChange={parseCsvFile}
                  title="Drop graduating batch CSV spreadsheet here, or click to browse"
                  hint="Expected columns: student_id, name, email, program, session, cert_type, cgpa"
                />

                {csvRows.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-line">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-serif font-semibold text-ink">
                          Parsed Candidate Rows ({csvRows.length} Total)
                        </h4>
                        <p className="text-xs text-muted">
                          {csvRows.filter((r) => r.isValid).length} valid candidate records ready for on-chain anchoring.
                        </p>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        loading={isProcessingBatch}
                        disabled={csvRows.filter((r) => r.isValid).length === 0}
                        leftIcon={<ShieldCheck className="w-4 h-4" />}
                        onClick={handleExecuteBatchIssuance}
                      >
                        Execute Batch Issuance ({csvRows.filter((r) => r.isValid).length})
                      </Button>
                    </div>

                    <TableContainer className="max-h-80 overflow-y-auto">
                      <Table>
                        <THead>
                          <TR>
                            <TH>#</TH>
                            <TH>Student Roll ID</TH>
                            <TH>Candidate Name</TH>
                            <TH>Program</TH>
                            <TH>CGPA</TH>
                            <TH>Validation</TH>
                          </TR>
                        </THead>
                        <TBody>
                          {csvRows.map((row, idx) => (
                            <TR key={idx} className={!row.isValid ? 'bg-danger-bg/40' : undefined}>
                              <TD className="text-muted font-mono text-xs">{idx + 1}</TD>
                              <TD className="font-mono font-semibold text-xs text-brand">
                                {row.studentId}
                              </TD>
                              <TD className="font-medium text-ink text-xs">{row.studentName}</TD>
                              <TD className="text-xs text-ink-2">{row.program}</TD>
                              <TD className="font-mono font-semibold text-xs text-success">
                                {row.cgpa}
                              </TD>
                              <TD>
                                {row.isValid ? (
                                  <Badge tone="success" size="xs">
                                    Valid
                                  </Badge>
                                ) : (
                                  <Badge tone="danger" size="xs">
                                    {row.validationError || 'Invalid'}
                                  </Badge>
                                )}
                              </TD>
                            </TR>
                          ))}
                        </TBody>
                      </Table>
                    </TableContainer>
                  </div>
                )}

                {batchResult && (
                  <Alert
                    tone="success"
                    title="Batch Smart Contract Execution Completed"
                  >
                    <div className="space-y-3 mt-2 text-xs">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg bg-surface border border-success-border">
                        <div>
                          <span className="text-muted block text-[11px]">Issued Credentials</span>
                          <span className="font-bold text-base text-success tabular">
                            {batchResult.processedCount}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted block text-[11px]">Failed Rows</span>
                          <span className="font-bold text-base text-danger tabular">
                            {batchResult.failedCount}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted block text-[11px]">Block Height</span>
                          <span className="font-mono font-bold text-base text-ink">
                            #{batchResult.blockNumber}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted block text-[11px]">Contract Method</span>
                          <span className="font-mono font-semibold text-xs text-brand">
                            issueBatchCertificates
                          </span>
                        </div>
                      </div>

                      {batchResult.txHash && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted">Batch Transaction Hash:</span>
                          <HashText
                            value={batchResult.txHash}
                            start={14}
                            end={10}
                            href={explorerTxUrl(batchResult.txHash)}
                          />
                        </div>
                      )}

                      {batchResult.failedRows && batchResult.failedRows.length > 0 && (
                        <div className="p-3 bg-danger-bg rounded-lg border border-danger-border text-danger space-y-1">
                          <span className="font-semibold block">Failed Rows Report:</span>
                          {batchResult.failedRows.map((f, i) => (
                            <p key={i}>
                              Row #{f.row} ({f.studentId}): {f.reason}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </Alert>
                )}
              </Card>
            </div>
          )}

          {/* TAB 5: ISSUED REGISTRY */}
          {activeTab === 'certificates' && (
            <div className="space-y-6">
              <PageHeader
                eyebrow="Anchored Diploma Ledger"
                title="Issued Certificates Registry"
                description="Inspect all issued credentials, download deterministic PDFs, or initiate a formal revocation request for Controller co-signature."
                actions={
                  <Badge tone="brand">
                    {filteredCertificates.length} of {certificates.length} Shown
                  </Badge>
                }
              />

              <Card>
                <TableToolbar
                  left={
                    <>
                      <SearchInput
                        value={registrySearch}
                        onChange={(e) => setRegistrySearch(e.target.value)}
                        onClear={() => setRegistrySearch('')}
                        placeholder="Search by Certificate ID, candidate name, roll ID, or program..."
                        className="w-full sm:w-96"
                      />
                      <Select
                        value={registryStatusFilter}
                        onChange={(e) =>
                          setRegistryStatusFilter(e.target.value as 'all' | 'valid' | 'revoked')
                        }
                        className="w-full sm:w-44"
                        aria-label="Filter by certificate status"
                      >
                        <option value="all">All Statuses</option>
                        <option value="valid">Valid Active</option>
                        <option value="revoked">Revoked</option>
                      </Select>
                    </>
                  }
                  right={
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                      onClick={fetchCertificates}
                    >
                      Refresh
                    </Button>
                  }
                />

                {filteredCertificates.length === 0 ? (
                  <EmptyState
                    icon={<Award className="w-5 h-5" />}
                    title="No matching certificates"
                    description="Adjust your search query or status filter to view anchored credentials."
                  />
                ) : (
                  <TableContainer className="border-0 rounded-none">
                    <Table>
                      <THead>
                        <TR>
                          <TH>Certificate ID</TH>
                          <TH>Candidate</TH>
                          <TH>Program</TH>
                          <TH>Issue Date</TH>
                          <TH>Status</TH>
                          <TH align="right">Actions</TH>
                        </TR>
                      </THead>
                      <TBody>
                        {filteredCertificates.map((cert) => (
                          <TR key={cert.id}>
                            <TD>
                              <span className="font-mono font-semibold text-xs text-brand">
                                {cert.id}
                              </span>
                            </TD>
                            <TD>
                              <div className="font-semibold text-ink text-sm">{cert.studentName}</div>
                              <div className="text-xs font-mono text-muted">{cert.studentId}</div>
                            </TD>
                            <TD>
                              <span className="text-xs text-ink-2">{cert.program}</span>
                            </TD>
                            <TD>
                              <span className="text-xs text-muted">{cert.issueDate}</span>
                            </TD>
                            <TD>
                              <StatusBadge status={cert.status} />
                            </TD>
                            <TD align="right">
                              <div className="inline-flex items-center justify-end gap-1.5">
                                <Button
                                  variant="secondary"
                                  size="xs"
                                  leftIcon={<Eye className="w-3.5 h-3.5" />}
                                  onClick={() => setPreviewCert(cert)}
                                >
                                  Inspect
                                </Button>
                                <ButtonLink
                                  href={`/api/certificates/${cert.id}/pdf`}
                                  target="_blank"
                                  rel="noreferrer"
                                  variant="secondary"
                                  size="xs"
                                  leftIcon={<Download className="w-3.5 h-3.5" />}
                                >
                                  PDF
                                </ButtonLink>
                                {cert.status === 'valid' && (
                                  <Button
                                    variant="danger-outline"
                                    size="xs"
                                    onClick={() => {
                                      setRevokeModalCert(cert);
                                      setRevokeReason('');
                                    }}
                                  >
                                    Request Revocation
                                  </Button>
                                )}
                              </div>
                            </TD>
                          </TR>
                        ))}
                      </TBody>
                    </Table>
                  </TableContainer>
                )}
              </Card>
            </div>
          )}

          {/* TAB 6: AUDIT TRAIL */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              <PageHeader
                eyebrow="Tamper-Evident Activity Log"
                title="Cryptographic Audit Trail"
                description="Immutable record of single issuances, batch CSV executions, revocation requests, and student directory updates."
              />

              <Card>
                <TableToolbar
                  left={
                    <Select
                      value={auditFilterAction}
                      onChange={(e) => {
                        setAuditFilterAction(e.target.value);
                        fetchAuditLogs(e.target.value);
                      }}
                      className="w-full sm:w-64"
                      aria-label="Filter audit logs by action"
                    >
                      <option value="all">All Audit Actions</option>
                      <option value="CERTIFICATE_ISSUED">Certificate Issued</option>
                      <option value="BATCH_CERTIFICATES_ISSUED">Batch Certificates Issued</option>
                      <option value="REVOCATION_REQUESTED">Revocation Requested</option>
                      <option value="STUDENT_RECORD_CREATED">Student Record Created</option>
                    </Select>
                  }
                  right={
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                      onClick={() => fetchAuditLogs(auditFilterAction)}
                    >
                      Refresh
                    </Button>
                  }
                />

                {isLoadingAudit ? (
                  <div className="p-12 flex justify-center">
                    <Spinner size="lg" />
                  </div>
                ) : auditLogs.length === 0 ? (
                  <EmptyState
                    icon={<Activity className="w-5 h-5" />}
                    title="No audit events recorded"
                    description="No audit logs match the selected action filter."
                  />
                ) : (
                  <TableContainer className="border-0 rounded-none">
                    <Table>
                      <THead>
                        <TR>
                          <TH>Timestamp</TH>
                          <TH>Action</TH>
                          <TH>Actor Role</TH>
                          <TH>Details &amp; Target</TH>
                          <TH>Blockchain Tx</TH>
                        </TR>
                      </THead>
                      <TBody>
                        {auditLogs.map((log) => (
                          <TR key={log.id}>
                            <TD className="text-xs text-muted whitespace-nowrap">
                              {log.timestamp}
                            </TD>
                            <TD>
                              <Badge
                                tone={
                                  log.action.includes('ISSUED')
                                    ? 'brand'
                                    : log.action.includes('REVOKE')
                                    ? 'warning'
                                    : 'neutral'
                                }
                                size="xs"
                              >
                                {log.action}
                              </Badge>
                            </TD>
                            <TD className="text-xs font-semibold text-ink uppercase">
                              {log.actorRole}
                            </TD>
                            <TD className="max-w-md">
                              <div className="font-semibold text-xs text-ink">
                                {log.targetReference || log.targetId}
                              </div>
                              <div className="text-xs text-muted">{log.details}</div>
                            </TD>
                            <TD>
                              {log.transactionHash ? (
                                <HashText
                                  value={log.transactionHash}
                                  start={8}
                                  end={6}
                                  href={explorerTxUrl(log.transactionHash)}
                                />
                              ) : (
                                <span className="text-xs text-subtle">—</span>
                              )}
                            </TD>
                          </TR>
                        ))}
                      </TBody>
                    </Table>
                  </TableContainer>
                )}
              </Card>
            </div>
          )}

          {/* TAB 7: REPORTS & ANALYTICS */}
          {activeTab === 'reports' && (
            <ReportsSection
              totalCertificates={certificates.length}
              validCertificates={validCount}
              revokedCertificates={revokedCount}
              totalStudents={students.length}
            />
          )}
        </main>
      </div>

      {/* MODAL 1: ADD NEW STUDENT */}
      <Dialog
        open={isNewStudentModalOpen}
        onClose={() => setIsNewStudentModalOpen(false)}
        size="md"
        eyebrow="Matriculation Directory"
        title="Register New Student Record"
        description="Create an official student record in the university registry prior to degree issuance."
      >
        <form onSubmit={handleCreateStudent} className="space-y-4">
          <Field label="Student Identification Roll" required>
            <Input
              mono
              required
              value={newStudentData.studentId}
              onChange={(e) =>
                setNewStudentData({ ...newStudentData, studentId: e.target.value.toUpperCase() })
              }
              placeholder="e.g. 0322410105102010"
            />
          </Field>

          <Field label="Full Candidate Name" required>
            <Input
              required
              value={newStudentData.name}
              onChange={(e) => setNewStudentData({ ...newStudentData, name: e.target.value })}
              placeholder="e.g. Nusrat Jahan"
            />
          </Field>

          <Field label="Institutional Email" required>
            <Input
              type="email"
              required
              value={newStudentData.email}
              onChange={(e) => setNewStudentData({ ...newStudentData, email: e.target.value })}
              placeholder="e.g. nusrat@pub.ac.bd"
            />
          </Field>

          <Field label="Degree Program / Department">
            <Select
              value={newStudentData.program}
              onChange={(e) =>
                setNewStudentData({
                  ...newStudentData,
                  program: e.target.value,
                  department: e.target.value.replace(/^B\.Sc\. in |Bachelor of /i, ''),
                })
              }
            >
              <option value="B.Sc. in Computer Science & Engineering">
                B.Sc. in Computer Science &amp; Engineering
              </option>
              <option value="B.Sc. in Electrical & Electronic Engineering">
                B.Sc. in Electrical &amp; Electronic Engineering
              </option>
              <option value="B.Sc. in Civil Engineering">B.Sc. in Civil Engineering</option>
              <option value="Bachelor of Business Administration (BBA)">
                Bachelor of Business Administration (BBA)
              </option>
              <option value="Bachelor of Laws (LL.B Honors)">
                Bachelor of Laws (LL.B Honors)
              </option>
            </Select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Academic Session">
              <Input
                value={newStudentData.session}
                onChange={(e) => setNewStudentData({ ...newStudentData, session: e.target.value })}
              />
            </Field>
            <Field label="CGPA">
              <Input
                mono
                value={newStudentData.cgpa}
                onChange={(e) => setNewStudentData({ ...newStudentData, cgpa: e.target.value })}
              />
            </Field>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsNewStudentModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={isSubmittingStudent}>
              Save Student Record
            </Button>
          </div>
        </form>
      </Dialog>

      {/* MODAL 2: REVOCATION REQUEST FOR CONTROLLER CO-SIGN */}
      <Dialog
        open={Boolean(revokeModalCert)}
        onClose={() => setRevokeModalCert(null)}
        size="md"
        eyebrow="Dual-Control Revocation Governance"
        title="Request Certificate Revocation"
        description="Under university governance, revoking an anchored credential requires secondary co-signature by the Controller of Examinations."
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setRevokeModalCert(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={isSubmittingRevoke}
              disabled={!revokeReason.trim()}
              onClick={handleRevokeRequestSubmit}
            >
              Forward to Controller for Co-Sign
            </Button>
          </>
        }
      >
        {revokeModalCert && (
          <div className="space-y-4">
            <Card padding="sm" className="bg-sunken">
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted">Certificate ID:</span>
                  <span className="font-mono font-semibold text-danger">{revokeModalCert.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Candidate:</span>
                  <span className="font-semibold text-ink">{revokeModalCert.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Program:</span>
                  <span className="text-ink-2">{revokeModalCert.program}</span>
                </div>
              </div>
            </Card>

            <Field label="Official Justification / Grounds for Revocation" required>
              <Textarea
                rows={4}
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="State specific Syndicate resolution, clerical error reference, or disciplinary finding..."
              />
            </Field>
          </div>
        )}
      </Dialog>

      {/* MODAL 3: CERTIFICATE INSPECTION WITH DYNAMIC UNIQUE QR CODE */}
      <Dialog
        open={Boolean(previewCert)}
        onClose={() => setPreviewCert(null)}
        size="xl"
        eyebrow={previewCert ? `Official Specimen • ${previewCert.id}` : 'Specimen'}
        title={previewCert ? `${previewCert.type} — Cryptographic Preview` : 'Certificate Preview'}
        footer={
          previewCert && (
            <div className="flex flex-wrap items-center justify-between gap-3 w-full">
              <div className="flex items-center gap-3">
                <StatusBadge status={previewCert.status} />
                <a
                  href={`/?id=${encodeURIComponent(previewCert.id)}#verify`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Public Verifier</span>
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => setPreviewCert(null)}>
                  Close
                </Button>
                <ButtonLink
                  href={`/api/certificates/${previewCert.id}/pdf`}
                  target="_blank"
                  rel="noreferrer"
                  variant="primary"
                  size="sm"
                  leftIcon={<Download className="w-4 h-4" />}
                >
                  Download Authentic PDF
                </ButtonLink>
              </div>
            </div>
          )
        }
      >
        {previewCert && (
          <CertificateDocumentPreview
            certId={previewCert.id}
            studentName={previewCert.studentName}
            studentId={previewCert.studentId}
            degree={previewCert.type}
            department={previewCert.program}
            session={previewCert.session}
            cgpa={previewCert.cgpa}
            issuedAt={previewCert.issueDate}
            txHash={previewCert.txHash}
            revoked={previewCert.status === 'revoked'}
            qrCodeDataUrl={previewCertQrUrl}
          />
        )}
      </Dialog>
    </div>
  );
};
