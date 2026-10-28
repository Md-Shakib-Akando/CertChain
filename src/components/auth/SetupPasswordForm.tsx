'use client';

import React from 'react';
import { Lock, CheckCircle2, ArrowRight, UserCheck, Building } from 'lucide-react';
import { useSetupPassword } from '@/hooks/useSetupPassword';
import { AuthLayout } from './AuthLayout';
import {
  Card,
  CardBody,
  Field,
  PasswordInput,
  Button,
  ButtonLink,
  Alert,
  RoleBadge,
  Spinner,
} from '@/components/ui';

export const SetupPasswordForm: React.FC = () => {
  const {
    isValidating,
    isValidToken,
    tokenError,
    invitedUser,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    isSubmitting,
    submitError,
    isSuccess,
    handleSubmit,
    passwordStrength,
  } = useSetupPassword();

  return (
    <AuthLayout>
      <Card>
        <CardBody className="p-6 sm:p-8 space-y-6">
          {/* State 1: Validating Token */}
          {isValidating && (
            <div className="py-10 text-center space-y-3">
              <Spinner className="size-7 text-brand mx-auto" />
              <div className="space-y-1">
                <h2 className="font-serif text-lg font-semibold text-ink">
                  Validating Invitation Token
                </h2>
                <p className="text-xs text-muted">
                  Verifying your cryptographically signed Controller activation token...
                </p>
              </div>
            </div>
          )}

          {/* State 2: Invalid or Expired Token */}
          {!isValidating && !isValidToken && (
            <div className="space-y-5">
              <div>
                <p className="eyebrow">Invitation Status</p>
                <h2 className="font-serif text-2xl font-semibold text-ink mt-1">
                  Activation Link Unavailable
                </h2>
              </div>
              <Alert tone="danger" title="Invalid or expired token">
                {tokenError ||
                  'This invitation link is invalid, has expired, or has already been used to activate an account.'}
              </Alert>
              <ButtonLink
                href="/login"
                variant="primary"
                fullWidth
                rightIcon={<ArrowRight />}
              >
                Return to Sign In
              </ButtonLink>
            </div>
          )}

          {/* State 3: Setup Success */}
          {!isValidating && isValidToken && isSuccess && (
            <div className="py-4 space-y-5 text-center">
              <div className="size-12 rounded-full bg-success-soft text-success border border-success-line flex items-center justify-center mx-auto">
                <CheckCircle2 className="size-6" />
              </div>
              <div className="space-y-1.5">
                <h2 className="font-serif text-2xl font-semibold text-ink">
                  Master Password Activated
                </h2>
                <p className="text-sm text-muted">
                  Your Controller of Examinations account has been activated. Redirecting to sign in...
                </p>
              </div>
              <ButtonLink href="/login" variant="primary" fullWidth>
                Proceed to Sign In
              </ButtonLink>
            </div>
          )}

          {/* State 4: Interactive Setup Password Form */}
          {!isValidating && isValidToken && !isSuccess && (
            <>
              <div>
                <p className="eyebrow">Authority Onboarding</p>
                <h2 className="font-serif text-2xl font-semibold text-ink mt-1">
                  Configure Master Password
                </h2>
                <p className="text-xs sm:text-[13.5px] text-muted mt-1">
                  Establish your confidential password to activate your Controller of Examinations desk.
                </p>
              </div>

              {invitedUser && (
                <div className="rounded-lg bg-sunken border border-line p-4 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold uppercase tracking-wider text-muted text-[11px]">
                      Invited Official
                    </span>
                    <RoleBadge role={invitedUser.role || 'controller'} size="sm" />
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="size-8 rounded bg-brand text-white font-semibold text-xs inline-flex items-center justify-center shrink-0">
                      {invitedUser.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink truncate flex items-center gap-1.5">
                        <UserCheck className="size-3.5 text-brand" />
                        <span>{invitedUser.name}</span>
                      </p>
                      <p className="text-xs text-muted truncate">{invitedUser.email}</p>
                    </div>
                  </div>
                  {invitedUser.department && (
                    <div className="pt-2 border-t border-line flex items-center gap-1.5 text-muted">
                      <Building className="size-3.5 shrink-0" />
                      <span>{invitedUser.department}</span>
                    </div>
                  )}
                </div>
              )}

              {submitError && <Alert tone="danger">{submitError}</Alert>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Field label="New Master Password" required>
                  <PasswordInput
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                  />
                </Field>

                <Field label="Confirm Master Password" required>
                  <PasswordInput
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter master password"
                  />
                </Field>

                <div className="rounded-md bg-sunken border border-line p-3 space-y-1.5 text-xs">
                  <p className="font-semibold text-ink-2">Password Requirements:</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    <span className={passwordStrength.hasLength ? 'text-success font-medium' : 'text-muted'}>
                      &bull; 8+ characters
                    </span>
                    <span className={passwordStrength.hasUpper ? 'text-success font-medium' : 'text-muted'}>
                      &bull; Uppercase letter
                    </span>
                    <span className={passwordStrength.hasLower ? 'text-success font-medium' : 'text-muted'}>
                      &bull; Lowercase letter
                    </span>
                    <span className={passwordStrength.hasNumber ? 'text-success font-medium' : 'text-muted'}>
                      &bull; Number (0–9)
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={isSubmitting}
                  loadingText="Sealing credentials..."
                  disabled={!passwordStrength.hasLength}
                  leftIcon={<Lock />}
                >
                  Activate Account &amp; Save Password
                </Button>
              </form>
            </>
          )}
        </CardBody>
      </Card>
    </AuthLayout>
  );
};
