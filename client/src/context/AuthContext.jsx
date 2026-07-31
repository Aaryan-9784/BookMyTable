/**
 * Auth Context Provider — Supabase Auth + JWT Session Token + MongoDB User Sync.
 * Supports 50,000 free monthly active users with zero sandbox limitations.
 */
import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';
import api from '../services/api.js';
import { supabase } from '../config/supabase.js';
import { STORAGE_ID_TOKEN, STORAGE_EMAIL } from '../utils/constants.js';
import { SESSION_INVALID_EVENT } from '../utils/authSession.js';

const AuthContext = createContext(null);
const STORAGE_PROFILE = 'bookmytable_profile';

function readCachedProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_PROFILE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCachedProfile(data) {
  try {
    if (data) localStorage.setItem(STORAGE_PROFILE, JSON.stringify(data));
    else localStorage.removeItem(STORAGE_PROFILE);
  } catch {}
}

function isRealSupabaseConfigured() {
  const url = import.meta.env.VITE_SUPABASE_URL || '';
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  return Boolean(
    url &&
    !url.includes('your-supabase-project') &&
    !url.includes('xyzcompany') &&
    key &&
    !key.includes('your-supabase-anon-key') &&
    !key.includes('dummykey')
  );
}

export function AuthProvider({ children }) {
  const [idToken, setIdTokenState] = useState(() => localStorage.getItem(STORAGE_ID_TOKEN));
  const [email, setEmailState] = useState(() => localStorage.getItem(STORAGE_EMAIL) || '');
  const [loading, setLoading] = useState(false);

  const cachedProfile = readCachedProfile();
  const [profile, setProfile] = useState(() => cachedProfile);
  const [role, setRole] = useState(() => cachedProfile?.role || null);
  const [profileLoading, setProfileLoading] = useState(
    () => Boolean(localStorage.getItem(STORAGE_ID_TOKEN)) && !cachedProfile
  );

  useEffect(() => {
    if (idToken) localStorage.setItem(STORAGE_ID_TOKEN, idToken);
    else localStorage.removeItem(STORAGE_ID_TOKEN);
  }, [idToken]);

  useEffect(() => {
    if (email) localStorage.setItem(STORAGE_EMAIL, email);
    else localStorage.removeItem(STORAGE_EMAIL);
  }, [email]);

  const refreshProfile = useCallback(async () => {
    const token = localStorage.getItem(STORAGE_ID_TOKEN);
    if (!token) {
      setProfile(null);
      setRole(null);
      writeCachedProfile(null);
      return null;
    }
    try {
      const { data } = await api.get('/api/users/profile');
      setRole(data.role || 'user');
      setProfile(data);
      writeCachedProfile(data);
      return data;
    } catch {
      setProfile(null);
      setRole(null);
      writeCachedProfile(null);
      return null;
    }
  }, []);

  const patchProfile = useCallback((updates) => {
    setProfile((prev) => {
      const next = { ...(prev || {}), ...updates };
      writeCachedProfile(next);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!idToken) {
      setProfile(null);
      setRole(null);
      setProfileLoading(false);
      writeCachedProfile(null);
      return;
    }
    let mounted = true;
    if (!readCachedProfile()) setProfileLoading(true);

    (async () => {
      try {
        const { data } = await api.get('/api/users/profile');
        if (mounted) {
          const dbName = data.name || data.fullName;
          if (dbName) {
            localStorage.setItem('bookmytable_full_name', dbName);
          }
          setRole(data.role || 'user');
          setProfile(data);
          writeCachedProfile(data);
        }
      } catch {
        if (mounted) {
          setProfile(null);
          setRole(null);
          writeCachedProfile(null);
        }
      } finally {
        if (mounted) setProfileLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [idToken]);

  const setIdToken = useCallback((token) => {
    setIdTokenState(token || null);
  }, []);

  /**
   * Supabase Auth — Login
   */
  const login = useCallback(async (userEmail, password) => {
    const trimmedEmail = (userEmail || '').trim();
    setLoading(true);

    try {
      let token = null;

      // 1. Attempt Supabase Auth Login only if a real Supabase URL is set
      const url = import.meta.env.VITE_SUPABASE_URL || '';
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
      const isRealSupabase = url && !url.includes('your-supabase-project') && !url.includes('xyzcompany') && key && !key.includes('your-supabase-anon-key') && !key.includes('dummykey');

      if (isRealSupabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });

        if (error) {
          setLoading(false);
          throw new Error(error.message);
        }
        token = data?.session?.access_token;
      }

      // 2. Local session JWT fallback (when Supabase is not yet linked or in development)
      if (!token) {
        const headerStr = JSON.stringify({ alg: 'HS256', typ: 'JWT' });
        const payloadStr = JSON.stringify({
          sub: `user-${trimmedEmail}`,
          email: trimmedEmail,
          password: password,
          name: localStorage.getItem('bookmytable_full_name') || trimmedEmail.split('@')[0],
          iat: Math.floor(Date.now() / 1000),
        });
        const b64uHeader = btoa(headerStr).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
        const b64uPayload = btoa(payloadStr).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
        token = `${b64uHeader}.${b64uPayload}.signature`;
      }

      localStorage.setItem(STORAGE_ID_TOKEN, token);
      setIdTokenState(token);
      setEmailState(trimmedEmail);
      setLoading(false);

      try {
        const { data: profileData } = await api.get('/api/users/profile');
        setRole(profileData.role || 'user');
        setProfile(profileData);
        writeCachedProfile(profileData);
      } catch {}

      return { token };
    } catch (err) {
      setLoading(false);
      throw err;
    }
  }, []);

  /**
   * Supabase Auth — Sign Up
   */
  const signUp = useCallback(async (userEmail, password, fullName) => {
    const trimmedEmail = (userEmail || '').trim();
    const trimmedName = (fullName || '').trim();
    if (!trimmedName) throw new Error('Full name is required');

    localStorage.setItem('bookmytable_full_name', trimmedName);
    setLoading(true);
    try {
      const url = import.meta.env.VITE_SUPABASE_URL || '';
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
      const isRealSupabase = url && !url.includes('your-supabase-project') && !url.includes('xyzcompany') && key && !key.includes('your-supabase-anon-key') && !key.includes('dummykey');

      let userConfirmed = false;
      if (isRealSupabase) {
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            data: { full_name: trimmedName },
          },
        });
        if (error) {
          setLoading(false);
          throw new Error(error.message);
        }
        userConfirmed = Boolean(data?.user?.confirmed_at);
      }

      setLoading(false);
      return {
        userConfirmed,
        email: trimmedEmail,
        cognitoUsername: trimmedEmail,
      };
    } catch (err) {
      setLoading(false);
      throw err;
    }
  }, []);

  /**
   * Supabase Auth — Confirm Sign Up
   */
  const confirmSignUp = useCallback(async (emailStr, code) => {
    setLoading(true);
    try {
      if (isRealSupabaseConfigured()) {
        const { error } = await supabase.auth.verifyOtp({
          email: emailStr.trim(),
          token: code.trim(),
          type: 'signup',
        });
        if (error) {
          setLoading(false);
          throw new Error(error.message);
        }
      }
      setLoading(false);
      return true;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  }, []);

  /**
   * Supabase Auth — Forgot Password
   */
  const forgotPassword = useCallback(async (emailStr) => {
    setLoading(true);
    try {
      if (isRealSupabaseConfigured()) {
        const { error } = await supabase.auth.resetPasswordForEmail(emailStr.trim());
        if (error) {
          setLoading(false);
          throw new Error(error.message);
        }
      }
      setLoading(false);
      return true;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  }, []);

  /**
   * Supabase Auth — Confirm Password
   */
  const confirmPassword = useCallback(async (emailStr, code, newPassword) => {
    setLoading(true);
    try {
      if (isRealSupabaseConfigured()) {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
          setLoading(false);
          throw new Error(error.message);
        }
      }
      setLoading(false);
      return true;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  }, []);

  /**
   * Resend Code
   */
  const resendConfirmationCode = useCallback(async (emailStr) => {
    return forgotPassword(emailStr);
  }, [forgotPassword]);

  /**
   * Logout
   */
  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut().catch(() => {});
    } catch {}

    setIdTokenState(null);
    setEmailState('');
    setProfile(null);
    setRole(null);
    localStorage.removeItem(STORAGE_ID_TOKEN);
    localStorage.removeItem(STORAGE_EMAIL);
    localStorage.removeItem('bookmytable_full_name');
    writeCachedProfile(null);
  }, []);

  useEffect(() => {
    const onSessionInvalid = () => {
      logout();
    };
    window.addEventListener(SESSION_INVALID_EVENT, onSessionInvalid);
    return () => window.removeEventListener(SESSION_INVALID_EVENT, onSessionInvalid);
  }, [logout]);

  const isAdmin = role === 'admin';

  const displayName = useMemo(() => {
    return (
      profile?.name?.trim() ||
      profile?.fullName?.trim() ||
      localStorage.getItem('bookmytable_full_name')?.trim() ||
      ''
    );
  }, [profile]);

  const value = useMemo(
    () => ({
      idToken,
      email,
      loading,
      profile,
      role,
      profileLoading,
      isAdmin,
      displayName,
      isAuthenticated: Boolean(idToken),
      login,
      signUp,
      confirmSignUp,
      forgotPassword,
      confirmPassword,
      resendConfirmationCode,
      logout,
      setIdToken,
      refreshProfile,
      patchProfile,
    }),
    [
      idToken,
      email,
      loading,
      profile,
      role,
      profileLoading,
      isAdmin,
      displayName,
      login,
      signUp,
      confirmSignUp,
      forgotPassword,
      confirmPassword,
      resendConfirmationCode,
      logout,
      setIdToken,
      refreshProfile,
      patchProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
