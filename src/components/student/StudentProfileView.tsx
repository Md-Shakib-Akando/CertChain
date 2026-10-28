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
  Send,
  CheckCircle2,
  Lock,
  FileQuestion,
} from 'lucide-react';
import { StudentProfileViewProps } from '@/types/student';
import {
  PageHeader,
  Card,
  CardBody,
  Badge,
  Button,
  Alert,
  Dialog,
  Field,
  Select,
  Textarea,
} from '@/components/ui';

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
    }, 600);
  };

  const handleCloseModal = () => {
    setIsCorrectionModalOpen(false);
    setSubmittedTicket(null);
    setCorrectionDetails('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Matriculation Dossier"
        title="Student Academic Profile"
        description="Official student record verified and maintained by the Office of the Registrar, Pundra University of Science & Technology."
        meta={
          <Badge tone="neutral" icon={<Lock className="w-3 h-3" />}>
            Official Record (Read-Only)
          </Badge>
        }
        actions={
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<FileQuestion className="w-4 h-4 text-brand" />}
            onClick={() => setIsCorrectionModalOpen(true)}
          >
            Request Data Correction
          </Button>
        }
      />

      <Card className="overflow-hidden">
        {/* Institutional Header Banner */}
        <div className="bg-night text-night-text on-night p-6 sm:p-8 border-b border-night-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-brand/30 border border-seal/40 text-night-text flex items-center justify-center text-xl font-serif font-bold shrink-0">
              {profile.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-serif font-semibold text-night-text">
                  {profile.name}
                </h2>
                <Badge tone="success" size="xs" icon={<ShieldCheck className="w-3 h-3" />}>
                  Verified Student
                </Badge>
              </div>
              <p className="text-xs font-mono text-seal">Student Roll: {profile.studentId}</p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[11px] uppercase tracking-wider text-night-muted block">
              Academic Standing
            </span>
            <span className="text-sm font-semibold text-night-text">
              {profile.status || 'Active Enrolled Student'}
            </span>
          </div>
        </div>

        <CardBody className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-canvas border border-line space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-brand" />
                Full Name (Official)
              </span>
              <p className="text-sm font-semibold text-ink">{profile.name}</p>
              <p className="text-[11px] text-subtle">As registered on University Matriculation Roll</p>
            </div>

            <div className="p-4 rounded-xl bg-canvas border border-line space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-brand" />
                Student Identification Roll
              </span>
              <p className="text-sm font-mono font-semibold text-brand">{profile.studentId}</p>
              <p className="text-[11px] text-subtle">Permanent identifier across all blockchain records</p>
            </div>

            <div className="p-4 rounded-xl bg-canvas border border-line space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-brand" />
                Institutional Email
              </span>
              <p className="text-sm font-medium text-ink">{profile.email}</p>
              <p className="text-[11px] text-subtle">Authorized recipient for security notifications &amp; OTPs</p>
            </div>

            <div className="p-4 rounded-xl bg-canvas border border-line space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-brand" />
                Academic Department
              </span>
              <p className="text-sm font-semibold text-ink">{profile.department}</p>
              <p className="text-[11px] text-subtle">Pundra University of Science &amp; Technology</p>
            </div>

            <div className="p-4 rounded-xl bg-canvas border border-line space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-brand" />
                Degree Program
              </span>
              <p className="text-sm font-semibold text-ink">
                {profile.program || (profile.department ? `B.Sc. in ${profile.department}` : 'Undergraduate Studies')}
              </p>
              <p className="text-[11px] text-subtle">
                {[profile.batch ? `Batch ${profile.batch}` : null, profile.session ? `Session: ${profile.session}` : null]
                  .filter(Boolean)
                  .join(' • ') || 'Official University Enrollment'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-canvas border border-line space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-success" />
                Cumulative Grade Point Average (CGPA)
              </span>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-success font-mono">{profile.cgpa || 'N/A'}</span>
                {profile.cgpa && <span className="text-xs text-muted">/ 4.00 Scale</span>}
                <Badge tone="success" size="xs" className="ml-auto">
                  {profile.status || 'Active'}
                </Badge>
              </div>
              <p className="text-[11px] text-subtle">
                {profile.graduationDate ? `Graduation Date: ${profile.graduationDate}` : 'Enrolled Regular Student'}
              </p>
            </div>
          </div>

          <Alert tone="warning" title="Why is this academic profile read-only?">
            Under university academic governance, students cannot directly alter matriculation attributes or grades on the blockchain registry. If any spelling, CGPA calculation, or program detail requires amendment, submit a formal Request for Data Correction to the Office of the Registrar.
          </Alert>
        </CardBody>
      </Card>

      <Dialog
        open={isCorrectionModalOpen}
        onClose={handleCloseModal}
        size="md"
        eyebrow="Office of the Registrar"
        title="Request Academic Data Correction"
        description="Notify the Registrar's office to review your physical matriculation files and process an official amendment."
      >
        {!submittedTicket ? (
          <form onSubmit={handleSubmitCorrection} className="space-y-4">
            <Field label="Field Requiring Correction" required>
              <Select
                value={fieldToCorrect}
                onChange={(e) => setFieldToCorrect(e.target.value)}
              >
                <option value="name">Full Name / Spelling Discrepancy</option>
                <option value="program">Program / Major / Specialization</option>
                <option value="cgpa">Transcript Grades / CGPA Calculation</option>
                <option value="batch">Batch / Session Details</option>
                <option value="email">University Email Address</option>
              </Select>
            </Field>

            <Field
              label="Correction Details & Justification"
              required
              hint="Include exact corrected spelling, NID/Passport reference, or relevant course codes."
            >
              <Textarea
                rows={4}
                required
                placeholder="Provide exact corrected values and supporting academic reference..."
                value={correctionDetails}
                onChange={(e) => setCorrectionDetails(e.target.value)}
              />
            </Field>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={isSubmitting}
                disabled={!correctionDetails.trim()}
                leftIcon={<Send className="w-3.5 h-3.5" />}
              >
                Submit to Registrar
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 py-2 text-center">
            <div className="w-12 h-12 rounded-full bg-success-bg border border-success-border text-success flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-serif font-semibold text-ink">
                Correction Request Logged
              </h4>
              <p className="text-xs text-muted max-w-sm mx-auto leading-relaxed">
                Your request has been assigned reference{' '}
                <span className="font-mono font-semibold text-brand">{submittedTicket}</span>. The Registrar&apos;s office will review your student docket and contact you via your university email.
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={handleCloseModal}>
              Close
            </Button>
          </div>
        )}
      </Dialog>
    </div>
  );
};
