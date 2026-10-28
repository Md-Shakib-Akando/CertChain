'use client';

import React from 'react';
import {
  User,
  Bell,
  FilePlus,
  FileSpreadsheet,
} from 'lucide-react';
import { IssuerTab } from './IssuerSidebar';
import { WorkspaceTopHeader } from '@/components/layout/WorkspaceShell';
import { Button } from '@/components/ui';

interface IssuerTopHeaderProps {
  activeTab: IssuerTab;
  onRefresh: () => void;
  isLoading: boolean;
  onLogout: () => void;
  onSelectTab: (tab: IssuerTab) => void;
  onToggleMobileMenu: () => void;
  issuerName?: string;
  issuerEmail?: string;
}

export const IssuerTopHeader: React.FC<IssuerTopHeaderProps> = ({
  activeTab,
  onRefresh,
  isLoading,
  onLogout,
  onSelectTab,
  onToggleMobileMenu,
  issuerName = 'Office of the Registrar',
  issuerEmail = 'registrar@pub.ac.bd',
}) => {
  const tabTitles: Record<IssuerTab, { title: string; subtitle: string }> = {
    overview: {
      title: 'Issuer Dashboard Overview',
      subtitle: 'Academic credentials summary, blockchain status, and recent issuances',
    },
    students: {
      title: 'Student Academic Directory',
      subtitle: 'Manage verified student records, graduation batches, and credentials',
    },
    issue: {
      title: 'Single Certificate Issuance',
      subtitle: 'Compile deterministic PDF and anchor SHA-256 fingerprint to Ethereum',
    },
    batch: {
      title: 'Batch CSV Issuance',
      subtitle: 'Upload graduating batch spreadsheets for automated smart contract execution',
    },
    certificates: {
      title: 'Issued Certificates Registry',
      subtitle: 'Cryptographic ledger of all issued credentials with revocation management',
    },
    audit: {
      title: 'Cryptographic Audit Trail',
      subtitle: 'Immutable record of issuances, revocations, and blockchain transactions',
    },
    reports: {
      title: 'Issuance Reports & Analytics',
      subtitle: 'Degree distribution, verification frequency, and system metrics',
    },
  };

  const currentTabInfo = tabTitles[activeTab] || tabTitles.overview;

  return (
    <WorkspaceTopHeader
      role="issuer"
      breadcrumbSection={activeTab}
      title={currentTabInfo.title}
      subtitle={currentTabInfo.subtitle}
      onRefresh={onRefresh}
      isLoading={isLoading}
      onLogout={onLogout}
      onNotificationClick={() => onSelectTab('audit')}
      onToggleMobileMenu={onToggleMobileMenu}
      userName={issuerName}
      userEmail={issuerEmail}
      quickActions={
        <>
          <Button
            variant="secondary"
            size="xs"
            leftIcon={<FileSpreadsheet className="w-3.5 h-3.5" />}
            onClick={() => onSelectTab('batch')}
          >
            Batch CSV
          </Button>
          <Button
            variant="primary"
            size="xs"
            leftIcon={<FilePlus className="w-3.5 h-3.5" />}
            onClick={() => onSelectTab('issue')}
          >
            Issue Credential
          </Button>
        </>
      }
      dropdownItems={[
        {
          label: 'Workspace Overview',
          icon: <User className="w-4 h-4 text-muted" />,
          onClick: () => onSelectTab('overview'),
        },
        {
          label: 'Cryptographic Audit Trail',
          icon: <Bell className="w-4 h-4 text-muted" />,
          onClick: () => onSelectTab('audit'),
        },
      ]}
    />
  );
};
