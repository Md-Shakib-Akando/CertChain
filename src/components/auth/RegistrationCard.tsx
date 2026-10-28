'use client';

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Building2,
  User,
  Mail,
  BadgeCheck,
  ShieldCheck,
  Clock,
  LogIn,
  CheckCircle2,
  Layers,
  KeyRound,
  ArrowLeft,
  RefreshCw,
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

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  // Staff fields
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffId, setStaffId] = useState('');
  const [staffDepartment, setStaffDepartment] = useState('Office of the Controller of Examinations');
  const [staffDesignation, setStaffDesignation] = useState('Assistant Controller of Examinations');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffConfirmPassword, setStaffConfirmPassword] = useState('');
  const [staffWallet, setStaffWallet] = useState('');
  const [staffSignature, setStaffSignature] = useState('');
  const [isStaffWalletVerified, setIsStaffWalletVerified] = useState(false);

  // Status & feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{
    type: 'student' | 'staff';
    referenceNumber?: string;
    name: string;
    email: string;
    studentId?: string;
    department?: string;
    batch?: string;
    employeeId?: string;
    designation?: string;
    walletAddress?: string;
    isWalletVerified?: boolean;
    signature?: string;
  } | null>(null);

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
      showToast(`Verification code sent to ${studentEmail.trim()}`, 'success');
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

      setSuccessResult({
        type: 'student',
        name: data.data?.name || studentName.trim(),
        email: data.data?.email || studentEmail.trim(),
        studentId: data.data?.studentId || studentId.trim(),
        department: data.data?.department || studentDepartment.trim(),
        batch: data.data?.batch || studentBatch.trim(),
      });
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
      const returnedData = result.data || {};
      setSuccessResult({
        type: 'staff',
        referenceNumber:
          returnedData.requestId || `REQ-PUB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        name: returnedData.name || staffName.trim(),
        email: returnedData.email || staffEmail.trim(),
        employeeId: returnedData.employeeId || staffId.trim(),
        department: returnedData.department || staffDepartment,
        designation: returnedData.designation || staffDesignation,
        walletAddress: returnedData.walletAddress || staffWallet.trim(),
        isWalletVerified: returnedData.isWalletVerified ?? isStaffWalletVerified,
        signature: staffSignature,
      });
    } catch {
      setIsLoading(false);
      setErrorMessage('Network error: Could not connect to the registration server.');
    }
  };

  // Render Success Result State
  if (successResult) {
    if (successResult.type === 'student') {
      return (
        <Card>
          <CardBody className="p-6 sm:p-8 space-y-6 text-center">
            <div className="size-12 rounded-full bg-success-soft border border-success-line text-success flex items-center justify-center mx-auto">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <StatusBadge status="active" label="Verified Student Account" size="sm" />
              <h2 className="font-serif text-2xl font-semibold text-ink mt-2">
                Student Registration Complete
              </h2>
              <p className="text-xs sm:text-sm text-muted max-w-md mx-auto mt-1">
                Your identity was matched against official admission records. You can now sign in to access your degree certificates and generate employer share links.
              </p>
            </div>

            <div className="rounded-lg bg-sunken border border-line p-4 text-left">
              <DescriptionList
                columns={2}
                items={[
                  { term: 'Full Name', value: <span className="font-semibold">{successResult.name}</span> },
                  { term: 'Student ID', value: <span className="font-mono">{successResult.studentId}</span> },
                  { term: 'Department', value: successResult.department },
                  { term: 'Batch', value: successResult.batch },
                  { term: 'Registered Email', value: successResult.email, full: true },
                ]}
              />
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={onGoToLogin}
              leftIcon={<LogIn />}
            >
              Proceed to Sign In
            </Button>
          </CardBody>
        </Card>
      );
    }

    return (
      <Card>
        <CardBody className="p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="size-12 rounded-full bg-warning-soft border border-warning-line text-warning flex items-center justify-center mx-auto">
              <Clock className="size-6" />
            </div>
            <StatusBadge status="pending" label="Pending Controller Authorization" size="sm" />
            <h2 className="font-serif text-2xl font-semibold text-ink">
              Issuer Access Request Submitted
            </h2>
            <p className="text-xs sm:text-sm text-muted max-w-md mx-auto">
              Your application and Ethereum signing address have been recorded. The Controller of Examinations must authorize your wallet on the smart contract before you can issue certificates.
            </p>
          </div>

          <div className="rounded-lg bg-sunken border border-line p-4 space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-line text-xs">
              <span className="text-muted font-medium">Application Reference</span>
              <span className="font-mono font-semibold text-ink">
                {successResult.referenceNumber}
              </span>
            </div>

            <DescriptionList
              columns={2}
              items={[
                { term: 'Applicant Name', value: <span className="font-semibold">{successResult.name}</span> },
                { term: 'Employee ID', value: <span className="font-mono">{successResult.employeeId}</span> },
                { term: 'Official Email', value: successResult.email },
                { term: 'Department', value: successResult.department },
              ]}
            />

            {successResult.walletAddress && (
              <div className="pt-2.5 border-t border-line flex items-center justify-between gap-2 text-xs">
                <span className="text-muted">Signing Wallet</span>
                <div className="flex items-center gap-2">
                  <HashText value={successResult.walletAddress} head={10} tail={8} />
                  {successResult.isWalletVerified && (
                    <StatusBadge status="approved" label="Verified" size="sm" />
                  )}
                </div>
              </div>
            )}
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={onGoToLogin}
            leftIcon={<LogIn />}
          >
            Return to Sign In
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <StateToast toast={toast} onDismiss={() => setToast(null)} />

      <Card>
        <CardBody className="p-6 sm:p-8 space-y-5">
          <div>
            <p className="eyebrow">Account Onboarding</p>
            <h2 className="font-serif text-2xl font-semibold text-ink mt-1">
              Register on CertChain
            </h2>
            <p className="text-xs sm:text-[13.5px] text-muted mt-1">
              Select Student Registration (instant OTP record match) or University Staff Access.
            </p>
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

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isLoading}
                loadingText="Submitting Access Request..."
                leftIcon={<BadgeCheck />}
              >
                Submit Staff Application
              </Button>
            </form>
          )}

          <div className="pt-4 border-t border-line text-center text-xs text-muted">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onGoToLogin}
              className="font-semibold text-brand hover:underline"
            >
              Sign In
            </button>
          </div>
        </CardBody>
      </Card>
    </>
  );
};
