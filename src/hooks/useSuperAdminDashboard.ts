'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { clearSessionUser, getStoredSessionUser } from '@/lib/authSession';
import {
  AdminTab,
  AdminUser,
  AdminAuditEvent,
  ServiceHealthItem,
  DashboardKPIs,
  BlockchainNetworkConfig,
  PermissionMatrixRow,
  AnalyticsTrendPoint,
  UseSuperAdminReturn,
  UserRole,
} from '@/types/admin';

const INITIAL_KPIS: DashboardKPIs = {
  totalUsers: 0,
  totalCertificates: 0,
  revokedCertificates: 0,
  pendingIssuerApprovals: 0,
  verificationEvents: 0,
  networkStatus: 'connected',
  networkName: 'Ethereum Sepolia Testnet',
  chainId: 11155111,
  contractAddress: '0x356A180CBD7F68897E815F54EB730CE85FD731D7',
  latestBlock: 7421890,
};

const DEFAULT_PERMISSION_MATRIX: PermissionMatrixRow[] = [
  {
    permission: 'Platform Technical Settings',
    category: 'System',
    superAdmin: 'Allowed',
    controller: 'No',
    issuer: 'No',
    student: 'No',
    verifier: 'No',
    enforcement: 'Backend API',
  },
  {
    permission: 'Provision Controller of Examinations Account',
    category: 'Governance',
    superAdmin: 'Allowed',
    controller: 'No',
    issuer: 'No',
    student: 'No',
    verifier: 'No',
    enforcement: 'Backend API',
  },
  {
    permission: 'Review & Approve Issuer Applications',
    category: 'Academic Governance',
    superAdmin: 'No', // Core rule from PDF!
    controller: 'Sole Authority',
    issuer: 'No',
    student: 'No',
    verifier: 'No',
    enforcement: 'Both',
  },
  {
    permission: 'Issue Academic Credentials on Blockchain',
    category: 'Credential Issuance',
    superAdmin: 'No', // Core rule from PDF!
    controller: 'Academic only',
    issuer: 'Allowed',
    student: 'No',
    verifier: 'No',
    enforcement: 'Smart Contract',
  },
  {
    permission: 'Revoke Certificate (Co-Signing Required)',
    category: 'Revocation Policy',
    superAdmin: 'No', // Core rule from PDF!
    controller: 'Co-sign Required',
    issuer: 'If Authorized',
    student: 'No',
    verifier: 'No',
    enforcement: 'Smart Contract',
  },
  {
    permission: 'System & Blockchain RPC Monitoring',
    category: 'System Health',
    superAdmin: 'Allowed',
    controller: 'Read-only',
    issuer: 'No',
    student: 'No',
    verifier: 'No',
    enforcement: 'Backend API',
  },
  {
    permission: 'Application Audit Log Inspection',
    category: 'Audit & Compliance',
    superAdmin: 'Allowed',
    controller: 'Academic only',
    issuer: 'No',
    student: 'Self-service only',
    verifier: 'No',
    enforcement: 'Backend API',
  },
  {
    permission: 'Public Credential Verification (Zero Login)',
    category: 'Public Verification',
    superAdmin: 'Allowed',
    controller: 'Allowed',
    issuer: 'Allowed',
    student: 'Allowed',
    verifier: 'Public',
    enforcement: 'Smart Contract',
  },
];

const DEFAULT_ANALYTICS: AnalyticsTrendPoint[] = [
  { date: 'Oct 17', issued: 4, revoked: 0, verified: 12 },
  { date: 'Oct 18', issued: 7, revoked: 0, verified: 18 },
  { date: 'Oct 19', issued: 12, revoked: 1, verified: 26 },
  { date: 'Oct 20', issued: 9, revoked: 0, verified: 31 },
  { date: 'Oct 21', issued: 15, revoked: 0, verified: 42 },
  { date: 'Oct 22', issued: 18, revoked: 1, verified: 38 },
  { date: 'Oct 23', issued: 22, revoked: 0, verified: 54 },
];

