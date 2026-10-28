import React from 'react';
import {
  BadgeCheck,
  Ban,
  CircleAlert,
  CircleDashed,
  CircleDot,
  CircleHelp,
  CircleSlash,
  Clock3,
  CloudOff,
  FileWarning,
  Link2Off,
  ShieldAlert,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/cn';

export type Tone = 'neutral' | 'brand' | 'success' | 'danger' | 'warning' | 'info' | 'seal';

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-sunken text-ink-2 border-line',
  brand: 'bg-brand-soft text-brand border-brand-line',
  success: 'bg-success-soft text-success border-success-line',
  danger: 'bg-danger-soft text-danger border-danger-line',
  warning: 'bg-warning-soft text-warning border-warning-line',
  info: 'bg-info-soft text-info border-info-line',
  seal: 'bg-seal-soft text-seal border-[#e6d6b3]',
};

const dotClasses: Record<Tone, string> = {
  neutral: 'bg-muted',
  brand: 'bg-brand',
  success: 'bg-success',
  danger: 'bg-danger',
  warning: 'bg-warning',
  info: 'bg-info',
  seal: 'bg-seal',
};

export function Badge({
  tone = 'neutral',
  icon,
  dot,
  children,
  className,
  size = 'md',
}: {
  tone?: Tone;
  icon?: React.ReactNode;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
  size?: 'xs' | 'sm' | 'md';
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 border font-medium whitespace-nowrap rounded-[4px] [&_svg]:shrink-0',
        size === 'xs'
          ? 'h-4.5 px-1.5 text-[10.5px] [&_svg]:size-2.5'
          : size === 'sm'
          ? 'h-5 px-1.5 text-[11px] [&_svg]:size-3'
          : 'h-6 px-2 text-[12px] [&_svg]:size-3.5',
        toneClasses[tone],
        className
      )}
    >
      {dot && <span className={cn('size-1.5 rounded-full shrink-0', dotClasses[tone])} aria-hidden />}
      {icon}
      {children}
    </span>
  );
}

/** Small count pill used in nav items and tabs. */
export function CountPill({
  children,
  tone = 'neutral',
  className,
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'brand' | 'warning' | 'danger' | 'seal' | 'info' | 'success';
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex min-w-5 h-5 px-1.5 items-center justify-center rounded-full text-[11px] font-semibold tabular',
        tone === 'neutral' && 'bg-sunken text-ink-2',
        tone === 'brand' && 'bg-brand text-white',
        tone === 'warning' && 'bg-warning-soft text-warning',
        tone === 'danger' && 'bg-danger text-white',
        tone === 'seal' && 'bg-seal-soft text-seal',
        tone === 'info' && 'bg-info-soft text-info',
        tone === 'success' && 'bg-success-soft text-success',
        className
      )}
    >
      {children}
    </span>
  );
}

/* --------------------------------------------------------------------------
   StatusBadge — ONE registry of status → label/icon/tone for the product.
   Use this everywhere a certificate, request, link, account or transaction
   status is displayed so the vocabulary never drifts between pages.
   -------------------------------------------------------------------------- */
export type StatusKey =
  // certificate / verification
  | 'valid'
  | 'revoked'
  | 'tampered'
  | 'not_found'
  | 'unavailable'
  | 'superseded'
  // workflow
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'info_requested'
  // accounts
  | 'active'
  | 'suspended'
  | 'invited'
  // share links
  | 'expired'
  | 'cancelled'
  // transactions / events
  | 'confirmed'
  | 'failed'
  | 'success'
  | 'failure';

