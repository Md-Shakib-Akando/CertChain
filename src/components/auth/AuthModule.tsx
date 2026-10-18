'use client';

import React, { useState } from 'react';
import { AuthLayout } from './AuthLayout';
import { LoginForm } from './LoginForm';
import { RegistrationCard } from './RegistrationCard';
import { ForgotPasswordForm } from './ForgotPasswordForm';

interface AuthModuleProps {
  initialMode?: 'login' | 'register';
}

export const AuthModule: React.FC<AuthModuleProps> = ({
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password'>(initialMode);

  return (
    <AuthLayout>
      {/* Top clean navigation pills between Sign In and Register */}
      {mode !== 'forgot-password' && (
        <div className="flex justify-center mb-6">
          <div className="bg-slate-200/80 p-1 rounded-xl inline-flex gap-1 shadow-inner">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === 'login'
                  ? 'bg-white text-[#2563EB] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === 'register'
                  ? 'bg-white text-[#2563EB] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>
      )}

      {/* Main Views */}
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
