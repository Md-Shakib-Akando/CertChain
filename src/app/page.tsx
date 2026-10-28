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
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      <Header />

      <main className="flex-1">
        <LandingHero
          onStartVerify={() => {
            const el = document.getElementById('verify');
            el?.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
              const input = document.getElementById('cert-id-search-input');
              input?.focus();
            }, 350);
          }}
          onLearnMore={() => {
            const el = document.getElementById('how-it-works');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        <QuickVerification />
        <HowItWorksSection />
        <WhyChooseSection />
        <StatsCommunitySection />
        <TestimonialsSection />
        <CtaBanner />
      </main>

      <Footer />
    </div>
  );
}
