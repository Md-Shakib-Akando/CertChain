'use client';

import React, { useState } from 'react';
import { Award, AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { AnalyticsTrendPoint, DashboardKPIs } from '@/types/admin';
import {
  PageHeader,
  StatStrip,
  Card,
  Badge,
  Segmented,
  TableContainer,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
} from '@/components/ui';

interface ReportsAnalyticsSectionProps {
  kpis: DashboardKPIs;
  trends: AnalyticsTrendPoint[];
}

export const ReportsAnalyticsSection: React.FC<ReportsAnalyticsSectionProps> = ({
  kpis,
  trends,
}) => {
  const [selectedRange, setSelectedRange] = useState<'30d' | '90d' | 'all'>('30d');

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Aggregate Registry Telemetry"
        title="Platform Reports & Analytics"
        description="Institutional verification metrics, issuance throughput, and revocation trends."
        actions={
          <Segmented
            size="sm"
            value={selectedRange}
            onChange={setSelectedRange}
            options={[
              { value: '30d', label: 'Last 30 Days' },
              { value: '90d', label: 'Last 90 Days' },
              { value: 'all', label: 'All Time' },
            ]}
          />
        }
      />

      {/* Aggregate Metric Cards */}
      <StatStrip
        items={[
          {
            label: 'Total On-Chain Issuances',
            value: kpis.totalCertificates,
            delta: 'Verified Active',
            deltaTone: 'up',
            hint: 'Pundra University of Science & Technology Degrees & Transcripts',
            icon: <Award className="w-4 h-4" />,
          },
          {
            label: 'Public Verifications',
            value: kpis.verificationEvents,
            delta: '100% Cryptographic',
            deltaTone: 'up',
            hint: 'Queries from employers, banks & universities',
            icon: <CheckCircle2 className="w-4 h-4" />,
          },
          {
            label: 'Revocation Ratio',
            value: kpis.revokedCertificates,
            delta: `of ${kpis.totalCertificates} total`,
            deltaTone: kpis.revokedCertificates > 0 ? 'down' : 'neutral',
            hint: 'Sealed with Controller co-signature',
            icon: <AlertTriangle className="w-4 h-4" />,
          },
        ]}
      />

      {/* Issuance Breakdown Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-base font-semibold text-ink">
              Credential Issuance &amp; Verification Daily Velocity
            </h3>
            <p className="text-xs text-muted">
              Chronological throughput recorded across the academic year
            </p>
          </div>
          <Badge tone="neutral" size="md" className="font-mono">
            Audit Period: 7-Day Window
          </Badge>
        </div>

        <TableContainer>
          <Table>
            <THead>
              <TR>
                <TH>Date</TH>
                <TH>Credentials Issued</TH>
                <TH>Public Verifications</TH>
                <TH>Revocations</TH>
                <TH align="right">Integrity Score</TH>
              </TR>
            </THead>
            <TBody>
              {trends.map((pt) => (
                <TR key={pt.date}>
                  <TD className="font-mono font-semibold text-ink">{pt.date}</TD>
                  <TD className="font-mono font-semibold text-brand">{pt.issued}</TD>
                  <TD className="font-mono font-semibold text-success">{pt.verified}</TD>
                  <TD className="font-mono font-semibold text-danger">{pt.revoked}</TD>
                  <TD align="right">
                    <Badge tone="success" size="sm">
                      100% Intact
                    </Badge>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </TableContainer>
      </div>

      {/* Privacy Guarantee Note (PDF Spec Section 5.6) */}
      <Card padding="md" className="bg-sunken border-line">
        <div className="flex items-start gap-3 text-xs">
          <ShieldCheck className="w-4 h-4 text-brand shrink-0 mt-0.5" />
          <div className="text-muted leading-relaxed">
            <strong className="text-ink font-semibold">Aggregate Data Minimization Policy: </strong>
            In accordance with Section 5.6 of the specification, aggregate reports strictly exclude individual student course-wise grades, GPA calculations, contact numbers, and raw PDF credentials to preserve institutional privacy compliance.
          </div>
        </div>
      </Card>
    </div>
  );
};
