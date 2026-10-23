'use client';

import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Mail,
  GraduationCap,
  Building,
  Hash,
  Award,
  AlertCircle,
  Send,
  CheckCircle2,
  Lock,
  X,
  FileQuestion,
} from 'lucide-react';
import { StudentProfileViewProps } from '@/types/student';

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({ profile }) => {
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [fieldToCorrect, setFieldToCorrect] = useState('name');
  const [correctionDetails, setCorrectionDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  const handleSubmitCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const ticketId = `REQ-CORR-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmittedTicket(ticketId);
      setIsSubmitting(false);
    }, 700);
  };

  const handleCloseModal = () => {
    setIsCorrectionModalOpen(false);
    setSubmittedTicket(null);
    setCorrectionDetails('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0B2545]">Student Academic Profile</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-semibold flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-500" />
              Official Record (Read-Only)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Official student record verified and maintained by the Office of the Registrar.
          </p>
        </div>

        <button
          onClick={() => setIsCorrectionModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-[#0B2545] text-xs font-semibold flex items-center gap-2 shadow-2xs transition self-start sm:self-auto cursor-pointer"
        >
          <FileQuestion className="w-4 h-4 text-[#2563EB]" />
          <span>Request Data Correction</span>
        </button>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        {/* Banner with avatar (Matches landing page navy color #10233F) */}
        <div className="h-32 bg-[#10233F] relative border-b border-slate-200 p-6 flex items-end">
          <div className="flex items-center gap-4 translate-y-8">
            <div className="w-20 h-20 rounded-2xl bg-[#2563EB] border-4 border-white text-white flex items-center justify-center text-2xl font-extrabold shadow-md">
              {profile.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div className="mb-2">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{profile.name}</h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Student
                </span>
              </div>
              <p className="text-xs font-mono text-blue-200 font-medium">{profile.studentId}</p>
            </div>
          </div>
        </div>

        {/* Profile Details Grid */}
        <div className="pt-12 p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-1 shadow-2xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#2563EB]" />
                Full Name (Official)
              </span>
              <p className="text-sm font-bold text-[#0B2545]">{profile.name}</p>
              <p className="text-[10px] text-slate-400">As registered on University Matriculation Roll</p>
            </div>

            {/* Student ID */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-1 shadow-2xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-[#2563EB]" />
                Student Identification ID
              </span>
              <p className="text-sm font-mono font-bold text-[#2563EB]">{profile.studentId}</p>
              <p className="text-[10px] text-slate-400">Permanent identifier across all blockchain records</p>
            </div>

            {/* University Email */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-1 shadow-2xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#2563EB]" />
                Institutional Email
              </span>
              <p className="text-sm font-medium text-slate-800">{profile.email}</p>
              <p className="text-[10px] text-slate-400">Authorized recipient for one-time passcodes (OTP)</p>
            </div>

            {/* Department */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-1 shadow-2xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#2563EB]" />
                Department
              </span>
              <p className="text-sm font-bold text-[#0B2545]">{profile.department}</p>
              <p className="text-[10px] text-slate-400">Faculty of Science &amp; Engineering</p>
            </div>

            {/* Academic Program */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-1 shadow-2xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-[#2563EB]" />
                Degree Program
              </span>
              <p className="text-sm font-bold text-[#0B2545]">
                {profile.program || (profile.department ? `B.Sc. in ${profile.department}` : 'Undergraduate Studies')}
              </p>
              <p className="text-[10px] text-slate-400">
                {[profile.batch ? `Batch ${profile.batch}` : null, profile.session ? `Session: ${profile.session}` : null].filter(Boolean).join(' • ') || 'Official University Enrollment'}
              </p>
            </div>

            {/* CGPA & Academic Status */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-1 shadow-2xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-emerald-600" />
                Cumulative Grade Point Average (CGPA)
              </span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-emerald-700">{profile.cgpa || 'N/A'}</span>
                {profile.cgpa && <span className="text-xs text-slate-500">/ 4.00 Scale</span>}
                <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full ml-auto">
                  {profile.status || 'Active'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                {profile.graduationDate ? `Graduation Date: ${profile.graduationDate}` : 'Enrolled Regular Student'}
              </p>
            </div>
          </div>

          {/* Immutable Notice */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 shadow-2xs">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-amber-900">
              <p className="font-bold text-slate-900">Why is this profile read-only?</p>
              <p className="leading-relaxed text-slate-600">
                Under university academic policy, students cannot directly edit personal or academic credentials on the blockchain registry.
                This guarantees integrity and prevents fraudulent credential alterations.
                If any name spelling, CGPA calculation, or program information is inaccurate, please submit a formal Request for Correction to the Registrar below.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Request Correction Modal */}
      {isCorrectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileQuestion className="w-5 h-5 text-[#2563EB]" />
                <h3 className="text-base font-bold text-[#0B2545]">Request Academic Data Correction</h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!submittedTicket ? (
              <form onSubmit={handleSubmitCorrection} className="space-y-4">
                <p className="text-xs text-slate-600">
                  This form will directly notify the Office of the Registrar. A university administrative officer will review your physical matriculation files and process corrections.
                </p>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Field Requiring Correction
                  </label>
                  <select
                    value={fieldToCorrect}
                    onChange={(e) => setFieldToCorrect(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 shadow-2xs cursor-pointer"
                  >
                    <option value="name">Full Name / Spelling Discrepancy</option>
                    <option value="program">Program / Major / Specialization</option>
                    <option value="cgpa">Transcript Grades / CGPA Calculation</option>
                    <option value="batch">Batch / Session Details</option>
                    <option value="email">University Email Address</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Correction Details &amp; Justification
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide exact corrected values, NID / Passport name spelling, or semester course codes..."
                    value={correctionDetails}
                    onChange={(e) => setCorrectionDetails(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 resize-none shadow-2xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !correctionDetails.trim()}
                    className="px-5 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 rounded-xl transition flex items-center gap-2 shadow-xs cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>Submitting Request...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit to Registrar</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 py-3 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#0B2545]">Correction Request Submitted</h4>
                  <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                    Your request has been logged under ticket reference{' '}
                    <span className="font-mono font-bold text-[#2563EB]">{submittedTicket}</span>.
                    The Registrar&apos;s office will review your student docket and contact you via your university email.
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-[#0B2545] rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
