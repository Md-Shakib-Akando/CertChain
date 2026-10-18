'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'warning';
    title: string;
    message: string;
  } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFeedback(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your university email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email format (e.g. name@pub.edu).');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const cleanEmail = email.trim().toLowerCase();

      if (cleanEmail.includes('pending')) {
        setFeedback({
          type: 'warning',
          title: 'Access Request Pending',
          message: 'Your staff account is awaiting approval by the Controller of Examinations. Request Reference: REQ-PUB-2026-8942.',
        });
      } else if (cleanEmail.includes('student')) {
        setFeedback({
          type: 'success',
          title: 'Welcome, Student',
          message: 'Successfully verified student credentials. Entering academic portal...',
        });
      } else if (cleanEmail.includes('issuer') || cleanEmail.includes('staff')) {
        setFeedback({
          type: 'success',
          title: 'Welcome, Authorized Staff',
          message: 'Authorized university staff validated. Directing to Certificate Issuance Desk...',
        });
      } else if (cleanEmail.includes('controller') || cleanEmail.includes('admin')) {
        setFeedback({
          type: 'success',
          title: 'Welcome, Controller of Examinations',
          message: 'Controller administrative privileges authenticated with smart contract key.',
        });
      } else {
        setFeedback({
          type: 'success',
          title: 'Authentication Successful',
          message: 'Signing in to PUB CertChain secure network...',
        });
      }
    }, 700);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-6 sm:p-10 transition-all">
      {/* Title */}
      <div className="space-y-2 mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#172033]">
          Welcome Back
        </h2>
        <p className="text-xs sm:text-sm text-[#64748B]">
          Sign in to access your CertChain account.
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-xs sm:text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`mb-5 p-4 rounded-xl border flex items-start gap-3 text-xs sm:text-sm ${
            feedback.type === 'warning'
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-emerald-50 border-emerald-300 text-emerald-900'
          }`}
        >
          {feedback.type === 'warning' ? (
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-bold">{feedback.title}</p>
            <p className="text-xs opacity-90 leading-relaxed mt-0.5">{feedback.message}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="login-email" className="block text-xs font-semibold text-[#172033]">
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="e.g. username@pub.edu"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 bg-white text-[#172033] text-sm placeholder:text-slate-400 transition-all outline-none"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className="block text-xs font-semibold text-[#172033]">
              Password <span className="text-red-500">*</span>
            </label>
            {onGoToForgotPassword ? (
              <button
                type="button"
                onClick={onGoToForgotPassword}
                className="text-xs font-medium text-[#2563EB] hover:text-blue-700 hover:underline transition-colors"
              >
                Forgot Password?
              </button>
            ) : (
              <span className="text-xs font-medium text-[#2563EB] cursor-pointer hover:underline">
                Forgot Password?
              </span>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-300 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 bg-white text-[#172033] text-sm placeholder:text-slate-400 transition-all outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
            />
            <span className="text-xs text-[#64748B]">Remember me on this trusted device</span>
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-4 rounded-xl bg-[#2563EB] hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying Credentials...</span>
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </>
          )}
        </button>
      </form>

      {/* Link to Register */}
      <div className="mt-8 pt-6 border-t border-slate-100 text-center">
        <p className="text-xs text-[#64748B]">
          Don&lsquo;t have an account?{' '}
          {onGoToRegister ? (
            <button
              type="button"
              onClick={onGoToRegister}
              className="font-bold text-[#2563EB] hover:text-blue-700 hover:underline transition-colors inline-flex items-center gap-1"
            >
              <span>Register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <Link
              href="/register"
              className="font-bold text-[#2563EB] hover:text-blue-700 hover:underline transition-colors inline-flex items-center gap-1"
            >
              <span>Register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </p>
      </div>
    </div>
  );
};
