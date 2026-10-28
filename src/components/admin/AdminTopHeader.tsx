'use client';

import React from 'react';
import { ShieldAlert, FileText } from 'lucide-react';
import { AdminTab } from '@/types/admin';
import { WorkspaceTopHeader } from '@/components/layout/WorkspaceShell';

interface AdminTopHeaderProps {
  activeTab: AdminTab;
  onRefresh: () => void;
  isLoading: boolean;
  onLogout?: () => void;
  onSelectTab: (tab: AdminTab) => void;
  onToggleMobileMenu?: () => void;
}

export const AdminTopHeader: React.FC<AdminTopHeaderProps> = ({
  activeTab,
  onRefresh,
  isLoading,
  onLogout,
  onSelectTab,
  onToggleMobileMenu,
}) => {
  const tabTitles: Record<AdminTab, { title: string; subtitle: string }> = {
    overview: {
      title: 'Platform Governance Overview',
      subtitle: 'System health, institutional metrics, and administrative summary',
    },
    users: {
      title: 'Institutional User Directory',
      subtitle: 'Search, audit, and provision university accounts',
    },
    roles: {
      title: 'Roles & Permission Matrix',
      subtitle: 'Smart Contract vs. backend authority boundaries',
    },
    monitoring: {
      title: 'System Health Monitoring',
      subtitle: 'Live API, MongoDB cluster, Brevo email, and Sepolia RPC status',
    },
    audit: {
      title: 'Immutable Audit Trail',
      subtitle: 'Tamper-evident logs of governance and administrative actions',
    },
    reports: {
      title: 'Platform Reports & Analytics',
      subtitle: 'Certificate volume, verification activity, and adoption trends',
    },
  };

  const currentTabInfo = tabTitles[activeTab] || tabTitles.overview;

  return (
    <WorkspaceTopHeader
      role="admin"
      breadcrumbSection={activeTab}
      title={currentTabInfo.title}
      subtitle={currentTabInfo.subtitle}
      onRefresh={onRefresh}
      isLoading={isLoading}
      onLogout={onLogout}
      onNotificationClick={() => onSelectTab('audit')}
      onToggleMobileMenu={onToggleMobileMenu}
      userName="Super Admin"
      userEmail="admin@pub.edu.bd"
      dropdownItems={[
        {
          label: 'Roles & Permissions Matrix',
          icon: <ShieldAlert className="w-4 h-4 text-muted" />,
          onClick: () => onSelectTab('roles'),
        },
        {
          label: 'System Audit Logs',
          icon: <FileText className="w-4 h-4 text-muted" />,
          onClick: () => onSelectTab('audit'),
        },
      ]}
    />
  );
};
