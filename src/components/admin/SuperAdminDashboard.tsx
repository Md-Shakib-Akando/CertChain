'use client';

import React from 'react';
import { useSuperAdminDashboard } from '@/hooks/useSuperAdminDashboard';
import { StateToast, PageSkeleton } from '@/components/ui';
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
    <div className="h-screen overflow-hidden bg-canvas text-ink flex font-sans antialiased">
      {/* Toast Feedback */}
      <StateToast toast={toast} />

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

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl w-full mx-auto space-y-6">
            {isLoading && !kpis.totalUsers ? (
              <PageSkeleton rows={5} />
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
          </div>
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
