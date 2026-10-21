'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import {
  Wallet,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  KeyRound,
  ExternalLink,
  ShieldCheck,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

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
  const [copied, setCopied] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [showLifecycleInfo, setShowLifecycleInfo] = useState(false);

  // Check if MetaMask is available in browser using useSyncExternalStore
  const hasMetaMask = useSyncExternalStore(
    subscribeEmpty,
    () => typeof window !== 'undefined' && Boolean((window as unknown as { ethereum?: unknown }).ethereum),
    () => false
  );

  // Format network name from hex chainId
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

  // Listen to MetaMask account & chain changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ethereum = (window as unknown as { ethereum?: {
      on?: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener?: (event: string, callback: (...args: unknown[]) => void) => void;
      request?: (args: { method: string }) => Promise<unknown>;
    } }).ethereum;

    if (!ethereum || !ethereum.on) return;

    const handleAccountsChanged = (accounts: unknown) => {
      const accList = accounts as string[];
      if (accList && accList.length > 0) {
        onWalletAddressChange(accList[0]);
        // Reset signature when account changes to maintain cryptographic validity
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

    // Initial network detection if already connected
    if (ethereum.request) {
      ethereum.request({ method: 'eth_chainId' })
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

  // Connect to MetaMask
  const connectWallet = async () => {
    setErrorMessage(null);
    setIsConnecting(true);

    try {
      if (typeof window === 'undefined' || !(window as unknown as { ethereum?: unknown }).ethereum) {
        setErrorMessage(
          'MetaMask extension was not detected in your browser. Please install MetaMask from metamask.io or switch to manual input below.'
        );
        setIsConnecting(false);
        return;
      }

      const ethereum = (window as unknown as {
        ethereum: {
          request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
        };
      }).ethereum;

      const accounts = (await ethereum.request({
        method: 'eth_requestAccounts',
      })) as string[];

      if (accounts && accounts.length > 0) {
        onWalletAddressChange(accounts[0]);
        onSignatureChange('');
        onVerificationChange(false);

        // Fetch chain ID
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

  // Cryptographic Signature Challenge (Ownership Proof)
  const signOwnershipChallenge = async () => {
    if (!walletAddress) {
      setErrorMessage('Please connect a wallet first.');
      return;
    }

    setErrorMessage(null);
    setIsSigning(true);

    try {
      const ethereum = (window as unknown as {
        ethereum?: {
          request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
        };
      }).ethereum;

      if (!ethereum) {
        setErrorMessage('Ethereum provider not available.');
        setIsSigning(false);
        return;
      }

      // Institutional security challenge text
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

      // Request personal_sign (standard, gasless)
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
        setErrorMessage('Signature challenge cancelled. Signature is needed to confirm wallet ownership.');
      } else {
        setErrorMessage(errorObj?.message || 'Failed to sign verification message.');
      }
    } finally {
      setIsSigning(false);
    }
  };

  const handleCopy = () => {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDisconnect = () => {
    onWalletAddressChange('');
    onSignatureChange('');
    onVerificationChange(false);
    setErrorMessage(null);
  };

  const truncateAddress = (addr: string) => {
    if (!addr || addr.length < 10) return addr;
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-[#172033]">
          Issuer Signing Wallet (MetaMask){' '}
          <span className="text-amber-600 font-medium text-[11px]">(Required for Issuers)</span>
        </label>
        <button
          type="button"
          onClick={() => setManualMode(!manualMode)}
          className="text-[11px] text-[#2563EB] hover:underline"
        >
          {manualMode ? 'Switch to MetaMask Auto-Connect' : 'Manual Address Input'}
        </button>
      </div>

      {/* Manual Input Fallback */}
      {manualMode ? (
        <div className="space-y-1.5">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Wallet className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="0x..."
              value={walletAddress}
              disabled={disabled}
              onChange={(e) => {
                onWalletAddressChange(e.target.value.trim());
                onSignatureChange('');
                onVerificationChange(false);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 text-xs font-mono outline-none"
            />
          </div>
          <p className="text-[11px] text-slate-500">
            Enter your public Ethereum address manually if MetaMask is unavailable.
          </p>
        </div>
      ) : (
        /* Interactive MetaMask Connector */
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-3 transition-all">
          {!walletAddress ? (
            /* Disconnected state */
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100/80 border border-orange-200 flex items-center justify-center shrink-0">
                  {/* MetaMask Fox SVG */}
                  <svg className="w-6 h-6" viewBox="0 0 318.6 318.6" fill="none">
                    <path
                      d="M274.1 35.5L174.6 109.4 193 65.8z"
                      fill="#E2761B"
                      stroke="#E2761B"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M44.5 35.5l98.6 74.3-17.7-44z"
                      fill="#E4761B"
                      stroke="#E4761B"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M238.3 206.8l-26.4 40.8 56.7 15.6 16.3-55.3z"
                      fill="#E4761B"
                      stroke="#E4761B"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M33.6 207.9l16.1 55.3 56.7-15.6-26.2-40.8z"
                      fill="#E4761B"
                      stroke="#E4761B"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M103.6 138.2l-15.8 23.9 56.3 2.5-2-60.5z"
                      fill="#E4761B"
                      stroke="#E4761B"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M215 138.2l-38.7-34.5-1.6 60.9 56.1-2.5z"
                      fill="#E4761B"
                      stroke="#E4761B"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M106.4 247.6l33.8-16.5-29.3-22.8z"
                      fill="#E4761B"
                      stroke="#E4761B"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M178.4 231.1l33.8 16.5-4.5-39.3z"
                      fill="#E4761B"
                      stroke="#E4761B"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M212.2 247.6l-33.8-16.5 3.6 26.6.6 8.8z"
                      fill="#D7C1B3"
                      stroke="#D7C1B3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M106.4 247.6l29.6 18.9.5-8.8 3.7-26.6z"
                      fill="#D7C1B3"
                      stroke="#D7C1B3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M140.2 221.7l-35.3-2.7-17.1 24.3 18.6 14.5z"
                      fill="#233447"
                      stroke="#233447"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M178.4 221.7l33.8 36.1 18.6-14.5-17.1-24.3z"
                      fill="#233447"
                      stroke="#233447"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M274.1 35.5l-81.1 30.3 35.8 28.5 45.3-58.8z"
                      fill="#CD6116"
                      stroke="#CD6116"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M44.5 35.5l45.4 58.8 35.7-28.5z"
                      fill="#CD6116"
                      stroke="#CD6116"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    Connect Issuer Signing Wallet
                  </h4>
                  <p className="text-[11px] text-slate-500 max-w-xs">
                    Link your MetaMask address so Controller can authorize you on the Smart Contract.
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={isConnecting || disabled}
                onClick={connectWallet}
                className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Connect MetaMask</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Connected state */
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-800">MetaMask Connected</span>
                  {networkName && (
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-[#2563EB] text-[10px] font-semibold">
                      {networkName}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={connectWallet}
                    className="text-[11px] text-slate-500 hover:text-slate-800 px-2 py-1 rounded hover:bg-slate-200 transition-colors"
                  >
                    Switch Account
                  </button>
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="text-[11px] text-red-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              </div>

              {/* Address display card */}
              <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-medium block">Wallet Address</span>
                  <div className="font-mono text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>{truncateAddress(walletAddress)}</span>
                    <span className="hidden sm:inline text-[11px] font-normal text-slate-500">
                      ({walletAddress.slice(0, 10)}...{walletAddress.slice(-8)})
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                  title="Copy full address"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Security Step: Cryptographic Signature Challenge */}
              <div className="rounded-lg p-3 bg-blue-50/80 border border-blue-200 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span className="text-xs font-bold text-blue-950">
                        Security Step: Prove Wallet Ownership
                      </span>
                    </div>
                    <p className="text-[11px] text-blue-800/90 leading-tight">
                      Sign a gas-free challenge message to prove this wallet belongs to you and prevent spoofing.
                    </p>
                  </div>

                  {isVerified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Verified Owner
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={isSigning || disabled}
                      onClick={signOwnershipChallenge}
                      className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSigning ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Signing...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Sign Challenge</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {isVerified && signature && (
                  <div className="text-[10px] text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-200 font-mono truncate">
                    Signature: {signature.slice(0, 24)}...{signature.slice(-16)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Browser extension missing alert */}
          {hasMetaMask === false && !walletAddress && (
            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center justify-between">
              <span>MetaMask extension is not installed in your browser.</span>
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noreferrer"
                className="font-bold underline text-amber-900 flex items-center gap-1"
              >
                <span>Install</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      )}

      {/* Error notification */}
      {errorMessage && (
        <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          <span className="flex-1">{errorMessage}</span>
        </div>
      )}

      {/* 5-Step Process Toggle Explanation */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden text-xs">
        <button
          type="button"
          onClick={() => setShowLifecycleInfo(!showLifecycleInfo)}
          className="w-full flex items-center justify-between p-2.5 text-left text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <div className="flex items-center gap-1.5 font-semibold text-[11px] text-slate-700">
            <Info className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>How does Issuer Registration & Approval work? (5 Steps)</span>
          </div>
          {showLifecycleInfo ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>

        {showLifecycleInfo && (
          <div className="p-3 pt-1 border-t border-slate-200 text-[11px] text-slate-600 space-y-2">
            <div className="flex items-start gap-2">
              <span className="font-bold text-[#2563EB] shrink-0">Step 1:</span>
              <span><strong>Issuer Signup:</strong> Provide your university details, official email, and credentials.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-[#2563EB] shrink-0">Step 2:</span>
              <span><strong>Connect MetaMask:</strong> Connect your wallet and sign the ownership challenge.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-amber-600 shrink-0">Step 3:</span>
              <span><strong>Pending Approval:</strong> Registration request is stored in database with <code className="bg-slate-200 px-1 rounded">status: &quot;pending&quot;</code>.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-amber-600 shrink-0">Step 4:</span>
              <span><strong>Controller Approval:</strong> Controller verifies your identity and authorizes your wallet address on the Smart Contract.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-emerald-600 shrink-0">Step 5:</span>
              <span><strong>Issuer Access:</strong> Once authorized both in Database and Smart Contract, you can sign and issue certificates on the blockchain.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
