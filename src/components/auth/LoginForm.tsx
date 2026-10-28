'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, LogIn, ArrowRight } from 'lucide-react';
import { saveSessionUser } from '@/lib/authSession';
import {
  Card,
  CardBody,
  Field,
  Input,
  PasswordInput,
  Checkbox,
  Button,
  ButtonLink,
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'warning';
    title: string;
    message: string;
  } | null>(null);

  const [redirectDestination, setRedirectDestination] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFeedback(null);
    setRedirectDestination(null);

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
      setIsLoading(false);

      if (!res.ok) {
        if (data.isPending) {
          setFeedback({
            type: 'warning',
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
      let title = `Welcome, ${user.name}`;
      let message = 'Signing in to PUB CertChain secure workspace...';

      if (user.role === 'admin' || user.role === 'super_admin') {
        title = 'Welcome, Super Administrator';
        message = 'Super Admin privileges authenticated. Entering Command Dashboard...';
      } else if (user.role === 'controller') {
        title = 'Welcome, Controller of Examinations';
        message = 'Controller authority authenticated. Entering Controller Desk...';
      } else if (user.role === 'issuer') {
        title = 'Welcome, Authorized Registrar / Issuer';
        message = 'Issuer account verified. Redirecting to Registrar Issuance Portal...';
      } else if (user.role === 'student') {
        title = 'Welcome, Student';
        message = 'Student credentials validated. Entering Student Credential Vault...';
      }

      setFeedback({
        type: 'success',
        title,
        message,
      });

      setRedirectDestination(data.redirectUrl || '/');

      if (typeof window !== 'undefined' && data.redirectUrl) {
        setTimeout(() => {
          window.location.href = data.redirectUrl;
        }, 900);
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('Network error: Could not connect to authentication server.');
    }
  };

  return (
    <Card>
      <CardBody className="p-6 sm:p-8 space-y-5">
        <div>
          <p className="eyebrow">Institutional Sign In</p>
          <h2 className="font-serif text-2xl font-semibold text-ink mt-1">
            Access Your CertChain Workspace
          </h2>
          <p className="text-xs sm:text-[13.5px] text-muted mt-1">
            Enter your university email, Student ID, or Employee ID to continue.
          </p>
        </div>

        {errorMessage && (
          <Alert tone="danger" title="Sign-in failed">
            {errorMessage}
          </Alert>
        )}

        {feedback && (
          <Alert
            tone={feedback.type === 'warning' ? 'warning' : 'success'}
            title={feedback.title}
          >
            <p>{feedback.message}</p>
            {redirectDestination && (
              <div className="mt-2.5">
                <ButtonLink
                  href={redirectDestination}
                  variant="primary"
                  size="sm"
                  rightIcon={<ArrowRight />}
                >
                  Proceed to Workspace
                </ButtonLink>
              </div>
            )}
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
              leftIcon={<Mail />}
              placeholder="e.g. admin@pub.edu.bd or 0322410105101055"
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
                  className="text-xs font-medium text-brand hover:underline"
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
            loading={isLoading}
            loadingText="Authenticating..."
            leftIcon={<LogIn />}
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
              className="font-semibold text-brand hover:underline inline-flex items-center gap-1"
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
  );
};
