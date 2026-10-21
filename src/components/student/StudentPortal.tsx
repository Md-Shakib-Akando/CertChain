'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Award,
  Share2,
  History,
  User,
  CheckCircle2,
  LayoutDashboard,
  Loader2,
} from 'lucide-react';
import {
  saveSessionUser,
  clearSessionUser,
  getStoredSessionUser,
} from '@/lib/authSession';
import {
  StudentCertificate,
  StudentShareLink,
  StudentAuditEvent,
  StudentProfileData,
  initialStudentData,
  initialCertificates,
  initialShareLinks,
  initialAuditLogs,
} from './types';
import { StudentDashboardView } from './StudentDashboardView';
import { CertificatesListView } from './CertificatesListView';
import { CertificateDetailModal } from './CertificateDetailModal';
import { ShareLinkModal } from './ShareLinkModal';
import { ManageLinksView } from './ManageLinksView';
import { StudentActivityLogView } from './StudentActivityLogView';
import { StudentProfileView } from './StudentProfileView';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const StudentPortal: React.FC = () => {
  const router = useRouter();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'certificates' | 'links' | 'activity' | 'profile'>('dashboard');

  // Data states from MongoDB
  const [profile, setProfile] = useState<StudentProfileData>(initialStudentData);
  const [certificates, setCertificates] = useState<StudentCertificate[]>(initialCertificates);
  const [shareLinks, setShareLinks] = useState<StudentShareLink[]>(initialShareLinks);
  const [auditLogs, setAuditLogs] = useState<StudentAuditEvent[]>(initialAuditLogs);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // Modals state
  const [selectedCertForDetail, setSelectedCertForDetail] = useState<StudentCertificate | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedCertForShare, setSelectedCertForShare] = useState<StudentCertificate | null>(null);

  // Download feedback toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch real student profile & certificates from MongoDB database
  useEffect(() => {
    let isMounted = true;

    async function loadStudentData() {
      try {
        setIsLoadingData(true);
        const session = getStoredSessionUser();

        // Build query string if session is available in localStorage
        const params = new URLSearchParams();
        if (session?.email) params.set('email', session.email);
        if (session?.studentId) params.set('studentId', session.studentId);
        const queryString = params.toString() ? `?${params.toString()}` : '';

        const res = await fetch(`/api/student/profile${queryString}`);
        const data = await res.json();

        if (!isMounted) return;

        if (res.ok && data.success && data.profile) {
          setProfile(data.profile);
          setCertificates(data.certificates || []);
          setShareLinks([]);

          // Synchronize session storage with authentic database profile
          saveSessionUser({
            id: data.profile.id,
            name: data.profile.name,
            email: data.profile.email,
            role: 'student',
            studentId: data.profile.studentId,
            department: data.profile.department,
          });
        } else if (res.status === 401 && !session) {
          // If no active session exists, redirect to login
          router.push('/login');
        }
      } catch (err) {
        console.error('Failed to load student data from database:', err);
      } finally {
        if (isMounted) {
          setIsLoadingData(false);
        }
      }
    }

    loadStudentData();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleLogout = () => {
    clearSessionUser();
    router.push('/login');
  };

  // Open share modal with optional preselected certificate
  const handleOpenShareModal = (cert?: StudentCertificate) => {
    setSelectedCertForShare(cert || certificates[0] || null);
    setIsShareModalOpen(true);
  };

  // When a new share link is generated
  const handleLinkCreated = (newLink: StudentShareLink) => {
    setShareLinks((prev) => [newLink, ...prev]);

    const newAuditEvent: StudentAuditEvent = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: 'Just now',
      eventType: 'ShareLinkCreated',
      title: 'Time-Limited Share Link Created',
      description: `Generated ${newLink.expiryHours}h verification link for "${newLink.recipientLabel}".`,
      certId: newLink.certId,
      method: 'Share Link',
    };
    setAuditLogs((prev) => [newAuditEvent, ...prev]);
    showToast(`Verification link generated for ${newLink.recipientLabel}!`);
  };

  // Cancel an active share link
  const handleCancelLink = (linkId: string) => {
    const targetLink = shareLinks.find((l) => l.id === linkId);
    setShareLinks((prev) =>
      prev.map((link) => (link.id === linkId ? { ...link, status: 'cancelled' } : link))
    );

    if (targetLink) {
      const cancelAudit: StudentAuditEvent = {
        id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: 'Just now',
        eventType: 'ShareLinkCancelled',
        title: 'Share Link Cancelled by Student',
        description: `Student revoked public access token for ${targetLink.recipientLabel} (${targetLink.certId}). URL rendered inactive.`,
        certId: targetLink.certId,
        method: 'Share Link',
      };
      setAuditLogs((prev) => [cancelAudit, ...prev]);
      showToast('Share link cancelled. Public access stopped immediately.');
    }
  };

  // PDF Download simulation
  const handleDownloadPdf = (cert: StudentCertificate) => {
    showToast(`Downloading official issued PDF for ${cert.id}`);

    const element = document.createElement('a');
    const fileContent = `PUB CertChain Official Issued Credential\nCertificate ID: ${cert.id}\nStudent Name: ${cert.studentName}\nStudent ID: ${cert.studentId}\nDegree: ${cert.degreeName}\nProgram: ${cert.program}\nIssue Date: ${cert.issueDate}\nStatus: ${cert.status.toUpperCase()}\nSHA-256 Fingerprint: ${cert.sha256Hash}\nTransaction Hash: ${cert.txHash}\nSmart Contract Issuer: ${cert.issuerAddress}\nNetwork: ${cert.network}\n`;
    const file = new Blob([fileContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${cert.id}_OFFICIAL_${cert.status.toUpperCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0B2545] flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B2545] text-white px-4 py-3 rounded-xl shadow-lg border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-xs sm:text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Main Website Navbar */}
      <Header
        isLoggedIn={true}
        userRole="student"
        userName={profile.name}
        userEmail={profile.email}
        onLogout={handleLogout}
      />

      {/* Tab Navigation Bar (Matches landing page clean light styling) */}
      <div className="bg-white border-b border-slate-200/90 shadow-2xs sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <nav className="flex space-x-2 sm:space-x-3 overflow-x-auto py-3 scrollbar-none">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'certificates', label: 'My Certificates', icon: Award, count: certificates.length },
                { id: 'links', label: 'Shared Links', icon: Share2, count: shareLinks.filter((l) => l.status === 'active').length },
                { id: 'activity', label: 'Activity Log', icon: History },
                { id: 'profile', label: 'Profile', icon: User },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-[#2563EB] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Student ID badge on right side of tab bar */}
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 font-medium pl-4">
              <span>Student ID:</span>
              <span className="font-mono font-bold text-[#0B2545] bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                {profile.studentId}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoadingData ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-16 text-center shadow-xs flex flex-col items-center justify-center gap-3 animate-in fade-in duration-200">
            <Loader2 className="w-9 h-9 text-[#2563EB] animate-spin" />
           
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <StudentDashboardView
                profile={profile}
                certificates={certificates}
                shareLinks={shareLinks}
                auditLogs={auditLogs}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onOpenCertificateDetail={(cert) => setSelectedCertForDetail(cert)}
                onOpenShareModal={(cert) => handleOpenShareModal(cert)}
                onDownloadPdf={(cert) => handleDownloadPdf(cert)}
              />
            )}

            {activeTab === 'certificates' && (
              <CertificatesListView
                certificates={certificates}
                onOpenCertificateDetail={(cert) => setSelectedCertForDetail(cert)}
                onOpenShareModal={(cert) => handleOpenShareModal(cert)}
                onDownloadPdf={(cert) => handleDownloadPdf(cert)}
              />
            )}

            {activeTab === 'links' && (
              <ManageLinksView
                shareLinks={shareLinks}
                onCancelLink={handleCancelLink}
                onOpenShareModal={() => handleOpenShareModal()}
              />
            )}

            {activeTab === 'activity' && <StudentActivityLogView auditLogs={auditLogs} />}

            {activeTab === 'profile' && <StudentProfileView profile={profile} />}
          </>
        )}
      </main>

      {/* Modals */}
      <CertificateDetailModal
        isOpen={Boolean(selectedCertForDetail)}
        onClose={() => setSelectedCertForDetail(null)}
        certificate={selectedCertForDetail}
        onOpenShareModal={(cert: StudentCertificate) => {
          setSelectedCertForDetail(null);
          handleOpenShareModal(cert);
        }}
        onDownloadPdf={(cert: StudentCertificate) => handleDownloadPdf(cert)}
      />

      <ShareLinkModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        certificate={selectedCertForShare}
        certificatesList={certificates}
        onLinkCreated={handleLinkCreated}
      />

      {/* Main Website Footer */}
      <Footer />
    </div>
  );
};
