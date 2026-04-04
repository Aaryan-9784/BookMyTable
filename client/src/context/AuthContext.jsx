/**
 * Auth via Amazon Cognito — ID JWT + MongoDB profile (role) from /api/users/profile.
 */
import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
} from 'amazon-cognito-identity-js';
import api from '../services/api.js';
import { STORAGE_ID_TOKEN, STORAGE_EMAIL } from '../utils/constants.js';
import { SESSION_INVALID_EVENT } from '../utils/authSession.js';

const AuthContext = createContext(null);

function getPool() {
  const UserPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
  const ClientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
  if (!UserPoolId || !ClientId) {
    console.warn('[Auth] Missing VITE_COGNITO_USER_POOL_ID or VITE_COGNITO_CLIENT_ID');
    return null;
  }
  return new CognitoUserPool({ UserPoolId, ClientId });
}

export function AuthProvider({ children }) {
  const [idToken, setIdTokenState] = useState(() => localStorage.getItem(STORAGE_ID_TOKEN));
  const [email, setEmailState] = useState(() => localStorage.getItem(STORAGE_EMAIL) || '');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

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
      return null;
    }
    try {
      const { data } = await api.get('/api/users/profile');
      setRole(data.role || 'user');
      setProfile(data);
      return data;
    } catch {
      setProfile(null);
      setRole(null);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!idToken) {
      setProfile(null);
      setRole(null);
      setProfileLoading(false);
      return;
    }
    let mounted = true;
    setProfileLoading(true);
    (async () => {
      try {
        const { data } = await api.get('/api/users/profile');
        if (mounted) {
          setRole(data.role || 'user');
          setProfile(data);
        }
      } catch {
        if (mounted) {
          setProfile(null);
          setRole(null);
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

  const login = useCallback((username, password) => {
    const pool = getPool();
    if (!pool) return Promise.reject(new Error('Cognito is not configured'));

    setLoading(true);
    const user = new CognitoUser({ Username: username, Pool: pool });
    const auth = new AuthenticationDetails({ Username: username, Password: password });

    return new Promise((resolve, reject) => {
      user.authenticateUser(auth, {
        onSuccess: async (session) => {
          const token = session.getIdToken().getJwtToken();
          localStorage.setItem(STORAGE_ID_TOKEN, token);
          setIdTokenState(token);
          setEmailState(username);
          setLoading(false);
          try {
            const { data } = await api.get('/api/users/profile');
            setRole(data.role || 'user');
            setProfile(data);
          } catch {
            setRole(null);
            setProfile(null);
          }
          resolve({ token });
        },
        onFailure: (err) => {
          setLoading(false);
          reject(err);
        },
      });
    });
  }, []);

  const signUp = useCallback((email, password, fullName) => {
    const pool = getPool();
    if (!pool) return Promise.reject(new Error('Cognito is not configured'));

    const trimmed = email.trim();
    const nameTrimmed = (fullName || '').trim();
    if (!nameTrimmed) {
      return Promise.reject(new Error('Full name is required'));
    }

    const cognitoUsername = crypto.randomUUID();

    const attributeList = [
      { Name: 'email', Value: trimmed },
      { Name: 'name', Value: nameTrimmed },
    ];

    setLoading(true);
    return new Promise((resolve, reject) => {
      pool.signUp(
        cognitoUsername,
        password,
        attributeList,
        null,
        (err, result) => {
          setLoading(false);
          if (err) reject(err);
          else resolve({ ...result, cognitoUsername, email: trimmed });
        }
      );
    });
  }, []);

  const confirmSignUp = useCallback((cognitoUsername, code) => {
    const pool = getPool();
    if (!pool) return Promise.reject(new Error('Cognito is not configured'));

    const user = new CognitoUser({ Username: cognitoUsername, Pool: pool });
    setLoading(true);
    return new Promise((resolve, reject) => {
      user.confirmRegistration(code, true, (err, result) => {
        setLoading(false);
        if (err) reject(err);
        else resolve(result);
      });
    });
  }, []);

  const logout = useCallback(() => {
    const pool = getPool();
    const user = pool?.getCurrentUser();
    if (user) {
      user.signOut();
    }
    setIdTokenState(null);
    setEmailState('');
    setProfile(null);
    setRole(null);
    localStorage.removeItem(STORAGE_ID_TOKEN);
    localStorage.removeItem(STORAGE_EMAIL);
  }, []);

  useEffect(() => {
    const onSessionInvalid = () => {
      logout();
    };
    window.addEventListener(SESSION_INVALID_EVENT, onSessionInvalid);
    return () => window.removeEventListener(SESSION_INVALID_EVENT, onSessionInvalid);
  }, [logout]);

  const isAdmin = role === 'admin';

  const value = useMemo(
    () => ({
      idToken,
      email,
      loading,
      profile,
      role,
      profileLoading,
      isAdmin,
      isAuthenticated: Boolean(idToken),
      login,
      signUp,
      confirmSignUp,
      logout,
      setIdToken,
      refreshProfile,
    }),
    [
      idToken,
      email,
      loading,
      profile,
      role,
      profileLoading,
      isAdmin,
      login,
      signUp,
      confirmSignUp,
      logout,
      setIdToken,
      refreshProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
