'use client';

import React, { useState } from 'react';
import {
  GraduationCap,
  Building2,
  User,
  Mail,
  BadgeCheck,
 
  Eye,
  EyeOff,
  Wallet,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ShieldAlert,
 
  Clock,
  LogIn,
} from 'lucide-react';

interface RegistrationCardProps {
  onGoToLogin: () => void;
}

export const RegistrationCard: React.FC<RegistrationCardProps> = ({
  onGoToLogin,
}) => {
  // Option: 'student' or 'staff'
  const [selectedRole, setSelectedRole] = useState<'student' | 'staff'>('student');

  // Student fields
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [studentConfirmPassword, setStudentConfirmPassword] = useState('');
  const [studentAgreeTerms, setStudentAgreeTerms] = useState(false);

  // Staff fields
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffId, setStaffId] = useState('');
  const [staffDepartment, setStaffDepartment] = useState('Office of the Controller of Examinations');
  const [staffDesignation, setStaffDesignation] = useState('Assistant Controller of Examinations');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffConfirmPassword, setStaffConfirmPassword] = useState('');
  const [staffWallet, setStaffWallet] = useState('');

  // Password visibility
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Status & feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{
    type: 'student' | 'staff';
    referenceNumber?: string;
    name: string;
    email: string;
  } | null>(null);

  // Password strength calculation for student
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
  const strengthColors = ['bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'];

  // Handle Student Submit
  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!studentName.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }
    if (!studentId.trim()) {
      setErrorMessage('Student ID / Registration number is required.');
      return;
    }
    if (!studentEmail.trim()) {
      setErrorMessage('University email is required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentEmail.trim())) {
      setErrorMessage('Please enter a valid university email format.');
      return;
    }
    if (!studentPassword) {
      setErrorMessage('Password is required.');
      return;
    }
    if (studentPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }
    if (studentPassword !== studentConfirmPassword) {
      setErrorMessage('Password and Confirm Password do not match.');
      return;
    }
    if (!studentAgreeTerms) {
      setErrorMessage('You must agree to the Terms of Service & Privacy Policy.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSuccessResult({
        type: 'student',
        name: studentName.trim(),
        email: studentEmail.trim(),
      });
    }, 800);
  };

  // Handle Staff Submit
  const handleStaffSubmit = (e: React.FormEvent) => {
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

    setIsLoading(true);
    const randomReq = `REQ-PUB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setTimeout(() => {
      setIsLoading(false);
      setSuccessResult({
        type: 'staff',
        referenceNumber: randomReq,
        name: staffName.trim(),
        email: staffEmail.trim(),
      });
    }, 800);
  };

  // Render Success Result State
  if (successResult) {
    if (successResult.type === 'student') {
      return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-6 sm:p-10 transition-all text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-5">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#172033] mb-2">
            Registration Successful!
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] max-w-sm mx-auto mb-6">
            Your student account has been registered. You can now sign in to view and verify your academic certificates.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-xs mb-6 space-y-2">
            <div>
              <span className="text-slate-400 block text-[11px]">Full Name</span>
              <span className="font-semibold text-slate-800">{successResult.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">University Email</span>
              <span className="font-semibold text-slate-800">{successResult.email}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onGoToLogin}
            className="w-full py-3.5 px-4 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Go to Login</span>
          </button>
        </div>
      );
    }

    // Staff success state
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-6 sm:p-10 transition-all text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-5">
          <Clock className="w-9 h-9" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 mb-3">
          <span>Status: Pending Approval</span>
        </div>
        <h2 className="text-2xl font-extrabold text-[#172033] mb-2">
          Staff Access Request Submitted
        </h2>
        <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto mb-6">
          Your request has been submitted successfully. The Controller of Examinations must approve your access before you can manage certificates.
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-xs mb-6 space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-semibold">Request Reference ID:</span>
            <span className="font-mono font-bold text-[#10233F] text-sm">
              {successResult.referenceNumber}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Applicant</span>
            <span className="font-semibold text-slate-800">{successResult.name}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Official Email</span>
            <span className="font-semibold text-slate-800">{successResult.email}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onGoToLogin}
          className="w-full py-3.5 px-4 rounded-xl bg-[#10233F] hover:bg-slate-800 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          <span>Return to Sign In</span>
        </button>
      </div>
    );
  }

  return (
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

      {/* FORM 1: STUDENT REGISTRATION */}
      {selectedRole === 'student' && (
        <form onSubmit={handleStudentSubmit} className="space-y-4">
          <div className="pb-1">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Student Information
            </span>
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
                placeholder="e.g. Tariqul Islam"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 text-sm outline-none"
              />
            </div>
          </div>

          {/* Student ID */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#172033]">
              Student ID / Registration Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <GraduationCap className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="e.g. PUB-2022-CSE-104"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 text-sm uppercase placeholder:normal-case outline-none"
              />
            </div>
          </div>

          {/* University Email */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#172033]">
              University Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                placeholder="e.g. name@pub.edu"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 text-sm outline-none"
              />
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#172033]">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min 8 characters"
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#172033]">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={studentConfirmPassword}
                  onChange={(e) => setStudentConfirmPassword(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Password Strength meter */}
          {studentPassword && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Strength:</span>
                <span className="font-bold text-[#2563EB]">
                  {strengthLabels[strengthScore - 1] || 'Too short'}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 h-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-full rounded-full ${
                      strengthScore >= i ? strengthColors[strengthScore - 1] : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Terms checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={studentAgreeTerms}
                onChange={(e) => setStudentAgreeTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-[#2563EB]"
              />
              <span className="text-xs text-[#64748B]">
                I certify that this Student ID matches my university record and agree to the Terms of Service.
              </span>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-3 py-3.5 px-4 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Student Account...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Create Student Account</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* FORM 2: UNIVERSITY STAFF REGISTRATION */}
      {selectedRole === 'staff' && (
        <form onSubmit={handleStaffSubmit} className="space-y-4">
          <div className="pb-1">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Staff Access Request
            </span>
          </div>

          {/* Institutional Governance Callout */}
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-800">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>Requires Controller Approval</span>
            </div>
            <p className="text-amber-800/90 text-[11px] leading-relaxed">
              Staff cannot self-assign Admin or Issuer roles. Submitting creates an Access Request requiring verification by the Controller of Examinations.
            </p>
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

          {/* Wallet Address (Optional) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#172033]">
              Signing Wallet Address <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Wallet className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="0x..."
                value={staffWallet}
                onChange={(e) => setStaffWallet(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 text-xs font-mono outline-none"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-3 py-3.5 px-4 rounded-xl bg-[#06B6D4] hover:bg-cyan-600 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Transmitting Access Request...</span>
              </>
            ) : (
              <>
                <BadgeCheck className="w-4 h-4" />
                <span>Submit for Approval</span>
              </>
            )}
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
  );
};
