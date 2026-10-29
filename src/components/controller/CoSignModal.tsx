'use client';

import React, { useState } from 'react';
import {
  PenTool,
  Wallet,
  CheckCircle2,
} from 'lucide-react';
import { RevocationItem } from '@/types/controller';
import {
  Dialog,
  Button,
  Card,
  Alert,
  HashText,
} from '@/components/ui';

interface CoSignModalProps {
  revocation: RevocationItem | null;
  walletAddress: string | null;
  onConnectWallet: () => void;
  onClose: () => void;
  onConfirmCoSign: (revId: string) => Promise<boolean>;
  isActionLoading: boolean;
}

export const CoSignModal: React.FC<CoSignModalProps> = ({
  revocation,
  walletAddress,
  onConnectWallet,
  onClose,
  onConfirmCoSign,
  isActionLoading,
}) => {
  const [step, setStep] = useState<'review' | 'signing' | 'confirmed'>('review');

  if (!revocation) return null;

  const handleExecute = async () => {
    setStep('signing');
    const success = await onConfirmCoSign(revocation.id);
    if (success) {
      setStep('confirmed');
    } else {
      setStep('review');
    }
  };

  return (
    <Dialog
      open={Boolean(revocation)}
      onClose={onClose}
      size="md"
      eyebrow={`Target Credential: ${revocation.certificateId}`}
      title="Cryptographic Co-Signature Confirmation"
      description="Authorize and broadcast the secondary signature required to revoke this credential on Ethereum Sepolia."
    >
      {step === 'confirmed' ? (
        <div className="py-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-success-bg text-success flex items-center justify-center mx-auto border border-success-border">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="text-base font-serif font-semibold text-ink">
            Revocation Confirmed on Ethereum Sepolia
          </h4>
          <p className="text-xs text-muted max-w-sm mx-auto leading-relaxed">
            Certificate <span className="font-mono font-semibold text-ink">{revocation.certificateId}</span> has been immutably revoked on-chain with dual-authorization signatures.
          </p>
          <div className="pt-2">
            <Button variant="primary" size="sm" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Card padding="md" className="bg-sunken space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted">Candidate:</span>
              <span className="font-semibold text-ink">{revocation.studentName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Credential:</span>
              <span className="text-ink-2">
                {revocation.certificateType} • {revocation.program}
              </span>
            </div>
            <div className="pt-2 border-t border-line">
              <span className="eyebrow block mb-1">Grounds for Revocation</span>
              <p className="text-ink font-medium leading-relaxed">{revocation.reason}</p>
            </div>
          </Card>

          <Card padding="sm" className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <Wallet className="w-4 h-4 text-brand shrink-0" />
              <div className="min-w-0">
                <span className="text-xs font-semibold text-ink block">Signer Wallet</span>
                {walletAddress ? (
                  <HashText value={walletAddress} start={8} end={6} />
                ) : (
                  <span className="font-mono text-[11px] text-muted block">
                    Server Relayer / MetaMask
                  </span>
                )}
              </div>
            </div>

            {!walletAddress && (
              <Button variant="secondary" size="xs" onClick={onConnectWallet}>
                Connect MetaMask
              </Button>
            )}
          </Card>

          <Alert tone="warning" title="Irreversible Smart Contract Broadcast">
            By co-signing, you provide the second cryptographic authorization required to permanently revoke this certificate on the blockchain.
          </Alert>

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isActionLoading}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={isActionLoading}
              leftIcon={<PenTool className="w-4 h-4" />}
              onClick={handleExecute}
            >
              Authorize &amp; Co-Sign
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
};
