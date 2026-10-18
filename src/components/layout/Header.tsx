'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Menu, X, LogIn, } from 'lucide-react';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const handleVerifyClick = () => {
    scrollToSection('verify');
    setTimeout(() => {
      const input = document.getElementById('cert-id-search-input');
      input?.focus();
    }, 400);
  };

  return (
    <header className="bg-[#0D1E36]/95 text-white border-b border-slate-800/70 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => scrollToSection('hero')}
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
            </button>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('hero')}
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Home
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
            <button
              onClick={() => scrollToSection('about')}
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Contact
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

            {/* Sign In Button */}
            <Link
              href="/login"
              className="px-3.5 py-2 rounded-lg bg-[#0F1B35] hover:bg-[#162547] text-white border border-slate-700/80 font-medium text-xs sm:text-sm transition-colors hidden sm:flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5 text-blue-400" />
              <span>Sign In</span>
            </Link>

            
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
          </div>
        </div>
      )}
    </header>
  );
};
