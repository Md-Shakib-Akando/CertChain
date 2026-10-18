'use client';

import React from 'react';
import { Award, GraduationCap, Building2, ShieldCheck } from 'lucide-react';

export const StatsCommunitySection: React.FC = () => {
  return (
    <section id="about" className="bg-white py-16 sm:py-24 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Box: Graduation Photo with Overlay & Quote */}
          <div className="lg:col-span-5 relative rounded-3xl overflow-hidden shadow-xl min-h-[340px] flex flex-col justify-end p-8 sm:p-10 text-white">
            {/* Background Graduation Photo */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('/images/graduation.jpg')` }}
            />
            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#040B18] via-[#040B18]/70 to-[#040B18]/40" />

            {/* Content on Photo */}
            <div className="relative z-10 space-y-4">
              <span className="text-4xl sm:text-5xl font-serif text-sky-400 font-black block leading-none">
                “
              </span>
              <p className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed italic">
                PUB CertChain gives us confidence that our certificates are genuine, secure and globally verifiable.
              </p>
              <div className="pt-2 border-t border-white/20">
                <div className="font-bold text-white text-sm sm:text-base">
                  &mdash; Prof. Dr. Ahmed Karim
                </div>
                <div className="text-xs text-sky-300 font-medium">
                  Controller of Examinations, Global University
                </div>
              </div>
            </div>
          </div>

          {/* Right Box: Community Stats & Partner Logos */}
          <div className="lg:col-span-7 bg-[#F8FAFC] rounded-3xl p-8 sm:p-12 border border-slate-200/80 flex flex-col justify-between space-y-8">
            
            {/* Header */}
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0B2545] tracking-tight">
                Trusted by the Academic Community
              </h2>
              <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
                A reliable solution for universities, students and employers worldwide.
              </p>
            </div>

            {/* 3 Metric Columns */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-2">
              <div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#2563EB] tracking-tight">
                  25+
                </div>
                <div className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                  Universities
                </div>
              </div>

              <div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#2563EB] tracking-tight">
                  100K+
                </div>
                <div className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                  Certificates Issued
                </div>
              </div>

              <div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#2563EB] tracking-tight">
                  99.9%
                </div>
                <div className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                  Verification Success
                </div>
              </div>
            </div>

            {/* University Partners Logos Row */}
            <div className="pt-6 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
              {/* Partner 1: Global University */}
              <div className="flex items-center gap-2 text-slate-700">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4 text-slate-700" />
                </div>
                <span className="text-xs font-bold leading-tight">Global University</span>
              </div>

              {/* Partner 2: East West University */}
              <div className="flex items-center gap-2 text-slate-700">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4 text-slate-700" />
                </div>
                <span className="text-xs font-bold leading-tight">East West University</span>
              </div>

              {/* Partner 3: National University */}
              <div className="flex items-center gap-2 text-slate-700">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-slate-700" />
                </div>
                <span className="text-xs font-bold leading-tight">National University</span>
              </div>

              {/* Partner 4: Tech University */}
              <div className="flex items-center gap-2 text-slate-700">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4 text-slate-700" />
                </div>
                <span className="text-xs font-bold leading-tight">Tech University</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
