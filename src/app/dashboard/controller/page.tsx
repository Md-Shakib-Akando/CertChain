import { Metadata } from 'next';
import { ControllerDashboard } from '@/components/controller/ControllerDashboard';

export const metadata: Metadata = {
  title: 'Controller of Examinations Dashboard — PUB CertChain',
  description:
    'Institutional Controller Dashboard for PUB CertChain: Review & approve registrar issuer accounts, cryptographic co-signing of certificate revocations, and immutable examination audit logging.',
};

export default function ControllerDashboardPage() {
  return <ControllerDashboard />;
}
