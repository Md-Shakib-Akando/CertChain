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
  LogOut,
  ShieldCheck,
  X,
  Radio,
} from 'lucide-react';

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
  const navItems = [
    {
      id: 'overview' as IssuerTab,
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'students' as IssuerTab,
      label: 'Student Directory',
      icon: Users,
      badge: studentsCount > 0 ? studentsCount : null,
      badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    },
    {
      id: 'issue' as IssuerTab,
      label: 'Single Issuance',
      icon: FilePlus,
      badge: null,
    },
    {
      id: 'batch' as IssuerTab,
      label: 'Batch CSV Issuance',
      icon: FileSpreadsheet,
      badge: 'Smart Contract',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    },
    {
      id: 'certificates' as IssuerTab,
      label: 'Issued Registry',
      icon: History,
      badge: certificatesCount > 0 ? certificatesCount : null,
      badgeColor: 'bg-slate-800 text-slate-300 border border-slate-700',
    },
    {
      id: 'audit' as IssuerTab,
      label: 'Audit Trail',
      icon: Activity,
      badge: auditCount > 0 ? auditCount : null,
      badgeColor: 'bg-slate-800 text-slate-300 border border-slate-700',
    },
    {
      id: 'reports' as IssuerTab,
      label: 'Reports & Analytics',
      icon: BarChart3,
      badge: null,
    },
  ];

  const handleTabClick = (tabId: IssuerTab) => {
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md border border-blue-400/30 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="font-extrabold text-base tracking-tight text-white truncate">
              PUB CertChain
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300">
                Registrar / Issuer
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Close Button */}
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Close Navigation"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Role Authority Advisory Callout */}
      <div className="mx-3 my-3 p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-[11px] text-slate-300 leading-relaxed shrink-0">
        <span className="font-semibold text-blue-300 block mb-0.5">
          Registrar Authority:
        </span>
        Authorized to create student records, issue degree credentials, and anchor cryptographic SHA-256 fingerprints to the blockchain ledger.
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto scrollbar-none">
        <span className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">
          Credential Issuance
        </span>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#2563EB] text-white shadow-sm font-bold'
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
                      item.badgeColor || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Smart Contract Live Status Card */}
      <div className="p-3 mx-3 mb-3 bg-slate-900/90 border border-slate-800 rounded-2xl shrink-0 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400 font-medium">Smart Contract</span>
          <span className="inline-flex items-center gap-1 font-mono text-emerald-400 text-[10px] font-bold">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            Live Online
          </span>
        </div>
        <div className="font-mono text-[10px] text-slate-300 bg-black/40 px-2 py-1 rounded truncate">
          0x5FbDB2315678afecb367f032d93F642f64180aa3
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
          <span>Network: Hardhat / Sepolia</span>
          <span className="text-blue-300 font-semibold">Chain ID: 31337</span>
        </div>
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow">
            RO
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">Registrar Office</p>
            <p className="text-[10px] text-slate-400 truncate">registrar@pub.ac.bd</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 transition cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 bg-[#0B1F3A] text-slate-200 flex-col border-r border-slate-800 h-screen shrink-0 z-30">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <aside className="relative flex-1 flex flex-col max-w-xs w-full bg-[#0B1F3A] text-slate-200 h-full shadow-2xl z-50">
            {renderSidebarContent()}
          </aside>
        </div>
      )}
    </>
  );
};
