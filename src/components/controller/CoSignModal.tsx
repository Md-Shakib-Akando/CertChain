'use client';

import React, { useState } from 'react';
import {
  X,
  PenTool,
  Wallet,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { RevocationItem } from '@/types/controller';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0B2545]">
                Cryptographic Co-signature Confirmation
              </h3>
              <span className="text-[11px] font-mono text-slate-500">
                Target: {revocation.certificateId}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'confirmed' ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-[#0B2545]">
              Revocation Confirmed on Ethereum Sepolia
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Certificate <span className="font-mono font-bold text-slate-800">{revocation.certificateId}</span> has been immutably revoked on-chain with dual-authorization signatures.
            </p>
            <div className="pt-4">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-500 transition shadow-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Target Credential & Reason */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Candidate &amp; Program
                </span>
                <span className="font-bold text-[#0B2545]">{revocation.studentName}</span>
              </div>
              <div className="text-[11px] text-slate-600">
                {revocation.certificateType} &bull; {revocation.program}
              </div>
              <div className="pt-2 border-t border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Grounds for Revocation
                </span>
                <p className="text-slate-800 font-medium text-[11px] mt-0.5 leading-relaxed">
                  {revocation.reason}
                </p>
              </div>
            </div>

            {/* Wallet Co-signer Status */}
            <div className="p-3.5 rounded-xl bg-teal-50/50 border border-teal-200 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-teal-700 shrink-0" />
                <div>
                  <span className="font-bold text-teal-900 block">Signer Wallet</span>
                  <span className="font-mono text-[11px] text-slate-600 block">
                    {walletAddress ? `${walletAddress.slice(0, 10)}...${walletAddress.slice(-8)}` : 'Internal Key / MetaMask'}
                  </span>
                </div>
              </div>

              {!walletAddress && (
                <button
                  onClick={onConnectWallet}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white text-teal-700 border border-teal-300 hover:bg-teal-50 transition cursor-pointer"
                >
                  Connect MetaMask
                </button>
              )}
            </div>

            {/* Smart contract notice */}
            <div className="text-[11px] text-slate-500 flex items-start gap-2 bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900 leading-relaxed">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                By co-signing, you provide the second cryptographic authorization required to permanently revoke this certificate on the blockchain. This action is auditable and irreversible.
              </span>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isActionLoading}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleExecute}
                disabled={isActionLoading}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isActionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Broadcasting to Sepolia...</span>
                  </>
                ) : (
                  <>
                    <PenTool className="w-4 h-4" />
                    <span>Authorize &amp; Co-sign</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
