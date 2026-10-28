'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { LandingHero } from '@/components/public/LandingHero';
import { QuickVerification } from '@/components/public/QuickVerification';
import { WhyChooseSection } from '@/components/public/WhyChooseSection';
import { HowItWorksSection } from '@/components/public/HowItWorksSection';
import { StatsCommunitySection } from '@/components/public/StatsCommunitySection';
import { TestimonialsSection } from '@/components/public/TestimonialsSection';
import { CtaBanner } from '@/components/public/CtaBanner';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#080D18] text-[#F1F5F9] selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Main Header */}
      <Header />

      {/* Full Landing Page */}
      <main className="flex-1">
        {/* 1. Hero Section */}
        <LandingHero
          onStartVerify={() => {
            const el = document.getElementById('verify');
            el?.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
              const input = document.getElementById('cert-id-search-input');
              input?.focus();
            }, 400);
          }}
          onLearnMore={() => {
            const el = document.getElementById('features');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* 2. Fast & Easy Quick Verification Section */}
        <QuickVerification />

        {/* 3. Key Benefits: Why Choose PUB CertChain? */}
        <WhyChooseSection />

        {/* 4. Simple Process: How It Works */}
        <HowItWorksSection />

        {/* 5. Trusted by Academic Community (Quote & Stats) */}
        <StatsCommunitySection />

        {/* 6. What People Say (Testimonials) */}
        <TestimonialsSection />

        {/* 7. Ready to Get Started? (CTA Banner) */}
        <CtaBanner />
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
