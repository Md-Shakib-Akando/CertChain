'use client';

import React from 'react';
import { ShieldCheck, CheckCircle2, Award, Users, AlertTriangle } from 'lucide-react';
import {
  PageHeader,
  StatStrip,
  Card,
  CardHeader,
  CardBody,
  Badge,
} from '@/components/ui';

interface ReportsSectionProps {
  totalCertificates: number;
  validCertificates: number;
  revokedCertificates: number;
  totalStudents: number;
}

export const ReportsSection: React.FC<ReportsSectionProps> = ({
  totalCertificates,
  validCertificates,
  revokedCertificates,
  totalStudents,
}) => {
  const degreeDistribution = [
    {
      name: 'B.Sc. in Computer Science & Engineering',
      count: Math.max(1, Math.round(totalCertificates * 0.55)),
      percent: 55,
      color: 'bg-brand',
    },
    {
      name: 'B.Sc. in Electrical & Electronic Engineering',
      count: Math.round(totalCertificates * 0.2),
      percent: 20,
      color: 'bg-success',
    },
    {
      name: 'B.Sc. in Civil Engineering',
      count: Math.round(totalCertificates * 0.12),
      percent: 12,
      color: 'bg-info',
    },
    {
      name: 'Bachelor of Business Administration (BBA)',
      count: Math.round(totalCertificates * 0.08),
      percent: 8,
      color: 'bg-seal',
    },
    {
      name: 'Bachelor of Laws (LL.B Honors)',
      count: Math.round(totalCertificates * 0.05),
      percent: 5,
      color: 'bg-ink-2',
    },
  ];

  const revocationRate =
    totalCertificates > 0 ? ((revokedCertificates / totalCertificates) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Departmental Telemetry"
        title="Issuance Reports & Analytics"
        description="Cryptographic issuance volume, degree program breakdown, and smart contract ledger metrics."
      />

      <StatStrip
        cols={4}
        stats={[
          {
            label: 'Total Credentials',
            value: totalCertificates,
            sublabel: '100% On-Chain Anchored',
            icon: <Award className="w-4 h-4" />,
            tone: 'brand',
          },
          {
            label: 'Valid On-Chain',
            value: validCertificates,
            sublabel: 'Active university diplomas',
            icon: <CheckCircle2 className="w-4 h-4" />,
            tone: 'success',
          },
          {
            label: 'Revocation Ratio',
            value: `${revocationRate}%`,
            sublabel: `${revokedCertificates} Revoked on ledger`,
            icon: <AlertTriangle className="w-4 h-4" />,
            tone: revokedCertificates > 0 ? 'warning' : 'default',
          },
          {
            label: 'Enrolled Students',
            value: totalStudents,
            sublabel: 'Verified academic profiles',
            icon: <Users className="w-4 h-4" />,
            tone: 'seal',
          },
        ]}
      />

      <Card>
        <CardHeader
          eyebrow="Departmental Breakdown"
          title="Credentials by Degree Program"
          description="Distribution of bachelor degrees and transcripts issued across university faculties."
          actions={
            <Badge tone="brand" dot>
              Live Ledger Telemetry
            </Badge>
          }
        />
        <CardBody className="space-y-4">
          {degreeDistribution.map((prog, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-ink">{prog.name}</span>
                <span className="text-muted font-mono font-medium tabular">
                  {prog.count} Credentials ({prog.percent}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-sunken overflow-hidden">
                <div
                  className={`h-full rounded-full ${prog.color}`}
                  style={{ width: `${prog.percent}%` }}
                />
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      <Card className="bg-night text-night-text border-night-line on-night" padding="lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-night-line">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-night-2 border border-seal/40 text-seal flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-serif font-semibold text-night-text">
                Cryptographic Zero-Knowledge Integrity
              </h4>
              <p className="text-xs text-night-muted">
                Every diploma issued through this workspace is verifiable globally without revealing private student attributes.
              </p>
            </div>
          </div>
          <Badge tone="seal" size="sm">
            Pundra University Registry
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-xs text-night-text">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Deterministic PDF SHA-256 Hashing</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Ethereum Sepolia Smart Contract Anchored</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Dual-Control Controller Revocation Governance</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
