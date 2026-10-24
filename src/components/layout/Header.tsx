'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Menu, X, LogIn, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useAuthSession, clearSessionUser } from '@/lib/authSession';

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
  const [isHovered, setIsHovered] = useState(false);
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

  // Close dropdown on click outside or Escape
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
    const el = document.getElementById('verify');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        const input = document.getElementById('cert-id-search-input');
        input?.focus();
      }, 400);
    } else {
      router.push('/#verify');
    }
  };

  return (
    <header className="bg-[#0D1E36]/95 text-white border-b border-slate-800/70 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-3 text-left group focus:outline-none cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform border border-blue-400/40">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg sm:text-xl tracking-tight text-white group-hover:text-blue-400 transition-colors">
                  PUB CertChain
                </span>
                <span className="text-[11px] text-slate-400 tracking-wide font-normal -mt-0.5">
                  Academic Credential Verification
                </span>
              </div>
            </Link>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-7">
            <Link
              href="/"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Home
            </Link>
            <button
              onClick={handleVerifyClick}
              className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
            >
              Verify
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Features
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Verify Certificate CTA Button */}
            <button
              onClick={handleVerifyClick}
              className="px-4 py-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 border border-blue-500/40 font-medium text-xs sm:text-sm transition-all cursor-pointer"
            >
              Verify Certificate
            </button>

            {effectiveLoggedIn ? (
              <div className="hidden sm:flex items-center gap-3">
                

                {/* Profile Icon with Hover Tooltip and Click Dropdown */}
                <div
                  id="navbar-profile-menu"
                  className="relative group/profile"
                  ref={dropdownRef}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  <button
                    id="navbar-profile-btn"
                    onClick={() => {
                      setDropdownOpen((prev) => !prev);
                    }}
                    className="flex items-center gap-1.5 p-1 rounded-full hover:ring-2 hover:ring-blue-500/50 focus:outline-none transition-all cursor-pointer group"
                    aria-label={`Profile menu for ${effectiveName}`}
                    aria-expanded={dropdownOpen}
                    aria-haspopup="true"
                    type="button"
                    title={effectiveName}
                  >
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center border border-blue-400/40 shadow-md group-hover:scale-105 group-hover:border-blue-300 transition-all">
                        {effectiveName.trim().charAt(0).toUpperCase()}
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0D1E36] rounded-full" />
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform duration-200 ${
                        dropdownOpen ? 'rotate-180 text-blue-400' : ''
                      }`}
                    />
                  </button>

                  {/* Hover Tooltip: Shows User Name (Visible on hover when dropdown is closed) */}
                  {!dropdownOpen && (
                    <div
                      id="navbar-profile-tooltip"
                      className={`absolute right-0 top-full mt-2 pointer-events-none z-50 transition-all duration-150 transform ${
                        isHovered
                          ? 'opacity-100 visible translate-y-0'
                          : 'opacity-0 invisible translate-y-1 group-hover/profile:opacity-100 group-hover/profile:visible group-hover/profile:translate-y-0'
                      }`}
                    >
                      <div className="relative bg-slate-900/95 backdrop-blur-md text-white text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-700/80 shadow-xl whitespace-nowrap flex items-center gap-1.5">
                        <div className="absolute -top-1 right-4 w-2 h-2 bg-slate-900 border-t border-l border-slate-700/80 rotate-45" />
                        <span className="text-slate-400 text-[11px]">User:</span>
                        <span className="font-semibold text-slate-100">{effectiveName}</span>
                      </div>
                    </div>
                  )}

                  {/* Dropdown Menu on Click */}
                  {dropdownOpen && (
                    <div
                      id="navbar-profile-dropdown"
                      className="absolute right-0 top-full mt-2.5 w-64 bg-[#0A1628] border border-slate-700/80 rounded-2xl shadow-2xl p-2 z-50 text-white backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
                    >
                      {/* User Info Header */}
                      <div className="px-3 py-2.5 bg-slate-900/70 rounded-xl border border-slate-800/80 mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0 border border-blue-400/40 shadow-inner">
                            {effectiveName.trim().charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-sm text-slate-100 truncate" title={effectiveName}>
                              {effectiveName}
                            </span>
                            {effectiveEmail && (
                              <span className="text-xs text-slate-400 truncate" title={effectiveEmail}>
                                {effectiveEmail}
                              </span>
                            )}
                            <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/30 w-fit">
                              {effectiveRole}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Dropdown Navigation Actions */}
                      <div className="space-y-1">
                        <Link
                          href={dashboardUrl}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-blue-400" />
                          <span>Go to Dashboard</span>
                        </Link>
                      </div>

                      <div className="my-1.5 border-t border-slate-800/80" />

                      {/* Logout Action */}
                      <button
                        id="navbar-logout-btn"
                        onClick={() => {
                          setDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-transparent hover:border-red-900/40 transition-colors text-left cursor-pointer"
                        type="button"
                      >
                        <LogOut className="w-4 h-4 text-red-400" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-3.5 py-2 rounded-lg bg-[#0F1B35] hover:bg-[#162547] text-white border border-slate-700/80 font-medium text-xs sm:text-sm transition-colors hidden sm:flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5 text-blue-400" />
                <span>Sign In</span>
              </Link>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#071326] border-t border-slate-800 px-4 py-5 space-y-3">
          <button
            onClick={() => scrollToSection('hero')}
            className="w-full text-left py-2 text-slate-200 font-medium hover:text-white"
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="w-full text-left py-2 text-slate-200 font-medium hover:text-white"
          >
            How It Works
          </button>
          <button
            onClick={() => scrollToSection('features')}
            className="w-full text-left py-2 text-slate-200 font-medium hover:text-white"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection('about')}
            className="w-full text-left py-2 text-slate-200 font-medium hover:text-white"
          >
            About
          </button>
          <button
            onClick={() => scrollToSection('contact')}
            className="w-full text-left py-2 text-slate-200 font-medium hover:text-white"
          >
            Contact
          </button>

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            <button
              onClick={handleVerifyClick}
              className="w-full py-2.5 text-center bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
            >
              Verify Certificate
            </button>

            {effectiveLoggedIn ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0 border border-blue-400/40">
                    {effectiveName.trim().charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-sm text-slate-100 truncate">{effectiveName}</span>
                    {effectiveEmail && (
                      <span className="text-xs text-slate-400 truncate">{effectiveEmail}</span>
                    )}
                    <span className="text-[10px] text-blue-400 uppercase font-semibold">{effectiveRole}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={dashboardUrl}
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 text-center bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm block"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="py-2.5 text-center bg-red-950/60 hover:bg-red-900/60 border border-red-800 text-red-300 font-medium rounded-lg text-sm block cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  className="py-2.5 text-center bg-[#0F1B35] border border-slate-700 text-white font-medium rounded-lg text-sm block"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="py-2.5 text-center bg-blue-600 text-white font-medium rounded-lg text-sm block"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
