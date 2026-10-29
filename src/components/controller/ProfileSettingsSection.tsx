'use client';

import React, { useState } from 'react';
import {
  Wallet,
  Laptop,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { ControllerProfileData } from '@/types/controller';
import {
  PageHeader,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Field,
  PasswordInput,
  Switch,
  Button,
  Badge,
  RoleBadge,
  HashText,
} from '@/components/ui';

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
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        eyebrow="Officer Identity & Security"
        title="Controller Profile & Security Controls"
        description="Manage your institutional identity, Web3 co-signature wallet binding, password, and notification preferences."
      />

      <Card>
        <CardBody className="space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-line">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-night text-seal border border-seal/40 flex items-center justify-center text-lg font-serif font-bold shrink-0">
                CO
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-serif font-semibold text-ink">{profile.name}</h3>
                  <RoleBadge role="controller" />
                </div>
                <p className="text-xs text-muted font-mono">{profile.email}</p>
                <p className="text-xs text-ink-2 font-medium">
                  {profile.designation} • {profile.department}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="eyebrow block">Institution</span>
              <span className="text-xs font-semibold text-ink block mt-0.5">
                {profile.university}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-brand" />
                  <span>Authorized Co-Signature Web3 Wallet</span>
                </h4>
                <p className="text-xs text-muted mt-0.5">
                  MetaMask address used to submit secondary cryptographic authorizations on Ethereum Sepolia.
                </p>
              </div>

              {walletAddress ? (
                <Button variant="danger-outline" size="xs" onClick={onDisconnectWallet}>
                  Disconnect Wallet
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="xs"
                  loading={isWalletConnecting}
                  leftIcon={<Wallet className="w-3.5 h-3.5" />}
                  onClick={onConnectWallet}
                >
                  Connect MetaMask
                </Button>
              )}
            </div>

            <div className="p-4 rounded-xl bg-canvas border border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="eyebrow block mb-1">Bound Wallet Address</span>
                {walletAddress ? (
                  <HashText value={walletAddress} start={12} end={8} />
                ) : (
                  <span className="font-mono text-muted">No wallet currently connected</span>
                )}
              </div>
              <div className="sm:text-right">
                <span className="eyebrow block mb-1">Target Network</span>
                <Badge tone="success" size="xs" dot>
                  Sepolia Testnet (11155111)
                </Badge>
              </div>
            </div>

            <p className="text-xs text-muted flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-brand" />
              <span>Never share your private keys or seed phrases with anyone.</span>
            </p>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <Card>
          <CardHeader
            eyebrow="Credential Rotation"
            title="Security & Password"
          />
          <CardBody className="space-y-4">
            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              <Field label="Current Password" required>
                <PasswordInput
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </Field>

              <Field label="New Password" required>
                <PasswordInput
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                />
              </Field>

              <Field label="Confirm New Password" required>
                <PasswordInput
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </Field>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                fullWidth
                loading={isChangingPassword}
              >
                Update Password
              </Button>
            </form>

            <div className="pt-4 border-t border-line space-y-2 text-xs">
              <span className="eyebrow block">Active Sessions</span>
              <div className="p-3 rounded-lg bg-canvas border border-line flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Laptop className="w-4 h-4 text-muted" />
                  <div>
                    <span className="font-semibold text-ink block">Current Web Session</span>
                    <span className="text-[11px] text-muted">Authenticated • Active Now</span>
                  </div>
                </div>
                <Badge tone="success" size="xs">
                  Current
                </Badge>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            eyebrow="Alert Routing"
            title="Notification Preferences"
          />
          <CardBody className="space-y-4">
            <Switch
              checked={notifyApplications}
              onChange={setNotifyApplications}
              label="Pending Issuer Applications"
              description="Receive alert notifications when an academic officer submits an issuer registration application."
            />

            <Switch
              checked={notifyRevocations}
              onChange={setNotifyRevocations}
              label="Certificate Revocation Requests"
              description="Immediate notification when an authorized registrar requests a certificate revocation."
            />

            <Switch
              checked={notifyBlockchainEvents}
              onChange={setNotifyBlockchainEvents}
              label="Blockchain Confirmations & Failures"
              description="Status updates when revocation transactions confirm or revert on Ethereum Sepolia."
            />
          </CardBody>
          <CardFooter>
            <Button
              variant="danger-outline"
              size="sm"
              fullWidth
              leftIcon={<LogOut className="w-4 h-4" />}
              onClick={onLogout}
            >
              Sign Out of Controller Session
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
