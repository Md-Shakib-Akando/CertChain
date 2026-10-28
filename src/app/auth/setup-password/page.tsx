import { Suspense } from 'react';
import { Metadata } from 'next';
import { SetupPasswordForm } from '@/components/auth/SetupPasswordForm';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Set Up Master Password — PUB CertChain',
  description: 'Configure your confidential password to activate your Controller of Examinations desk.',
};

export default function SetupPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0A1628] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      }
    >
      <SetupPasswordForm />
    </Suspense>
  );
}
