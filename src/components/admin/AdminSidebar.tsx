'use client';

import React from 'react';
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  Activity,
  FileText,
  BarChart3,
} from 'lucide-react';
import { AdminTab } from '@/types/admin';
import { WorkspaceSidebar, WorkspaceNavItem } from '@/components/layout/WorkspaceShell';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  pendingIssuersCount?: number;
  totalUsersCount?: number;
  onLogout: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  totalUsersCount = 0,
  onLogout,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const navItems: WorkspaceNavItem<AdminTab>[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'users',
      label: 'User Management',
      icon: Users,
      badge: totalUsersCount > 0 ? totalUsersCount : null,
    },
    {
      id: 'roles',
      label: 'Roles & Permissions',
      icon: ShieldAlert,
    },
    {
      id: 'monitoring',
      label: 'System Monitoring',
      icon: Activity,
      badge: 'Live',
      badgeTone: 'success',
    },
    {
      id: 'audit',
      label: 'Audit Logs',
      icon: FileText,
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
    },
  ];

  return (
    <WorkspaceSidebar
      role="admin"
      roleSubtitle="Super Admin"
      scopeTitle="Role Boundary"
      scopeDescription="Super Admin governs platform infrastructure & user provisioning. Academic issuer approvals and revocations are reserved for the Controller of Examinations."
      navGroupLabel="Platform Governance"
      navItems={navItems}
      activeTab={activeTab}
      onSelectTab={onSelectTab}
      onLogout={onLogout}
      isMobileOpen={isMobileOpen}
      onCloseMobile={onCloseMobile}
      userName="Super Admin"
      userEmail="admin@pub.edu.bd"
    />
  );
};
