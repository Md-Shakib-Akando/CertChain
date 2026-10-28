'use client';

import React from 'react';
import {
  ShieldCheck,
  User,
} from 'lucide-react';
import { ControllerTab } from '@/types/controller';
import { WorkspaceTopHeader } from '@/components/layout/WorkspaceShell';

interface ControllerTopHeaderProps {
  activeTab: ControllerTab;
  onRefresh: () => void;
  isLoading: boolean;
  onLogout: () => void;
  onSelectTab: (tab: ControllerTab) => void;
  onToggleMobileMenu: () => void;
  controllerName?: string;
  controllerEmail?: string;
  pendingTotal?: number;
}

export const ControllerTopHeader: React.FC<ControllerTopHeaderProps> = ({
  activeTab,
  onRefresh,
  isLoading,
  onLogout,
  onSelectTab,
  onToggleMobileMenu,
  controllerName = 'Controller of Examinations',
  controllerEmail = 'controller.pub@gmail.com',
  pendingTotal = 0,
}) => {
  const tabTitles: Record<ControllerTab, { title: string; subtitle: string }> = {
    overview: {
      title: 'Controller Overview',
      subtitle: 'Examination administration, pending actions, and network status',
    },
    'issuer-approvals': {
      title: 'Issuer Account Approvals',
      subtitle: 'Review and authorize eligible Registrar & academic issuer accounts',
    },
    'revocation-requests': {
      title: 'Revocation Requests',
      subtitle: 'Inspect certificate revocation requests, grounds, and recorded evidence',
    },
    'co-signature-center': {
      title: 'Co-signature Center',
      subtitle: 'Cryptographic secondary signatures for smart contract revocation execution',
    },
    'issuer-directory': {
      title: 'Authorized Issuer Directory',
      subtitle: 'Directory of registered issuers, wallet bindings, and authorization status',
    },
    'audit-trail': {
      title: 'Immutable Examination Audit Trail',
      subtitle: 'Tamper-evident logs of approvals, rejections, revocations, and signatures',
    },
    'reports-analytics': {
      title: 'Operational Reports & Analytics',
      subtitle: 'Credential lifecycles, revocation summaries, and synchronization metrics',
    },
    'profile-settings': {
      title: 'Controller Profile & Security',
      subtitle: 'Account details, MetaMask wallet binding, and institutional security controls',
    },
  };

  const currentTabInfo = tabTitles[activeTab] || tabTitles.overview;

  return (
    <WorkspaceTopHeader
      role="controller"
      breadcrumbSection={activeTab.replace(/-/g, ' ')}
      title={currentTabInfo.title}
      subtitle={currentTabInfo.subtitle}
      onRefresh={onRefresh}
      isLoading={isLoading}
      onLogout={onLogout}
      onNotificationClick={() => onSelectTab('revocation-requests')}
      notificationCount={pendingTotal}
      onToggleMobileMenu={onToggleMobileMenu}
      userName={controllerName}
      userEmail={controllerEmail}
      dropdownItems={[
        {
          label: 'My Profile & Settings',
          icon: <User className="w-4 h-4 text-muted" />,
          onClick: () => onSelectTab('profile-settings'),
        },
        {
          label: 'Co-signature Center',
          icon: <ShieldCheck className="w-4 h-4 text-brand" />,
          onClick: () => onSelectTab('co-signature-center'),
        },
      ]}
    />
  );
};
