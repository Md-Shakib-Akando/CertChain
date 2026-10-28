'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, LogIn, ArrowRight, Loader2, CheckCircle2, X } from 'lucide-react';
import { saveSessionUser, SESSION_EVENT_NAME } from '@/lib/authSession';
import {
  Card,
  CardBody,
  Field,
  Input,
  PasswordInput,
  Checkbox,
  Button,
  Alert,
} from '@/components/ui';

interface LoginFormProps {
  onGoToRegister?: () => void;
  onGoToForgotPassword?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onGoToRegister,
  onGoToForgotPassword,
}) => {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingWarning, setPendingWarning] = useState<{
    title: string;
    message: string;
  } | null>(null);
  const [toast, setToast] = useState<{
    title: string;
    message: string;
  } | null>(null);

  // Listen for logout or session changes across the app to ensure form is completely reset
  useEffect(() => {
    const handleSessionChange = () => {
      setIsLoading(false);
      setPassword('');
      setErrorMessage(null);
      setPendingWarning(null);
    };
    window.addEventListener(SESSION_EVENT_NAME, handleSessionChange);
    return () => {
      window.removeEventListener(SESSION_EVENT_NAME, handleSessionChange);
    };
  }, []);

  // Auto-dismiss toast in exactly 1 second (1000ms)
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setPendingWarning(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your Email Address, Student ID, or Staff ID.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setIsLoading(false);
        if (data.isPending) {
          setPendingWarning({
            title: 'Access Request Pending',
            message:
              data.error ||
              'Your staff account is awaiting approval by the Controller of Examinations.',
          });
        } else {
          setErrorMessage(data.error || 'Login failed. Please check your credentials.');
        }
        return;
      }

      const user = data.user;
      saveSessionUser(user);
      let title = 'Login Successful';
      let message = `Welcome back, ${user.name || 'User'}!`;

      if (user.role === 'admin' || user.role === 'super_admin') {
        title = 'Login Successful';
        message = 'Welcome back, Super Administrator!';
      } else if (user.role === 'controller') {
        title = 'Login Successful';
        message = 'Welcome back, Controller!';
      } else if (user.role === 'issuer') {
        title = 'Login Successful';
        message = 'Welcome back, Authorized Staff!';
      } else if (user.role === 'student') {
        title = 'Login Successful';
        message = `Welcome back, ${user.name || 'Student'}!`;
      }

      // Show top-right success toast styled with test branch night colors
      setToast({
        title,
        message,
      });

      // Clear loading state and password so if user logs out later, the login page is clean and ready
      setIsLoading(false);
      setPassword('');

      const destination = data.redirectUrl || '/';

      // Toast disappears and page redirects in exactly 1 second (1000ms)
      setTimeout(() => {
        setToast(null);
        router.push(destination);
      }, 1000);
    } catch {
      setIsLoading(false);
      setErrorMessage('Network error: Could not connect to authentication server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Top-Right Login Success Toast Notification (Night Theme) */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-5 right-5 sm:top-6 sm:right-6 z-50 max-w-sm sm:max-w-md w-[calc(100%-2.5rem)] sm:w-auto animate-fade-in pointer-events-auto"
        >
          <div className="bg-night text-night-text px-4 py-3.5 rounded-xl shadow-overlay border border-night-line flex items-start gap-3 backdrop-blur-md">
            <div className="size-7 rounded-full bg-success/20 text-success inline-flex items-center justify-center shrink-0 mt-0.5 border border-success/30">
              <CheckCircle2 className="size-4" />
            </div>
            <div className="flex-1 min-w-0 pr-1">
              <p className="text-xs font-semibold text-night-text tracking-tight">{toast.title}</p>
              <p className="text-[11.5px] text-night-muted mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="Close notification"
              className="text-night-muted hover:text-night-text p-1 rounded-md hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      <Card>
        <CardBody className="p-6 sm:p-8 space-y-5">
          <div>
            <p className="eyebrow">Institutional Sign In</p>
            <h2 className="font-serif text-2xl font-semibold text-ink mt-1">
              Welcome Back
            </h2>
            <p className="text-xs sm:text-[13.5px] text-muted mt-1">
              Sign in to access your CertChain workspace.
            </p>
          </div>

          {errorMessage && (
            <Alert tone="danger" title="Sign-in failed">
              {errorMessage}
            </Alert>
          )}

          {pendingWarning && (
            <Alert tone="warning" title={pendingWarning.title}>
              {pendingWarning.message}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Field
              label="Email Address or Student / Staff ID"
              required
              id="login-email"
            >
              <Input
                id="login-email"
                type="text"
                autoComplete="username"
                leftIcon={<Mail className="size-4" />}
                placeholder="e.g. name@pub.ac.bd or Student ID (0322410105101055)"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
              />
            </Field>

            <Field
              label="Password"
              required
              id="login-password"
              labelAside={
                onGoToForgotPassword ? (
                  <button
                    type="button"
                    onClick={onGoToForgotPassword}
                    className="text-xs font-medium text-brand hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                ) : undefined
              }
            >
              <PasswordInput
                id="login-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
              />
            </Field>

            <Checkbox
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              label="Keep me signed in on this trusted workstation"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isLoading}
              leftIcon={
                isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <LogIn className="size-4" />
                )
              }
              className="cursor-pointer"
            >
              Sign In
            </Button>
          </form>

          <div className="pt-4 border-t border-line text-center text-xs text-muted">
            Don&apos;t have an account yet?{' '}
            {onGoToRegister ? (
              <button
                type="button"
                onClick={onGoToRegister}
                className="font-semibold text-brand hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Create an account</span>
                <ArrowRight className="size-3" />
              </button>
            ) : (
              <Link
                href="/register"
                className="font-semibold text-brand hover:underline inline-flex items-center gap-1"
              >
                <span>Create an account</span>
                <ArrowRight className="size-3" />
              </Link>
            )}
          </div>
        </CardBody>
      </Card>
    </>
  );
};
