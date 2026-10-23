'use client';

import React, { useState } from 'react';
import {
  PenTool,
  Wallet,
  CheckCircle2,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { RevocationItem } from '@/types/controller';

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

  // Eligible items for co-signing
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
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner with MetaMask Web3 Wallet Integration */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0B2545]">
                Controller Cryptographic Co-signature Center
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Supply secondary cryptographic authorizations required by the PUB CertChain smart contract.
              </p>
            </div>
          </div>
        </div>

        {/* Web3 Wallet State & Connect Button */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Controller Wallet
            </span>
            <span className="font-mono text-xs font-semibold text-[#0B2545] block">
              {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Disconnected'}
            </span>
          </div>

          {walletAddress ? (
            <button
              onClick={onDisconnectWallet}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition cursor-pointer"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={onConnectWallet}
              disabled={isWalletConnecting}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>{isWalletConnecting ? 'Connecting...' : 'Connect MetaMask'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Co-signature Workspace */}
      {eligibleRevocations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-16 text-center flex flex-col items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3 opacity-80" />
          <h4 className="text-base font-bold text-[#0B2545]">
            No Revocations Awaiting Controller Co-signature
          </h4>
          <p className="text-xs text-slate-500 max-w-md mt-1 leading-relaxed">
            All revocation requests submitted by academic registrars have either been co-signed or rejected. When a new revocation request is submitted, it will appear here for cryptographic signing.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: List of items awaiting co-sign */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-[#0B2545]">
                Queue: {eligibleRevocations.length} Pending
              </span>
              <span className="text-[10px] font-semibold text-slate-400">Select to Co-sign</span>
            </div>

            <div className="space-y-2.5 mt-3 flex-1 overflow-y-auto max-h-[520px] pr-1">
              {eligibleRevocations.map((rev) => {
                const isSelected = activeItem?.id === rev.id;
                return (
                  <button
                    key={rev.id}
                    onClick={() => {
                      setSelectedRevId(rev.id);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50/70 border-teal-300 shadow-2xs'
                        : 'bg-white border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#0B2545]">
                        {rev.certificateId}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                        {rev.workflowStatus === 'awaiting_signature' ? 'Ready to Sign' : 'Pending Review'}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-700 mt-1 truncate">
                      {rev.studentName}
                    </div>

                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-tight">
                      {rev.reason}
                    </p>

                    <div className="mt-2 pt-2 border-t border-slate-100/80 flex items-center justify-between text-[10px] text-slate-400">
                      <span>By: {rev.requestingIssuer.name}</span>
                      <span>{rev.requestedAt}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right 2 Columns: Cryptographic Signing Inspection & Execution Panel */}
          {activeItem && (
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 flex flex-col justify-between">
              <div className="space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-teal-600 tracking-wider block">
                      Target Credential Under Revocation
                    </span>
                    <h4 className="text-lg font-bold text-[#0B2545] font-mono mt-0.5">
                      {activeItem.certificateId}
                    </h4>
                    <span className="text-xs text-slate-500">{activeItem.certificateType}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Grounds Review
                    </span>
                    <span className="text-xs font-bold text-rose-700 px-2 py-0.5 rounded bg-rose-50 border border-rose-200 inline-block mt-0.5">
                      Co-signature Required
                    </span>
                  </div>
                </div>

                {/* Evidence & Grounds Card */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2.5">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Official Revocation Grounds
                    </span>
                    <p className="text-slate-800 font-medium text-xs mt-0.5 leading-relaxed">
                      {activeItem.reason}
                    </p>
                  </div>

                  {activeItem.evidenceNotes && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Supporting Evidence / Committee Resolution
                      </span>
                      <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed font-sans">
                        {activeItem.evidenceNotes}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/80">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Student ID</span>
                      <span className="font-mono font-bold text-[#0B2545]">{activeItem.studentId}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Candidate Name</span>
                      <span className="font-bold text-[#0B2545]">{activeItem.studentName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Degree Program</span>
                      <span className="text-slate-700 truncate block">{activeItem.program}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Requesting Registrar</span>
                      <span className="text-slate-700 truncate block">{activeItem.requestingIssuer.name}</span>
                    </div>
                  </div>
                </div>

                {/* Signing Steps Progress */}
                <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-200/70 text-xs">
                  <div className="flex items-center gap-2 mb-2 font-bold text-teal-900">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    <span>Cryptographic Co-signature Protocol</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px]">
                    <li>Controller inspects recorded grounds and candidate evidence.</li>
                    <li>Generates an EIP-191 cryptographic digest co-signed by Controller&apos;s authorized address.</li>
                    <li>Submits revocation transaction to smart contract on Ethereum Sepolia.</li>
                    <li>Certificate is immutably flagged as Revoked across the platform &amp; verification portal.</li>
                  </ol>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  onClick={() => onOpenRejectModal(activeItem)}
                  disabled={isActionLoading}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition cursor-pointer disabled:opacity-50"
                >
                  Reject Revocation Request
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => onOpenDetailModal(activeItem)}
                    className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
                  >
                    View Full Certificate Record
                  </button>

                  <button
                    onClick={handleStartCoSign}
                    disabled={isActionLoading}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isActionLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Signing &amp; Broadcasting...</span>
                      </>
                    ) : (
                      <>
                        <PenTool className="w-4 h-4" />
                        <span>Authorize &amp; Co-sign Revocation</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