const STATUS: Record<StatusKey, { label: string; tone: Tone; icon: LucideIcon }> = {
  valid: { label: 'Valid', tone: 'success', icon: BadgeCheck },
  revoked: { label: 'Revoked', tone: 'danger', icon: Ban },
  tampered: { label: 'Tampered', tone: 'danger', icon: ShieldAlert },
  not_found: { label: 'Not found', tone: 'neutral', icon: CircleHelp },
  unavailable: { label: 'Unavailable', tone: 'warning', icon: CloudOff },
  superseded: { label: 'Superseded', tone: 'neutral', icon: FileWarning },
  pending: { label: 'Pending', tone: 'warning', icon: Clock3 },
  approved: { label: 'Approved', tone: 'success', icon: BadgeCheck },
  rejected: { label: 'Rejected', tone: 'danger', icon: CircleSlash },
  info_requested: { label: 'Info requested', tone: 'info', icon: CircleAlert },
  active: { label: 'Active', tone: 'success', icon: CircleDot },
  suspended: { label: 'Suspended', tone: 'danger', icon: CircleSlash },
  invited: { label: 'Invited', tone: 'info', icon: CircleDashed },
  expired: { label: 'Expired', tone: 'neutral', icon: Clock3 },
  cancelled: { label: 'Cancelled', tone: 'neutral', icon: Link2Off },
  confirmed: { label: 'Confirmed', tone: 'success', icon: BadgeCheck },
  failed: { label: 'Failed', tone: 'danger', icon: CircleAlert },
  success: { label: 'Success', tone: 'success', icon: BadgeCheck },
  failure: { label: 'Failure', tone: 'danger', icon: CircleAlert },
};

/** Normalise loose backend strings (e.g. "VALID", "Revoked", "INVALID_MODIFIED") to a StatusKey. */
export function toStatusKey(raw: string | null | undefined): StatusKey {
  const s = String(raw || '').toLowerCase().replace(/[\s-]+/g, '_');
  if (s in STATUS) return s as StatusKey;
  if (s.includes('tamper') || s.includes('modified') || s === 'invalid') return 'tampered';
  if (s.includes('revok')) return 'revoked';
  if (s.includes('not_found') || s === 'notfound') return 'not_found';
  if (s.includes('verif') || s === 'issued' || s === 'healthy') return 'valid';
  if (s.includes('approv')) return 'approved';
  if (s.includes('reject') || s.includes('denied')) return 'rejected';
  if (s.includes('suspend') || s.includes('disabled')) return 'suspended';
  if (s.includes('pending') || s.includes('await') || s.includes('review')) return 'pending';
  if (s.includes('error') || s.includes('unavail') || s.includes('degrad')) return 'unavailable';
  return 'pending';
}

export function statusMeta(status: StatusKey) {
  return STATUS[status];
}

export function StatusBadge({
  status,
  label,
  size = 'md',
  className,
}: {
  status: StatusKey | string;
  label?: string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}) {
  const key = (status in STATUS ? status : toStatusKey(status)) as StatusKey;
  const meta = STATUS[key];
  const Icon = meta.icon;
  return (
    <Badge tone={meta.tone} icon={<Icon aria-hidden />} size={size} className={className}>
      {label || meta.label}
    </Badge>
  );
}

/** Role badge — consistent naming of the four platform roles. */
export const ROLE_LABELS: Record<string, string> = {
  admin: 'Super Admin',
  super_admin: 'Super Admin',
  controller: 'Controller of Examinations',
  issuer: 'Registrar · Issuer',
  registrar: 'Registrar · Issuer',
  student: 'Student',
  verifier: 'Public verifier',
  system: 'System',
};

export function roleLabel(role?: string | null) {
  if (!role) return 'Unknown';
  return ROLE_LABELS[role] || role.charAt(0).toUpperCase() + role.slice(1);
}

export function RoleBadge({
  role,
  size = 'md',
  className,
}: {
  role: string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}) {
  const tone: Tone =
    role === 'admin' || role === 'super_admin'
      ? 'brand'
      : role === 'controller'
      ? 'seal'
      : role === 'issuer' || role === 'registrar'
      ? 'info'
      : 'neutral';
  return (
    <Badge tone={tone} size={size} className={className}>
      {roleLabel(role)}
    </Badge>
  );
}
