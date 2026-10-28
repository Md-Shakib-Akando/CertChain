'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  RefreshCw,
  Menu,
  ChevronDown,
  ShieldCheck,
  User,
  LogOut,
} from 'lucide-react';
import { ControllerTab } from '@/types/controller';

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
  controllerEmail = 'controller@pub.edu.bd',
  pendingTotal = 0,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-[#0D1424]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shrink-0">
      {/* Left: Mobile Menu + Breadcrumbs & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 -ml-1 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 border border-white/10 transition cursor-pointer"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
            <span>CertChain</span>
            <span>/</span>
            <span className="text-cyan-400 font-bold capitalize">
              {activeTab.replace('-', ' ')}
            </span>
          </div>
          <h2 className="text-sm sm:text-lg font-bold text-[#F1F5F9] leading-none mt-0.5 truncate max-w-[200px] sm:max-w-none">
            {currentTabInfo.title}
          </h2>
        </div>
      </div>

      {/* Right: Actions, Blockchain Network Badge, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Blockchain Network Badge */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-200">Sepolia Testnet</span>
          <span className="text-[10px] text-cyan-400 font-mono">11155111</span>
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-white/10 transition cursor-pointer disabled:opacity-50"
          title="Refresh dashboard"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>

        {/* Notification indicator */}
        <button
          onClick={() => onSelectTab('revocation-requests')}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-white/10 transition relative cursor-pointer"
          title="Pending examination alerts"
        >
          <Bell className="w-4 h-4" />
          {pendingTotal > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
          )}
          {pendingTotal > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
          )}
        </button>

        {/* Controller Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center justify-center text-xs font-bold shrink-0">
              CO
            </div>
            <div className="text-left hidden lg:block">
              <span className="text-xs font-bold text-[#F1F5F9] block leading-tight">
                {controllerName}
              </span>
              <span className="text-[10px] text-slate-400 block font-mono truncate max-w-[140px]">
                {controllerEmail}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-[#121C2E] rounded-2xl shadow-2xl border border-white/15 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-white/10">
                <span className="text-xs font-bold text-[#F1F5F9] block">{controllerName}</span>
                <span className="text-[11px] text-slate-400 font-mono block truncate">{controllerEmail}</span>
                <span className="mt-1 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  Controller of Examinations
                </span>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onSelectTab('profile-settings');
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition cursor-pointer"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>My Profile &amp; Settings</span>
                </button>
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onSelectTab('co-signature-center');
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Co-signature Center</span>
                </button>
              </div>
              <div className="border-t border-white/10 pt-1">
                <button
                  onClick={onLogout}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
