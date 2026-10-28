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
        <div className="mb-5">
          <Segmented
            fullWidth
            ariaLabel="Authentication mode"
            value={mode}
            onChange={(m) => setMode(m)}
            items={[
              { key: 'login', label: 'Sign In', icon: <LogIn /> },
              { key: 'register', label: 'Create Account', icon: <UserPlus /> },
            ]}
          />
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
