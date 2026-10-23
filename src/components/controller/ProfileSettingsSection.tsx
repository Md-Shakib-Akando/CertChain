'use client';

import React, { useState } from 'react';
import {
  Key,
  Wallet,
  Bell,
  Laptop,
  ShieldCheck,
} from 'lucide-react';
import { ControllerProfileData } from '@/types/controller';

interface ProfileSettingsSectionProps {
  profile: ControllerProfileData;
  walletAddress: string | null;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
  isWalletConnecting: boolean;
  onLogout: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ProfileSettingsSection: React.FC<ProfileSettingsSectionProps> = ({
  profile,
  walletAddress,
  onConnectWallet,
  onDisconnectWallet,
  isWalletConnecting,
  onLogout,
  showToast,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Notification Preferences
  const [notifyApplications, setNotifyApplications] = useState(true);
  const [notifyRevocations, setNotifyRevocations] = useState(true);
  const [notifyBlockchainEvents, setNotifyBlockchainEvents] = useState(true);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('All password fields are required.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    if (newPassword.length < 8) {
      showToast('Password must be at least 8 characters long.', 'error');
      return;
    }

    setIsChangingPassword(true);
    setTimeout(() => {
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Password updated successfully.', 'success');
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Profile Overview Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#0B2545] text-teal-300 flex items-center justify-center text-xl font-bold shadow-sm">
              CO
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#0B2545]">{profile.name}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  Controller Role
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{profile.email}</p>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                {profile.designation} &bull; {profile.department}
              </p>
            </div>
          </div>

          <div className="text-right self-stretch sm:self-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Institution
            </span>
            <span className="text-xs font-bold text-[#0B2545] block">
              {profile.university}
            </span>
          </div>
        </div>

        {/* Connected Wallet Section per PDF Section 10 */}
        <div className="mt-5 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                <Wallet className="w-3.5 h-3.5 text-teal-600" />
                <span>Authorized Co-signature Web3 Wallet</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                MetaMask address used to submit secondary cryptographic authorizations on Ethereum Sepolia.
              </p>
            </div>

            {walletAddress ? (
              <button
                onClick={onDisconnectWallet}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition cursor-pointer"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={onConnectWallet}
                disabled={isWalletConnecting}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>{isWalletConnecting ? 'Connecting...' : 'Connect MetaMask'}</span>
              </button>
            )}
          </div>

          <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                Bound Wallet Address
              </span>
              <span className="font-mono font-bold text-[#0B2545] break-all">
                {walletAddress || 'No wallet currently connected'}
              </span>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                Network
              </span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Sepolia Testnet (11155111)
              </span>
            </div>
          </div>

          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Never share your private keys or seed phrases with anyone.</span>
          </div>
        </div>
      </div>

      {/* Grid: Security Settings + Notifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Password & Security Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Key className="w-4 h-4 text-teal-600" />
            <h4 className="text-sm font-bold text-[#0B2545]">Security &amp; Password</h4>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-3 mt-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#0B2545] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#0B2545] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#0B2545] focus:bg-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isChangingPassword}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white transition shadow-xs cursor-pointer disabled:opacity-50 mt-2"
            >
              {isChangingPassword ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>

          {/* Active Sessions */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-xs">
            <span className="font-bold text-slate-700 block mb-2">Active Sessions</span>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Laptop className="w-4 h-4 text-slate-500" />
                <div>
                  <span className="font-semibold text-[#0B2545] block">Current Web Session</span>
                  <span className="text-[10px] text-slate-400">Windows &bull; Chrome &bull; Active Now</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Current
              </span>
            </div>
          </div>
        </div>

        {/* Notifications & Institutional Preferences Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Bell className="w-4 h-4 text-teal-600" />
              <h4 className="text-sm font-bold text-[#0B2545]">Notification Preferences</h4>
            </div>

            <div className="space-y-4 mt-4 text-xs">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="font-bold text-slate-800 block">Pending Issuer Applications</span>
                  <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                    Receive alert notifications when an academic officer submits an issuer registration application.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyApplications}
                  onChange={(e) => setNotifyApplications(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4 mt-0.5 cursor-pointer"
                />
              </div>

              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="font-bold text-slate-800 block">Certificate Revocation Requests</span>
                  <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                    Immediate notification when an authorized registrar requests a certificate revocation.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyRevocations}
                  onChange={(e) => setNotifyRevocations(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4 mt-0.5 cursor-pointer"
                />
              </div>

              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="font-bold text-slate-800 block">Blockchain Confirmations &amp; Failures</span>
                  <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                    Status updates when revocation transactions confirm or revert on Ethereum Sepolia.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyBlockchainEvents}
                  onChange={(e) => setNotifyBlockchainEvents(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4 mt-0.5 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <button
              onClick={onLogout}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition cursor-pointer"
            >
              Sign Out of Controller Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
