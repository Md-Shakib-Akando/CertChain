'use client';

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Building2,
  User,
  Mail,
  BadgeCheck,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  
  CheckCircle2,
  Layers,
  KeyRound,
  ArrowLeft,
  RefreshCw,
  X,
} from 'lucide-react';
import { MetaMaskIssuerConnect } from './MetaMaskIssuerConnect';
import {
  Card,
  CardBody,
  Segmented,
  Stepper,
  Field,
  Input,
  PasswordInput,
  Select,
  Checkbox,
  Button,
  Alert,
  StatusBadge,
  HashText,
  DescriptionList,
  StateToast,
} from '@/components/ui';

interface RegistrationCardProps {
  onGoToLogin: () => void;
}

export const RegistrationCard: React.FC<RegistrationCardProps> = ({
  onGoToLogin,
}) => {
  const [selectedRole, setSelectedRole] = useState<'student' | 'staff'>('student');

  // Student fields
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [studentDepartment, setStudentDepartment] = useState('CSE');
  const [studentBatch, setStudentBatch] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [studentConfirmPassword, setStudentConfirmPassword] = useState('');
  const [studentAgreeTerms, setStudentAgreeTerms] = useState(false);

  // Student OTP Verification Step (Brevo Integration)
  const [studentStep, setStudentStep] = useState<'form' | 'otp'>('form');
  const [otpCode, setOtpCode] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Floating Toast state (Matching LoginForm)
  const [toast, setToast] = useState<{
    title?: string;
    message: string;
    type: 'error' | 'success';
  } | null>(null);

  const showToast = (message: string, type: 'error' | 'success' = 'error', title?: string) => {
    setToast({ message, type, title });
    const duration = type === 'success' ? 1000 : 3000;
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, duration);
  };

  // Staff fields
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffId, setStaffId] = useState('');
  const [staffDepartment, setStaffDepartment] = useState('Office of the Controller of Examinations');
  const [staffDesignation, setStaffDesignation] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffConfirmPassword, setStaffConfirmPassword] = useState('');
  const [staffWallet, setStaffWallet] = useState('');
  const [staffSignature, setStaffSignature] = useState('');
  const [isStaffWalletVerified, setIsStaffWalletVerified] = useState(false);

  // Status & feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);


  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const hasMinLength = studentPassword.length >= 8;
  const hasMixed = /[a-z]/.test(studentPassword) && /[A-Z]/.test(studentPassword);
  const hasNumber = /\d/.test(studentPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(studentPassword);

  let strengthScore = 0;
  if (hasMinLength) strengthScore++;
  if (hasMixed) strengthScore++;
  if (hasNumber) strengthScore++;
  if (hasSpecial) strengthScore++;

  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-danger', 'bg-warning', 'bg-brand', 'bg-success'];

  // Step 1: Send OTP to university email via Brevo and verify against student-record
  const handleStudentSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!studentName.trim()) {
      showToast('Full name is required.', 'error');
      return;
    }
    if (!studentId.trim()) {
      showToast('Student ID is required.', 'error');
      return;
    }
    if (!studentDepartment.trim()) {
      showToast('Department is required.', 'error');
      return;
    }
    if (!studentBatch.trim()) {
      showToast('Batch is required.', 'error');
      return;
    }
    if (!studentEmail.trim()) {
      showToast('Student email is required.', 'error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentEmail.trim())) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    if (!studentPassword || studentPassword.length < 8) {
      showToast('Password must be at least 8 characters long.', 'error');
      return;
    }
    if (studentPassword !== studentConfirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }
    if (!studentAgreeTerms) {
      showToast('You must agree to the Terms of Service.', 'error');
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await fetch('/api/auth/register-student/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: studentName.trim(),
          studentId: studentId.trim(),
          department: studentDepartment.trim(),
          batch: studentBatch.trim(),
          email: studentEmail.trim(),
        }),
      });

      const data = await res.json();
      setIsSendingOtp(false);

      if (!res.ok) {
        if (data.error === 'Invalid Student' || res.status === 403) {
          showToast('Invalid Student: Record did not match official admission registry.', 'error');
        } else {
          showToast(data.error || 'Invalid Student', 'error');
        }
        return;
      }

      setStudentStep('otp');
      setResendCooldown(60);
      showToast(`Verification code sent to ${studentEmail.trim()}`, 'success', 'Verification Code Sent');
    } catch {
      setIsSendingOtp(false);
      showToast('Network error: Could not connect to verification server.', 'error');
    }
  };

  // Step 2: Verify OTP and finalize student account creation
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      showToast('Please enter the 6-digit OTP code sent to your email.', 'error');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const res = await fetch('/api/auth/register-student/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: studentName.trim(),
          studentId: studentId.trim(),
          department: studentDepartment.trim(),
          batch: studentBatch.trim(),
          email: studentEmail.trim(),
          otp: otpCode.trim(),
          password: studentPassword,
        }),
      });

      const data = await res.json();
      setIsVerifyingOtp(false);

      if (!res.ok) {
        if (data.error === 'Invalid Student' || res.status === 403) {
          showToast('Invalid Student', 'error');
        } else {
          showToast(data.error || 'Invalid or expired OTP code.', 'error');
        }
        return;
      }

      // Successful registration: Show toast and redirect to login in 1s without card success view
      showToast('Account registered successfully! Redirecting to login...', 'success', 'Registration Successful');
      setTimeout(() => {
        setToast(null);
        if (onGoToLogin) {
          onGoToLogin();
        }
      }, 1000);
    } catch {
      setIsVerifyingOtp(false);
      showToast('Network error: Could not complete registration.', 'error');
    }
  };

  // Handle Staff Submit (Real MongoDB API + MetaMask)
  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!staffName.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }
    if (!staffEmail.trim()) {
      setErrorMessage('Official university email is required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(staffEmail.trim())) {
      setErrorMessage('Please enter a valid university email format.');
      return;
    }
    if (!staffId.trim()) {
      setErrorMessage('Staff ID / Employee ID is required.');
      return;
    }
    if (!staffDepartment.trim()) {
      setErrorMessage('Department is required.');
      return;
    }
    if (!staffDesignation.trim()) {
      setErrorMessage('Designation is required.');
      return;
    }
    if (!staffPassword) {
      setErrorMessage('Password is required.');
      return;
    }
    if (staffPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }
    if (staffPassword !== staffConfirmPassword) {
      setErrorMessage('Password and Confirm Password do not match.');
      return;
    }
    if (!staffWallet.trim()) {
      setErrorMessage(
        'Connecting a MetaMask wallet is required for Issuer Registration so the Controller can authorize your address on the Smart Contract.'
      );
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register-issuer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: staffName.trim(),
          email: staffEmail.trim(),
          employeeId: staffId.trim(),
          department: staffDepartment,
          designation: staffDesignation,
          walletAddress: staffWallet.trim(),
          signature: staffSignature,
          isWalletVerified: isStaffWalletVerified,
          password: staffPassword,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        setErrorMessage(result.error || 'Failed to submit staff access request.');
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      // Successful staff request: Show toast and redirect to login in 1s without card success view
      showToast('Issuer access request submitted! Redirecting to login...', 'success', 'Request Submitted');
      setTimeout(() => {
        setToast(null);
        if (onGoToLogin) {
          onGoToLogin();
        }
      }, 1000);
    } catch {
      setIsLoading(false);
      setErrorMessage('Network error: Could not connect to the registration server.');
    }
  };

  return (
    <>
      {/* Top-Right Modern Toast Notification (Matching LoginForm) */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-5 right-5 sm:top-6 sm:right-6 z-50 max-w-sm sm:max-w-md w-[calc(100%-2.5rem)] sm:w-auto animate-in fade-in slide-in-from-top-3 duration-200 pointer-events-auto"
        >
          <div
            className={`px-4 py-3.5 rounded-2xl shadow-2xl border flex items-start gap-3 backdrop-blur-md text-white ${
              toast.type === 'error'
                ? 'bg-[#1E112A] border-rose-500/40'
                : 'bg-[#0B2545] border-emerald-500/40'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                toast.type === 'error'
                  ? 'bg-rose-500/20 text-rose-400'
                  : 'bg-emerald-500/20 text-emerald-400'
              }`}
            >
              {toast.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-rose-400" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              )}
            </div>
            <div className="flex-1 min-w-0 pr-1">
              {toast.title && (
                <p className="text-sm font-bold text-white tracking-tight">{toast.title}</p>
              )}
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="Close notification"
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-6 sm:p-10 transition-all">
      {/* Title */}
      <div className="space-y-1.5 mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#172033]">
          Create an Account
        </h2>
        <p className="text-xs sm:text-sm text-[#64748B]">
          Choose registration type: Student or University Staff.
        </p>
      </div>

      {/* Two Option Tabs: Student vs Staff */}
      <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-xl mb-6">
        <button
          type="button"
          onClick={() => {
            setSelectedRole('student');
            setErrorMessage(null);
          }}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg text-xs font-bold transition-all ${
            selectedRole === 'student'
              ? 'bg-white text-[#2563EB] shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Student Registration</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedRole('staff');
            setErrorMessage(null);
          }}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg text-xs font-bold transition-all ${
            selectedRole === 'staff'
              ? 'bg-white text-[#06B6D4] shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Staff Access</span>
        </button>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-xs sm:text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      {/* FORM 1: STUDENT REGISTRATION (2-STEP: RECORD MATCH + BREVO OTP) */}
      {selectedRole === 'student' && studentStep === 'form' && (
        <form onSubmit={handleStudentSendOtp} className="space-y-4">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Step 1: Student Information
            </span>
           
          </div>

          

          <Segmented
            fullWidth
            ariaLabel="Registration account type"
            value={selectedRole}
            onChange={(r) => {
              setSelectedRole(r);
              setErrorMessage(null);
            }}
            items={[
              { key: 'student', label: 'Student Registration', icon: <GraduationCap /> },
              { key: 'staff', label: 'Staff / Issuer Access', icon: <Building2 /> },
            ]}
          />

          {errorMessage && (
            <Alert tone="danger" title="Validation error">
              {errorMessage}
            </Alert>
          )}

          {/* STUDENT REGISTRATION */}
          {selectedRole === 'student' && (
            <div className="space-y-5">
              <Stepper
                current={studentStep === 'form' ? 0 : 1}
                steps={[
                  { label: 'Academic Record Match', description: 'Verify admission details' },
                  { label: 'Email OTP Confirmation', description: '6-digit Brevo code' },
                ]}
              />

              {studentStep === 'form' ? (
                <form onSubmit={handleStudentSendOtp} className="space-y-4" noValidate>
                  <Alert tone="info" title="Official Student Record Matching">
                    Your Name, Student ID, Department, Batch, and Email are checked against the university&apos;s pre-seeded academic registry before sending an email OTP.
                  </Alert>

                  <Field
                    label="Full Name"
                    required
                    hint="Must match your university admission documents."
                  >
                    <Input
                      type="text"
                      leftIcon={<User />}
                      placeholder="e.g. Md. Shakib Akando"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                    />
                  </Field>

                  <Field label="Student ID / Registration Number" required>
                    <Input
                      type="text"
                      mono
                      leftIcon={<GraduationCap />}
                      placeholder="e.g. 0322410105101055"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                    />
                  </Field>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <Field label="Department" required>
                      <Select
                        value={studentDepartment}
                        onChange={(e) => setStudentDepartment(e.target.value)}
                      >
                        <option value="CSE">Computer Science &amp; Engineering (CSE)</option>
                        <option value="EEE">Electrical &amp; Electronic Engineering (EEE)</option>
                        <option value="BBA">Business Administration (BBA)</option>
                        <option value="English">English</option>
                        <option value="Law">Law</option>
                      </Select>
                    </Field>

                    <Field label="Batch" required>
                      <Input
                        type="text"
                        leftIcon={<Layers />}
                        placeholder="e.g. 24 or 24th Batch"
                        value={studentBatch}
                        onChange={(e) => setStudentBatch(e.target.value)}
                      />
                    </Field>
                  </div>

                  <Field
                    label="Student Email"
                    required
                    hint="A 6-digit OTP code will be delivered to this email address."
                  >
                    <Input
                      type="email"
                      leftIcon={<Mail />}
                      placeholder="e.g. shakib.akando.dev@gmail.com"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                    />
                  </Field>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <Field label="Password" required>
                      <PasswordInput
                        autoComplete="new-password"
                        placeholder="Min 8 characters"
                        value={studentPassword}
                        onChange={(e) => setStudentPassword(e.target.value)}
                      />
                    </Field>

                    <Field label="Confirm Password" required>
                      <PasswordInput
                        autoComplete="new-password"
                        placeholder="Re-enter password"
                        value={studentConfirmPassword}
                        onChange={(e) => setStudentConfirmPassword(e.target.value)}
                      />
                    </Field>
                  </div>

                  {studentPassword && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted">Password strength</span>
                        <span className="font-semibold text-ink">
                          {strengthLabels[strengthScore - 1] || 'Too short'}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 h-1.5">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-full rounded-full ${
                              strengthScore >= i ? strengthColors[strengthScore - 1] : 'bg-line'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <Checkbox
                    checked={studentAgreeTerms}
                    onChange={(e) => setStudentAgreeTerms(e.target.checked)}
                    label="I certify that this Student ID and academic details belong to me."
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={isSendingOtp}
                    loadingText="Matching Record & Sending OTP..."
                    leftIcon={<Mail />}
                  >
                    Verify Record &amp; Send OTP
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-5 pt-1" noValidate>
                  <div className="text-center space-y-1.5">
                    <div className="size-11 rounded-full bg-brand-soft border border-brand-line text-brand flex items-center justify-center mx-auto">
                      <KeyRound className="size-5" />
                    </div>
                    <h3 className="font-serif text-xl font-semibold text-ink">
                      Enter 6-Digit Verification Code
                    </h3>
                    <p className="text-xs text-muted max-w-sm mx-auto">
                      Sent to <strong className="text-ink break-all">{studentEmail}</strong>
                    </p>
                  </div>

                  <div className="max-w-xs mx-auto">
                    <Input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      autoFocus
                      mono
                      inputSize="lg"
                      placeholder="••••••"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                      className="text-center text-xl tracking-[0.35em] font-semibold"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={isVerifyingOtp}
                    loadingText="Verifying OTP..."
                    disabled={otpCode.trim().length !== 6}
                    leftIcon={<CheckCircle2 />}
                  >
                    Verify OTP &amp; Complete Registration
                  </Button>

                  <div className="flex items-center justify-between pt-3 border-t border-line text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setStudentStep('form');
                        setOtpCode('');
                      }}
                      className="inline-flex items-center gap-1.5 text-muted hover:text-ink font-medium"
                    >
                      <ArrowLeft className="size-3.5" />
                      <span>Edit Student Details</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleStudentSendOtp}
                      disabled={isSendingOtp || resendCooldown > 0}
                      className="inline-flex items-center gap-1.5 font-semibold text-brand hover:underline disabled:text-subtle disabled:no-underline"
                    >
                      <RefreshCw className={`size-3.5 ${isSendingOtp ? 'animate-spin' : ''}`} />
                      <span>
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                      </span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* UNIVERSITY STAFF REGISTRATION */}
          {selectedRole === 'staff' && (
            <form onSubmit={handleStaffSubmit} className="space-y-4" noValidate>
              <Alert tone="warning" title="Controller Authorization Required">
                Registrar and Issuer accounts cannot self-activate. Submitting this application queues your profile and Ethereum wallet for review by the Controller of Examinations.
              </Alert>

              <Field label="Full Name" required>
                <Input
                  type="text"
                  leftIcon={<User />}
                  placeholder="e.g. Dr. Nusrat Jahan"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Field label="Official Email" required>
                  <Input
                    type="email"
                    leftIcon={<Mail />}
                    placeholder="name@pub.edu.bd"
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                  />
                </Field>

                <Field label="Staff / Employee ID" required>
                  <Input
                    type="text"
                    mono
                    leftIcon={<BadgeCheck />}
                    placeholder="e.g. PUB-EMP-781"
                    value={staffId}
                    onChange={(e) => setStaffId(e.target.value.toUpperCase())}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Field label="Department / Office" required>
                  <Select
                    value={staffDepartment}
                    onChange={(e) => setStaffDepartment(e.target.value)}
                  >
                    <option value="Office of the Controller of Examinations">
                      Office of the Controller of Examinations
                    </option>
                    <option value="Office of the Registrar">Office of the Registrar</option>
                    <option value="Computer Science & Engineering">
                      Computer Science &amp; Engineering
                    </option>
                    <option value="Business Administration">Business Administration</option>
                    <option value="Electrical & Electronic Engineering">
                      Electrical &amp; Electronic Engineering
                    </option>
                  </Select>
                </Field>

                <Field label="Official Designation" required>
                  <Input
                    type="text"
                    placeholder="e.g. Assistant Registrar"
                    value={staffDesignation}
                    onChange={(e) => setStaffDesignation(e.target.value)}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Field label="Password" required>
                  <PasswordInput
                    autoComplete="new-password"
                    placeholder="Min 8 characters"
                    value={staffPassword}
                    onChange={(e) => setStaffPassword(e.target.value)}
                  />
                </Field>

                <Field label="Confirm Password" required>
                  <PasswordInput
                    autoComplete="new-password"
                    placeholder="Re-enter password"
                    value={staffConfirmPassword}
                    onChange={(e) => setStaffConfirmPassword(e.target.value)}
                  />
                </Field>
              </div>

              <MetaMaskIssuerConnect
                walletAddress={staffWallet}
                onWalletAddressChange={setStaffWallet}
                signature={staffSignature}
                onSignatureChange={setStaffSignature}
                isVerified={isStaffWalletVerified}
                onVerificationChange={setIsStaffWalletVerified}
                staffId={staffId}
                disabled={isLoading}
              />

          {/* Submit -> Brevo Send OTP */}
          <button
            type="submit"
            disabled={isSendingOtp}
            className="w-full mt-3 py-3.5 px-4 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isSendingOtp ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Mail className="w-4 h-4" />
            )}
            <span>Verify Record & Send OTP</span>
          </button>
        </form>
      )}

      {/* FORM 1 - STEP 2: PROFESSIONAL MINIMALIST OTP VERIFICATION */}
      {selectedRole === 'student' && studentStep === 'otp' && (
        <form onSubmit={handleVerifyOtp} className="space-y-6 pt-2">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 text-[#2563EB] flex items-center justify-center mx-auto shadow-sm">
              <KeyRound className="w-7 h-7" />
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#172033] tracking-tight">
              Enter Verification Code
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
              We have sent a 6-digit verification code to your email{' '}
              <span className="font-semibold text-slate-800 break-all">{studentEmail}</span>
            </p>
          </div>

          {/* 6-Digit Code Input */}
          <div className="space-y-2">
            <div className="relative max-w-xs mx-auto">
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                autoFocus
                placeholder="• • • • • •"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full py-3.5 px-4 rounded-xl border border-slate-300 focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15 text-center font-mono text-2xl tracking-[0.35em] font-bold outline-none transition-all bg-slate-50/40"
              />
            </div>
            <p className="text-center text-[11px] text-slate-400">
              Enter the 6-digit code received in your inbox
            </p>
          </div>

          <div className="pt-4 border-t border-line text-center text-xs text-muted">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onGoToLogin}
              className="font-semibold text-brand hover:underline"
            >
              {isVerifyingOtp ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>Verify OTP & Complete Registration</span>
            </button>
          </div>

          

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#172033]">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="e.g. Dr. Nusrat Jahan"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 text-sm outline-none"
              />
            </div>
          </div>

          {/* Official Email & Staff ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#172033]">
                Official Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  placeholder="name@pub.edu"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 text-sm outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#172033]">
                Staff ID / Employee ID <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <BadgeCheck className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. PUB-EMP-781"
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 text-sm uppercase placeholder:normal-case outline-none"
                />
              </div>
            </div>
          </div>

          {/* Department & Designation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#172033]">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                value={staffDepartment}
                onChange={(e) => setStaffDepartment(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 text-sm outline-none"
              >
                <option value="Office of the Controller of Examinations">
                  Office of the Controller of Examinations
                </option>
                <option value="Office of the Registrar">Office of the Registrar</option>
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Business Administration">Business Administration</option>
                <option value="Electrical & Electronic Engineering">Electrical & Electronic Engineering</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#172033]">
                Designation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Assistant Controller"
                value={staffDesignation}
                onChange={(e) => setStaffDesignation(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 text-sm outline-none"
              />
            </div>
          </div>

          {/* Password & Confirm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#172033]">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="Min 8 characters"
                value={staffPassword}
                onChange={(e) => setStaffPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 text-sm outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#172033]">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="Re-enter password"
                value={staffConfirmPassword}
                onChange={(e) => setStaffConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 text-sm outline-none"
              />
            </div>
          </div>

          {/* Issuer Signing Wallet with MetaMask Integration */}
          <MetaMaskIssuerConnect
            walletAddress={staffWallet}
            onWalletAddressChange={setStaffWallet}
            signature={staffSignature}
            onSignatureChange={setStaffSignature}
            isVerified={isStaffWalletVerified}
            onVerificationChange={setIsStaffWalletVerified}
            staffId={staffId}
            disabled={isLoading}
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-3 py-3.5 px-4 rounded-xl bg-[#06B6D4] hover:bg-cyan-600 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <BadgeCheck className="w-4 h-4" />
            )}
            <span>Submit for Approval</span>
          </button>
        </form>
      )}

      {/* Footer link back to Login */}
      <div className="mt-8 pt-6 border-t border-slate-100 text-center">
        <p className="text-xs text-[#64748B]">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onGoToLogin}
            className="font-bold text-[#2563EB] hover:underline"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  </>
);
};
