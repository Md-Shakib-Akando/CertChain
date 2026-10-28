'use client';

import React from 'react';
import { Briefcase, Globe, GraduationCap, CheckCircle2 } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  const scenarios = [
    {
      icon: <Briefcase className="w-6 h-6 text-cyan-400" />,
      badge: 'Employer Screening',
      title: 'Global Corporate Hiring',
      challenge: 'Traditional background screening takes 2–4 weeks via registrar emails and courier requests.',
      solution: 'Employers upload candidate PDFs directly to CertChain and verify SHA-256 hashes against Ethereum in under 5 seconds.',
      result: 'Zero verification lag · Absolute authenticity guarantee',
    },
    {
      icon: <Globe className="w-6 h-6 text-blue-400" />,
      badge: 'Higher Studies & Visas',
      title: 'Embassy & University Admissions',
      challenge: 'Foreign universities face high rates of altered CGPAs and counterfeit degree transcripts.',
      solution: 'Immigration and admissions officers scan printed QR codes to inspect the immutable on-chain record in real time.',
      result: 'Instant foreign validation · Complete fraud prevention',
    },
    {
      icon: <GraduationCap className="w-6 h-6 text-teal-400" />,
      badge: 'University Operations',
      title: 'Graduating Cohort Convocation',
      challenge: 'Manual certificate printing and signing is labor-intensive and prone to administrative errors.',
      solution: 'Registrar batch-uploads CSV graduation records, synthesizing authentic vector PDFs and anchoring them in one transaction.',
      result: 'Gas-optimized bulk issuance · Automated student delivery',
    },
  ];

  return (
    <section className="bg-[#080D18] py-20 sm:py-28 border-b border-white/10 relative overflow-hidden">
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 right-1/4 w-[600px] h-[350px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-cyan-300">
              Institutional Use Cases
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#F1F5F9] tracking-tight">
            Built for Real-World Verification
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-normal">
            Eliminating credential delays across multinational recruitment, foreign university admissions, and university registrar operations.
          </p>
        </div>

        {/* 3 Use Case Bento Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {scenarios.map((item, idx) => (
            <div
              key={idx}
              className="dark-liquid-glass rounded-2xl border border-white/10 p-7 flex flex-col justify-between space-y-6 text-left group hover:border-cyan-400/30 transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider font-mono px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-cyan-300">
                    {item.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-3 tracking-tight">
                  {item.title}
                </h3>

                <div className="space-y-3 text-xs leading-relaxed">
                  <div className="bg-red-500/10 p-3 rounded-xl border border-red-500/20 text-red-200">
                    <span className="font-bold text-red-300 block mb-0.5">Challenge:</span>
                    {item.challenge}
                  </div>
                  <div className="bg-cyan-500/10 p-3 rounded-xl border border-cyan-500/20 text-cyan-100">
                    <span className="font-bold text-cyan-300 block mb-0.5">CertChain Solution:</span>
                    {item.solution}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center gap-2 text-[11px] font-medium text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{item.result}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
