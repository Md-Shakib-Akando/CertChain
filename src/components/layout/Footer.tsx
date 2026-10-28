'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ExternalLink, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#080D18] text-slate-400 border-t border-white/10 pt-16 pb-12 relative overflow-hidden">
      {/* Background Soft Accent */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-48 bg-blue-600/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          
          {/* Column 1: Brand Info & Attribution */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/40">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight text-white">
                  PUB CertChain
                </span>
                <span className="text-[11px] text-slate-400 tracking-wide font-medium -mt-0.5">
                  Academic Credential Verification System
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm font-normal">
              An institutional blockchain credential registry anchoring SHA-256 digital certificate fingerprints onto decentralized smart contracts for permanent, tamper-evident verification.
            </p>
            <div className="pt-1 flex items-center gap-2 text-[11px] text-cyan-300 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>PUB CSE Fest-26 Hackathon · Problem A1</span>
            </div>
          </div>

          {/* Column 2: Platform Navigation */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Platform Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => scrollTo('hero')}
                  className="hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  Platform Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('how-it-works')}
                  className="hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  Credential Lifecycle & Workflows
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('features')}
                  className="hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  Security & Architecture
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('verify')}
                  className="hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  Public Verification Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Institutional Portals */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Authorized Portals
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/login"
                  className="hover:text-cyan-300 transition-colors flex items-center gap-1.5"
                >
                  <span>Student Portal (View & Share Credentials)</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="hover:text-cyan-300 transition-colors flex items-center gap-1.5"
                >
                  <span>Registrar & Issuer Workspace</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="hover:text-cyan-300 transition-colors flex items-center gap-1.5"
                >
                  <span>Controller of Examinations Desk</span>
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/Md-Shakib-Akando/CertChain"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 pt-1 font-semibold"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  <span>GitHub Repository</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            &copy; 2026 PUB CertChain. Pundra University of Science & Technology (PUST / PUB). All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs">
            <span className="font-mono text-[11px] text-slate-400">
              Solidity 0.8.20 · Next.js 16 · Hardhat · OpenZeppelin
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
