'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, LogIn, LogOut, LayoutDashboard, ChevronDown, ShieldCheck } from 'lucide-react';
import { useAuthSession, clearSessionUser } from '@/lib/authSession';
import { Logo } from '@/components/brand/Logo';
import { Button, ButtonLink, RoleBadge } from '@/components/ui';

export interface HeaderProps {
  isLoggedIn?: boolean;
  userRole?: string;
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isLoggedIn,
  userRole,
  userName,
  userEmail,
  onLogout,
}) => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user: sessionUser, isLoggedIn: sessionLoggedIn, logout: sessionLogout } = useAuthSession();

  const effectiveLoggedIn = isLoggedIn !== undefined ? isLoggedIn : sessionLoggedIn;
  const effectiveName = userName || sessionUser?.name || 'Student';
  const effectiveRole = userRole || sessionUser?.role || 'student';
  const effectiveEmail = userEmail || sessionUser?.email;
  const dashboardUrl =
    effectiveRole === 'student'
      ? '/dashboard/student'
      : effectiveRole === 'issuer' || effectiveRole === 'registrar'
      ? '/dashboard/issuer'
      : effectiveRole === 'admin' || effectiveRole === 'super_admin'
      ? '/admin/dashboard'
      : '/dashboard/controller';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen]);

  const handleLogout = () => {
    sessionLogout();
    clearSessionUser();
    if (onLogout) {
      onLogout();
    } else {
      router.push('/login');
    }
  };

  const scrollToSection = (sectionId: string) => {
    if (sectionId === 'hero') {
      if (typeof window !== 'undefined' && window.location.pathname === '/') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        router.push('/');
      }
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        router.push(`/#${sectionId}`);
      }
    }
    setMobileMenuOpen(false);
  };

  const handleVerifyClick = () => {
    setMobileMenuOpen(false);
    const el = document.getElementById('verify');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        const input = document.getElementById('cert-id-search-input');
        input?.focus();
      }, 350);
    } else {
      router.push('/#verify');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Logo href="/" tone="ink" subtitle="Pundra University Registry" />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-7" aria-label="Main navigation">
            <button
              type="button"
              onClick={handleVerifyClick}
              className="text-sm font-medium text-ink-2 hover:text-ink transition-colors inline-flex items-center gap-1.5"
            >
              <ShieldCheck className="size-4 text-brand" aria-hidden />
              <span>Verify Credential</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('how-it-works')}
              className="text-sm font-medium text-ink-2 hover:text-ink transition-colors"
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('features')}
              className="text-sm font-medium text-ink-2 hover:text-ink transition-colors"
            >
              Architecture &amp; Security
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('governance')}
              className="text-sm font-medium text-ink-2 hover:text-ink transition-colors"
            >
              Governance
            </button>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2.5">
            <Button variant="secondary" size="sm" onClick={handleVerifyClick} className="hidden sm:inline-flex">
              Verify Certificate
            </Button>

            {effectiveLoggedIn ? (
              <div className="hidden sm:flex items-center gap-2" ref={dropdownRef}>
                <div className="relative">
                  <button
                    id="navbar-profile-btn"
                    type="button"
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    className="inline-flex items-center gap-2 h-9 pl-1.5 pr-2.5 rounded-md border border-line bg-surface hover:bg-sunken transition-colors"
                    aria-label={`Account menu for ${effectiveName}`}
                    aria-expanded={dropdownOpen}
                    aria-haspopup="true"
                  >
                    <span className="size-6 rounded bg-brand text-white text-xs font-semibold inline-flex items-center justify-center">
                      {effectiveName.trim().charAt(0).toUpperCase()}
                    </span>
                    <span className="text-xs font-medium text-ink max-w-[140px] truncate">
                      {effectiveName}
                    </span>
                    <ChevronDown
                      className={`size-3.5 text-muted transition-transform ${
                        dropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {dropdownOpen && (
                    <div
                      id="navbar-profile-dropdown"
                      className="absolute right-0 top-full mt-1.5 w-64 rounded-lg border border-line bg-surface shadow-overlay p-1.5 z-50 animate-scale-in"
                    >
                      <div className="px-3 py-2.5 border-b border-line mb-1">
                        <p className="text-sm font-semibold text-ink truncate">{effectiveName}</p>
                        {effectiveEmail && (
                          <p className="text-xs text-muted truncate mt-0.5">{effectiveEmail}</p>
                        )}
                        <div className="mt-2">
                          <RoleBadge role={effectiveRole} size="sm" />
                        </div>
                      </div>

                      <Link
                        href={dashboardUrl}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 h-9 text-[13.5px] font-medium rounded-md text-ink hover:bg-sunken transition-colors"
                      >
                        <LayoutDashboard className="size-4 text-brand" />
                        <span>Open Workspace</span>
                      </Link>

                      <div className="my-1 h-px bg-line" />

                      <button
                        id="navbar-logout-btn"
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 h-9 text-[13.5px] font-medium rounded-md text-danger hover:bg-danger-soft transition-colors text-left"
                      >
                        <LogOut className="size-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <ButtonLink href="/login" variant="primary" size="sm" leftIcon={<LogIn />}>
                  Portal Sign In
                </ButtonLink>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="md:hidden size-9 inline-flex items-center justify-center rounded-md border border-line text-ink hover:bg-sunken"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface border-t border-line px-4 py-4 space-y-2 shadow-raised">
          <button
            type="button"
            onClick={handleVerifyClick}
            className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-ink hover:bg-sunken"
          >
            Verify Credential
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('how-it-works')}
            className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-ink hover:bg-sunken"
          >
            How It Works
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('features')}
            className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-ink hover:bg-sunken"
          >
            Architecture &amp; Security
          </button>

          <div className="pt-3 border-t border-line space-y-2">
            {effectiveLoggedIn ? (
              <>
                <div className="px-3 py-2 rounded-md bg-sunken">
                  <p className="text-sm font-semibold text-ink truncate">{effectiveName}</p>
                  {effectiveEmail && <p className="text-xs text-muted truncate">{effectiveEmail}</p>}
                  <div className="mt-1.5">
                    <RoleBadge role={effectiveRole} size="sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <ButtonLink
                    href={dashboardUrl}
                    variant="primary"
                    size="sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Workspace
                  </ButtonLink>
                  <Button
                    variant="danger-soft"
                    size="sm"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                  >
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <ButtonLink href="/login" variant="primary" size="sm" onClick={() => setMobileMenuOpen(false)}>
                  Sign In
                </ButtonLink>
                <ButtonLink href="/register" variant="secondary" size="sm" onClick={() => setMobileMenuOpen(false)}>
                  Register
                </ButtonLink>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
