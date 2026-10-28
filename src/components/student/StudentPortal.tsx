'use client';

import React from 'react';
import {
  Award,
  Share2,
  History,
  User,
  LayoutDashboard,
} from 'lucide-react';
import { useStudentPortal } from '@/hooks/useStudentPortal';
import { StudentDashboardView } from './StudentDashboardView';
import { CertificatesListView } from './CertificatesListView';
import { CertificateDetailModal } from './CertificateDetailModal';
import { ShareLinkModal } from './ShareLinkModal';
import { ManageLinksView } from './ManageLinksView';
import { StudentActivityLogView } from './StudentActivityLogView';
import { StudentProfileView } from './StudentProfileView';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Tabs, Badge, PageSkeleton, StateToast } from '@/components/ui';

export const StudentPortal: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    profile,
    certificates,
    shareLinks,
    auditLogs,
    isLoadingData,
    selectedCertForDetail,
    setSelectedCertForDetail,
    isShareModalOpen,
    setIsShareModalOpen,
    selectedCertForShare,
    toastMessage,
    handleLogout,
    handleOpenShareModal,
    handleLinkCreated,
    handleCancelLink,
    handleDownloadPdf,
  } = useStudentPortal();

  const activeLinksCount = shareLinks.filter((l) => l.status === 'active').length;

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col font-sans">
      <StateToast message={toastMessage} tone="success" />

      <Header
        isLoggedIn={true}
        userRole="student"
        userName={profile.name}
        userEmail={profile.email}
        onLogout={handleLogout}
      />

      {/* Sticky Sub-Navigation Bar */}
      <div className="bg-surface/95 backdrop-blur-md border-b border-line sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <Tabs
              value={activeTab}
              onChange={(next) => setActiveTab(next)}
              variant="underline"
              ariaLabel="Student portal sections"
              className="border-b-0 flex-1"
              items={[
                { value: 'dashboard', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
                {
                  value: 'certificates',
                  label: 'My Credentials',
                  icon: <Award className="w-4 h-4" />,
                  count: certificates.length,
                },
                {
                  value: 'links',
                  label: 'Verification Links',
                  icon: <Share2 className="w-4 h-4" />,
                  count: activeLinksCount,
                },
                { value: 'activity', label: 'Audit Trail', icon: <History className="w-4 h-4" /> },
                { value: 'profile', label: 'Academic Record', icon: <User className="w-4 h-4" /> },
              ]}
            />

            <div className="hidden md:flex items-center gap-2 shrink-0 py-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">Student Roll:</span>
              <Badge tone="brand" size="sm" className="font-mono">
                {profile.studentId}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoadingData ? (
          <PageSkeleton />
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

      <CertificateDetailModal
        isOpen={Boolean(selectedCertForDetail)}
        onClose={() => setSelectedCertForDetail(null)}
        certificate={selectedCertForDetail}
        onOpenShareModal={(cert) => {
          setSelectedCertForDetail(null);
          handleOpenShareModal(cert);
        }}
        onDownloadPdf={(cert) => handleDownloadPdf(cert)}
      />

      <ShareLinkModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        certificate={selectedCertForShare}
        certificatesList={certificates}
        onLinkCreated={handleLinkCreated}
      />

      <Footer />
    </div>
  );
};
