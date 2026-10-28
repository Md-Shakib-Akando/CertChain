'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredSessionUser } from '@/lib/authSession';

export default function DashboardRootPage() {
  const router = useRouter();

  useEffect(() => {
    const user = getStoredSessionUser();
    if (user?.role === 'admin' || user?.role === 'super_admin') {
      router.replace('/admin/dashboard');
    } else if (user?.role === 'controller') {
      router.replace('/dashboard/controller');
    } else if (user?.role === 'issuer') {
      router.replace('/dashboard/issuer');
    } else {
      router.replace('/dashboard/student');
    }
  }, [router]);

  return null;
}
