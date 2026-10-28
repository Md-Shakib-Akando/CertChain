'use client';

import React, { useState } from 'react';
import { Mail, KeyRound, ArrowLeft } from 'lucide-react';
import { Card, CardBody, Field, Input, Button, Alert } from '@/components/ui';

interface ForgotPasswordFormProps {
  onGoToLogin: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onGoToLogin,
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your university email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid university email format.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <Card>
      <CardBody className="p-6 sm:p-8 space-y-5">
        <div>
          <p className="eyebrow">Account Recovery</p>
          <h2 className="font-serif text-2xl font-semibold text-ink mt-1">
            Reset Your Password
          </h2>
          <p className="text-xs sm:text-[13.5px] text-muted mt-1">
            Enter your registered university email address to receive a one-time recovery link.
          </p>
        </div>

        {isSubmitted ? (
          <div className="space-y-5">
            <Alert tone="success" title="Recovery instructions dispatched">
              <p>
                If an active account is associated with{' '}
                <strong className="font-semibold text-ink">{email}</strong>, a time-limited recovery link has been sent to that inbox.
              </p>
              <p className="text-xs text-muted mt-1">
                Recovery tokens expire after 15 minutes and can only be used once.
              </p>
            </Alert>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={onGoToLogin}
              leftIcon={<ArrowLeft />}
            >
              Return to Sign In
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {errorMessage && <Alert tone="danger">{errorMessage}</Alert>}

            <Field
              label="Registered University Email"
              required
              id="forgot-email"
              hint="Must match the email address on your student or staff profile."
            >
              <Input
                id="forgot-email"
                type="email"
                leftIcon={<Mail />}
                placeholder="e.g. name@pub.edu.bd"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
              />
            </Field>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              loadingText="Sending recovery link..."
              leftIcon={<KeyRound />}
            >
              Send Recovery Link
            </Button>

            <div className="pt-3 border-t border-line text-center">
              <button
                type="button"
                onClick={onGoToLogin}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
              >
                <ArrowLeft className="size-3.5" />
                <span>Back to Sign In</span>
              </button>
            </div>
          </form>
        )}
      </CardBody>
    </Card>
  );
};
