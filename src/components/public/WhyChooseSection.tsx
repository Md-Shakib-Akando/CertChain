'use client';

import React from 'react';
import {
  ShieldCheck,
  Fingerprint,
  QrCode,
  Ban,
  History,
  User,
} from 'lucide-react';

export const WhyChooseSection: React.FC = () => {
  const benefits = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#2563EB]" />,
      title: 'Secure Issuance',
      description: 'Only authorized university staff can issue or revoke certificates.',
    },
    {
      icon: <Fingerprint className="w-6 h-6 text-[#2563EB]" />,
      title: 'Tamper Detection',
      description: 'Cryptographic hash ensures certificates cannot be altered or forged.',
    },
    {
      icon: <QrCode className="w-6 h-6 text-[#2563EB]" />,
      title: 'QR Code Verification',
      description: 'Instant access to verification page via QR code on every certificate.',
    },
    {
      icon: <Ban className="w-6 h-6 text-[#2563EB]" />,
      title: 'Revocation Support',
      description: 'Revoke certificates with a reason. Always verifiable as revoked.',
    },
    {
      icon: <History className="w-6 h-6 text-[#2563EB]" />,
      title: 'Audit Trail',
      description: 'Complete history of issuance, revocation and verification events with blockchain hash.',
    },
    {
      icon: <User className="w-6 h-6 text-[#2563EB]" />,
      title: 'Student Portal',
      description: 'View your certificates and share time-limited verification links with employers.',
    },
  ];

  return (
    <section id="features" className="bg-white py-16 sm:py-24 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2 mb-14">
          <span className="text-xs font-bold tracking-wider uppercase text-[#2563EB] bg-blue-50 px-3.5 py-1.5 rounded-full inline-block border border-blue-100">
            Key Benefits
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B2545] tracking-tight">
            Why Choose PUB CertChain?
          </h2>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            Built for modern education. Trusted by universities, students and employers.
          </p>
        </div>

        {/* 6 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {benefits.map((item, index) => (
            <div
              key={index}
              className="bg-white p-7 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50/90 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                {item.icon}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
