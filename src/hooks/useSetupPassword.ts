'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SetupPasswordInvitedUser, UseSetupPasswordReturn } from '@/types/auth';

export function useSetupPassword(): UseSetupPasswordReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isValidating, setIsValidating] = useState<boolean>(true);
  const [isValidToken, setIsValidToken] = useState<boolean>(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [invitedUser, setInvitedUser] = useState<SetupPasswordInvitedUser | null>(null);

  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Validate token on mount
  useEffect(() => {
    let ignore = false;

    async function validateToken() {
      if (!token) {
        if (!ignore) {
          setIsValidating(false);
          setIsValidToken(false);
          setTokenError('No invitation token was provided in the URL. Please verify your invitation link.');
        }
        return;
      }

      try {
        const res = await fetch(`/api/auth/setup-password?token=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (ignore) return;

        if (!res.ok || !data.success) {
          setIsValidToken(false);
          setTokenError(data.error || 'This invitation link is invalid or has expired.');
        } else {
          setIsValidToken(true);
          setInvitedUser(data.user);
        }
      } catch (err) {
        if (!ignore) {
          console.error('Failed to validate token:', err);
          setIsValidToken(false);
          setTokenError('Network error while validating invitation token.');
        }
      } finally {
        if (!ignore) {
          setIsValidating(false);
        }
      }
    }

    validateToken();

    return () => {
      ignore = true;
    };
  }, [token]);

  // Dynamic password strength evaluation
  const passwordStrength = useMemo(() => {
    return {
      hasLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
    };
  }, [password]);

  // Form submission handler
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitError(null);

      if (!token) {
        setSubmitError('Missing invitation token.');
        return;
      }

      if (password.length < 8) {
        setSubmitError('Password must be at least 8 characters long.');
        return;
      }

      if (password !== confirmPassword) {
        setSubmitError('Passwords do not match. Please re-enter.');
        return;
      }

      try {
        setIsSubmitting(true);
        const res = await fetch('/api/auth/setup-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, password }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          setSubmitError(data.error || 'Failed to configure password.');
          return;
        }

        setIsSuccess(true);

        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } catch (err) {
        console.error('Password setup error:', err);
        setSubmitError('Network error while saving master password.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [token, password, confirmPassword, router]
  );

  return {
    token,
    isValidating,
    isValidToken,
    tokenError,
    invitedUser,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    isSubmitting,
    submitError,
    isSuccess,
    handleSubmit,
    passwordStrength,
  };
}
