'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  LogOut,
  X,
  Menu,
  RefreshCw,
  Bell,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { Badge, RoleBadge, Button, IconButton } from '@/components/ui';
import { cn } from '@/lib/cn';

export interface WorkspaceNavItem<T extends string = string> {
  id: T;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: React.ReactNode;
  badgeTone?: 'neutral' | 'brand' | 'seal' | 'success' | 'warning' | 'danger' | 'info';
}

export interface WorkspaceSidebarProps<T extends string = string> {
  role: 'admin' | 'controller' | 'issuer' | 'student';
  roleSubtitle: string;
  scopeTitle: string;
  scopeDescription: string;
  navGroupLabel: string;
  navItems: WorkspaceNavItem<T>[];
  activeTab: T;
  onSelectTab: (tab: T) => void;
  onLogout: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  footerSlot?: React.ReactNode;
  userName?: string;
  userEmail?: string;
}

export function WorkspaceSidebar<T extends string = string>({
  roleSubtitle,
  scopeTitle,
  scopeDescription,
  navGroupLabel,
  navItems,
  activeTab,
  onSelectTab,
  onLogout,
  isMobileOpen = false,
  onCloseMobile,
  footerSlot,
  userName,
  userEmail,
}: WorkspaceSidebarProps<T>) {
  const handleTabClick = (tabId: T) => {
    onSelectTab(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  const renderContent = () => (
    <>
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-night-line flex items-center justify-between shrink-0">
        <Logo href="/" tone="light" subtitle={roleSubtitle} />
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-night-muted hover:text-night-text hover:bg-night-2 transition-colors cursor-pointer"
            title="Close Navigation"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>



      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto scrollbar-none">
        <span className="px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-night-muted block mb-2">
          {navGroupLabel}
        </span>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleTabClick(item.id)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer',
                isActive
                  ? 'bg-night-3 text-night-text border border-seal/40 font-semibold shadow-xs'
                  : 'text-night-muted hover:text-night-text hover:bg-night-2 border border-transparent'
              )}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  className={cn(
                    'w-4 h-4 shrink-0',
                    isActive ? 'text-seal' : 'text-night-muted'
                  )}
                />
                <span className="truncate">{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                {item.badge !== null && item.badge !== undefined && (
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold border',
                      item.badgeTone === 'warning'
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        : item.badgeTone === 'danger'
                          ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                          : item.badgeTone === 'success'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : item.badgeTone === 'seal'
                              ? 'bg-amber-500/15 text-amber-200 border-amber-400/30'
                              : 'bg-night-2 text-night-text border-night-line'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-seal" />}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Optional Footer Status Slot (e.g. Smart Contract or Wallet Status) */}
      {footerSlot && <div className="px-3 pb-2 shrink-0">{footerSlot}</div>}

      {/* Bottom User & Sign Out */}
      <div className="p-3 border-t border-night-line bg-night-2/50 shrink-0 flex items-center justify-between gap-2">
        {userName ? (
          <>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-night-3 border border-night-line text-seal font-serif font-bold text-xs flex items-center justify-center shrink-0">
                {userName
                  .split(' ')
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-night-text truncate">{userName}</p>
                {userEmail && (
                  <p className="text-[10px] font-mono text-night-muted truncate">{userEmail}</p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="p-2 rounded-lg text-night-muted hover:text-rose-300 hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-300 hover:text-white hover:bg-rose-950/50 border border-transparent hover:border-rose-800/50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0 text-rose-400" />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </>
  );

  return (
    <>
      <aside className="w-64 bg-night text-night-text on-night hidden lg:flex flex-col shrink-0 h-screen sticky top-0 border-r border-night-line select-none z-20">
        {renderContent()}
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-ink/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <aside className="relative w-72 max-w-[85vw] bg-night text-night-text on-night flex flex-col h-full border-r border-night-line select-none shadow-lg z-10">
            {renderContent()}
          </aside>
        </div>
      )}
    </>
  );
}

export interface WorkspaceTopHeaderProps {
  role: 'admin' | 'controller' | 'issuer' | 'student';
  breadcrumbSection: string;
  title: string;
  subtitle?: string;
  onRefresh: () => void;
  isLoading: boolean;
  onLogout?: () => void;
  onNotificationClick?: () => void;
  notificationCount?: number;
  onToggleMobileMenu?: () => void;
  userName: string;
  userEmail: string;
  quickActions?: React.ReactNode;
  dropdownItems?: { label: string; icon?: React.ReactNode; onClick: () => void }[];
}

export const WorkspaceTopHeader: React.FC<WorkspaceTopHeaderProps> = ({
  role,
  breadcrumbSection,
  title,
  subtitle,
  onRefresh,
  isLoading,
  onLogout,
  onNotificationClick,
  notificationCount = 0,
  onToggleMobileMenu,
  userName,
  userEmail,
  quickActions,
  dropdownItems = [],
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = userName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="h-16 bg-surface/95 backdrop-blur-md border-b border-line px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shrink-0">
      {/* Left: Mobile Menu Toggle + Breadcrumb & Active Section Title */}
      <div className="flex items-center gap-3 min-w-0">
        {onToggleMobileMenu && (
          <IconButton
            label="Open Navigation Menu"
            variant="secondary"
            size="sm"
            onClick={onToggleMobileMenu}
            className="lg:hidden"
          >
            <Menu className="w-4 h-4" />
          </IconButton>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted">
            <span>CertChain Registry</span>
            <span>/</span>
            <span className="text-brand font-semibold capitalize truncate">{breadcrumbSection}</span>
          </div>

        </div>
      </div>

      {/* Right: Quick Actions, Network Badge, Refresh, Bell, Profile Menu */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {quickActions && <div className="hidden md:flex items-center gap-2">{quickActions}</div>}



        {onNotificationClick && (
          <div className="relative">
            <IconButton
              label="Workspace notifications & audit alerts"
              variant="secondary"
              size="sm"
              onClick={onNotificationClick}
            >
              <Bell className="w-4 h-4" />
            </IconButton>
            {notificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-danger ring-2 ring-surface" />
            )}
          </div>
        )}

        {/* User Profile Pill / Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setProfileDropdownOpen((v) => !v)}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-lg border border-line bg-surface hover:bg-sunken transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-md bg-brand-muted text-brand border border-brand/20 flex items-center justify-center text-xs font-serif font-bold shrink-0">
              {initials}
            </div>
            <div className="text-left hidden lg:block min-w-0">
              <span className="text-xs font-semibold text-ink block leading-tight truncate max-w-[140px]">
                {userName}
              </span>
              <span className="text-[10px] text-muted block font-mono truncate max-w-[140px]">
                {userEmail}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted hidden sm:block" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-surface rounded-xl shadow-lg border border-line py-1.5 z-50">
              <div className="px-3.5 py-2.5 border-b border-line space-y-1">
                <p className="text-xs font-semibold text-ink truncate">{userName}</p>
                <p className="text-[11px] font-mono text-muted truncate">{userEmail}</p>
                <div className="pt-1">
                  <RoleBadge role={role} />
                </div>
              </div>

              {dropdownItems.length > 0 && (
                <div className="p-1 space-y-0.5">
                  {dropdownItems.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        item.onClick();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-ink-2 hover:text-ink hover:bg-sunken flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {onLogout && (
                <div className="p-1 border-t border-line">
                  <Button
                    variant="ghost"
                    size="sm"
                    fullWidth
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onLogout();
                    }}
                    className="justify-start text-danger hover:bg-danger-bg"
                    leftIcon={<LogOut className="w-4 h-4" />}
                  >
                    Sign Out
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

