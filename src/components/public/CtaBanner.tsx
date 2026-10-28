'use client';

import React from 'react';
import { ArrowRight, LayoutDashboard, LogIn, ShieldCheck } from 'lucide-react';
import { useAuthSession } from '@/lib/authSession';
import { Button, ButtonLink } from '@/components/ui';

export const CtaBanner: React.FC = () => {
  const { isLoggedIn, user } = useAuthSession();
  const dashboardUrl =
    user?.role === 'student'
      ? '/dashboard/student'
      : user?.role === 'issuer' || user?.role === 'registrar'
      ? '/dashboard/issuer'
      : user?.role === 'admin' || user?.role === 'super_admin'
      ? '/admin/dashboard'
      : '/dashboard/controller';

  const handleVerifyClick = () => {
    const el = document.getElementById('verify');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        const input = document.getElementById('cert-id-search-input');
        input?.focus();
      }, 350);
    }
  };

  return (
    <section className="bg-surface py-14 sm:py-16 border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-night text-night-text border border-night-line px-6 py-8 sm:px-10 sm:py-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 on-night">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-seal-bright">
              <ShieldCheck className="size-4" aria-hidden />
              <span>Pundra University Credential Registry</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-night-text">
              {isLoggedIn
                ? `Welcome back, ${user?.name || 'User'}`
                : 'Access the Institutional Credential Portal'}
            </h2>
            <p className="text-xs sm:text-sm text-night-muted leading-relaxed">
              {isLoggedIn
                ? 'Open your role workspace to inspect credentials, manage time-bound verification links, or execute authorized registry actions.'
                : 'Students can claim their verified degree certificates and create shareable employer links. Authorized university staff can issue or co-sign credentials.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button variant="night" size="lg" onClick={handleVerifyClick}>
              Verify a Certificate
            </Button>
            {isLoggedIn ? (
              <ButtonLink
                href={dashboardUrl}
                variant="night-ghost"
                size="lg"
                leftIcon={<LayoutDashboard />}
                rightIcon={<ArrowRight />}
              >
                Go to Workspace
              </ButtonLink>
            ) : (
              <ButtonLink
                href="/login"
                variant="night-ghost"
                size="lg"
                leftIcon={<LogIn />}
              >
                Portal Sign In
              </ButtonLink>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
