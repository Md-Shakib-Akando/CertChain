'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import {
  Wallet,
  CheckCircle2,
  KeyRound,
  ExternalLink,
  ShieldCheck,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button, Input, Badge, HashText, Alert } from '@/components/ui';

interface MetaMaskIssuerConnectProps {
  walletAddress: string;
  onWalletAddressChange: (address: string) => void;
  signature: string;
  onSignatureChange: (sig: string) => void;
  isVerified: boolean;
  onVerificationChange: (verified: boolean) => void;
  staffId?: string;
  disabled?: boolean;
}

const subscribeEmpty = () => () => {};

export const MetaMaskIssuerConnect: React.FC<MetaMaskIssuerConnectProps> = ({
  walletAddress,
  onWalletAddressChange,
  signature,
  onSignatureChange,
  isVerified,
  onVerificationChange,
  staffId = '',
  disabled = false,
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [networkName, setNetworkName] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [showLifecycleInfo, setShowLifecycleInfo] = useState(false);

  const hasMetaMask = useSyncExternalStore(
    subscribeEmpty,
    () =>
      typeof window !== 'undefined' &&
      Boolean((window as unknown as { ethereum?: unknown }).ethereum),
    () => false
  );

  const getNetworkLabel = (chainIdHex: string): string => {
    switch (chainIdHex) {
      case '0x1':
        return 'Ethereum Mainnet';
      case '0xaa36a7':
        return 'Sepolia Testnet';
      case '0x89':
        return 'Polygon PoS';
      case '0x13882':
        return 'Polygon Amoy';
      case '0x539':
      case '0x7a69':
        return 'Local Hardhat/Anvil';
      default:
        return `Chain ${parseInt(chainIdHex, 16) || chainIdHex}`;
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ethereum = (
      window as unknown as {
        ethereum?: {
          on?: (event: string, callback: (...args: unknown[]) => void) => void;
          removeListener?: (event: string, callback: (...args: unknown[]) => void) => void;
          request?: (args: { method: string }) => Promise<unknown>;
        };
      }
    ).ethereum;

    if (!ethereum || !ethereum.on) return;

    const handleAccountsChanged = (accounts: unknown) => {
      const accList = accounts as string[];
      if (accList && accList.length > 0) {
        onWalletAddressChange(accList[0]);
        onSignatureChange('');
        onVerificationChange(false);
      } else {
        onWalletAddressChange('');
        onSignatureChange('');
        onVerificationChange(false);
      }
    };

    const handleChainChanged = (chainId: unknown) => {
      if (typeof chainId === 'string') {
        setNetworkName(getNetworkLabel(chainId));
      }
    };

    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);

    if (ethereum.request) {
      ethereum
        .request({ method: 'eth_chainId' })
        .then((chain) => {
          if (typeof chain === 'string') setNetworkName(getNetworkLabel(chain));
        })
        .catch(() => {});
    }

    return () => {
      if (ethereum.removeListener) {
        ethereum.removeListener('accountsChanged', handleAccountsChanged);
        ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [onWalletAddressChange, onSignatureChange, onVerificationChange]);

  const connectWallet = async () => {
    setErrorMessage(null);
    setIsConnecting(true);

    try {
      if (
        typeof window === 'undefined' ||
        !(window as unknown as { ethereum?: unknown }).ethereum
      ) {
        setErrorMessage(
          'MetaMask browser extension was not detected. Install MetaMask or switch to manual address input.'
        );
        setIsConnecting(false);
        return;
      }

      const ethereum = (
        window as unknown as {
          ethereum: {
            request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
          };
        }
      ).ethereum;

      const accounts = (await ethereum.request({
        method: 'eth_requestAccounts',
      })) as string[];

      if (accounts && accounts.length > 0) {
        onWalletAddressChange(accounts[0]);
        onSignatureChange('');
        onVerificationChange(false);

        const chainId = (await ethereum.request({
          method: 'eth_chainId',
        })) as string;
        if (chainId) setNetworkName(getNetworkLabel(chainId));
      } else {
        setErrorMessage('No accounts selected in MetaMask.');
      }
    } catch (err: unknown) {
      const errorObj = err as { code?: number; message?: string };
      if (errorObj?.code === 4001) {
        setErrorMessage('MetaMask connection request was cancelled.');
      } else {
        setErrorMessage(errorObj?.message || 'Failed to connect MetaMask wallet.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const signOwnershipChallenge = async () => {
    if (!walletAddress) {
      setErrorMessage('Please connect a wallet first.');
      return;
    }

    setErrorMessage(null);
    setIsSigning(true);

    try {
      const ethereum = (
        window as unknown as {
          ethereum?: {
            request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
          };
        }
      ).ethereum;

      if (!ethereum) {
        setErrorMessage('Ethereum provider not available.');
        setIsSigning(false);
        return;
      }

      const timestamp = new Date().toISOString();
      const nonce = Math.floor(100000 + Math.random() * 900000);
      const challengeMessage = [
        '=== PUB CertChain Issuer Identity Verification ===',
        'Action: Register Staff Issuer Wallet',
        `Staff ID: ${staffId.trim() || 'Pending Assignment'}`,
        `Wallet Address: ${walletAddress.toLowerCase()}`,
        `Verification Nonce: ${nonce}`,
        `Timestamp: ${timestamp}`,
        '',
        'Note: Signing this challenge is gas-free and securely proves you own this private key without initiating a blockchain transaction.',
      ].join('\n');

      const sig = (await ethereum.request({
        method: 'personal_sign',
        params: [challengeMessage, walletAddress],
      })) as string;

      if (sig) {
        onSignatureChange(sig);
        onVerificationChange(true);
      }
    } catch (err: unknown) {
      const errorObj = err as { code?: number; message?: string };
      if (errorObj?.code === 4001) {
        setErrorMessage('Signature challenge cancelled.');
      } else {
        setErrorMessage(errorObj?.message || 'Failed to sign verification message.');
      }
    } finally {
      setIsSigning(false);
    }
  };

  const handleDisconnect = () => {
    onWalletAddressChange('');
    onSignatureChange('');
    onVerificationChange(false);
    setErrorMessage(null);
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <label className="text-[13px] font-medium text-ink">
          Issuer Signing Wallet (MetaMask) <span className="text-danger">*</span>
        </label>
        <button
          type="button"
          onClick={() => setManualMode((v) => !v)}
          className="text-xs font-medium text-brand hover:underline"
        >
          {manualMode ? 'Use MetaMask Auto-Connect' : 'Enter Address Manually'}
        </button>
      </div>

      {manualMode ? (
        <div className="space-y-1.5">
          <Input
            type="text"
            mono
            placeholder="0x..."
            value={walletAddress}
            disabled={disabled}
            leftIcon={<Wallet />}
            onChange={(e) => {
              onWalletAddressChange(e.target.value.trim());
              onSignatureChange('');
              onVerificationChange(false);
            }}
          />
          <p className="text-xs text-muted">
            Provide the public Ethereum address that the Controller of Examinations will authorize on the smart contract.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-line bg-sunken/60 p-4 space-y-3">
          {!walletAddress ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="size-9 rounded-md bg-surface border border-line text-brand inline-flex items-center justify-center shrink-0">
                  <Wallet className="size-4" aria-hidden />
                </span>
                <div>
                  <p className="text-xs font-semibold text-ink">
                    Connect Ethereum Signing Wallet
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    Required so the Controller can grant <code className="font-mono">ISSUER_ROLE</code> to your address.
                  </p>
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={connectWallet}
                loading={isConnecting}
                disabled={disabled}
                leftIcon={<Wallet />}
              >
                Connect MetaMask
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-line">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-success" aria-hidden />
                  <span className="text-xs font-semibold text-ink">Wallet Connected</span>
                  {networkName && (
                    <Badge tone="brand" size="sm">
                      {networkName}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={connectWallet}
                    className="text-muted hover:text-ink font-medium"
                  >
                    Switch
                  </button>
                  <span className="text-line-strong">&middot;</span>
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="text-danger hover:underline font-medium"
                  >
                    Disconnect
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 rounded-md bg-surface border border-line px-3 py-2">
                <span className="text-xs text-muted">Address</span>
                <HashText value={walletAddress} head={10} tail={8} label="wallet address" />
              </div>

              <div className="rounded-md bg-surface border border-line p-3 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                      <KeyRound className="size-3.5 text-brand" />
                      <span>Cryptographic Ownership Proof</span>
                    </div>
                    <p className="text-xs text-muted">
                      Sign a gas-free challenge message to prove ownership of this key.
                    </p>
                  </div>

                  {isVerified ? (
                    <Badge tone="success" size="sm" icon={<CheckCircle2 />}>
                      Verified Owner
                    </Badge>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={signOwnershipChallenge}
                      loading={isSigning}
                      disabled={disabled}
                      leftIcon={<ShieldCheck />}
                    >
                      Sign Challenge
                    </Button>
                  )}
                </div>

                {isVerified && signature && (
                  <div className="pt-1.5 border-t border-line flex items-center justify-between text-xs">
                    <span className="text-muted">Signature</span>
                    <HashText value={signature} head={14} tail={10} label="signature" />
                  </div>
                )}
              </div>
            </div>
          )}

          {hasMetaMask === false && !walletAddress && (
            <div className="rounded-md bg-warning-soft border border-warning-line px-3 py-2 text-xs text-warning flex items-center justify-between gap-2">
              <span>MetaMask extension not detected in browser.</span>
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline inline-flex items-center gap-1"
              >
                <span>Install</span>
                <ExternalLink className="size-3" />
              </a>
            </div>
          )}
        </div>
      )}

      {errorMessage && <Alert tone="danger">{errorMessage}</Alert>}

      <div className="rounded-md border border-line bg-surface overflow-hidden text-xs">
        <button
          type="button"
          onClick={() => setShowLifecycleInfo((v) => !v)}
          className="w-full flex items-center justify-between px-3 py-2 text-left text-muted hover:text-ink hover:bg-sunken/50 transition-colors"
        >
          <span className="inline-flex items-center gap-1.5 font-medium">
            <Info className="size-3.5 text-brand" />
            <span>How does Issuer wallet authorization work?</span>
          </span>
          {showLifecycleInfo ? (
            <ChevronUp className="size-3.5" />
          ) : (
            <ChevronDown className="size-3.5" />
          )}
        </button>

        {showLifecycleInfo && (
          <ol className="px-3 py-2.5 border-t border-line bg-sunken/40 text-xs text-muted space-y-1.5">
            <li>
              <strong className="text-ink">1. Submit Application:</strong> Register your official staff profile and Ethereum wallet address.
            </li>
            <li>
              <strong className="text-ink">2. Controller Review:</strong> The Controller of Examinations verifies your university appointment.
            </li>
            <li>
              <strong className="text-ink">3. On-Chain Grant:</strong> Controller executes <code className="font-mono text-ink">addIssuer(walletAddress)</code> on the smart contract.
            </li>
          </ol>
        )}
      </div>
    </div>
  );
};
