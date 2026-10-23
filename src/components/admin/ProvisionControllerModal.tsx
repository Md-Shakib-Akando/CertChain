'use client';

import React, { useState } from 'react';
import { X, UserPlus, ShieldCheck, MailCheck } from 'lucide-react';

interface ProvisionControllerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    name: string;
    email: string;
    department: string;
  }) => Promise<{ success: boolean; email?: string } | null>;
  isActionLoading: boolean;
}

export const ProvisionControllerModal: React.FC<ProvisionControllerModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isActionLoading,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Office of the Controller of Examinations');
  const [createdResult, setCreatedResult] = useState<{
    email: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setName('');
    setEmail('');
    setCreatedResult(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const res = await onConfirm({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      department: department.trim(),
    });

    if (res?.success) {
      setCreatedResult({
        email: res.email || email,
      });
      setName('');
      setEmail('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-blue-600">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#0B2545]">Provision Controller Account</h3>
              <p className="text-[11px] text-slate-500">
                Secure institutional provisioning (No public signup allowed)
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* State A: Success Confirmation (Zero link disclosure to Admin) */}
        {createdResult ? (
          <div className="space-y-5 py-4 text-center animate-in fade-in duration-200">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <MailCheck className="w-7 h-7" />
            </div>

            <div className="space-y-2 max-w-sm mx-auto">
              <h4 className="text-base font-bold text-[#0B2545]">
                Invitation Email Successfully Sent!
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                An official Brevo email has been securely delivered to{' '}
                <strong className="font-mono text-blue-600 font-semibold">{createdResult.email}</strong>.
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 text-left space-y-1">
                <p className="font-semibold text-slate-700">Next Steps for Controller:</p>
                <p>1. Open their official mailbox at {createdResult.email}.</p>
                <p>2. Click the confidential &quot;Set Up Password&quot; button in the email.</p>
                <p>3. Configure their master password to access the Controller Desk.</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-center">
              <button
                type="button"
                onClick={handleClose}
                className="w-full sm:w-auto px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* State B: Input Form */
          <>
            {/* Advisory */}
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 leading-relaxed space-y-1">
              <p className="font-bold">Institutional Security Policy (PRD Section 5.1):</p>
              <p className="text-slate-600">
                The Controller of Examinations is the highest academic authority for credential
                issuance and revocation co-signing. Public signup is forbidden; an invitation link will
                be dispatched exclusively to their official email to set up their password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Official Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Prof. Dr. M. A. Karim"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Institutional Email Address (@pub.edu.bd or authorized)
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="controller@pub.edu.bd"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-800 font-mono focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Department / Office
                </label>
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isActionLoading}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isActionLoading || !name.trim() || !email.trim()}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>
                    {isActionLoading ? 'Dispatching Invitation...' : 'Send Invitation Link'}
                  </span>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
