'use client';

import React from 'react';
import {
  ShieldCheck,
  Lock,
  Boxes,
} from 'lucide-react';
import { PermissionMatrixRow } from '@/types/admin';

interface RolePermissionsSectionProps {
  matrix: PermissionMatrixRow[];
}

export const RolePermissionsSection: React.FC<RolePermissionsSectionProps> = ({ matrix }) => {
  const roles = [
    {
      name: 'Super Admin',
      scope: 'Technical / Platform',
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      description: 'System infrastructure, node connectivity, user provisioning, and operational monitoring.',
      restrictions: 'Zero authority to issue or revoke certificates, and cannot approve academic issuers.',
    },
    {
      name: 'Controller of Examinations',
      scope: 'Academic Governance',
      color: 'bg-amber-50 text-amber-800 border-amber-200',
      description: 'Sole authority to approve faculty issuer requests, co-sign smart contract revocations, and supervise university records.',
      restrictions: 'Does not manage platform server settings or technical database infrastructure.',
    },
    {
      name: 'Faculty / Staff Issuer',
      scope: 'Academic Execution',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      description: 'Drafts, hashes, and commits authentic graduation credentials and transcripts to Ethereum Sepolia.',
      restrictions: 'Requires Controller approval and smart contract authorization before issuing.',
    },
    {
      name: 'Student',
      scope: 'Credential Holder',
      color: 'bg-slate-100 text-slate-700 border-slate-200',
      description: 'Views immutable academic records, generates time-limited employer share links, and downloads official PDFs.',
      restrictions: 'Read-only profile; cannot alter smart contract data.',
    },
    {
      name: 'Public Verifier',
      scope: 'Third-Party Verification',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      description: 'Employers, embassies, and academic institutions verifying SHA-256 hashes against Sepolia ledger with zero login.',
      restrictions: 'Zero access to student personal records beyond minimal verified credential proofs.',
    },
  ];

  return (
    <div className="space-y-6">
      

      {/* 5 Role Concept Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {roles.map((r) => (
          <div
            key={r.name}
            className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3"
          >
            <div>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${r.color}`}>
                {r.scope}
              </span>
              <h3 className="text-sm font-bold text-[#0B2545] mt-2">{r.name}</h3>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{r.description}</p>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[10px] text-amber-800 bg-amber-50/50 p-2 rounded-lg border border-amber-200/60">
              <strong>Boundary:</strong> {r.restrictions}
            </div>
          </div>
        ))}
      </div>

      {/* Complete Permission Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#0B2545]">Institutional Permission Matrix</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enforcement layers across backend middleware and Sepolia smart contracts
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
            Active Policy v1.0
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4 sm:px-6">Feature / Action</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Super Admin</th>
                <th className="py-3 px-3">Controller</th>
                <th className="py-3 px-3">Issuer (Staff)</th>
                <th className="py-3 px-3">Student</th>
                <th className="py-3 px-3">Verifier</th>
                <th className="py-3 px-4 text-right">Enforcement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {matrix.map((row) => (
                <tr key={row.permission} className="hover:bg-slate-50/70 transition">
                  {/* Feature */}
                  <td className="py-3 px-4 sm:px-6 font-semibold text-[#0B2545]">
                    {row.permission}
                  </td>

                  {/* Category */}
                  <td className="py-3 px-3">
                    <span className="text-[11px] text-slate-500">{row.category}</span>
                  </td>

                  {/* Super Admin */}
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.superAdmin === 'Allowed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : row.superAdmin === 'Read-only'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {row.superAdmin}
                    </span>
                  </td>

                  {/* Controller */}
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.controller.includes('Allowed') || row.controller.includes('Sole')
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      {row.controller}
                    </span>
                  </td>

                  {/* Issuer */}
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.issuer.includes('Allowed')
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {row.issuer}
                    </span>
                  </td>

                  {/* Student */}
                  <td className="py-3 px-3">
                    <span className="text-[11px] text-slate-600">{row.student}</span>
                  </td>

                  {/* Verifier */}
                  <td className="py-3 px-3">
                    <span className="text-[11px] text-slate-600">{row.verifier}</span>
                  </td>

                  {/* Enforcement */}
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        row.enforcement === 'Smart Contract'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : row.enforcement === 'Both'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {row.enforcement === 'Smart Contract' && <Boxes className="w-3 h-3 text-indigo-600" />}
                      {row.enforcement === 'Backend API' && <ShieldCheck className="w-3 h-3 text-blue-600" />}
                      {row.enforcement === 'Both' && <Lock className="w-3 h-3 text-purple-600" />}
                      <span>{row.enforcement}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
