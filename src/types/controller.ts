export type ControllerTab =
  | 'overview'
  | 'issuer-approvals'
  | 'revocation-requests'
  | 'co-signature-center'
  | 'issuer-directory'
  | 'audit-trail'
  | 'reports-analytics'
  | 'profile-settings';

export type IssuerApplicationStatus = 'pending' | 'approved' | 'rejected' | 'more_info_required';
export type ContractAuthorizationStatus = 'authorized' | 'unauthorized' | 'pending' | 'unknown';
export type AccountStatus = 'active' | 'suspended';

export interface IssuerApplication {
  id: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  employeeId: string;
  requestedRole: string; // 'Registrar / Issuer'
  submittedAt: string;
  status: IssuerApplicationStatus;
  walletAddress?: string;
  isWalletVerified?: boolean;
  contractAuthorization: ContractAuthorizationStatus;
  accountStatus: AccountStatus;
  issuedCertificatesCount: number;
  rejectionReason?: string;
  requestId?: string;
  notes?: string;
}

export type RevocationWorkflowState =
  | 'pending_review'
  | 'awaiting_signature'
  | 'submitted'
  | 'confirmed'
  | 'rejected'
  | 'failed';

export interface RevocationItem {
  id: string;
  certificateId: string;
  certificateType: string;
  studentName: string;
  studentId: string;
  program: string;
  issueDate: string;
  originalTxHash?: string;
  sha256Hash?: string;
  requestingIssuer: {
    name: string;
    email: string;
    department?: string;
    authorizationStatus?: 'authorized' | 'pending' | 'suspended';
    wallet?: string;
  };
  reason: string;
  evidenceNotes?: string;
  requestedAt: string;
  currentStatus: 'valid' | 'pending_revocation' | 'revoked';
  workflowStatus: RevocationWorkflowState;
  transactionHash?: string;
  blockNumber?: number;
  controllerSignerEmail?: string;
  controllerSignerWallet?: string;
  controllerSignedAt?: string;
  controllerSignatureHash?: string;
  rejectionReason?: string;
  failureReason?: string;
}

export interface ControllerStats {
  activeIssuers: number;
  pendingIssuerApplications: number;
  pendingRevocations: number;
  confirmedRevocations: number;
  totalCertificatesInSystem: number;
  blockchainNetwork: {
    state: 'connected' | 'degraded' | 'disconnected';
    networkName: string;
    chainId: number;
    contractAddress: string;
    latestBlock: number;
    lastSyncTime: string;
    explorerUrl: string;
  };
}

export interface ControllerAuditEvent {
  id: string;
  eventType: string; // 'Issuer Approved', 'Issuer Rejected', 'Revocation Requested', 'Revocation Co-Signed', 'Revocation Confirmed', etc.
  actor: string;
  actorRole: string;
  targetReference: string; // Issuer ID or Certificate ID
  timestamp: string;
  isBlockchainEvent?: boolean;
  blockTimestamp?: string;
  result: 'success' | 'pending' | 'rejected' | 'failed';
  transactionHash?: string;
  blockNumber?: number;
  network?: string;
  details?: string;
}

export interface PendingActionItem {
  id: string;
  type: 'issuer_application' | 'revocation_request';
  title: string;
  subtitle: string;
  targetRef: string;
  submittedAt: string;
  priority: 'high' | 'medium';
  actionTab: ControllerTab;
}

export interface RecentActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'rejected' | 'failed' | 'pending';
  txHash?: string;
}

export interface ControllerProfileData {
  name: string;
  email: string;
  designation: string;
  department: string;
  roleTitle: string; // 'Controller of Examinations'
  university: string;
  walletAddress?: string;
  isWalletConnected: boolean;
  networkName?: string;
  mfaEnabled: boolean;
  activeSessionsCount: number;
}
