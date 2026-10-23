'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  UserCheck,
  Building,
  ArrowRight,
} from 'lucide-react';
import { useSetupPassword } from '@/hooks/useSetupPassword';

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
    showPassword,
    setShowPassword,
    isSubmitting,
    submitError,
    isSuccess,
    handleSubmit,
    passwordStrength,
  } = useSetupPassword();

  return (
    <div className="min-h-screen bg-[#0A1628] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.15),rgba(255,255,255,0))] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">PUB CertChain</span>
          </Link>
          <p className="text-xs text-slate-400">
            Primeasia University &bull; Institutional Credential Network
          </p>
        </div>

        {/* State 1: Validating Token */}
        {isValidating && (
          <div className="bg-[#0F1E36] border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-white">Validating Invitation</h3>
              <p className="text-xs text-slate-400">Verifying your cryptographically signed activation token...</p>
            </div>
          </div>
        )}

        {/* State 2: Invalid or Expired Token */}
        {!isValidating && !isValidToken && (
          <div className="bg-[#0F1E36] border border-red-900/50 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-white">Invitation Unavailable</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {tokenError || 'This activation link is invalid, has expired, or has already been completed.'}
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/login"
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <span>Return to Login</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* State 3: Setup Success */}
        {!isValidating && isValidToken && isSuccess && (
          <div className="bg-[#0F1E36] border border-emerald-800/50 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Master Password Activated!</h3>
              <p className="text-xs text-slate-300">
                Your Controller of Examinations credentials have been cryptographically sealed.
              </p>
              <p className="text-xs text-emerald-400 font-medium">
                Redirecting to secure Controller Desk sign in...
              </p>
            </div>
          </div>
        )}

        {/* State 4: Interactive Setup Password Form */}
        {!isValidating && isValidToken && !isSuccess && (
          <div className="bg-[#0F1E36] border border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
            {/* Form Title & Target User Badge */}
            <div className="space-y-3">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-400" />
                  <span>Configure  Password</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Establish your confidential password to claim your academic authority desk.
                </p>
              </div>

              {/* Invited Profile Info Box */}
              {invitedUser && (
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Authorized Account
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 text-[10px] font-bold">
                      CONTROLLER
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {invitedUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                        <span>{invitedUser.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">{invitedUser.email}</div>
                    </div>
                  </div>
                  <div className="pt-1 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center gap-1">
                    <Building className="w-3 h-3 text-slate-500" />
                    <span>{invitedUser.department}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {submitError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  New  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create strong password"
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Confirm  Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter master password"
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Password Requirements Checklist */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5 text-[11px]">
                <div className="text-slate-400 font-semibold mb-1">Password Requirements:</div>
                <div className="grid grid-cols-2 gap-1.5">
                  <span
                    className={`flex items-center gap-1.5 ${
                      passwordStrength.hasLength ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    <span className="text-[10px]">&bull;</span> At least 8 characters
                  </span>
                  <span
                    className={`flex items-center gap-1.5 ${
                      passwordStrength.hasUpper ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    <span className="text-[10px]">&bull;</span> Uppercase letter
                  </span>
                  <span
                    className={`flex items-center gap-1.5 ${
                      passwordStrength.hasLower ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    <span className="text-[10px]">&bull;</span> Lowercase letter
                  </span>
                  <span
                    className={`flex items-center gap-1.5 ${
                      passwordStrength.hasNumber ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    <span className="text-[10px]">&bull;</span> Number (0-9)
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !passwordStrength.hasLength}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-blue-600/30 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sealing Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Activate Account &amp; Save Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
