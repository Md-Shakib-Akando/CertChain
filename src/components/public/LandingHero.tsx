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
  const dashboardUrl = user?.role === 'student' ? '/dashboard/student' : '/admin/requests';
  return (
    <section
      id="hero"
      className="relative bg-[#10233F] overflow-hidden py-16 sm:py-24 border-b border-slate-800/80"
    >
      {/* Subtle Blockchain Connected Node Pattern Background (SVG identical to Login/Reg page) */}
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
                stroke="#06B6D4"
                strokeWidth="0.6"
                strokeDasharray="4,4"
              />
              <circle cx="0" cy="0" r="2.5" fill="#2563EB" />
              <circle cx="60" cy="0" r="2" fill="#06B6D4" />
              <circle cx="0" cy="60" r="2" fill="#06B6D4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-blockchain-grid)" />
          <line
            x1="80"
            y1="120"
            x2="240"
            y2="280"
            stroke="#2563EB"
            strokeWidth="1.5"
            strokeOpacity="0.4"
          />
          <line
            x1="240"
            y1="280"
            x2="460"
            y2="190"
            stroke="#06B6D4"
            strokeWidth="1.5"
            strokeOpacity="0.4"
          />
          <line
            x1="460"
            y1="190"
            x2="680"
            y2="320"
            stroke="#2563EB"
            strokeWidth="1.5"
            strokeOpacity="0.35"
          />
          <line
            x1="680"
            y1="320"
            x2="950"
            y2="180"
            stroke="#06B6D4"
            strokeWidth="1.5"
            strokeOpacity="0.4"
          />
          <line
            x1="950"
            y1="180"
            x2="1200"
            y2="340"
            stroke="#2563EB"
            strokeWidth="1.5"
            strokeOpacity="0.3"
          />
          <line
            x1="380"
            y1="220"
            x2="160"
            y2="460"
            stroke="#2563EB"
            strokeWidth="1.5"
            strokeOpacity="0.3"
          />
          <line
            x1="160"
            y1="460"
            x2="380"
            y2="520"
            stroke="#06B6D4"
            strokeWidth="1.5"
            strokeOpacity="0.35"
          />
          <line
            x1="760"
            y1="480"
            x2="1040"
            y2="530"
            stroke="#06B6D4"
            strokeWidth="1.5"
            strokeOpacity="0.3"
          />
          <circle cx="80" cy="120" r="5" fill="#2563EB" />
          <circle cx="240" cy="280" r="6" fill="#06B6D4" />
          <circle cx="460" cy="190" r="5" fill="#2563EB" />
          <circle cx="680" cy="320" r="6" fill="#06B6D4" />
          <circle cx="950" cy="180" r="5.5" fill="#2563EB" />
          <circle cx="1200" cy="340" r="6" fill="#06B6D4" />
          <circle cx="380" cy="220" r="5" fill="#2563EB" />
          <circle cx="160" cy="460" r="4.5" fill="#06B6D4" />
          <circle cx="380" cy="520" r="5" fill="#2563EB" />
          <circle cx="760" cy="480" r="4.5" fill="#2563EB" />
          <circle cx="1040" cy="530" r="5" fill="#06B6D4" />
        </svg>
      </div>

      {/* Ambient Lighting Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-72 bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 left-12 w-96 h-96 bg-blue-600/10 rounded-full blur-[110px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Heading, Subtext, Badges & CTAs (Exact Original Size & Width) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Top Pill Tag */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/70 border border-blue-500/30 shadow-inner">
                <span className="text-[11px] sm:text-xs font-bold tracking-widest text-sky-400 uppercase">
                  Blockchain-Powered Academic Credentials
                </span>
              </div>
              {isLoggedIn && (
                <Link
                  href={dashboardUrl}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-900/40 border border-blue-400/40 text-[11px] text-blue-200 font-semibold hover:bg-blue-900/60 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Welcome back, {user?.name || 'Student'}</span>
                </Link>
              )}
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight leading-[1.15] text-white">
              Trust Every Certificate.{' '}
              <span className="block text-[#2563EB]">Verify in Seconds.</span>
            </h1>

            {/* Description Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl font-normal">
              PUB CertChain is a secure and transparent platform for issuing,
              verifying and managing academic certificates using blockchain
              technology. No more manual checks. No more forgery worries.
            </p>

            {/* Feature Bullet Badges Row */}
            <div className="pt-2 flex flex-wrap items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400 shadow-[0_0_10px_rgba(56,189,248,0.2)]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm text-slate-200 font-medium">
                  Tamper-evident <br /> verification
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400 shadow-[0_0_10px_rgba(56,189,248,0.2)]">
                  <QrCode className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm text-slate-200 font-medium">
                  Instant QR code <br /> verification
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400 shadow-[0_0_10px_rgba(56,189,248,0.2)]">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm text-slate-200 font-medium">
                  Blockchain <br /> powered
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              {isLoggedIn && (
                <Link
                  href={dashboardUrl}
                  className="px-7 py-3.5 rounded-lg bg-[#2563EB] hover:bg-blue-600 text-white font-semibold text-sm sm:text-base transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 group active:scale-95"
                >
                  <LayoutDashboard className="w-4 h-4 text-white" />
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}

              <button
                onClick={onStartVerify}
                className={
                  isLoggedIn
                    ? "px-6 py-3.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-white border border-slate-700 font-semibold text-sm sm:text-base transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    : "px-7 py-3.5 rounded-lg bg-[#2563EB] hover:bg-blue-600 text-white font-semibold text-sm sm:text-base transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 group active:scale-95 cursor-pointer"
                }
              >
                <span>Verify Certificate</span>
                {!isLoggedIn && (
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                )}
              </button>

              <button
                onClick={() => {
                  if (onLearnMore) {
                    onLearnMore();
                  } else {
                    const el = document.getElementById('features');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="px-6 py-3.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-white border border-slate-700 font-semibold text-sm sm:text-base transition-colors flex items-center justify-center cursor-pointer"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Right Column: Hero4 Image (Enlarged with zero change to left side) */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end items-center">
            <div className="relative w-full max-w-[580px] lg:max-w-none lg:w-[130%] xl:w-[140%] lg:-mr-16 xl:-mr-24 -left-35 lg:scale-115 xl:scale-125 origin-center lg:origin-left transition-transform duration-300">
              <Image
                src={hero4Image}
                alt="PUB CertChain Certificate Verification System"
                priority
                className="w-full h-auto object-contain drop-shadow-[0_25px_60px_rgba(37,99,235,0.3)]"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

