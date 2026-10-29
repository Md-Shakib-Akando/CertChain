'use client';

import React, { useState } from 'react';
import {
  PenTool,
  Wallet,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { RevocationItem } from '@/types/controller';
import {
  PageHeader,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Badge,
  DescriptionList,
  Alert,
  EmptyState,
} from '@/components/ui';

interface CoSignatureCenterSectionProps {
  revocations: RevocationItem[];
  walletAddress: string | null;
  isWalletConnecting: boolean;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
  onApproveAndCoSign: (revId: string) => Promise<boolean>;
  onOpenDetailModal: (rev: RevocationItem) => void;
  onOpenRejectModal: (rev: RevocationItem) => void;
  isActionLoading: boolean;
}

export const CoSignatureCenterSection: React.FC<CoSignatureCenterSectionProps> = ({
  revocations,
  walletAddress,
  isWalletConnecting,
  onConnectWallet,
  onDisconnectWallet,
  onApproveAndCoSign,
  onOpenDetailModal,
  onOpenRejectModal,
  isActionLoading,
}) => {
  const [selectedRevId, setSelectedRevId] = useState<string | null>(null);

  const eligibleRevocations = revocations.filter(
    (r) => r.workflowStatus === 'pending_review' || r.workflowStatus === 'awaiting_signature'
  );

  const activeItem =
    eligibleRevocations.find((r) => r.id === selectedRevId) || eligibleRevocations[0] || null;

  const handleStartCoSign = async () => {
    if (!activeItem) return;
    await onApproveAndCoSign(activeItem.id);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dual-Authorization Execution"
        title="Controller Cryptographic Co-Signature Center"
        description="Supply the mandatory secondary cryptographic authorization required by CertChain.sol to finalize certificate revocations on Ethereum Sepolia."
        actions={
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] uppercase font-semibold text-muted block tracking-wider">
                Controller Signer Wallet
              </span>
              <span className="font-mono text-xs font-semibold text-ink block">
                {walletAddress
                  ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                  : 'Server Relayer / Standby'}
              </span>
            </div>

            {walletAddress ? (
              <Button variant="secondary" size="sm" onClick={onDisconnectWallet}>
                Disconnect
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                loading={isWalletConnecting}
                leftIcon={<Wallet className="w-4 h-4" />}
                onClick={onConnectWallet}
              >
                Connect MetaMask
              </Button>
            )}
          </div>
        }
      />

      {eligibleRevocations.length === 0 ? (
        <Card>
          <EmptyState
            icon={<CheckCircle2 className="w-5 h-5" />}
            title="No revocations awaiting Controller co-signature"
            description="All revocation requests submitted by academic registrars have been co-signed or resolved. When a new revocation request is submitted, it will appear here for cryptographic signing."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 4 Cols: Queue */}
          <Card className="lg:col-span-4">
            <CardHeader
              eyebrow="Pending Queue"
              title={`${eligibleRevocations.length} Awaiting Co-Sign`}
              description="Select a credential to inspect and sign."
            />
            <CardBody className="space-y-2.5 max-h-[520px] overflow-y-auto no-scrollbar">
              {eligibleRevocations.map((rev) => {
                const isSelected = activeItem?.id === rev.id;
                return (
                  <button
                    key={rev.id}
                    type="button"
                    onClick={() => setSelectedRevId(rev.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-brand-muted border-brand shadow-xs'
                        : 'bg-canvas border-line hover:border-line-strong'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-semibold text-brand">
                        {rev.certificateId}
                      </span>
                      <Badge tone="warning" size="xs">
                        {rev.workflowStatus === 'awaiting_signature' ? 'Ready' : 'Review'}
                      </Badge>
                    </div>

                    <div className="text-xs font-semibold text-ink mt-1 truncate">
                      {rev.studentName}
                    </div>

                    <p className="text-[11px] text-muted mt-1 line-clamp-2 leading-relaxed">
                      {rev.reason}
                    </p>

                    <div className="mt-2 pt-2 border-t border-line flex items-center justify-between text-[10px] text-subtle">
                      <span>By: {rev.requestingIssuer.name}</span>
                      <span>{rev.requestedAt}</span>
                    </div>
                  </button>
                );
              })}
            </CardBody>
          </Card>

          {/* Right 8 Cols: Inspection & Execution */}
          {activeItem && (
            <Card className="lg:col-span-8">
              <CardHeader
                eyebrow="Target Credential Under Revocation"
                title={`${activeItem.certificateId} — ${activeItem.certificateType}`}
                description={`Candidate: ${activeItem.studentName} (${activeItem.studentId})`}
                actions={
                  <Badge tone="danger" dot>
                    Co-Signature Required
                  </Badge>
                }
              />

              <CardBody className="space-y-5">
                <div className="p-4 rounded-xl bg-sunken border border-line space-y-3 text-xs">
                  <div>
                    <span className="eyebrow block mb-1">Official Revocation Grounds</span>
                    <p className="text-ink font-medium leading-relaxed">{activeItem.reason}</p>
                  </div>

                  {activeItem.evidenceNotes && (
                    <div className="pt-2 border-t border-line">
                      <span className="eyebrow block mb-1">
                        Supporting Evidence / Syndicate Resolution
                      </span>
                      <p className="text-ink-2 leading-relaxed">{activeItem.evidenceNotes}</p>
                    </div>
                  )}
                </div>

                <DescriptionList
                  cols={2}
                  items={[
                    {
                      term: 'Candidate Student ID',
                      detail: <span className="font-mono font-semibold">{activeItem.studentId}</span>,
                    },
                    {
                      term: 'Candidate Full Name',
                      detail: <span className="font-semibold">{activeItem.studentName}</span>,
                    },
                    {
                      term: 'Academic Program',
                      detail: activeItem.program,
                    },
                    {
                      term: 'Requesting Registrar',
                      detail: `${activeItem.requestingIssuer.name} (${activeItem.requestingIssuer.email})`,
                    },
                  ]}
                />

                <Alert
                  tone="info"
                  icon={<ShieldCheck className="w-4 h-4" />}
                  title="Cryptographic Co-Signature Protocol"
                >
                  <ol className="list-decimal list-inside space-y-1 mt-1 text-xs">
                    <li>Controller inspects recorded revocation grounds and candidate evidence.</li>
                    <li>Signs an EIP-191 digest paired with the Registrar&apos;s revocation request.</li>
                    <li>Broadcasts <code className="font-mono">revokeCertificate()</code> to Ethereum Sepolia.</li>
                    <li>Credential is permanently flagged as Revoked across the public verification portal.</li>
                  </ol>
                </Alert>
              </CardBody>

              <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <Button
                  variant="danger-outline"
                  size="sm"
                  disabled={isActionLoading}
                  onClick={() => onOpenRejectModal(activeItem)}
                >
                  Reject Revocation Request
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onOpenDetailModal(activeItem)}
                  >
                    Inspect Full Dossier
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    loading={isActionLoading}
                    leftIcon={<PenTool className="w-4 h-4" />}
                    onClick={handleStartCoSign}
                  >
                    Authorize &amp; Co-Sign Revocation
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
