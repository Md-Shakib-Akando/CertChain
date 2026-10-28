'use client';

import React from 'react';
import {
  LayoutDashboard,
  Users,
  FilePlus,
  FileSpreadsheet,
  History,
  Activity,
  BarChart3,
  Radio,
} from 'lucide-react';
import { WorkspaceSidebar, WorkspaceNavItem } from '@/components/layout/WorkspaceShell';

export type IssuerTab =
  | 'overview'
  | 'students'
  | 'issue'
  | 'batch'
  | 'certificates'
  | 'audit'
  | 'reports';

interface IssuerSidebarProps {
  activeTab: IssuerTab;
  onSelectTab: (tab: IssuerTab) => void;
  certificatesCount?: number;
  studentsCount?: number;
  auditCount?: number;
  onLogout: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const IssuerSidebar: React.FC<IssuerSidebarProps> = ({
  activeTab,
  onSelectTab,
  certificatesCount = 0,
  studentsCount = 0,
  auditCount = 0,
  onLogout,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const navItems: WorkspaceNavItem<IssuerTab>[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'students',
      label: 'Student Directory',
      icon: Users,
      badge: studentsCount > 0 ? studentsCount : null,
    },
    {
      id: 'issue',
      label: 'Single Issuance',
      icon: FilePlus,
    },
    {
      id: 'batch',
      label: 'Batch CSV Issuance',
      icon: FileSpreadsheet,
      badge: 'CSV',
      badgeTone: 'seal',
    },
    {
      id: 'certificates',
      label: 'Issued Registry',
      icon: History,
      badge: certificatesCount > 0 ? certificatesCount : null,
    },
    {
      id: 'audit',
      label: 'Audit Trail',
      icon: Activity,
      badge: auditCount > 0 ? auditCount : null,
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
    },
  ];

  return (
    <WorkspaceSidebar
      role="issuer"
      roleSubtitle="Registrar & Issuer"
      scopeTitle="Registrar Authority"
      scopeDescription="Authorized to manage student dossiers, generate deterministic diploma PDFs, and anchor SHA-256 digests on Ethereum Sepolia."
      navGroupLabel="Credential Issuance"
      navItems={navItems}
      activeTab={activeTab}
      onSelectTab={onSelectTab}
      onLogout={onLogout}
      isMobileOpen={isMobileOpen}
      onCloseMobile={onCloseMobile}
      userName="Registrar Office"
      userEmail="registrar@pub.ac.bd"
      footerSlot={
        <div className="p-3 bg-night-2 border border-night-line rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-night-muted font-medium">CertChain.sol</span>
            <span className="inline-flex items-center gap-1 font-mono text-emerald-400 text-[10px] font-semibold">
              <Radio className="w-3 h-3 animate-pulse" />
              Active
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-night-muted">
            <span>Sepolia / Local RPC</span>
            <span className="font-mono text-seal">SHA-256</span>
          </div>
        </div>
      }
    />
  );
};
