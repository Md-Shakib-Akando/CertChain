import { Metadata } from 'next';
import { AuthModule } from '@/components/auth/AuthModule';

export const metadata: Metadata = {
  title: 'Authentication — PUB CertChain',
  description:
    'Secure, role-based university portal access for students and authorized academic staff.',
};

export default function AuthPage() {
  return <AuthModule initialMode="login" />;
}
