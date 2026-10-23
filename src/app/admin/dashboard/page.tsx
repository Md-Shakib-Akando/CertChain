import { Metadata } from 'next';
import { SuperAdminDashboard } from '@/components/admin/SuperAdminDashboard';

export const metadata: Metadata = {
  title: 'Super Admin Command Dashboard — PUB CertChain',
  description:
    'Institutional Super Admin Dashboard for PUB CertChain: System monitoring, user account provisioning, blockchain state inspection, immutable audit logging, and platform security controls.',
};

export default function AdminDashboardPage() {
  return <SuperAdminDashboard />;
}
