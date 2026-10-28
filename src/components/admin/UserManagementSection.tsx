'use client';

import React from 'react';
import {
  Users,
  Search,
  UserPlus,
  Download,
  Ban,
  CheckCircle2,
  Eye,
  KeyRound,
  Trash2,
} from 'lucide-react';
import { AdminUser } from '@/types/admin';
import {
  PageHeader,
  Card,
  Button,
  Input,
  Select,
  StatusBadge,
  RoleBadge,
  EmptyState,
  TableContainer,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
} from '@/components/ui';

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
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Identity & Access Directory"
        title="Platform User Management"
        description="Manage institutional users, suspend accounts, and securely provision the Controller of Examinations."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onExportCsv}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Export CSV
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenInviteController}
              leftIcon={<UserPlus className="w-4 h-4" />}
            >
              Provision Controller
            </Button>
          </div>
        }
      />

      {/* Search & Filter Bar */}
      <Card padding="md" className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6">
            <Input
              type="text"
              placeholder="Search by name, email, Student ID, or Employee ID..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="sm:col-span-3">
            <Select
              value={selectedRoleFilter}
              onChange={(e) => onRoleFilterChange(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="student">Student</option>
              <option value="issuer">Issuer (Faculty/Staff)</option>
              <option value="controller">Controller of Examinations</option>
              <option value="admin">Super Admin</option>
            </Select>
          </div>

          <div className="sm:col-span-3">
            <Select
              value={selectedStatusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted pt-2 border-t border-line">
          <span>Showing {users.length} accounts matching filters</span>
          <span className="font-mono text-[11px]">Database: MongoDB Atlas Direct Query</span>
        </div>
      </Card>

      {/* Users Table */}
      {users.length === 0 ? (
        <Card padding="lg">
          <EmptyState
            icon={<Users className="w-5 h-5" />}
            title="No Users Match Your Query"
            description="Try adjusting your search keywords or clearing the role and status filters."
          />
        </Card>
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <TR>
                <TH>User / Identity</TH>
                <TH>Role</TH>
                <TH>Status</TH>
                <TH>Department / ID</TH>
                <TH>Registered Date</TH>
                <TH align="right">Actions</TH>
              </TR>
            </THead>
            <TBody>
              {users.map((u) => {
                const isSuspended = u.status === 'suspended';

                return (
                  <TR key={u.id}>
                    <TD>
                      <div className="space-y-0.5">
                        <span className="font-semibold text-ink block">{u.name}</span>
                        <span className="font-mono text-xs text-muted block">{u.email}</span>
                      </div>
                    </TD>

                    <TD>
                      <RoleBadge role={u.role} />
                    </TD>

                    <TD>
                      <StatusBadge status={u.status} />
                    </TD>

                    <TD>
                      <span className="text-ink font-medium block text-xs">
                        {u.department || 'PUB Institutional'}
                      </span>
                      <span className="font-mono text-[11px] text-muted block">
                        {u.studentId || u.employeeId || 'ID: Assigned'}
                      </span>
                    </TD>

                    <TD className="text-muted font-mono text-xs">{u.createdAt}</TD>

                    <TD align="right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="secondary"
                          size="xs"
                          onClick={() => onOpenDetailModal(u)}
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                        >
                          Details
                        </Button>

                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => onOpenRoleModal(u)}
                          leftIcon={<KeyRound className="w-3.5 h-3.5" />}
                        >
                          Role
                        </Button>

                        {isSuspended ? (
                          <Button
                            variant="outline"
                            size="xs"
                            disabled={isActionLoading}
                            onClick={() => onReactivateUser(u.id)}
                            leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-success" />}
                          >
                            Reactivate
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="xs"
                            disabled={isActionLoading}
                            onClick={() => onOpenSuspendModal(u)}
                            leftIcon={<Ban className="w-3.5 h-3.5 text-danger" />}
                          >
                            Suspend
                          </Button>
                        )}

                        <Button
                          variant="danger"
                          size="xs"
                          disabled={isActionLoading}
                          onClick={() => onOpenDeleteModal(u)}
                          leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                        >
                          Delete
                        </Button>
                      </div>
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};
