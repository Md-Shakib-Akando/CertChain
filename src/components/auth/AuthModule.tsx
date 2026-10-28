'use client';

import React, { useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { LoginForm } from './LoginForm';
import { RegistrationCard } from './RegistrationCard';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { Segmented } from '@/components/ui';

interface AuthModuleProps {
  initialMode?: 'login' | 'register';
}

export const AuthModule: React.FC<AuthModuleProps> = ({
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password'>(initialMode);

  return (
    <AuthLayout>
      {mode !== 'forgot-password' && (
        <div className="mb-6 flex justify-center">
          <div className="w-full max-w-xs">
            <Segmented
              fullWidth
              ariaLabel="Authentication mode"
              value={mode}
              onChange={(m) => setMode(m as 'login' | 'register')}
              items={[
                { key: 'login', label: 'Sign In', icon: <LogIn className="size-3.5" /> },
                { key: 'register', label: 'Create Account', icon: <UserPlus className="size-3.5" /> },
              ]}
            />
          </div>
        </div>
      )}

      {mode === 'login' && (
        <LoginForm
          onGoToRegister={() => setMode('register')}
          onGoToForgotPassword={() => setMode('forgot-password')}
        />
      )}

      {mode === 'register' && (
        <RegistrationCard onGoToLogin={() => setMode('login')} />
      )}

      {mode === 'forgot-password' && (
        <ForgotPasswordForm onGoToLogin={() => setMode('login')} />
      )}
    </AuthLayout>
  );
};
