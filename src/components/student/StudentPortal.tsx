'use client';

import React from 'react';
import {
  Award,
  Share2,
  History,
  User,
  CheckCircle2,
  LayoutDashboard,
  Loader2,
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

      {/* Tab Navigation Bar */}
      <div className="bg-white border-b border-slate-200/90 shadow-2xs sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <nav className="flex space-x-2 sm:space-x-3 overflow-x-auto py-3 scrollbar-none">
              {[
                { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
                { id: 'certificates' as const, label: 'My Certificates', icon: Award, count: certificates.length },
                { id: 'links' as const, label: 'Shared Links', icon: Share2, count: shareLinks.filter((l) => l.status === 'active').length },
                { id: 'activity' as const, label: 'Activity Log', icon: History },
                { id: 'profile' as const, label: 'Profile', icon: User },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
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
            <span className="text-xs text-slate-500 font-medium">Loading student credentials...</span>
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

      {/* Main Website Footer */}
      <Footer />
    </div>
  );
};
