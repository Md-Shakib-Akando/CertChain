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
  LogOut,
  ShieldCheck,
  ChevronRight,
  X,
  Wallet,
} from 'lucide-react';
import { ControllerTab } from '@/types/controller';

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
  const navItems = [
    {
      id: 'overview' as ControllerTab,
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'issuer-approvals' as ControllerTab,
      label: 'Issuer Approvals',
      icon: UserCheck,
      badge: pendingApplicationsCount > 0 ? pendingApplicationsCount : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    },
    {
      id: 'revocation-requests' as ControllerTab,
      label: 'Revocation Requests',
      icon: FileX2,
      badge: pendingRevocationsCount > 0 ? pendingRevocationsCount : null,
      badgeColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
    },
    {
      id: 'co-signature-center' as ControllerTab,
      label: 'Co-signature Center',
      icon: PenTool,
      badge: pendingRevocationsCount > 0 ? `${pendingRevocationsCount} Pending` : 'Ready',
      badgeColor: pendingRevocationsCount > 0
        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    },
    {
      id: 'issuer-directory' as ControllerTab,
      label: 'Issuer Directory',
      icon: Users,
      badge: activeIssuersCount > 0 ? activeIssuersCount : null,
      badgeColor: 'bg-slate-800 text-slate-300 border border-slate-700',
    },
    {
      id: 'audit-trail' as ControllerTab,
      label: 'Audit Trail',
      icon: FileText,
      badge: null,
    },
    {
      id: 'reports-analytics' as ControllerTab,
      label: 'Reports & Analytics',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'profile-settings' as ControllerTab,
      label: 'My Profile & Settings',
      icon: Settings,
      badge: null,
    },
  ];

  const handleTabClick = (tabId: ControllerTab) => {
    onSelectTab(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const renderSidebarContent = () => (
    <>
      {/* Brand & Workspace Logo */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-md border border-teal-400/30 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="font-extrabold text-base tracking-tight text-white truncate">
              PUB CertChain
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300">
                Controller of Exams
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Close Button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Close Navigation"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Role Authority Advisory Callout per PDF Section 1 & 11 */}
      <div className="mx-3 my-3 p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-[11px] text-slate-300 leading-relaxed shrink-0">
        <span className="font-semibold text-teal-300 block mb-0.5">
          Controller Scope:
        </span>
        Authorized to review issuer credentials and provide required secondary cryptographic co-signatures for certificate revocations.
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto scrollbar-none">
        <span className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">
          Examination Governance
        </span>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-teal-600 text-white shadow-sm font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                      item.badgeColor
                        ? item.badgeColor
                        : isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-teal-200" />}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Web3 Wallet Quick Status Badge */}
      <div className="px-3 py-2 border-t border-slate-800/60 shrink-0">
        <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 text-[11px] flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Wallet className={`w-3.5 h-3.5 shrink-0 ${isWalletConnected ? 'text-teal-400' : 'text-slate-500'}`} />
            <div className="truncate">
              <span className="block text-[10px] text-slate-400">Co-sign Wallet</span>
              <span className="font-mono text-xs text-white truncate block">
                {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Not connected'}
              </span>
            </div>
          </div>
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              isWalletConnected ? 'bg-teal-400' : 'bg-amber-400'
            }`}
            title={isWalletConnected ? 'Connected & Ready' : 'Wallet not connected'}
          />
        </div>
      </div>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-slate-800/80 shrink-0">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:text-white hover:bg-rose-900/30 border border-transparent hover:border-rose-800/50 transition cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0 text-rose-400" />
          <span>Log Out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="w-64 bg-[#0B1E36] text-white hidden lg:flex flex-col shrink-0 h-screen sticky top-0 border-r border-slate-800 select-none z-20">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Responsive Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={onCloseMobile}
          />
          <aside className="relative w-72 max-w-[85vw] bg-[#0B1E36] text-white flex flex-col h-full border-r border-slate-800 select-none shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {renderSidebarContent()}
          </aside>
        </div>
      )}
    </>
  );
};
