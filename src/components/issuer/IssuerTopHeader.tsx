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
  FilePlus,
  FileSpreadsheet,
} from 'lucide-react';
import { IssuerTab } from './IssuerSidebar';

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
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentTabInfo = tabTitles[activeTab] || tabTitles.overview;

  return (
    <header className="bg-white border-b border-slate-200/90 h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 z-20 shadow-xs">
      {/* Left: Mobile Toggle & Page Header */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
          title="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-extrabold text-[#0B1F3A] tracking-tight truncate">
            {currentTabInfo.title}
          </h2>
          <p className="text-[11px] text-slate-500 truncate hidden sm:block">
            {currentTabInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Actions, Live Blockchain Pill, Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Quick Action Shortcuts */}
        <div className="hidden md:flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSelectTab('issue')}
            className="px-3 py-1.5 rounded-xl bg-blue-50 text-[#2563EB] hover:bg-blue-100 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <FilePlus className="w-3.5 h-3.5" />
            <span>Issue Cert</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('batch')}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Batch CSV</span>
          </button>
        </div>

        {/* Live Blockchain Network Badge */}
        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Hardhat / Sepolia</span>
        </div>

        {/* Refresh Button */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition disabled:opacity-50 cursor-pointer"
          title="Refresh Data"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#2563EB]' : ''}`} />
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => onSelectTab('audit')}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer relative"
            title="Audit Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-1.5 right-1.5" />
          </button>
        </div>

        <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
              RO
            </div>
            <div className="hidden md:block text-left min-w-0">
              <span className="text-xs font-bold text-[#0B1F3A] block truncate leading-tight">
                {issuerName}
              </span>
              <span className="text-[10px] text-slate-500 font-medium block truncate">
                Authorized Issuer
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-3 border-b border-slate-100">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">
                  Signed in as
                </span>
                <p className="text-xs font-bold text-[#0B1F3A] truncate">{issuerName}</p>
                <p className="text-[11px] text-slate-500 truncate">{issuerEmail}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 text-[#2563EB] text-[10px] font-bold">
                  <ShieldCheck className="w-3 h-3" />
                  <span>On-Chain Authorized Issuer</span>
                </div>
              </div>

              <div className="p-1 space-y-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onSelectTab('overview');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 transition flex items-center gap-2 cursor-pointer"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Issuer Profile &amp; Role</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onSelectTab('audit');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 transition flex items-center gap-2 cursor-pointer"
                >
                  <Bell className="w-4 h-4 text-slate-400" />
                  <span>Audit Trail</span>
                </button>
              </div>

              <div className="p-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onLogout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 transition flex items-center gap-2 font-medium cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
