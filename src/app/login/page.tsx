import { Metadata } from 'next';
import { AuthModule } from '@/components/auth/AuthModule';

export const metadata: Metadata = {
  title: 'Sign In — PUB CertChain',
  description:
    'Sign in to your PUB CertChain student or university staff account.',
};

export default function LoginPage() {
  return <AuthModule initialMode="login" />;
}
