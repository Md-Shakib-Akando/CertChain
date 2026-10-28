'use client';

import React from 'react';
import {
  LayoutDashboard,
  UserCheck,
  FileX2,
  PenTool,
  Users,
  FileText,
  BarChart3,
  Settings,
  Wallet,
} from 'lucide-react';
import { ControllerTab } from '@/types/controller';
import { WorkspaceSidebar, WorkspaceNavItem } from '@/components/layout/WorkspaceShell';

interface ControllerSidebarProps {
  activeTab: ControllerTab;
  onSelectTab: (tab: ControllerTab) => void;
  pendingApplicationsCount?: number;
  pendingRevocationsCount?: number;
  activeIssuersCount?: number;
  isWalletConnected?: boolean;
  walletAddress?: string | null;
  onLogout: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const ControllerSidebar: React.FC<ControllerSidebarProps> = ({
  activeTab,
  onSelectTab,
  pendingApplicationsCount = 0,
  pendingRevocationsCount = 0,
  activeIssuersCount = 0,
  isWalletConnected = false,
  walletAddress,
  onLogout,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const navItems: WorkspaceNavItem<ControllerTab>[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'issuer-approvals',
      label: 'Issuer Approvals',
      icon: UserCheck,
      badge: pendingApplicationsCount > 0 ? pendingApplicationsCount : null,
      badgeTone: 'warning',
    },
    {
      id: 'revocation-requests',
      label: 'Revocation Requests',
      icon: FileX2,
      badge: pendingRevocationsCount > 0 ? pendingRevocationsCount : null,
      badgeTone: 'danger',
    },
    {
      id: 'co-signature-center',
      label: 'Co-signature Center',
      icon: PenTool,
      badge: pendingRevocationsCount > 0 ? `${pendingRevocationsCount} Pending` : 'Ready',
      badgeTone: pendingRevocationsCount > 0 ? 'danger' : 'success',
    },
    {
      id: 'issuer-directory',
      label: 'Issuer Directory',
      icon: Users,
      badge: activeIssuersCount > 0 ? activeIssuersCount : null,
    },
    {
      id: 'audit-trail',
      label: 'Audit Trail',
      icon: FileText,
    },
    {
      id: 'reports-analytics',
      label: 'Reports & Analytics',
      icon: BarChart3,
    },
    {
      id: 'profile-settings',
      label: 'My Profile & Settings',
      icon: Settings,
    },
  ];

  return (
    <WorkspaceSidebar
      role="controller"
      roleSubtitle="Controller of Exams"
      scopeTitle="Controller Scope"
      scopeDescription="Authorized to vet Registrar/Issuer applications and execute required secondary cryptographic co-signatures for certificate revocations."
      navGroupLabel="Examination Governance"
      navItems={navItems}
      activeTab={activeTab}
      onSelectTab={onSelectTab}
      onLogout={onLogout}
      isMobileOpen={isMobileOpen}
      onCloseMobile={onCloseMobile}
      userName="Controller of Exams"
      userEmail="controller.pub@gmail.com"
      footerSlot={
        <div className="p-2.5 rounded-xl bg-night-2 border border-night-line text-[11px] flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Wallet
              className={`w-3.5 h-3.5 shrink-0 ${
                isWalletConnected ? 'text-emerald-400' : 'text-night-muted'
              }`}
            />
            <div className="truncate">
              <span className="block text-[10px] text-night-muted">Co-Sign Wallet</span>
              <span className="font-mono text-xs text-night-text truncate block">
                {walletAddress
                  ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                  : 'Server / MetaMask'}
              </span>
            </div>
          </div>
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              isWalletConnected ? 'bg-emerald-400' : 'bg-amber-400'
            }`}
            title={isWalletConnected ? 'Connected & Ready' : 'Standby'}
          />
        </div>
      }
    />
  );
};
