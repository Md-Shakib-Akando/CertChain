import { Metadata } from 'next';
import { AuthModule } from '@/components/auth/AuthModule';

export const metadata: Metadata = {
  title: 'Register — PUB CertChain',
  description:
    'Create your student account or request university staff access on PUB CertChain.',
};

export default function RegisterPage() {
  return <AuthModule initialMode="register" />;
}
