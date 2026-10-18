'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
export const CtaBanner: React.FC = () => {
  const handleVerifyClick = () => {
    const el = document.getElementById('verify');
    el?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      const input = document.getElementById('cert-id-search-input');
      input?.focus();
    }, 400);
  };

  return (
    <section id="contact" className="bg-white py-14 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Blue Banner Box */}
        <div className="bg-[#1D4ED8] bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 rounded-3xl p-8 sm:p-12 shadow-xl shadow-blue-600/20 text-white flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* Left Content */}
          <div className="flex items-center gap-5 text-left w-full lg:w-auto">
            <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Ready to Get Started?
              </h2>
              <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-md">
                Join thousands of students, universities and employers who trust PUB CertChain.
              </p>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto shrink-0">
            <button
              onClick={handleVerifyClick}
              className="px-7 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-blue-700 font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 text-center cursor-pointer"
            >
              Verify Certificate
            </button>
            <Link
              href="/login"
              className="px-7 py-3.5 rounded-xl bg-[#091F47] hover:bg-[#071735] text-white border border-white/20 font-semibold text-xs sm:text-sm transition-all text-center flex items-center justify-center gap-1.5"
            >
              Sign In / Register
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
};
