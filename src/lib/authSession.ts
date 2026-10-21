'use client';

import { useSyncExternalStore, useCallback } from 'react';

export interface AuthUser {
  id?: string;
  name: string;
  email?: string;
  role: 'student' | 'issuer' | 'controller' | 'admin' | string;
  status?: string;
  studentId?: string;
  department?: string;
  employeeId?: string;
  walletAddress?: string;
}

export const SESSION_STORAGE_KEY = 'certchain_user';
export const SESSION_COOKIE_NAME = 'certchain_user';
export const SESSION_EVENT_NAME = 'certchain_session_change';

let cachedUser: AuthUser | null = null;
let cachedRaw: string | null = null;

/**
 * Read session user safely from localStorage or fallback cookie
 */
export function getStoredSessionUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (raw && raw === cachedRaw && cachedUser) {
      return cachedUser;
    }
    if (raw) {
      cachedRaw = raw;
      cachedUser = JSON.parse(raw) as AuthUser;
      return cachedUser;
    }
    // Fallback: parse document.cookie
    const match = document.cookie.match(
      new RegExp(`(?:^|;\\s*)${SESSION_COOKIE_NAME}=([^;]*)`)
    );
    if (match && match[1]) {
      const decoded = decodeURIComponent(match[1]);
      cachedUser = JSON.parse(decoded) as AuthUser;
      cachedRaw = JSON.stringify(cachedUser);
      localStorage.setItem(SESSION_STORAGE_KEY, cachedRaw);
      return cachedUser;
    }
    cachedRaw = null;
    cachedUser = null;
  } catch (e) {
    console.warn('Failed to parse certchain session:', e);
    cachedRaw = null;
    cachedUser = null;
  }
  return null;
}

/**
 * Save session to both localStorage and Cookie, and notify all active listeners
 */
export function saveSessionUser(user: AuthUser): void {
  if (typeof window === 'undefined') return;
  try {
    const serialized = JSON.stringify(user);
    cachedRaw = serialized;
    cachedUser = user;
    localStorage.setItem(SESSION_STORAGE_KEY, serialized);
    // 7 days cookie for persistent SSR/client sync
    document.cookie = `${SESSION_COOKIE_NAME}=${encodeURIComponent(
      serialized
    )}; path=/; max-age=604800; SameSite=Lax`;

    window.dispatchEvent(new CustomEvent(SESSION_EVENT_NAME, { detail: user }));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.error('Error saving session:', e);
  }
}

/**
 * Remove session from localStorage and Cookie, and notify all active listeners
 */
export function clearSessionUser(): void {
  if (typeof window === 'undefined') return;
  try {
    cachedRaw = null;
    cachedUser = null;
    localStorage.removeItem(SESSION_STORAGE_KEY);
    document.cookie = `${SESSION_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;

    window.dispatchEvent(new CustomEvent(SESSION_EVENT_NAME, { detail: null }));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.error('Error clearing session:', e);
  }
}

function subscribeSession(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = () => {
    callback();
  };
  window.addEventListener(SESSION_EVENT_NAME, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(SESSION_EVENT_NAME, handler);
    window.removeEventListener('storage', handler);
  };
}

function getSnapshot(): AuthUser | null {
  return getStoredSessionUser();
}

function getServerSnapshot(): null {
  return null;
}

/**
 * React hook to reactively subscribe to session changes across all pages and tabs
 */
export function useAuthSession() {
  const user = useSyncExternalStore(subscribeSession, getSnapshot, getServerSnapshot);

  const logout = useCallback(() => {
    clearSessionUser();
  }, []);

  return {
    user,
    isLoggedIn: Boolean(user),
    logout,
    saveSession: saveSessionUser,
  };
}
