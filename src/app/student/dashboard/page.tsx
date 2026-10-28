import { Metadata } from 'next';
import { StudentPortal } from '@/components/student/StudentPortal';

export const metadata: Metadata = {
  title: 'Student Portal — PUB CertChain',
  description:
    'PUB CertChain Student Credential Portal: View blockchain-authenticated degree certificates, generate time-limited employer verification links, and view transparent on-chain audit trails.',
};

export default function StudentDashboardPage() {
  return <StudentPortal />;
}
