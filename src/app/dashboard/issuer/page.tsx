import { Metadata } from 'next';
import { IssuerDashboard } from '@/components/issuer/IssuerDashboard';

export const metadata: Metadata = {
  title: 'Registrar & Issuer Portal — PUB CertChain',
  description:
    'Institutional Registrar & Certificate Issuance Portal for PUB CertChain: Issue degree credentials, generate deterministic PDFs, anchor SHA-256 fingerprints to Ethereum, and manage revocations.',
};

export default function IssuerDashboardPage() {
  return <IssuerDashboard />;
}
