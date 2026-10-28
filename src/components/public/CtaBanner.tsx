'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, LayoutDashboard, ArrowRight, LogIn } from 'lucide-react';
import { useAuthSession } from '@/lib/authSession';

export const CtaBanner: React.FC = () => {
  const { isLoggedIn, user } = useAuthSession();
  const dashboardUrl =
    user?.role === 'student'
      ? '/dashboard/student'
      : user?.role === 'admin' || user?.role === 'super_admin'
      ? '/admin/dashboard'
      : user?.role === 'issuer'
      ? '/dashboard/issuer'
      : '/dashboard/controller';

  const handleVerifyClick = () => {
    const el = document.getElementById('verify');
    el?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      const input = document.getElementById('cert-id-search-input');
      input?.focus();
    }, 400);
  };

  return (
    <section id="contact" className="bg-[#080D18] py-16 sm:py-24 border-b border-white/10 relative overflow-hidden">
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Dark Liquid Glass Banner */}
        <div className="dark-liquid-glass rounded-3xl p-8 sm:p-12 border border-white/15 shadow-2xl text-white flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden">
          {/* Top Subtle Cyan Gradient Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500" />
          
          {/* Left Content */}
          <div className="flex items-center gap-5 text-left w-full lg:w-auto">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-inner">
              <ShieldCheck className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F1F5F9]">
                {isLoggedIn ? `Welcome Back, ${user?.name || 'User'}` : 'Secure Academic Credential Registry'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-lg leading-relaxed font-normal">
                {isLoggedIn
                  ? 'Access your tamper-proof blockchain certificates, manage time-limited share links, and verify credentials.'
                  : 'Empowering universities with immutable certificate issuance and providing global employers with instantaneous verification.'}
              </p>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto shrink-0">
            <button
              onClick={handleVerifyClick}
              className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-cyan-600/20 active:scale-95 text-center cursor-pointer border border-cyan-400/30"
            >
              Verify a Certificate
            </button>
            {isLoggedIn ? (
              <Link
                href={dashboardUrl}
                className="px-7 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 font-bold text-xs sm:text-sm transition-all text-center flex items-center justify-center gap-2 shadow-sm"
              >
                <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-7 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 font-semibold text-xs sm:text-sm transition-all text-center flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4 text-cyan-400" />
                <span>Issuer & Student Portal</span>
              </Link>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
