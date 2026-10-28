'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import hero4Image from '../../../public/images/hero4.png';
import {
  ShieldCheck,
  QrCode,
  Link as LinkIcon,
  ArrowRight,
  LayoutDashboard,
} from 'lucide-react';
import { useAuthSession } from '@/lib/authSession';

interface LandingHeroProps {
  onStartVerify: () => void;
  onLearnMore?: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onStartVerify,
  onLearnMore,
}) => {
  const { isLoggedIn, user } = useAuthSession();
  const dashboardUrl =
    user?.role === 'student'
      ? '/dashboard/student'
      : user?.role === 'admin' || user?.role === 'super_admin'
      ? '/admin/dashboard'
      : '/dashboard/controller';
  return (
    <section
      id="hero"
      className="relative bg-[#080D18] aurora-bg overflow-hidden py-20 sm:py-28 border-b border-white/10"
    >
      {/* Subtle Connected Blockchain Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
        >
          <defs>
            <pattern
              id="hero-blockchain-grid"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="#22D3EE"
                strokeWidth="0.5"
                strokeDasharray="3,3"
              />
              <circle cx="0" cy="0" r="2" fill="#60A5FA" />
              <circle cx="60" cy="0" r="1.5" fill="#22D3EE" />
              <circle cx="0" cy="60" r="1.5" fill="#22D3EE" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-blockchain-grid)" />
        </svg>
      </div>

      {/* Atmospheric Aurora Lighting */}
      <div className="absolute top-0 left-1/4 w-[600px] h-72 bg-blue-600/15 blur-[140px] pointer-events-none" />
      <div className="absolute top-1/4 right-10 w-[550px] h-[550px] bg-cyan-500/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-5 left-10 w-96 h-96 bg-indigo-600/15 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          
          {/* Left Column: Heading, Subtext, Badges & CTAs */}
          <div className="lg:col-span-6 space-y-7">
            {/* Top Pill Tag */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 shadow-inner">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[11px] sm:text-xs font-bold tracking-widest text-cyan-300 uppercase">
                  Blockchain Academic Verification
                </span>
              </div>
              {isLoggedIn && (
                <Link
                  href={dashboardUrl}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-900/40 border border-blue-400/30 text-[11px] text-blue-200 font-semibold hover:bg-blue-900/60 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Signed in as {user?.name || 'User'}</span>
                </Link>
              )}
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight leading-[1.12] text-[#F1F5F9]">
              Academic Credentials.{' '}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300">
                Cryptographically Verified.
              </span>
            </h1>

            {/* Description Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl font-normal">
              Verify academic certificates in seconds. CertChain connects digital credentials with tamper-evident records, helping institutions issue trusted certificates and giving verifiers a faster way to confirm authenticity.
            </p>

            {/* Feature Highlights Row */}
            <div className="pt-1 flex flex-wrap items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-400/30 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.2)]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm text-slate-200 font-medium">
                  Tamper-evident <br /> verification
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-400/30 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.2)]">
                  <QrCode className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm text-slate-200 font-medium">
                  Instant QR code <br /> lookup
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-400/30 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.2)]">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm text-slate-200 font-medium">
                  Zero gas cost <br /> for verifiers
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <button
                onClick={onStartVerify}
                className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-sm sm:text-base transition-all shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 group active:scale-95 cursor-pointer border border-cyan-300/30"
              >
                <span>Verify a Certificate</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => {
                  if (onLearnMore) {
                    onLearnMore();
                  } else {
                    const el = document.getElementById('how-it-works');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 font-semibold text-sm sm:text-base transition-all flex items-center justify-center cursor-pointer backdrop-blur-md"
              >
                Explore the Platform
              </button>

              {isLoggedIn && (
                <Link
                  href={dashboardUrl}
                  className="px-6 py-3.5 rounded-xl bg-slate-900/70 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 font-semibold text-sm sm:text-base transition-colors flex items-center justify-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
              )}
            </div>
          </div>

          {/* Right Column: Floating Visual Composition */}
          <div className="lg:col-span-6 relative flex justify-center items-center py-6">
            <div className="relative w-full max-w-[500px]">
              
              {/* Ambient Glow behind composition */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-cyan-400/20 rounded-3xl blur-2xl transform scale-105 pointer-events-none" />

              {/* Main Certificate Card (Floating) */}
              <div className="relative dark-liquid-glass rounded-2xl p-6 sm:p-7 border border-white/15 shadow-2xl animate-float-gentle text-left overflow-hidden">
                {/* Decorative Gold Top Edge Accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500" />
                
                {/* Certificate Header */}
                <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-amber-400 block">
                      Official Academic Credential
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                      Pundra University of Science & Technology
                    </h3>
                    <p className="text-[11px] text-slate-400">Bogura, Bangladesh</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-amber-300" />
                  </div>
                </div>

                {/* Certificate Body */}
                <div className="py-4 space-y-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Awarded To</span>
                    <p className="text-base sm:text-lg font-extrabold text-white">Md. Shakib Akando</p>
                    <span className="text-xs text-cyan-300 font-mono">Student ID: 0322410105101055</span>
                  </div>

                  <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Degree Program</span>
                      <span className="font-semibold text-slate-200">B.Sc. in Computer Science & Engineering</span>
                    </div>
                    <div className="text-right pl-3 border-l border-white/10">
                      <span className="text-[10px] text-slate-400 uppercase block">CGPA</span>
                      <span className="font-extrabold text-emerald-400">3.88 / 4.00</span>
                    </div>
                  </div>
                </div>

                {/* Certificate Card Footer */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-mono">ID: PUB-DEG-2026-000105</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Verified On-Chain
                  </span>
                </div>
              </div>

              {/* Floating Element 1: QR Code Card (Top Right Offset) */}
              <div className="absolute -top-6 -right-4 sm:-right-6 w-36 sm:w-40 bg-[#0D1424]/90 backdrop-blur-xl rounded-2xl p-3 border border-cyan-400/30 shadow-xl shadow-cyan-950/40 animate-float-slow hidden xs:block">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-cyan-300 uppercase">QR Stamp</span>
                  <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                {/* Stylized QR placeholder visual */}
                <div className="w-full aspect-square bg-white rounded-lg p-1.5 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900 fill-current">
                    <path d="M0,0 h30 v30 h-30 z M40,0 h20 v10 h-20 z M70,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z M80,10 h10 v10 h-10 z M0,40 h10 v20 h-10 z M20,40 h20 v10 h-20 z M50,40 h10 v10 h-10 z M70,40 h30 v10 h-30 z M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z M40,60 h10 v20 h-10 z M60,60 h20 v20 h-20 z M40,90 h20 v10 h-20 z M70,90 h30 v10 h-30 z" />
                  </svg>
                </div>
                <span className="text-[9px] text-center text-slate-400 block mt-1">Scan to Verify</span>
              </div>

              {/* Floating Element 2: SHA-256 Fingerprint Badge (Bottom Left Offset) */}
              <div className="absolute -bottom-6 -left-4 sm:-left-6 max-w-[280px] bg-[#0D1424]/90 backdrop-blur-xl rounded-2xl p-3.5 border border-blue-400/30 shadow-xl shadow-blue-950/40 animate-float-slow">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 rounded-md bg-cyan-500/20 flex items-center justify-center">
                    <ShieldCheck className="w-3 h-3 text-cyan-300" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                    SHA-256 Hash Digest
                  </span>
                </div>
                <p className="text-[10px] font-mono text-slate-300 truncate">
                  c1dbba77e693ebb2a18510ae6b4a2546...
                </p>
                <div className="mt-1 flex items-center justify-between text-[9px] text-slate-400 border-t border-white/5 pt-1">
                  <span>Tx: 0x5055422d44...</span>
                  <span className="text-emerald-400 font-semibold">Block #19402842</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

