'use client';

import React from 'react';
import {
  Users,
  Search,
  UserPlus,
  Download,
  Ban,
  CheckCircle2,
  Clock,
  Eye,
  KeyRound,
  Trash2,
} from 'lucide-react';
import { AdminUser } from '@/types/admin';

interface UserManagementSectionProps {
  users: AdminUser[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedRoleFilter: string;
  onRoleFilterChange: (role: string) => void;
  selectedStatusFilter: string;
  onStatusFilterChange: (status: string) => void;
  onOpenDetailModal: (user: AdminUser) => void;
  onOpenSuspendModal: (user: AdminUser) => void;
  onOpenRoleModal: (user: AdminUser) => void;
  onOpenDeleteModal: (user: AdminUser) => void;
  onOpenInviteController: () => void;
  onReactivateUser: (userId: string) => Promise<boolean>;
  onExportCsv: () => void;
  isActionLoading: boolean;
}

export const UserManagementSection: React.FC<UserManagementSectionProps> = ({
  users,
  searchQuery,
  onSearchChange,
  selectedRoleFilter,
  onRoleFilterChange,
  selectedStatusFilter,
  onStatusFilterChange,
  onOpenDetailModal,
  onOpenSuspendModal,
  onOpenRoleModal,
  onOpenDeleteModal,
  onOpenInviteController,
  onReactivateUser,
  onExportCsv,
  isActionLoading,
}) => {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'controller':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'issuer':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'student':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return {
          label: 'Active',
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'pending':
        return {
          label: 'Pending',
          color: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'suspended':
        return {
          label: 'Suspended',
          color: 'bg-red-50 text-red-700 border-red-200',
        };
      case 'rejected':
      default:
        return {
          label: status,
          color: 'bg-slate-100 text-slate-600 border-slate-200',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#0B2545] flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Platform User Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage institutional users, suspend accounts, and securely provision the Controller of Examinations.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Export CSV */}
          <button
            onClick={onExportCsv}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
            title="Download CSV export of platform users"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          {/* Provision Controller Account */}
          <button
            onClick={onOpenInviteController}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Provision Controller</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="relative sm:col-span-6">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, email, Student ID, or Employee ID..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/10 shadow-2xs"
            />
          </div>

          {/* Role Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedRoleFilter}
              onChange={(e) => onRoleFilterChange(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-blue-600 cursor-pointer shadow-2xs"
            >
              <option value="all">All Roles</option>
              <option value="student">Student</option>
              <option value="issuer">Issuer (Faculty/Staff)</option>
              <option value="controller">Controller of Examinations</option>
              <option value="admin">Super Admin</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedStatusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-blue-600 cursor-pointer shadow-2xs"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Counter Summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>Showing {users.length} accounts matching filters</span>
          <span className="text-[11px] font-mono text-slate-400">
            Database: MongoDB Atlas Direct Query
          </span>
        </div>
      </div>

      {/* Users Table */}
      {users.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center shadow-xs space-y-2">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-[#0B2545]">No Users Match Your Query</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keywords or clearing the role and status filters.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 sm:px-6">User / Identity</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Department / ID</th>
                  <th className="py-3.5 px-4">Registered Date</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const statusInfo = getStatusBadge(u.status);
                  const isSuspended = u.status === 'suspended';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition group">
                      {/* User Info */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="space-y-0.5">
                          <span className="font-bold text-[#0B2545] block group-hover:text-blue-600 transition">
                            {u.name}
                          </span>
                          <span className="font-mono text-[11px] text-slate-500 block">
                            {u.email}
                          </span>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getRoleBadge(
                            u.role
                          )}`}
                        >
                          {u.role}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusInfo.color}`}
                        >
                          {u.status === 'active' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {u.status === 'suspended' && <Ban className="w-3 h-3 text-red-600" />}
                          {u.status === 'pending' && <Clock className="w-3 h-3 text-amber-600" />}
                          <span>{statusInfo.label}</span>
                        </span>
                      </td>

                      {/* Department / ID */}
                      <td className="py-3.5 px-4">
                        <span className="text-slate-700 font-medium block">
                          {u.department || 'PUB Institutional'}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 block">
                          {u.studentId || u.employeeId || 'ID: Assigned'}
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="py-3.5 px-4 text-slate-600">
                        <span>{u.createdAt}</span>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Inspect Detail */}
                          <button
                            onClick={() => onOpenDetailModal(u)}
                            className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                            title="View Full User Details & Audit History"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-600" />
                            <span className="hidden sm:inline">Details</span>
                          </button>

                          {/* Role Change */}
                          <button
                            onClick={() => onOpenRoleModal(u)}
                            className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                            title="Change User Role Assignment"
                          >
                            <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                            <span className="hidden sm:inline">Role</span>
                          </button>

                          {/* Suspend or Reactivate */}
                          {isSuspended ? (
                            <button
                              onClick={() => onReactivateUser(u.id)}
                              disabled={isActionLoading}
                              className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
                              title="Reactivate Suspended Account"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="hidden sm:inline">Reactivate</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => onOpenSuspendModal(u)}
                              disabled={isActionLoading}
                              className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
                              title="Suspend User Account (Requires Reason)"
                            >
                              <Ban className="w-3.5 h-3.5 text-red-600" />
                              <span className="hidden sm:inline">Suspend</span>
                            </button>
                          )}

                          {/* Delete Permanently */}
                          <button
                            onClick={() => onOpenDeleteModal(u)}
                            disabled={isActionLoading}
                            className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
                            title="Permanently Delete User from Database"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
