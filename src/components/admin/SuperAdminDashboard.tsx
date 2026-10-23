'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Info, Loader2 } from 'lucide-react';
import { useSuperAdminDashboard } from '@/hooks/useSuperAdminDashboard';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopHeader } from './AdminTopHeader';
import { OverviewSection } from './OverviewSection';
import { UserManagementSection } from './UserManagementSection';
import { RolePermissionsSection } from './RolePermissionsSection';
import { SystemMonitoringSection } from './SystemMonitoringSection';
import { AuditLogsSection } from './AuditLogsSection';
import { ReportsAnalyticsSection } from './ReportsAnalyticsSection';
import { UserDetailModal } from './UserDetailModal';
import { SuspendUserModal } from './SuspendUserModal';
import { ChangeRoleModal } from './ChangeRoleModal';
import { DeleteUserModal } from './DeleteUserModal';
import { ProvisionControllerModal } from './ProvisionControllerModal';

export const SuperAdminDashboard: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    selectedRoleFilter,
    setSelectedRoleFilter,
    selectedStatusFilter,
    setSelectedStatusFilter,
    kpis,
    filteredUsers,
    totalUserCount,
    auditLogs,
    filteredAuditLogs,
    systemHealth,
    blockchainConfig,
    permissionMatrix,
    analyticsTrends,
    isLoading,
    isActionLoading,
    selectedUserForDetail,
    setSelectedUserForDetail,
    selectedUserForSuspend,
    setSelectedUserForSuspend,
    selectedUserForRole,
    setSelectedUserForRole,
    selectedUserForDelete,
    setSelectedUserForDelete,
    isInviteControllerOpen,
    setIsInviteControllerOpen,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    toast,
    refreshDashboardData,
    handleSuspendUser,
    handleReactivateUser,
    handleChangeUserRole,
    handleDeleteUser,
    handleProvisionController,
    handleExportAuditLogsCsv,
    handleExportUsersCsv,
    handleExportHealthReport,
    handleLogout,
  } = useSuperAdminDashboard();

  return (
    <div className="h-screen overflow-hidden bg-[#F8FAFC] text-[#0B2545] flex font-sans antialiased">
      {/* Toast Feedback */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-200 ${
            toast.type === 'success'
              ? 'bg-[#0B2545] text-white border-slate-700'
              : toast.type === 'error'
              ? 'bg-red-950 text-white border-red-700'
              : 'bg-slate-900 text-white border-slate-800'
          }`}
        >
          {toast.type === 'success' && (
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          )}
          {toast.type === 'error' && (
            <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
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

      {/* Left Sidebar (Desktop Fixed Sticky + Mobile Responsive Drawer) */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        pendingIssuersCount={kpis.pendingIssuerApprovals}
        totalUsersCount={totalUserCount}
        onLogout={handleLogout}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area: Header remains pinned, body scrolls independently */}
      <div className="flex-1 h-screen flex flex-col min-w-0 overflow-hidden">
        <AdminTopHeader
          activeTab={activeTab}
          onRefresh={refreshDashboardData}
          isLoading={isLoading}
          onLogout={handleLogout}
          onSelectTab={setActiveTab}
          onToggleMobileMenu={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {isLoading && !kpis.totalUsers ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-16 text-center shadow-xs flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-9 h-9 text-blue-600 animate-spin" />
              <span className="text-xs text-slate-500 font-medium">
                Loading Super Admin metrics &amp; database cluster...
              </span>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <OverviewSection
                  kpis={kpis}
                  recentLogs={auditLogs}
                  systemHealth={systemHealth}
                  blockchainConfig={blockchainConfig}
                  analyticsTrends={analyticsTrends}
                  onNavigateTab={setActiveTab}
                />
              )}

              {activeTab === 'users' && (
                <UserManagementSection
                  users={filteredUsers}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedRoleFilter={selectedRoleFilter}
                  onRoleFilterChange={setSelectedRoleFilter}
                  selectedStatusFilter={selectedStatusFilter}
                  onStatusFilterChange={setSelectedStatusFilter}
                  onOpenDetailModal={(u) => setSelectedUserForDetail(u)}
                  onOpenSuspendModal={(u) => setSelectedUserForSuspend(u)}
                  onOpenRoleModal={(u) => setSelectedUserForRole(u)}
                  onOpenDeleteModal={(u) => setSelectedUserForDelete(u)}
                  onOpenInviteController={() => setIsInviteControllerOpen(true)}
                  onReactivateUser={handleReactivateUser}
                  onExportCsv={handleExportUsersCsv}
                  isActionLoading={isActionLoading}
                />
              )}

              {activeTab === 'roles' && <RolePermissionsSection matrix={permissionMatrix} />}

              {activeTab === 'monitoring' && (
                <SystemMonitoringSection
                  systemHealth={systemHealth}
                  onRefresh={refreshDashboardData}
                  onExportReport={handleExportHealthReport}
                  isLoading={isLoading}
                />
              )}

              {activeTab === 'audit' && (
                <AuditLogsSection
                  logs={filteredAuditLogs}
                  onExportCsv={handleExportAuditLogsCsv}
                />
              )}

              {activeTab === 'reports' && (
                <ReportsAnalyticsSection kpis={kpis} trends={analyticsTrends} />
              )}
            </>
          )}
        </main>
      </div>

      {/* Modals & Dialogs */}
      <UserDetailModal
        user={selectedUserForDetail}
        onClose={() => setSelectedUserForDetail(null)}
        onOpenRoleModal={(u) => setSelectedUserForRole(u)}
        onOpenSuspendModal={(u) => setSelectedUserForSuspend(u)}
        onOpenDeleteModal={(u) => setSelectedUserForDelete(u)}
        onReactivateUser={handleReactivateUser}
      />

      <SuspendUserModal
        user={selectedUserForSuspend}
        onClose={() => setSelectedUserForSuspend(null)}
        onConfirm={handleSuspendUser}
        isActionLoading={isActionLoading}
      />

      <ChangeRoleModal
        user={selectedUserForRole}
        onClose={() => setSelectedUserForRole(null)}
        onConfirm={handleChangeUserRole}
        isActionLoading={isActionLoading}
      />

      <DeleteUserModal
        user={selectedUserForDelete}
        onClose={() => setSelectedUserForDelete(null)}
        onConfirm={handleDeleteUser}
        isActionLoading={isActionLoading}
      />

      <ProvisionControllerModal
        isOpen={isInviteControllerOpen}
        onClose={() => setIsInviteControllerOpen(false)}
        onConfirm={handleProvisionController}
        isActionLoading={isActionLoading}
      />
    </div>
  );
};
