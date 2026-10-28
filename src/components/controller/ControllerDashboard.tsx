'use client';

import React from 'react';
import { useControllerDashboard } from '@/hooks/useControllerDashboard';
import { ControllerSidebar } from './ControllerSidebar';
import { ControllerTopHeader } from './ControllerTopHeader';
import { OverviewSection } from './OverviewSection';
import { IssuerApprovalsSection } from './IssuerApprovalsSection';
import { RevocationRequestsSection } from './RevocationRequestsSection';
import { CoSignatureCenterSection } from './CoSignatureCenterSection';
import { IssuerDirectorySection } from './IssuerDirectorySection';
import { AuditTrailSection } from './AuditTrailSection';
import { ReportsAnalyticsSection } from './ReportsAnalyticsSection';
import { ProfileSettingsSection } from './ProfileSettingsSection';

import { ApplicationDetailModal } from './ApplicationDetailModal';
import { RevocationDetailModal } from './RevocationDetailModal';
import { RejectionReasonModal } from './RejectionReasonModal';
import { RequestInfoModal } from './RequestInfoModal';
import { CoSignModal } from './CoSignModal';
import { PageSkeleton, StateToast } from '@/components/ui';

export const ControllerDashboard: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    stats,
    filteredApplications,
    filteredRevocations,
    filteredIssuers,
    auditLogs,
    pendingActions,
    recentActivity,
    isLoading,
    isActionLoading,
    selectedAppForDetail,
    setSelectedAppForDetail,
    selectedRevocationForDetail,
    setSelectedRevocationForDetail,
    selectedRevocationForCoSign,
    setSelectedRevocationForCoSign,
    rejectionModal,
    setRejectionModal,
    requestInfoModal,
    setRequestInfoModal,
    toast,
    showToast,
    walletAddress,
    isWalletConnecting,
    connectWallet,
    disconnectWallet,
    profile,
    fetchDashboardData,
    handleApproveIssuer,
    handleRejectIssuer,
    handleRequestInfo,
    handleApproveAndCoSignRevocation,
    handleRejectRevocation,
    handleSuspendIssuer,
    handleReactivateIssuer,
    handleLogout,
    exportAuditLogsCsv,
    exportReportsCsv,
  } = useControllerDashboard();

  return (
    <div className="h-screen overflow-hidden bg-canvas text-ink flex font-sans antialiased">
      <StateToast
        message={toast?.message ?? null}
        tone={toast?.type === 'error' ? 'danger' : toast?.type === 'info' ? 'info' : 'success'}
      />

      <ControllerSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        pendingApplicationsCount={stats.pendingIssuerApplications}
        pendingRevocationsCount={stats.pendingRevocations}
        activeIssuersCount={stats.activeIssuers}
        isWalletConnected={Boolean(walletAddress)}
        walletAddress={walletAddress}
        onLogout={handleLogout}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 h-screen flex flex-col min-w-0 overflow-hidden">
        <ControllerTopHeader
          activeTab={activeTab}
          onRefresh={fetchDashboardData}
          isLoading={isLoading}
          onLogout={handleLogout}
          onSelectTab={setActiveTab}
          onToggleMobileMenu={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          controllerName={profile.name}
          controllerEmail={profile.email}
          pendingTotal={stats.pendingIssuerApplications + stats.pendingRevocations}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {isLoading && !stats.activeIssuers && !stats.pendingIssuerApplications ? (
            <PageSkeleton />
          ) : (
            <>
              {activeTab === 'overview' && (
                <OverviewSection
                  stats={stats}
                  pendingActions={pendingActions}
                  recentActivity={recentActivity}
                  onNavigateTab={setActiveTab}
                />
              )}

              {activeTab === 'issuer-approvals' && (
                <IssuerApprovalsSection
                  applications={filteredApplications}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  statusFilter={statusFilter}
                  onStatusFilterChange={setStatusFilter}
                  onOpenDetailModal={(app) => setSelectedAppForDetail(app)}
                  onApproveIssuer={handleApproveIssuer}
                  onOpenRejectModal={(app) =>
                    setRejectionModal({
                      open: true,
                      type: 'application',
                      id: app.id,
                      title: `${app.name} (${app.email})`,
                    })
                  }
                  onOpenRequestInfoModal={(app) =>
                    setRequestInfoModal({
                      open: true,
                      id: app.id,
                      name: app.name,
                    })
                  }
                  isActionLoading={isActionLoading}
                />
              )}

              {activeTab === 'revocation-requests' && (
                <RevocationRequestsSection
                  revocations={filteredRevocations}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  statusFilter={statusFilter}
                  onStatusFilterChange={setStatusFilter}
                  onOpenDetailModal={(rev) => setSelectedRevocationForDetail(rev)}
                  onOpenCoSignModal={(rev) => setSelectedRevocationForCoSign(rev)}
                  onOpenRejectModal={(rev) =>
                    setRejectionModal({
                      open: true,
                      type: 'revocation',
                      id: rev.id,
                      title: `Certificate ${rev.certificateId} (${rev.studentName})`,
                    })
                  }
                  isActionLoading={isActionLoading}
                />
              )}

              {activeTab === 'co-signature-center' && (
                <CoSignatureCenterSection
                  revocations={filteredRevocations}
                  walletAddress={walletAddress}
                  isWalletConnecting={isWalletConnecting}
                  onConnectWallet={connectWallet}
                  onDisconnectWallet={disconnectWallet}
                  onApproveAndCoSign={handleApproveAndCoSignRevocation}
                  onOpenDetailModal={(rev) => setSelectedRevocationForDetail(rev)}
                  onOpenRejectModal={(rev) =>
                    setRejectionModal({
                      open: true,
                      type: 'revocation',
                      id: rev.id,
                      title: `Certificate ${rev.certificateId} (${rev.studentName})`,
                    })
                  }
                  isActionLoading={isActionLoading}
                />
              )}

              {activeTab === 'issuer-directory' && (
                <IssuerDirectorySection
                  issuers={filteredIssuers}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  statusFilter={statusFilter}
                  onStatusFilterChange={setStatusFilter}
                  onOpenDetailModal={(issuer) => setSelectedAppForDetail(issuer)}
                  onSuspendIssuer={handleSuspendIssuer}
                  onReactivateIssuer={handleReactivateIssuer}
                  isActionLoading={isActionLoading}
                />
              )}

              {activeTab === 'audit-trail' && (
                <AuditTrailSection
                  auditLogs={auditLogs}
                  onExportCsv={exportAuditLogsCsv}
                />
              )}

              {activeTab === 'reports-analytics' && (
                <ReportsAnalyticsSection
                  stats={stats}
                  revocations={filteredRevocations}
                  applications={filteredApplications}
                  onExportCsv={exportReportsCsv}
                />
              )}

              {activeTab === 'profile-settings' && (
                <ProfileSettingsSection
                  profile={profile}
                  walletAddress={walletAddress}
                  onConnectWallet={connectWallet}
                  onDisconnectWallet={disconnectWallet}
                  isWalletConnecting={isWalletConnecting}
                  onLogout={handleLogout}
                  showToast={showToast}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Modals & Dialogs */}
      <ApplicationDetailModal
        application={selectedAppForDetail}
        onClose={() => setSelectedAppForDetail(null)}
        onApprove={handleApproveIssuer}
        onReject={(app) =>
          setRejectionModal({
            open: true,
            type: 'application',
            id: app.id,
            title: `${app.name} (${app.email})`,
          })
        }
        onRequestInfo={(app) =>
          setRequestInfoModal({
            open: true,
            id: app.id,
            name: app.name,
          })
        }
        isActionLoading={isActionLoading}
      />

      <RevocationDetailModal
        revocation={selectedRevocationForDetail}
        onClose={() => setSelectedRevocationForDetail(null)}
        onCoSign={(rev) => setSelectedRevocationForCoSign(rev)}
        onReject={(rev) =>
          setRejectionModal({
            open: true,
            type: 'revocation',
            id: rev.id,
            title: `Certificate ${rev.certificateId} (${rev.studentName})`,
          })
        }
        isActionLoading={isActionLoading}
      />

      {rejectionModal && (
        <RejectionReasonModal
          isOpen={rejectionModal.open}
          type={rejectionModal.type}
          targetTitle={rejectionModal.title}
          onClose={() => setRejectionModal(null)}
          onConfirm={(reason) => {
            if (rejectionModal.type === 'application') {
              handleRejectIssuer(rejectionModal.id, reason);
            } else {
              handleRejectRevocation(rejectionModal.id, reason);
            }
          }}
          isActionLoading={isActionLoading}
        />
      )}

      {requestInfoModal && (
        <RequestInfoModal
          isOpen={requestInfoModal.open}
          applicantName={requestInfoModal.name}
          onClose={() => setRequestInfoModal(null)}
          onConfirm={(notes) => handleRequestInfo(requestInfoModal.id, notes)}
          isActionLoading={isActionLoading}
        />
      )}

      <CoSignModal
        revocation={selectedRevocationForCoSign}
        walletAddress={walletAddress}
        onConnectWallet={connectWallet}
        onClose={() => setSelectedRevocationForCoSign(null)}
        onConfirmCoSign={handleApproveAndCoSignRevocation}
        isActionLoading={isActionLoading}
      />
    </div>
  );
};
