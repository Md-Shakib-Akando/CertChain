'use client';

import React from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  Loader2,
} from 'lucide-react';
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
    handleSeedDemo,
    handleClearDemo,
    handleLogout,
    exportAuditLogsCsv,
    exportReportsCsv,
  } = useControllerDashboard();

  return (
    <div className="h-screen overflow-hidden bg-[#F8FAFC] text-[#0B2545] flex font-sans antialiased">
      {/* Toast Feedback */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-200 ${
            toast.type === 'success'
              ? 'bg-[#0B2545] text-white border-slate-700'
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
              <Info className="w-4 h-4" />
            </div>
          )}
          <span className="text-xs sm:text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Left Sidebar */}
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

      {/* Main Content Area */}
      <div className="flex-1 h-screen flex flex-col min-w-0 overflow-hidden">
        <ControllerTopHeader
          activeTab={activeTab}
          onRefresh={fetchDashboardData}
          isLoading={isLoading}
          onLogout={handleLogout}
          onSelectTab={setActiveTab}
          onToggleMobileMenu={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onSeedDemo={handleSeedDemo}
          onClearDemo={handleClearDemo}
          controllerName={profile.name}
          controllerEmail={profile.email}
          pendingTotal={stats.pendingIssuerApplications + stats.pendingRevocations}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {isLoading && !stats.activeIssuers && !stats.pendingIssuerApplications ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-16 text-center shadow-xs flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-9 h-9 text-teal-600 animate-spin" />
              <span className="text-xs text-slate-500 font-medium">
                Connecting to Examination Controller registry &amp; smart contract...
              </span>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <OverviewSection
                  stats={stats}
                  pendingActions={pendingActions}
                  recentActivity={recentActivity}
                  onNavigateTab={setActiveTab}
                  onSeedDemo={handleSeedDemo}
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
                  onSeedDemo={handleSeedDemo}
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
                  onSeedDemo={handleSeedDemo}
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
                  onSeedDemo={handleSeedDemo}
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
                  onSeedDemo={handleSeedDemo}
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
