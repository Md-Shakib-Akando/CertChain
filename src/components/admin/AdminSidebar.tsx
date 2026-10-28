'use client';

import React from 'react';
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  Activity,
  FileText,
  BarChart3,
  LogOut,
  ShieldCheck,
  ChevronRight,
  X,
} from 'lucide-react';
import { AdminTab } from '@/types/admin';

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
  const navItems = [
    {
      id: 'overview' as AdminTab,
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'users' as AdminTab,
      label: 'User Management',
      icon: Users,
      badge: totalUsersCount > 0 ? totalUsersCount : null,
    },
    {
      id: 'roles' as AdminTab,
      label: 'Roles & Permissions',
      icon: ShieldAlert,
      badge: null,
    },
    {
      id: 'monitoring' as AdminTab,
      label: 'System Monitoring',
      icon: Activity,
      badge: 'Live',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      id: 'audit' as AdminTab,
      label: 'Audit Logs',
      icon: FileText,
      badge: null,
    },
    {
      id: 'reports' as AdminTab,
      label: 'Reports & Analytics',
      icon: BarChart3,
      badge: null,
    },
  ];

  const handleTabClick = (tabId: AdminTab) => {
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md border border-blue-400/30 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="font-extrabold text-base tracking-tight text-white truncate">
              PUB CertChain
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300">
                Super Admin
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Close Button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Controller Boundary Advisory Callout */}
      <div className="mx-3 my-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300 leading-relaxed shrink-0">
        <span className="font-semibold text-amber-300 block mb-0.5">
          Role Boundary:
        </span>
        Super Admin manages platform &amp; users. Academic issuer approvals are reserved for the Controller of Examinations.
      </div>

      {/* Navigation Links - Scrollable if items overflow */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto scrollbar-none">
        <span className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">
          Administration
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
                  ? 'bg-blue-600 text-white shadow-sm font-bold'
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
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-200" />}
              </div>
            </button>
          );
        })}
      </nav>

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
      {/* 1. Desktop Fixed Sticky Sidebar (lg and above) */}
      <aside className="w-64 bg-[#0B1E36] text-white hidden lg:flex flex-col shrink-0 h-screen sticky top-0 border-r border-slate-800 select-none z-20">
        {renderSidebarContent()}
      </aside>

      {/* 2. Mobile Responsive Drawer (smaller than lg) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={onCloseMobile}
          />

          {/* Drawer Panel */}
          <aside className="relative w-72 max-w-[85vw] bg-[#0B1E36] text-white flex flex-col h-full border-r border-slate-800 select-none shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {renderSidebarContent()}
          </aside>
        </div>
      )}
    </>
  );
};
