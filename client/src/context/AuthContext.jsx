/**
 * Auth Context Provider — Pure MongoDB Authentication & JWT Session Token.
 */
import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';
import api from '../services/api.js';
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
      setRole(data.role || 'customer');
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
          setRole(data.role || 'customer');
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
    return () => {
      mounted = false;
    };
  }, [idToken]);

  const setIdToken = useCallback((token) => {
    setIdTokenState(token || null);
  }, []);

  const setAuthSession = useCallback((token, user) => {
    if (token) {
      localStorage.setItem(STORAGE_ID_TOKEN, token);
      setIdTokenState(token);
    }
    if (user?.email) {
      localStorage.setItem(STORAGE_EMAIL, user.email);
      setEmailState(user.email);
    }
    if (user?.name) {
      localStorage.setItem('bookmytable_full_name', user.name);
    }
    if (user?.role) {
      setRole(user.role);
    }
    if (user) {
      setProfile(user);
      writeCachedProfile(user);
    }
  }, []);

  /**
   * MongoDB Login
   */
  const login = useCallback(async (userEmail, password) => {
    const trimmedEmail = (userEmail || '').trim();
    setLoading(true);

    try {
      const res = await api.post('/api/auth/login', {
        email: trimmedEmail,
        password,
      });

      const token = res.data?.token;
      if (!token) {
        setLoading(false);
        throw new Error('Authentication failed - no token received');
      }

      localStorage.setItem(STORAGE_ID_TOKEN, token);
      setIdTokenState(token);
      setEmailState(trimmedEmail);

      const user = res.data?.user || {};
      if (user.role) {
        setRole(user.role);
      }
      if (user.name) {
        localStorage.setItem('bookmytable_full_name', user.name);
      }

      setProfile(user);
      writeCachedProfile(user);
      setLoading(false);

      // Refresh full profile in background
      api.get('/api/users/profile').then(({ data }) => {
        setProfile(data);
        setRole(data.role || user.role || 'customer');
        writeCachedProfile(data);
      }).catch(() => {});

      return { token, profile: user };
    } catch (err) {
      setLoading(false);
      throw err;
    }
  }, []);

  /**
   * MongoDB Sign Up / Register
   */
  const signUp = useCallback(async (userEmail, password, fullName) => {
    const trimmedEmail = (userEmail || '').trim();
    const trimmedName = (fullName || '').trim();

    if (!trimmedName) {
      throw new Error('Full name is required');
    }

    localStorage.setItem('bookmytable_full_name', trimmedName);
    setLoading(true);

    try {
      const res = await api.post('/api/auth/register', {
        email: trimmedEmail,
        password,
        fullName: trimmedName,
      });

      setLoading(false);
      return {
        userConfirmed: true,
        email: trimmedEmail,
        user: res.data?.user,
      };
    } catch (err) {
      setLoading(false);
      throw err;
    }
  }, []);

  /**
   * Confirm Sign Up
   */
  const confirmSignUp = useCallback(async () => {
    return true;
  }, []);

  /**
   * Forgot Password
   */
  const forgotPassword = useCallback(async (emailStr) => {
    return true;
  }, []);

  /**
   * Confirm Password Reset
   */
  const confirmPassword = useCallback(async (emailStr, code, newPassword) => {
    setLoading(true);
    try {
      await api.post('/api/auth/reset-password', {
        email: emailStr.trim(),
        newPassword,
      });
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
    return true;
  }, []);

  /**
   * Logout
   */
  const logout = useCallback(async () => {
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

  const userRole = (role || 'customer').toLowerCase();
  const isAdmin = userRole === 'admin';
  const isRestaurant = userRole === 'restaurant';
  const isCustomer = userRole === 'customer';

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
      role: userRole,
      userRole,
      profileLoading,
      isAdmin,
      isRestaurant,
      isCustomer,
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
      setAuthSession,
      refreshProfile,
      patchProfile,
    }),
    [
      idToken,
      email,
      loading,
      profile,
      role,
      userRole,
      profileLoading,
      isAdmin,
      isRestaurant,
      isCustomer,
      displayName,
      login,
      signUp,
      confirmSignUp,
      forgotPassword,
      confirmPassword,
      resendConfirmationCode,
      logout,
      setIdToken,
      setAuthSession,
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
