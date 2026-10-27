'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  saveSessionUser,
  clearSessionUser,
  getStoredSessionUser,
} from '@/lib/authSession';
import {
  StudentCertificate,
  StudentShareLink,
  StudentAuditEvent,
  StudentProfileData,
  StudentTab,
  UseStudentPortalReturn,
  initialStudentData,
  initialCertificates,
  initialShareLinks,
  initialAuditLogs,
} from '@/types/student';

export const useStudentPortal = (): UseStudentPortalReturn => {
  const router = useRouter();

  // Active Tab
  const [activeTab, setActiveTab] = useState<StudentTab>('dashboard');

  // Data states from MongoDB
  const [profile, setProfile] = useState<StudentProfileData>(initialStudentData);
  const [certificates, setCertificates] = useState<StudentCertificate[]>(initialCertificates);
  const [shareLinks, setShareLinks] = useState<StudentShareLink[]>(initialShareLinks);
  const [auditLogs, setAuditLogs] = useState<StudentAuditEvent[]>(initialAuditLogs);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // Modals state
  const [selectedCertForDetail, setSelectedCertForDetail] = useState<StudentCertificate | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [selectedCertForShare, setSelectedCertForShare] = useState<StudentCertificate | null>(null);

  // Feedback toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  }, []);

  // Fetch student profile & certificates from MongoDB database
  const loadStudentData = useCallback(async () => {
    try {
      setIsLoadingData(true);
      const session = getStoredSessionUser();

      const params = new URLSearchParams();
      if (session?.email) params.set('email', session.email);
      if (session?.studentId) params.set('studentId', session.studentId);
      const queryString = params.toString() ? `?${params.toString()}` : '';

      const res = await fetch(`/api/student/profile${queryString}`);
      const data = await res.json();

      if (res.ok && data.success && data.profile) {
        setProfile(data.profile);
        setCertificates(data.certificates || []);
        setShareLinks([]);

        saveSessionUser({
          id: data.profile.id,
          name: data.profile.name,
          email: data.profile.email,
          role: 'student',
          studentId: data.profile.studentId,
          department: data.profile.department,
        });
      } else if (res.status === 401 && !session) {
        router.push('/login');
      }
    } catch (err) {
      console.error('Failed to load student data from database:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, [router]);

  // Initial load without cascading synchronous setState in effect
  useEffect(() => {
    let isMounted = true;

    async function initialFetch() {
      try {
        const session = getStoredSessionUser();
        const params = new URLSearchParams();
        if (session?.email) params.set('email', session.email);
        if (session?.studentId) params.set('studentId', session.studentId);
        const queryString = params.toString() ? `?${params.toString()}` : '';

        const res = await fetch(`/api/student/profile${queryString}`);
        const data = await res.json();

        if (!isMounted) return;

        if (res.ok && data.success && data.profile) {
          setProfile(data.profile);
          setCertificates(data.certificates || []);
          setShareLinks([]);

          saveSessionUser({
            id: data.profile.id,
            name: data.profile.name,
            email: data.profile.email,
            role: 'student',
            studentId: data.profile.studentId,
            department: data.profile.department,
          });
        } else if (res.status === 401 && !session) {
          router.push('/login');
        }
      } catch (err) {
        console.error('Failed to load student data from database:', err);
      } finally {
        if (isMounted) {
          setIsLoadingData(false);
        }
      }
    }

    initialFetch();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleLogout = useCallback(() => {
    clearSessionUser();
    router.push('/login');
  }, [router]);

  // Open share modal with optional preselected certificate
  const handleOpenShareModal = useCallback((cert?: StudentCertificate) => {
    setSelectedCertForShare(cert || certificates[0] || null);
    setIsShareModalOpen(true);
  }, [certificates]);

  // When a new share link is generated
  const handleLinkCreated = useCallback(async (newLink: StudentShareLink) => {
    const linkToSave = { ...newLink };

    try {
      const res = await fetch('/api/student/share-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          certId: newLink.certId,
          createdBy: profile.studentId,
          recipientLabel: newLink.recipientLabel,
          durationHours: newLink.expiryHours,
        }),
      });
      const data = await res.json();
      if (res.ok && data.shareUrl) {
        linkToSave.fullUrl = data.shareUrl;
        newLink.fullUrl = data.shareUrl;
      }
    } catch (e) {
      console.warn('Failed to persist share link to backend:', e);
    }

    setShareLinks((prev) => [linkToSave, ...prev]);

    const newAuditEvent: StudentAuditEvent = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: 'Just now',
      eventType: 'ShareLinkCreated',
      title: 'Time-Limited Share Link Created',
      description: `Generated ${newLink.expiryHours}h verification link for "${newLink.recipientLabel}".`,
      certId: newLink.certId,
      method: 'Share Link',
    };
    setAuditLogs((prev) => [newAuditEvent, ...prev]);
    showToast(`Verification link generated for ${newLink.recipientLabel}!`);
  }, [profile.studentId, showToast]);

  // Cancel an active share link
  const handleCancelLink = useCallback(async (linkId: string) => {
    const targetLink = shareLinks.find((l) => l.id === linkId);
    setShareLinks((prev) =>
      prev.map((link) => (link.id === linkId ? { ...link, status: 'cancelled' } : link))
    );

    try {
      await fetch(`/api/student/share-links?id=${encodeURIComponent(linkId)}`, { method: 'DELETE' });
    } catch {}

    if (targetLink) {
      const cancelAudit: StudentAuditEvent = {
        id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: 'Just now',
        eventType: 'ShareLinkCancelled',
        title: 'Share Link Cancelled by Student',
        description: `Student revoked public access token for ${targetLink.recipientLabel} (${targetLink.certId}). URL rendered inactive.`,
        certId: targetLink.certId,
        method: 'Share Link',
      };
      setAuditLogs((prev) => [cancelAudit, ...prev]);
      showToast('Share link cancelled. Public access stopped immediately.');
    }
  }, [shareLinks, showToast]);

  // Real PDF Download
  const handleDownloadPdf = useCallback((cert: StudentCertificate) => {
    showToast(`Opening authentic blockchain-secured PDF for ${cert.id}`);
    window.open(`/api/certificates/${encodeURIComponent(cert.id)}/pdf`, '_blank');
  }, [showToast]);

  return {
    activeTab,
    setActiveTab,
    profile,
    certificates,
    shareLinks,
    auditLogs,
    isLoadingData,
    selectedCertForDetail,

    setSelectedCertForDetail,
    isShareModalOpen,
    setIsShareModalOpen,
    selectedCertForShare,
    setSelectedCertForShare,
    toastMessage,
    showToast,
    handleLogout,
    handleOpenShareModal,
    handleLinkCreated,
    handleCancelLink,
    handleDownloadPdf,
    loadStudentData,
  };
};
