export type AdminTab =
  | 'overview'
  | 'users'
  | 'roles'
  | 'monitoring'
  | 'audit'
  | 'reports';

export type UserRole = 'admin' | 'controller' | 'issuer' | 'student';
export type UserStatus = 'active' | 'pending' | 'suspended' | 'rejected';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  department?: string;
  studentId?: string;
  employeeId?: string;
  designation?: string;
  walletAddress?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AdminAuditEvent {
  id: string;
  timestamp: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId?: string;
  targetReference?: string;
  outcome: 'success' | 'failure' | 'warning';
  details?: string;
  ipAddress?: string;
  transactionHash?: string;
}

export interface ServiceHealthItem {
  service: 'api' | 'database' | 'email' | 'blockchain';
  displayName: string;
  status: 'healthy' | 'degraded' | 'down' | 'not_configured';
  latencyMs?: number;
  message: string;
  lastChecked: string;
  category?: string;
  purpose?: string;
  uptime?: string;
  securityFeature?: string;
}

export interface DashboardKPIs {
  totalUsers: number;
  totalCertificates: number;
  revokedCertificates: number;
  pendingIssuerApprovals: number;
  verificationEvents: number;
  networkStatus: 'connected' | 'degraded' | 'disconnected';
  networkName: string;
  chainId: number;
  contractAddress: string;
  latestBlock: number;
}

export interface BlockchainNetworkConfig {
  networkName: string;
  chainId: number;
  contractAddress: string;
  connectionState: 'connected' | 'degraded' | 'disconnected';
  latestBlock: number;
  lastSyncTime: string;
  lastSuccessfulTx: string;
  explorerUrl: string;
}

export interface PermissionMatrixRow {
  permission: string;
  category: string;
  superAdmin: string;
  controller: string;
  issuer: string;
  student: string;
  verifier: string;
  enforcement: 'Smart Contract' | 'Backend API' | 'Both';
}

export interface AnalyticsTrendPoint {
  date: string;
  issued: number;
  revoked: number;
  verified: number;
}

export interface UseSuperAdminReturn {
  // Navigation
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;

  // Search & Filtering
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedRoleFilter: string;
  setSelectedRoleFilter: (role: string) => void;
  selectedStatusFilter: string;
  setSelectedStatusFilter: (status: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;

  // Data
  kpis: DashboardKPIs;
  users: AdminUser[];
  filteredUsers: AdminUser[];
  totalUserCount: number;
  auditLogs: AdminAuditEvent[];
  filteredAuditLogs: AdminAuditEvent[];
  systemHealth: ServiceHealthItem[];
  blockchainConfig: BlockchainNetworkConfig;
  permissionMatrix: PermissionMatrixRow[];
  analyticsTrends: AnalyticsTrendPoint[];
  isLoading: boolean;
  isActionLoading: boolean;

  // Modals & Drawers
  selectedUserForDetail: AdminUser | null;
  setSelectedUserForDetail: (user: AdminUser | null) => void;
  selectedUserForSuspend: AdminUser | null;
  setSelectedUserForSuspend: (user: AdminUser | null) => void;
  selectedUserForRole: AdminUser | null;
  setSelectedUserForRole: (user: AdminUser | null) => void;
  selectedUserForDelete: AdminUser | null;
  setSelectedUserForDelete: (user: AdminUser | null) => void;
  isInviteControllerOpen: boolean;
  setIsInviteControllerOpen: (open: boolean) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;

  // Feedback Toast
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;

  // Actions
  refreshDashboardData: () => Promise<void>;
  handleSuspendUser: (userId: string, reason: string) => Promise<boolean>;
  handleReactivateUser: (userId: string) => Promise<boolean>;
  handleChangeUserRole: (userId: string, newRole: UserRole, reason: string) => Promise<boolean>;
  handleDeleteUser: (userId: string, reason?: string) => Promise<boolean>;
  handleProvisionController: (data: { name: string; email: string; department: string }) => Promise<{ success: boolean; email?: string } | null>;
  handleExportAuditLogsCsv: () => void;
  handleExportUsersCsv: () => void;
  handleExportHealthReport: () => void;
  handleLogout: () => void;
}
