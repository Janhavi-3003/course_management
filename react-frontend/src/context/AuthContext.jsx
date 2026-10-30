import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as api from '../services/api.js';
import { clearSession, getSession, saveSession, updateStoredUser } from '../utils/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => getSession());

  // token expired / rejected by the API -> logged out everywhere
  useEffect(() => {
    const onExpired = () => setSession(null);
    window.addEventListener('cm:session-expired', onExpired);
    return () => window.removeEventListener('cm:session-expired', onExpired);
  }, []);

  const startSession = useCallback((data) => {
    saveSession(data);
    setSession(getSession());
    return data.user;
  }, []);

  const studentLogin = useCallback(async (email, password) => startSession(await api.login(email, password)), [startSession]);

  const adminLogin = useCallback(async (adminId, password) => {
    const data = await api.adminLogin(adminId, password);
    return startSession(data);
  }, [startSession]);

  const register = useCallback((body) => api.register(body), []);

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  const refreshUser = useCallback((user) => {
    updateStoredUser(user);
    setSession(getSession());
  }, []);

  const value = useMemo(() => ({
    session,
    token: session?.token || null,
    user: session?.user || null,
    role: session?.role || null,
    isStudent: session?.role === 'student',
    isAdmin: session?.role === 'admin',
    studentLogin, adminLogin, register, logout, refreshUser,
  }), [session, studentLogin, adminLogin, register, logout, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
