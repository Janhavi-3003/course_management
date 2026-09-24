import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getSession, isAdminIn, signOut as authSignOut } from '../utils/auth';
import { seedDefaults, getMyNotifications } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  useEffect(() => { seedDefaults(); }, []);

  const [session, setSessionState] = useState(() => getSession());
  const [admin, setAdminState] = useState(() => isAdminIn());

  const refresh = useCallback(() => {
    setSessionState(getSession());
    setAdminState(isAdminIn());
  }, []);

  const signOut = useCallback(() => {
    authSignOut();
    refresh();
  }, [refresh]);

  const unreadCount = session ? getMyNotifications(session.email).length : 0;

  const value = { session, admin, refresh, signOut, unreadCount };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
