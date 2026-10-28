'use client';

import React from 'react';
import { ShieldCheck, Lock, Boxes } from 'lucide-react';
import { PermissionMatrixRow } from '@/types/admin';
import {
  PageHeader,
  Card,
  Badge,
  TableContainer,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
} from '@/components/ui';

interface RolePermissionsSectionProps {
  matrix: PermissionMatrixRow[];
}

export const RolePermissionsSection: React.FC<RolePermissionsSectionProps> = ({ matrix }) => {
  const roles = [
    {
      name: 'Super Admin',
      scope: 'Technical / Platform',
      tone: 'brand' as const,
      description:
        'System infrastructure, node connectivity, user provisioning, and operational monitoring.',
      restrictions:
        'Zero authority to issue or revoke certificates, and cannot approve academic issuers.',
    },
    {
      name: 'Controller of Examinations',
      scope: 'Academic Governance',
      tone: 'seal' as const,
      description:
        'Sole authority to approve faculty issuer requests, co-sign smart contract revocations, and supervise university records.',
      restrictions:
        'Does not manage platform server settings or technical database infrastructure.',
    },
    {
      name: 'Faculty / Staff Issuer',
      scope: 'Academic Execution',
      tone: 'info' as const,
      description:
        'Drafts, hashes, and commits authentic graduation credentials and transcripts to Ethereum Sepolia.',
      restrictions:
        'Requires Controller approval and smart contract authorization before issuing.',
    },
    {
      name: 'Student',
      scope: 'Credential Holder',
      tone: 'neutral' as const,
      description:
        'Views immutable academic records, generates time-limited employer share links, and downloads official PDFs.',
      restrictions: 'Read-only profile; cannot alter smart contract data.',
    },
    {
      name: 'Public Verifier',
      scope: 'Third-Party Verification',
      tone: 'success' as const,
      description:
        'Employers, embassies, and academic institutions verifying SHA-256 hashes against Sepolia ledger with zero login.',
      restrictions:
        'Zero access to student personal records beyond minimal verified credential proofs.',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Access Control Governance"
        title="Role & Permission Matrix"
        description="Institutional separation of duties enforced across backend API middleware and Ethereum Sepolia smart contracts."
      />

      {/* 5 Role Concept Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {roles.map((r) => (
          <Card
            key={r.name}
            padding="md"
            className="flex flex-col justify-between space-y-3"
          >
            <div>
              <Badge tone={r.tone} size="sm">
                {r.scope}
              </Badge>
              <h3 className="text-sm font-semibold text-ink mt-2.5">{r.name}</h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">{r.description}</p>
            </div>

            <div className="p-2.5 rounded-md bg-warning-soft/60 border border-warning/25 text-[11px] text-warning leading-relaxed">
              <strong className="font-semibold">Boundary:</strong> {r.restrictions}
            </div>
          </Card>
        ))}
      </div>

      {/* Complete Permission Matrix Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-base font-semibold text-ink">
              Institutional Permission Matrix
            </h3>
            <p className="text-xs text-muted">
              Enforcement layers across backend middleware and Sepolia smart contracts
            </p>
          </div>
          <Badge tone="neutral" size="md" className="font-mono">
            Active Policy v1.0
          </Badge>
        </div>

        <TableContainer>
          <Table>
            <THead>
              <TR>
                <TH>Feature / Action</TH>
                <TH>Category</TH>
                <TH>Super Admin</TH>
                <TH>Controller</TH>
                <TH>Issuer (Staff)</TH>
                <TH>Student</TH>
                <TH>Verifier</TH>
                <TH align="right">Enforcement</TH>
              </TR>
            </THead>
            <TBody>
              {matrix.map((row) => (
                <TR key={row.permission}>
                  <TD className="font-semibold text-ink">{row.permission}</TD>
                  <TD className="text-xs text-muted">{row.category}</TD>
                  <TD>
                    <Badge
                      size="sm"
                      tone={
                        row.superAdmin === 'Allowed'
                          ? 'success'
                          : row.superAdmin === 'Read-only'
                          ? 'info'
                          : 'danger'
                      }
                    >
                      {row.superAdmin}
                    </Badge>
                  </TD>
                  <TD>
                    <Badge
                      size="sm"
                      tone={
                        row.controller.includes('Allowed') || row.controller.includes('Sole')
                          ? 'success'
                          : 'warning'
                      }
                    >
                      {row.controller}
                    </Badge>
                  </TD>
                  <TD>
                    <Badge
                      size="sm"
                      tone={row.issuer.includes('Allowed') ? 'success' : 'neutral'}
                    >
                      {row.issuer}
                    </Badge>
                  </TD>
                  <TD className="text-xs text-muted">{row.student}</TD>
                  <TD className="text-xs text-muted">{row.verifier}</TD>
                  <TD align="right">
                    <Badge
                      size="sm"
                      tone={
                        row.enforcement === 'Smart Contract'
                          ? 'brand'
                          : row.enforcement === 'Both'
                          ? 'seal'
                          : 'info'
                      }
                      icon={
                        row.enforcement === 'Smart Contract' ? (
                          <Boxes className="w-3 h-3" />
                        ) : row.enforcement === 'Backend API' ? (
                          <ShieldCheck className="w-3 h-3" />
                        ) : (
                          <Lock className="w-3 h-3" />
                        )
                      }
                    >
                      {row.enforcement}
                    </Badge>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
};
