'use client';

import React from 'react';
import {
  Bell,
  RefreshCw,
  Menu,
} from 'lucide-react';
import { AdminTab } from '@/types/admin';

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
  onSelectTab,
  onToggleMobileMenu,
}) => {
  const tabTitles: Record<AdminTab, { title: string; subtitle: string }> = {
    overview: {
      title: 'Platform Overview',
      subtitle: 'System health, key metrics, and administrative summary',
    },
    users: {
      title: 'User Management',
      subtitle: 'Search, audit, and provision institutional accounts',
    },
    roles: {
      title: 'Roles & Permission Matrix',
      subtitle: 'Smart Contract vs. backend authority boundaries',
    },
    monitoring: {
      title: 'System Health Monitoring',
      subtitle: 'Live API, MongoDB cluster, Brevo email, and RPC status',
    },
    audit: {
      title: 'Immutable Audit Trail',
      subtitle: 'Tamper-evident logs of governance and administrative actions',
    },
    reports: {
      title: 'Reports & Analytics',
      subtitle: 'Certificate volume, verification activity, and adoption trends',
    },
  };

  const currentTabInfo = tabTitles[activeTab] || tabTitles.overview;

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs shrink-0">
      {/* Left: Hamburger (Mobile) + Breadcrumbs & Page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 -ml-1 rounded-xl text-slate-600 hover:text-[#0B2545] hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
          title="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
            <span>PUB CertChain</span>
            <span>/</span>
            <span className="text-blue-600 font-bold capitalize">{activeTab}</span>
          </div>
          <h2 className="text-sm sm:text-lg font-bold text-[#0B2545] leading-none mt-0.5 truncate max-w-[180px] sm:max-w-none">
            {currentTabInfo.title}
          </h2>
        </div>
      </div>

     

      {/* Right: Actions, Network Badge, Notifications & Profile */}
      <div className="flex items-center gap-2.5">
        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition cursor-pointer disabled:opacity-50"
          title="Refresh dashboard metrics"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
        </button>

        

        {/* Notification indicator */}
        <button
          onClick={() => onSelectTab('audit')}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition relative cursor-pointer"
          title="View recent alerts and audit events"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full" />
        </button>

        {/* Super Admin Profile Menu */}
        <div className="relative" >
          <button
           
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-[#0B1E36] text-white flex items-center justify-center text-xs font-bold shrink-0">
              SA
            </div>
            <div className="text-left hidden lg:block">
              <span className="text-xs font-bold text-[#0B2545] block leading-tight">
                Super Admin
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">admin@pub.edu.bd</span>
            </div>
            
          </button>

         
        </div>
      </div>
    </header>
  );
};
