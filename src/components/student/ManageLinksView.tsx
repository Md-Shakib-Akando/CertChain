'use client';

import React, { useState } from 'react';
import {
  Share2,
  Plus,
  Clock,
  Eye,
  Ban,
  ShieldCheck,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { ManageLinksViewProps } from '@/types/student';
import {
  PageHeader,
  Alert,
  Card,
  Button,
  Badge,
  StatusBadge,
  CopyButton,
  TableContainer,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
  ConfirmDialog,
  EmptyState,
} from '@/components/ui';

export const ManageLinksView: React.FC<ManageLinksViewProps> = ({
  shareLinks,
  onCancelLink,
  onOpenShareModal,
}) => {
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleConfirmCancel = () => {
    if (!cancellingId) return;
    onCancelLink(cancellingId);
    setCancellingId(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Time-Bound Access Control"
        title="Manage Verification Share Links"
        description="Track active credential links shared with employers and universities. Revoke any link immediately to terminate external access."
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={onOpenShareModal}
          >
            Generate New Link
          </Button>
        }
      />

      <Alert
        tone="info"
        icon={<ShieldCheck className="w-4 h-4" />}
        title="Time-Limited Verification Policy"
      >
        Every shared link expires automatically after its configured duration. Once cancelled or expired, any visitor receives an immediate{' '}
        <em>&ldquo;This link has expired or was cancelled&rdquo;</em> notice with zero credential disclosure.
      </Alert>

      {shareLinks.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Share2 className="w-5 h-5" />}
            title="No verification links created yet"
            description="Generate time-limited links for employers or admissions boards to verify your credentials without requiring them to sign up or connect a wallet."
            action={
              <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={onOpenShareModal}>
                Create Your First Share Link
              </Button>
            }
          />
        </Card>
      ) : (
        <Card>
          <TableContainer className="border-0 rounded-none">
            <Table>
              <THead>
                <TR>
                  <TH>Recipient &amp; Credential</TH>
                  <TH>Created</TH>
                  <TH>Expires At</TH>
                  <TH>Views / Limit</TH>
                  <TH>Status</TH>
                  <TH align="right">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {shareLinks.map((link) => {
                  const isActive = link.status === 'active';
                  return (
                    <TR key={link.id}>
                      <TD>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-ink text-sm">{link.recipientLabel}</span>
                            {link.includeDetails && (
                              <Badge tone="brand" size="xs">
                                + Transcript Grades
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted">
                            <span className="font-mono font-semibold text-brand">{link.certId}</span>
                            <span>•</span>
                            <span>{link.certType}</span>
                          </div>
                        </div>
                      </TD>

                      <TD>
                        <span className="text-xs text-ink-2 inline-flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-muted" />
                          {link.createdAt}
                        </span>
                      </TD>

                      <TD>
                        <div className="space-y-0.5">
                          <span className="text-xs text-ink font-medium inline-flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-brand" />
                            {link.expiresAt}
                          </span>
                          <span className="text-[11px] text-muted block">
                            Duration: {link.expiryHours}h
                          </span>
                        </div>
                      </TD>

                      <TD>
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink tabular">
                          <Eye className="w-3.5 h-3.5 text-muted" />
                          <span>{link.viewCount}</span>
                          <span className="text-subtle">/</span>
                          <span className="text-muted">
                            {link.maxViews ? `${link.maxViews} max` : 'Unlimited'}
                          </span>
                        </span>
                      </TD>

                      <TD>
                        <StatusBadge status={link.status} />
                      </TD>

                      <TD align="right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <CopyButton value={link.fullUrl} label="Copy URL" />
                          <a
                            href={link.fullUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border border-line bg-surface hover:bg-sunken text-xs font-medium text-ink transition-colors"
                            title="Preview employer link"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-muted" />
                            <span className="hidden sm:inline">Open</span>
                          </a>
                          {isActive && (
                            <Button
                              variant="danger-outline"
                              size="xs"
                              leftIcon={<Ban className="w-3.5 h-3.5" />}
                              onClick={() => setCancellingId(link.id)}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      <ConfirmDialog
        open={Boolean(cancellingId)}
        onClose={() => setCancellingId(null)}
        onConfirm={handleConfirmCancel}
        tone="danger"
        title="Revoke This Verification Link?"
        description="Once cancelled, this share link stops working immediately. Any employer or admissions officer attempting to open the URL will receive an expired notice with zero credential data."
        confirmLabel="Revoke Link Immediately"
        cancelLabel="Keep Link Active"
      />
    </div>
  );
};
