import { Suspense } from 'react';
import { Metadata } from 'next';
import { SetupPasswordForm } from '@/components/auth/SetupPasswordForm';
import { Spinner } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Set Up Master Password — PUB CertChain',
  description: 'Configure your confidential password to activate your Controller of Examinations desk.',
};

export default function SetupPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-canvas flex items-center justify-center">
          <Spinner className="size-7 text-brand" />
        </div>
      }
    >
      <SetupPasswordForm />
    </Suspense>
  );
}
