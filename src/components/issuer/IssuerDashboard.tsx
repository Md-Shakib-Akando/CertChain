'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Upload,
  Search,
  Plus,
  ShieldAlert,
  ArrowRight,
  UserCheck,
  FilePlus,
  FileSpreadsheet,
  Download,
  Users,
  Eye,
  X,
  ExternalLink,
  Award,
  QrCode,
} from 'lucide-react';
import { IssuerSidebar, IssuerTab } from './IssuerSidebar';
import { IssuerTopHeader } from './IssuerTopHeader';
import { ReportsSection } from './ReportsSection';
import { clearSessionUser } from '@/lib/authSession';

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

  // Generate QR for newly issued certificate
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

  // Generate QR for previewed certificate
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

  // Handle single certificate issuance
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

  // Pre-fill Issue Wizard from student directory
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

  // Add new student
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

  // Parse CSV file content
  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
    e.target.value = '';
  };

  // Execute batch issuance to Smart Contract
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

  // Revocation request to Controller
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
    <div className="h-screen overflow-hidden bg-[#F8FAFC] text-[#0B2545] flex font-sans antialiased">
      {/* Toast Feedback */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-200 ${
            toast.type === 'success'
              ? 'bg-[#0B1F3A] text-white border-slate-700'
              : toast.type === 'error'
              ? 'bg-rose-950 text-white border-rose-700'
              : 'bg-slate-900 text-white border-slate-800'
          }`}
        >
          {toast.type === 'success' && (
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          )}
          {toast.type === 'error' && (
            <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
          )}
          {toast.type === 'info' && (
            <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
          )}
          <span className="text-xs sm:text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Left Sidebar */}
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

      {/* Main Content Area */}
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
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Hero Card */}
              <div className="bg-gradient-to-r from-[#0B1F3A] to-[#12325C] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-blue-900/40">
                <div className="relative z-10 max-w-2xl space-y-3">
                  <span className="px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold uppercase tracking-wider backdrop-blur-xs">
                    Academic Issuance Authority
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Registrar Credential Management Portal
                  </h2>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Issue tamper-proof academic degrees, transcripts, and provisional certificates anchored to the Ethereum blockchain ledger with zero cryptographic drift.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab('issue')}
                      className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow cursor-pointer flex items-center gap-2"
                    >
                      <FilePlus className="w-4 h-4" />
                      <span>Issue Certificate</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('batch')}
                      className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl backdrop-blur-xs cursor-pointer flex items-center gap-2"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Batch CSV Issuance</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('students')}
                      className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl backdrop-blur-xs cursor-pointer flex items-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      <span>Student Directory</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">Total Issued</span>
                    <p className="text-2xl font-black text-[#0B1F3A] mt-1">{certificates.length}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold">
                    {certificates.length}
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">Valid Active</span>
                    <p className="text-2xl font-black text-emerald-600 mt-1">{validCount}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">Registered Students</span>
                    <p className="text-2xl font-black text-[#2563EB] mt-1">{students.length}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
                    <UserCheck className="w-5 h-5" />
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">Revoked</span>
                    <p className="text-2xl font-black text-amber-600 mt-1">{revokedCount}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Recent Activity Table */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[#0B1F3A]">Recently Issued Credentials</h3>
                    <p className="text-xs text-slate-500">Live feed from Ethereum smart contract and MongoDB ledger</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('certificates')}
                    className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
                  >
                    View All ({certificates.length}) &rarr;
                  </button>
                </div>

                {isLoading ? (
                  <div className="p-12 text-center">
                    <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin mx-auto" />
                  </div>
                ) : certificates.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-xs">
                    No certificates issued yet. Click &quot;Issue Certificate&quot; to begin.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {certificates.slice(0, 5).map((cert) => (
                      <div
                        key={cert.id}
                        className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/50"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-[#2563EB]">{cert.id}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                cert.status === 'valid'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {cert.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-slate-800">
                            {cert.studentName} —{' '}
                            <span className="text-slate-500 font-normal">{cert.program}</span>
                          </p>
                          <span className="text-[11px] text-slate-400">Issued: {cert.issueDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPreviewCert(cert)}
                            className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#2563EB] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                            title="View Certificate & Unique QR Code"
                          >
                            <Eye className="w-4 h-4" />
                            <span className="hidden sm:inline">View</span>
                          </button>
                          <a
                            href={`/api/certificates/${cert.id}/pdf`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">PDF</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: STUDENT DIRECTORY */}
          {activeTab === 'students' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-[#0B1F3A]">Student Academic Records</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Maintain student identities, graduation batches, and issue authentic credentials.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewStudentModalOpen(true)}
                  className="px-4 py-2.5 bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow cursor-pointer flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Student</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => {
                    setStudentSearch(e.target.value);
                    fetchStudents(e.target.value);
                  }}
                  placeholder="Search students by name, Student ID, email, or department..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2563EB] shadow-xs"
                />
              </div>

              {/* Students Table */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
                {isLoadingStudents ? (
                  <div className="p-12 text-center">
                    <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin mx-auto" />
                  </div>
                ) : students.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-xs">
                    No students found matching your query. Click &quot;Add New Student&quot; to register one.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold">
                        <tr>
                          <th className="px-5 py-3">Student ID</th>
                          <th className="px-5 py-3">Student Name</th>
                          <th className="px-5 py-3">Program / Dept</th>
                          <th className="px-5 py-3">Batch &amp; Session</th>
                          <th className="px-5 py-3">CGPA</th>
                          <th className="px-5 py-3">Certs</th>
                          <th className="px-5 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {students.map((st) => (
                          <tr key={st.id} className="hover:bg-slate-50/50">
                            <td className="px-5 py-3.5 font-mono font-bold text-[#2563EB]">{st.studentId}</td>
                            <td className="px-5 py-3.5 font-bold text-slate-800">
                              <div>{st.name}</div>
                              <div className="text-[11px] text-slate-400 font-normal">{st.email}</div>
                            </td>
                            <td className="px-5 py-3.5 text-slate-600">{st.department || st.program}</td>
                            <td className="px-5 py-3.5 text-slate-600">
                              {st.batch} ({st.session})
                            </td>
                            <td className="px-5 py-3.5 font-bold text-emerald-700">{st.cgpa || 'N/A'}</td>
                            <td className="px-5 py-3.5">
                              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#2563EB] font-bold text-[10px]">
                                {st.certificateCount} Issued
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <button
                                type="button"
                                onClick={() => handleSelectStudentForIssue(st)}
                                className="px-3 py-1.5 bg-[#2563EB] hover:bg-blue-600 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                              >
                                <span>Issue Cert</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SINGLE ISSUANCE WIZARD */}
          {activeTab === 'issue' && (
            <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
              {/* Step Progress Bar */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                {[
                  { step: 1, label: 'Student Info' },
                  { step: 2, label: 'Academic Details' },
                  { step: 3, label: 'Confirm & Sign' },
                  { step: 4, label: 'Complete' },
                ].map((s) => (
                  <div key={s.step} className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
                        wizardStep === s.step
                          ? 'bg-[#2563EB] text-white shadow'
                          : wizardStep > s.step
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {wizardStep > s.step ? '✓' : s.step}
                    </div>
                    <span className="text-xs font-bold text-slate-700 hidden sm:inline">{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Step 1: Student Information */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-[#0B1F3A]">Step 1: Student Identification</h3>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Full Student Name</label>
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="e.g. Md. Shakib Akando"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Student ID (Unique)</label>
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                      placeholder="e.g. 0322410105101055"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Student University Email</label>
                    <input
                      type="email"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      placeholder="e.g. student@pub.ac.bd"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      disabled={!studentName.trim() || !studentId.trim()}
                      onClick={() => setWizardStep(2)}
                      className="px-6 py-2.5 bg-[#2563EB] hover:bg-blue-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                    >
                      Next: Academic Details &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Academic Program & Type */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-[#0B1F3A]">Step 2: Credential Parameters</h3>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Certificate Type</label>
                    <select
                      value={certType}
                      onChange={(e) => setCertType(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                    >
                      <option value="Degree Certificate">Degree Certificate (Main Parchment)</option>
                      <option value="Provisional Certificate">Provisional Certificate</option>
                      <option value="Academic Transcript">Official Academic Transcript</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Degree / Program</label>
                    <select
                      value={program}
                      onChange={(e) => setProgram(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                    >
                      <option value="B.Sc. in Computer Science & Engineering">B.Sc. in Computer Science & Engineering</option>
                      <option value="B.Sc. in Electrical & Electronic Engineering">B.Sc. in Electrical & Electronic Engineering</option>
                      <option value="B.Sc. in Civil Engineering">B.Sc. in Civil Engineering</option>
                      <option value="Bachelor of Business Administration (BBA)">Bachelor of Business Administration (BBA)</option>
                      <option value="Bachelor of Laws (LL.B Honors)">Bachelor of Laws (LL.B Honors)</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">Academic Session</label>
                      <input
                        type="text"
                        value={session}
                        onChange={(e) => setSession(e.target.value)}
                        placeholder="2020 - 2024"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">CGPA (Out of 4.00)</label>
                      <input
                        type="text"
                        value={cgpa}
                        onChange={(e) => setCgpa(e.target.value)}
                        placeholder="3.88"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-emerald-700 focus:outline-none focus:border-[#2563EB]"
                      />
                    </div>
                  </div>
                  <div className="pt-2 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setWizardStep(1)}
                      className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      &larr; Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setWizardStep(3)}
                      className="px-6 py-2.5 bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                    >
                      Next: Review &amp; Confirm &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Review, Hash, and Sign */}
              {wizardStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-[#0B1F3A]">Step 3: Cryptographic Review &amp; Blockchain Anchoring</h3>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Student:</span>
                      <span className="font-bold text-slate-800">
                        {studentName} ({studentId})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Document Type:</span>
                      <span className="font-bold text-slate-800">{certType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Program:</span>
                      <span className="font-bold text-slate-800">{program}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Session &amp; GPA:</span>
                      <span className="font-bold text-emerald-700">
                        {session} | CGPA {cgpa}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      Submitting will compile deterministic PDF bytes, calculate the SHA-256 fingerprint, and broadcast an immutable transaction to the CertChain smart contract.
                    </span>
                  </div>

                  <div className="pt-2 flex justify-between">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setWizardStep(2)}
                      className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      &larr; Back
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleIssueSubmit}
                      className="px-7 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Generating &amp; Anchoring...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Confirm &amp; Issue On-Chain</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Issue Complete */}
              {wizardStep === 4 && issuedResult && (
                <div className="text-center space-y-5 py-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-[#0B1F3A]">Certificate Issued Successfully!</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Anchored to Ethereum blockchain with verifiable SHA-256 fingerprint.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left">
                    {issuedQrUrl ? (
                      <div className="w-28 h-28 bg-white p-1 rounded-xl border border-slate-300 shadow-xs shrink-0 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={issuedQrUrl}
                          alt={`QR Code for ${issuedResult.id}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-28 h-28 bg-white p-2 rounded-xl border border-slate-300 shadow-xs shrink-0 flex items-center justify-center">
                        <QrCode className="w-10 h-10 text-slate-300 animate-pulse" />
                      </div>
                    )}
                    <div className="space-y-1.5 min-w-0 flex-1 text-xs font-mono">
                      <div>
                        <span className="text-slate-400 font-sans block text-[11px]">Certificate ID:</span>
                        <span className="font-bold text-[#2563EB] text-sm">{issuedResult.id}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-sans block text-[11px]">Recipient:</span>
                        <span className="text-slate-800 font-sans font-medium">{issuedResult.studentName} ({issuedResult.studentId})</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-sans block text-[11px]">Blockchain Tx Hash:</span>
                        <span className="text-slate-700 break-all text-[11px]">{issuedResult.txHash}</span>
                      </div>
                      <div className="pt-1">
                        <a
                          href={`/?id=${encodeURIComponent(issuedResult.id)}#verify`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[#2563EB] hover:underline font-sans font-bold text-xs"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open Public Verification Page</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <a
                      href={`/api/certificates/${issuedResult.id}/pdf`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full sm:w-auto px-6 py-2.5 bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Issued PDF</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setStudentName('');
                        setStudentId('');
                        setWizardStep(1);
                      }}
                      className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Issue Another
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: BATCH CSV ISSUANCE */}
          {activeTab === 'batch' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-[#0B1F3A]">Batch CSV Certificate Issuance</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Upload a student CSV file to batch issue an entire graduating class in a single smart contract execution.
                  </p>
                </div>

                {/* Upload Zone */}
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-3 bg-slate-50/50">
                  <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">Upload Students CSV File</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Columns: <code className="text-[#2563EB]">student_id, name, email, program, session, cert_type, cgpa</code>
                  </p>
                  <div className="pt-2 flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const csvSample = `student_id,name,email,program,session,cert_type,cgpa\n0322410105102001,Rahim Ahmed,rahim@pub.ac.bd,B.Sc. in Computer Science & Engineering,2020 - 2024,Degree Certificate,3.92\n0322410105102002,Fatima Begum,fatima@pub.ac.bd,B.Sc. in Computer Science & Engineering,2020 - 2024,Degree Certificate,3.85\n0322410105102003,Tanvir Islam,tanvir@pub.ac.bd,B.Sc. in Electrical & Electronic Engineering,2020 - 2024,Degree Certificate,3.78`;
                        const blob = new Blob([csvSample], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'students_batch_template.csv';
                        a.click();
                      }}
                      className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 shadow-xs cursor-pointer"
                    >
                      Download Template CSV
                    </button>
                    <label className="px-5 py-2 bg-[#2563EB] text-white text-xs font-bold rounded-xl hover:bg-blue-600 shadow cursor-pointer">
                      <span>Browse CSV File</span>
                      <input type="file" accept=".csv" onChange={handleCsvFileUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* Parsed Rows Preview */}
                {csvRows.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-[#0B1F3A]">
                          Preview Loaded Records ({csvRows.length} Rows)
                        </h4>
                        <p className="text-xs text-slate-500">
                          {csvRows.filter((r) => r.isValid).length} valid records ready for on-chain anchoring.
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={isProcessingBatch || csvRows.filter((r) => r.isValid).length === 0}
                        onClick={handleExecuteBatchIssuance}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow cursor-pointer flex items-center gap-2"
                      >
                        {isProcessingBatch ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Issuing Batch On-Chain...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" />
                            <span>Execute Batch Issuance ({csvRows.filter((r) => r.isValid).length})</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 font-bold sticky top-0">
                          <tr>
                            <th className="px-4 py-2.5">#</th>
                            <th className="px-4 py-2.5">Student ID</th>
                            <th className="px-4 py-2.5">Name</th>
                            <th className="px-4 py-2.5">Program</th>
                            <th className="px-4 py-2.5">CGPA</th>
                            <th className="px-4 py-2.5">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {csvRows.map((row, idx) => (
                            <tr key={idx} className={row.isValid ? 'hover:bg-slate-50/50' : 'bg-red-50/30'}>
                              <td className="px-4 py-2 text-slate-400">{idx + 1}</td>
                              <td className="px-4 py-2 font-mono font-bold text-[#2563EB]">{row.studentId}</td>
                              <td className="px-4 py-2 font-bold text-slate-800">{row.studentName}</td>
                              <td className="px-4 py-2 text-slate-600">{row.program}</td>
                              <td className="px-4 py-2 font-bold text-emerald-700">{row.cgpa}</td>
                              <td className="px-4 py-2">
                                {row.isValid ? (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                                    Valid
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700">
                                    {row.validationError || 'Invalid'}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Batch Success Result Box */}
                {batchResult && (
                  <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-3">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>Batch Issuance Completed Successfully!</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Issued Certificates:</span>
                        <span className="font-bold text-base text-emerald-700">{batchResult.processedCount}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Failed Rows:</span>
                        <span className="font-bold text-base text-red-600">{batchResult.failedCount}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Block Number:</span>
                        <span className="font-bold text-base text-[#0B1F3A]">#{batchResult.blockNumber}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Smart Contract:</span>
                        <span className="font-bold text-xs text-blue-700 font-mono">CertChain</span>
                      </div>
                    </div>
                    {batchResult.txHash && (
                      <div className="pt-1">
                        <span className="text-slate-500 font-sans block text-[11px]">Blockchain Tx Hash:</span>
                        <code className="font-mono text-emerald-900 break-all">{batchResult.txHash}</code>
                      </div>
                    )}
                    {batchResult.failedRows && batchResult.failedRows.length > 0 && (
                      <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-red-800 space-y-1">
                        <span className="font-bold block">Failed Rows Report:</span>
                        {batchResult.failedRows.map((f, i) => (
                          <p key={i}>
                            Row #{f.row} ({f.studentId}): {f.reason}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: ISSUED REGISTRY */}
          {activeTab === 'certificates' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden space-y-4 animate-in fade-in duration-200">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-[#0B1F3A]">
                    Registered Credentials ({filteredCertificates.length})
                  </h3>
                  <p className="text-xs text-slate-500">Live cryptographic register with on-chain revocation initiation</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={registryStatusFilter}
                    onChange={(e) => setRegistryStatusFilter(e.target.value as 'all' | 'valid' | 'revoked')}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                  >
                    <option value="all">All Status</option>
                    <option value="valid">Valid Active</option>
                    <option value="revoked">Revoked</option>
                  </select>
                  <button
                    type="button"
                    onClick={fetchCertificates}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    Refresh
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="px-6">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={registrySearch}
                    onChange={(e) => setRegistrySearch(e.target.value)}
                    placeholder="Search certificates by ID, Student Name, Student ID, or Program..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold">
                    <tr>
                      <th className="px-5 py-3">Certificate ID</th>
                      <th className="px-5 py-3">Student Name</th>
                      <th className="px-5 py-3">Program</th>
                      <th className="px-5 py-3">Issue Date</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCertificates.map((cert) => (
                      <tr key={cert.id} className="hover:bg-slate-50/50">
                        <td className="px-5 py-3.5 font-mono font-bold text-[#2563EB]">{cert.id}</td>
                        <td className="px-5 py-3.5 font-bold text-slate-800">{cert.studentName}</td>
                        <td className="px-5 py-3.5 text-slate-600">{cert.program}</td>
                        <td className="px-5 py-3.5 text-slate-500">{cert.issueDate}</td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              cert.status === 'valid'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {cert.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => setPreviewCert(cert)}
                            className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#2563EB] font-bold inline-flex items-center gap-1 cursor-pointer"
                            title="View Certificate & Unique QR Code"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                          <a
                            href={`/api/certificates/${cert.id}/pdf`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </a>
                          {cert.status === 'valid' && (
                            <button
                              type="button"
                              onClick={() => {
                                setRevokeModalCert(cert);
                                setRevokeReason('');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-bold cursor-pointer"
                            >
                              Request Revocation
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: AUDIT TRAIL */}
          {activeTab === 'audit' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-[#0B1F3A]">Cryptographic Audit Trail</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Immutable record of certificate issuances, revocations, and blockchain transactions.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={auditFilterAction}
                    onChange={(e) => {
                      setAuditFilterAction(e.target.value);
                      fetchAuditLogs(e.target.value);
                    }}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                  >
                    <option value="all">All Audit Actions</option>
                    <option value="CERTIFICATE_ISSUED">Certificate Issued</option>
                    <option value="BATCH_CERTIFICATES_ISSUED">Batch Certificates Issued</option>
                    <option value="REVOCATION_REQUESTED">Revocation Requested</option>
                    <option value="STUDENT_RECORD_CREATED">Student Record Created</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => fetchAuditLogs(auditFilterAction)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    Refresh
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
                {isLoadingAudit ? (
                  <div className="p-12 text-center">
                    <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin mx-auto" />
                  </div>
                ) : auditLogs.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-xs">
                    No audit logs recorded for this category yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold">
                        <tr>
                          <th className="px-5 py-3">Timestamp</th>
                          <th className="px-5 py-3">Action</th>
                          <th className="px-5 py-3">Actor Role</th>
                          <th className="px-5 py-3">Details &amp; Target</th>
                          <th className="px-5 py-3">Blockchain Tx</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {auditLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/50">
                            <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                            <td className="px-5 py-3.5 font-bold">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] ${
                                  log.action.includes('ISSUED')
                                    ? 'bg-blue-50 text-[#2563EB]'
                                    : log.action.includes('REVOKE')
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {log.action}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-slate-600 font-semibold">{log.actorRole.toUpperCase()}</td>
                            <td className="px-5 py-3.5 text-slate-800 max-w-sm">
                              <div className="font-bold text-xs">{log.targetReference || log.targetId}</div>
                              <div className="text-[11px] text-slate-500">{log.details}</div>
                            </td>
                            <td className="px-5 py-3.5 font-mono text-[11px]">
                              {log.transactionHash ? (
                                <span className="text-slate-600 truncate block max-w-[140px]" title={log.transactionHash}>
                                  {log.transactionHash.slice(0, 10)}...{log.transactionHash.slice(-6)}
                                </span>
                              ) : (
                                <span className="text-slate-400">N/A</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
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
      {isNewStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-base font-bold text-[#0B1F3A]">Add New Student Record</h4>
              <button
                type="button"
                onClick={() => setIsNewStudentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateStudent} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Student ID *</label>
                <input
                  type="text"
                  required
                  value={newStudentData.studentId}
                  onChange={(e) => setNewStudentData({ ...newStudentData, studentId: e.target.value.toUpperCase() })}
                  placeholder="e.g. 0322410105102010"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:outline-none focus:border-[#2563EB]"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Student Name *</label>
                <input
                  type="text"
                  required
                  value={newStudentData.name}
                  onChange={(e) => setNewStudentData({ ...newStudentData, name: e.target.value })}
                  placeholder="e.g. Nusrat Jahan"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Student Email *</label>
                <input
                  type="email"
                  required
                  value={newStudentData.email}
                  onChange={(e) => setNewStudentData({ ...newStudentData, email: e.target.value })}
                  placeholder="e.g. nusrat@pub.ac.bd"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Program / Department</label>
                <select
                  value={newStudentData.program}
                  onChange={(e) =>
                    setNewStudentData({
                      ...newStudentData,
                      program: e.target.value,
                      department: e.target.value.replace(/^B\.Sc\. in |Bachelor of /i, ''),
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="B.Sc. in Computer Science & Engineering">B.Sc. in Computer Science & Engineering</option>
                  <option value="B.Sc. in Electrical & Electronic Engineering">B.Sc. in Electrical & Electronic Engineering</option>
                  <option value="B.Sc. in Civil Engineering">B.Sc. in Civil Engineering</option>
                  <option value="Bachelor of Business Administration (BBA)">Bachelor of Business Administration (BBA)</option>
                  <option value="Bachelor of Laws (LL.B Honors)">Bachelor of Laws (LL.B Honors)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Session</label>
                  <input
                    type="text"
                    value={newStudentData.session}
                    onChange={(e) => setNewStudentData({ ...newStudentData, session: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">CGPA</label>
                  <input
                    type="text"
                    value={newStudentData.cgpa}
                    onChange={(e) => setNewStudentData({ ...newStudentData, cgpa: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-emerald-700"
                  />
                </div>
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewStudentModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingStudent}
                  className="px-5 py-2 bg-[#2563EB] hover:bg-blue-600 disabled:opacity-50 text-white font-bold rounded-xl shadow flex items-center gap-2 cursor-pointer"
                >
                  {isSubmittingStudent && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REVOCATION REQUEST FOR CONTROLLER CO-SIGN */}
      {revokeModalCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600">
              <ShieldAlert className="w-6 h-6" />
              <h4 className="text-base font-bold text-[#0B1F3A]">Request Certificate Revocation</h4>
            </div>
            <p className="text-xs text-slate-600">
              Per university governance, revoking Certificate{' '}
              <strong className="font-mono text-red-600">{revokeModalCert.id}</strong> requires official co-signature by the Controller of Examinations.
            </p>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <div>
                <span className="text-slate-400">Student:</span>{' '}
                <span className="font-bold text-slate-800">{revokeModalCert.studentName}</span>
              </div>
              <div>
                <span className="text-slate-400">Program:</span>{' '}
                <span className="text-slate-800">{revokeModalCert.program}</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Official Justification / Reason for Revocation *
              </label>
              <textarea
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="State specific reason (e.g., Grade dispute Syndicate resolution, clerical error, identity forgery)..."
                rows={3}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-red-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRevokeModalCert(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingRevoke || !revokeReason.trim()}
                onClick={handleRevokeRequestSubmit}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 cursor-pointer"
              >
                {isSubmittingRevoke && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Forward to Controller</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CERTIFICATE INSPECTION WITH DYNAMIC UNIQUE QR CODE */}
      {previewCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#0B1F3A]">{previewCert.type} Details</h4>
                  <p className="text-xs text-slate-500 font-mono">{previewCert.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewCert(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Certificate Preview Card with Dynamic QR */}
            <div className="bg-gradient-to-br from-amber-50/40 via-white to-slate-50 p-6 rounded-2xl border-2 border-slate-200/80 shadow-inner relative overflow-hidden">
              <div className="text-center space-y-1.5 pb-4 border-b border-slate-200/60">
                <span className="text-[10px] font-bold tracking-widest text-[#997928] uppercase">
                  Pundra University of Science &amp; Technology
                </span>
                <h3 className="text-lg font-bold text-[#0B1F3A]">{previewCert.studentName}</h3>
                <p className="text-xs text-slate-600">
                  Student ID: <span className="font-mono font-semibold">{previewCert.studentId}</span>
                </p>
                <p className="text-xs font-serif italic text-slate-700 pt-1">
                  has successfully fulfilled requirements for {previewCert.program}
                </p>
                <p className="text-xs text-slate-600">
                  Session: <b>{previewCert.session}</b> • CGPA: <b className="text-emerald-700">{previewCert.cgpa}</b>
                </p>
              </div>

              {/* Unique Dynamic QR Code Section */}
              <div className="pt-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-20 h-20 bg-white p-1 rounded-xl border border-slate-300 shadow-sm flex items-center justify-center">
                    {previewCertQrUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={previewCertQrUrl}
                        alt={`Unique QR Code for ${previewCert.id}`}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <QrCode className="w-10 h-10 text-slate-300 animate-pulse" />
                    )}
                  </div>
                  <div className="text-left space-y-0.5">
                    <span className="text-[11px] font-bold text-slate-800 block">Unique Verification QR</span>
                    <span className="text-[10px] text-slate-500 block">Points to live blockchain registry</span>
                    <a
                      href={`/?id=${encodeURIComponent(previewCert.id)}#verify`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-[#2563EB] hover:underline font-bold inline-flex items-center gap-1 mt-0.5"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Test Verify Link</span>
                    </a>
                  </div>
                </div>

                <div className="text-right text-xs">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full font-bold text-[10px] ${
                      previewCert.status === 'valid'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    ● {previewCert.status.toUpperCase()}
                  </span>
                  <span className="block text-[10px] text-slate-400 mt-1 font-mono truncate max-w-[140px]">
                    {previewCert.txHash.slice(0, 16)}...
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <a
                href={`/api/certificates/${previewCert.id}/pdf`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-5 py-2.5 bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Authentic PDF</span>
              </a>
              <button
                type="button"
                onClick={() => setPreviewCert(null)}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