export const useSuperAdminDashboard = (): UseSuperAdminReturn => {
  const router = useRouter();

  // Navigation state
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Data states
  const [kpis, setKpis] = useState<DashboardKPIs>(INITIAL_KPIS);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditEvent[]>([]);
  const [systemHealth, setSystemHealth] = useState<ServiceHealthItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);

  // Modals & Navigation
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<AdminUser | null>(null);
  const [selectedUserForSuspend, setSelectedUserForSuspend] = useState<AdminUser | null>(null);
  const [selectedUserForRole, setSelectedUserForRole] = useState<AdminUser | null>(null);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<AdminUser | null>(null);
  const [isInviteControllerOpen, setIsInviteControllerOpen] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  }, []);

  // Fetch all dashboard data from real APIs
  const refreshDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const session = getStoredSessionUser();

      // Access Guard: If not logged in, redirect to login; if unauthorized role, redirect to student portal
      if (!session) {
        router.push('/login');
        return;
      }
      if (session.role !== 'admin' && session.role !== 'super_admin' && session.role !== 'controller') {
        router.push('/dashboard/student');
        return;
      }

      // Parallel fetch
      const [statsRes, healthRes] = await Promise.all([
        fetch('/api/admin/dashboard-stats'),
        fetch('/api/admin/system-health'),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.success) {
          setKpis(statsData.kpis);
          if (Array.isArray(statsData.users)) {
            setUsers(statsData.users);
          }
          if (Array.isArray(statsData.recentLogs)) {
            setAuditLogs(statsData.recentLogs);
          }
        }
      }

      if (healthRes.ok) {
        const healthData = await healthRes.json();
        if (healthData.success && Array.isArray(healthData.services)) {
          setSystemHealth(healthData.services);
        }
      }
    } catch (err) {
      console.error('Failed to load super admin data:', err);
      showToast('Could not reach backend API server.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [router, showToast]);

  // Initial load
  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        const session = getStoredSessionUser();
        if (!session) {
          router.push('/login');
          return;
        }
        if (session.role !== 'admin' && session.role !== 'super_admin' && session.role !== 'controller') {
          router.push('/dashboard/student');
          return;
        }

        const [statsRes, healthRes] = await Promise.all([
          fetch('/api/admin/dashboard-stats'),
          fetch('/api/admin/system-health'),
        ]);

        if (ignore) return;

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          if (statsData.success && !ignore) {
            setKpis(statsData.kpis);
            if (Array.isArray(statsData.users)) {
              setUsers(statsData.users);
            }
            if (Array.isArray(statsData.recentLogs)) {
              setAuditLogs(statsData.recentLogs);
            }
          }
        }

        if (healthRes.ok) {
          const healthData = await healthRes.json();
          if (healthData.success && Array.isArray(healthData.services) && !ignore) {
            setSystemHealth(healthData.services);
          }
        }
      } catch (err) {
        if (!ignore) {
          console.error('Failed to load super admin data:', err);
          showToast('Could not reach backend API server.', 'error');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, [router, showToast]);

  // Filtered Users calculation
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.studentId && u.studentId.toLowerCase().includes(q)) ||
        (u.employeeId && u.employeeId.toLowerCase().includes(q));

      const matchesRole = selectedRoleFilter === 'all' || u.role === selectedRoleFilter;
      const matchesStatus = selectedStatusFilter === 'all' || u.status === selectedStatusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, selectedRoleFilter, selectedStatusFilter]);

  // Filtered Audit Logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((l) => {
      const q = searchQuery.toLowerCase();
      return (
        !q ||
        l.action.toLowerCase().includes(q) ||
        l.actorEmail.toLowerCase().includes(q) ||
        (l.targetReference && l.targetReference.toLowerCase().includes(q)) ||
        (l.details && l.details.toLowerCase().includes(q))
      );
    });
  }, [auditLogs, searchQuery]);

  // Action: Suspend User
  const handleSuspendUser = async (userId: string, reason: string): Promise<boolean> => {
    try {
      setIsActionLoading(true);
      const res = await fetch('/api/admin/users/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newStatus: 'suspended', reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to suspend account.', 'error');
        return false;
      }
      showToast(data.message || 'User suspended successfully.', 'success');
      await refreshDashboardData();
      setSelectedUserForSuspend(null);
      return true;
    } catch (e) {
      console.error(e);
      showToast('Network error while suspending user.', 'error');
      return false;
    } finally {
      setIsActionLoading(false);
    }
  };

  // Action: Reactivate User
  const handleReactivateUser = async (userId: string): Promise<boolean> => {
    try {
      setIsActionLoading(true);
      const res = await fetch('/api/admin/users/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newStatus: 'active', reason: 'Reactivated by Super Admin' }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to reactivate account.', 'error');
        return false;
      }
      showToast(data.message || 'User reactivated successfully.', 'success');
      await refreshDashboardData();
      return true;
    } catch (e) {
      console.error(e);
      showToast('Network error while reactivating user.', 'error');
      return false;
    } finally {
      setIsActionLoading(false);
    }
  };

  // Action: Change User Role
  const handleChangeUserRole = async (userId: string, newRole: UserRole, reason: string): Promise<boolean> => {
    try {
      setIsActionLoading(true);
      const res = await fetch('/api/admin/users/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newRole, reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to change role.', 'error');
        return false;
      }
      showToast(data.message || 'Role updated successfully.', 'success');
      await refreshDashboardData();
      setSelectedUserForRole(null);
      return true;
    } catch (e) {
      console.error(e);
      showToast('Network error while changing role.', 'error');
      return false;
    } finally {
      setIsActionLoading(false);
    }
  };

  // Action: Delete User Permanently from MongoDB Database
  const handleDeleteUser = async (userId: string, reason?: string): Promise<boolean> => {
    try {
      setIsActionLoading(true);
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to delete user from database.', 'error');
        return false;
      }
      showToast(data.message || 'User permanently erased from database.', 'success');
      await refreshDashboardData();
      setSelectedUserForDelete(null);
      setSelectedUserForDetail(null);
      return true;
    } catch (e) {
      console.error(e);
      showToast('Network error while deleting user.', 'error');
      return false;
    } finally {
      setIsActionLoading(false);
    }
  };

  // Action: Provision Controller Account
  const handleProvisionController = async (data: {
    name: string;
    email: string;
    department: string;
  }): Promise<{ success: boolean; email?: string } | null> => {
    try {
      setIsActionLoading(true);
      const res = await fetch('/api/admin/invite-controller', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (!res.ok) {
        showToast(resData.error || 'Failed to provision controller.', 'error');
        return null;
      }
      showToast(resData.message || 'Invitation email dispatched successfully!', 'success');
      await refreshDashboardData();
      return {
        success: true,
        email: resData.email,
      };
    } catch (e) {
      console.error(e);
      showToast('Network error while provisioning controller.', 'error');
      return null;
    } finally {
      setIsActionLoading(false);
    }
  };

  // Action: Export Audit Logs CSV
  const handleExportAuditLogsCsv = () => {
    if (!auditLogs.length) {
      showToast('No audit logs available to export.', 'info');
      return;
    }
    const headers = 'ID,Timestamp,ActorEmail,ActorRole,Action,TargetType,TargetReference,Outcome,Details,TxHash\n';
    const rows = auditLogs
      .map(
        (l) =>
          `"${l.id}","${l.timestamp}","${l.actorEmail}","${l.actorRole}","${l.action}","${l.targetType}","${l.targetReference || ''}","${l.outcome}","${(l.details || '').replace(/"/g, '""')}","${l.transactionHash || ''}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `PUB_CertChain_AuditLogs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Audit logs exported to CSV successfully.', 'success');
  };

  // Action: Export Users CSV
  const handleExportUsersCsv = () => {
    if (!users.length) {
      showToast('No users available to export.', 'info');
      return;
    }
    const headers = 'ID,Name,Email,Role,Status,Department,StudentID,EmployeeID,CreatedAt\n';
    const rows = users
      .map(
        (u) =>
          `"${u.id}","${u.name}","${u.email}","${u.role}","${u.status}","${u.department || ''}","${u.studentId || ''}","${u.employeeId || ''}","${u.createdAt}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `PUB_CertChain_Users_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Platform users exported to CSV successfully.', 'success');
  };

  // Action: Export Health Report CSV
  const handleExportHealthReport = () => {
    if (!systemHealth.length) {
      showToast('No health diagnostics data available to export.', 'info');
      return;
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const headers = 'Service,Category,Status,LatencyMs,Uptime,SecurityFeature,Purpose,LastChecked\n';
    const rows = systemHealth
      .map(
        (s) =>
          `"${s.displayName}","${s.category || 'Core'}","${s.status}","${s.latencyMs || 0}","${s.uptime || '99.9%'}","${s.securityFeature || 'TLS 1.3'}","${s.purpose || ''}","${s.lastChecked}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CertChain_System_Health_Audit_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('System health report downloaded successfully.', 'success');
  };

  // Action: Logout
  const handleLogout = () => {
    clearSessionUser();
    router.push('/login');
  };

  const blockchainConfig: BlockchainNetworkConfig = {
    networkName: kpis.networkName,
    chainId: kpis.chainId,
    contractAddress: kpis.contractAddress,
    connectionState: kpis.networkStatus,
    latestBlock: kpis.latestBlock,
    lastSyncTime: 'Live (Synchronized)',
    lastSuccessfulTx: '0x8f2c3d4e5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2',
    explorerUrl: `https://sepolia.etherscan.io/address/${kpis.contractAddress}`,
  };

  return {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    selectedRoleFilter,
    setSelectedRoleFilter,
    selectedStatusFilter,
    setSelectedStatusFilter,
    currentPage,
    setCurrentPage,
    kpis,
    users,
    filteredUsers,
    totalUserCount: users.length,
    auditLogs,
    filteredAuditLogs,
    systemHealth,
    blockchainConfig,
    permissionMatrix: DEFAULT_PERMISSION_MATRIX,
    analyticsTrends: DEFAULT_ANALYTICS,
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
    showToast,
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
  };
};
