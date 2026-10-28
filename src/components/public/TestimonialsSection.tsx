'use client';

import React from 'react';
import { Terminal, FileCode2, ShieldCheck } from 'lucide-react';
import { Card, CardBody } from '@/components/ui';

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="bg-canvas py-16 sm:py-20 border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-3">
            <p className="eyebrow">On-Chain Registry Contract</p>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-ink tracking-tight">
              Verifiable Smart Contract Primitives
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              The <code className="font-mono text-xs text-ink bg-sunken px-1.5 py-0.5 rounded">CertChain.sol</code> contract stores only non-PII cryptographic commitments. Public verification calls execute via zero-gas EVM <code className="font-mono text-xs text-ink bg-sunken px-1.5 py-0.5 rounded">view</code> functions.
            </p>
            <div className="pt-2 space-y-2 text-xs text-ink-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-success shrink-0" />
                <span>OpenZeppelin v5.6 AccessControl role hierarchy</span>
              </div>
              <div className="flex items-center gap-2">
                <FileCode2 className="size-4 text-brand shrink-0" />
                <span>Deterministic A4 PDF synthesis via pdf-lib + QRCode</span>
              </div>
              <div className="flex items-center gap-2">
                <Terminal className="size-4 text-seal shrink-0" />
                <span>Direct reverse-lookup by 32-byte SHA-256 digest</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <Card className="bg-night text-night-text border-night-line overflow-hidden">
              <div className="px-4 py-2.5 bg-night-2 border-b border-night-line flex items-center justify-between text-xs font-mono text-night-muted">
                <span>contracts/CertChain.sol</span>
                <span className="text-seal-bright">Solidity ^0.8.20</span>
              </div>
              <CardBody className="p-4 sm:p-5 font-mono text-xs leading-relaxed overflow-x-auto">
                <pre className="text-night-text">
{`struct CertificateRecord {
    string  certId;           // e.g. "PUB-DEG-2026-000105"
    bytes32 sha256Hash;       // Canonical PDF SHA-256 digest
    address issuer;           // Authorized Registrar wallet
    uint256 issuedAt;         // Block timestamp
    bool    isRevoked;        // Revocation state flag
    string  revocationReason; // Audited Controller rationale
}`}
                </pre>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
