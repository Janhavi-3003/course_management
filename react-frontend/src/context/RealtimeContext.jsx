import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createSocket } from '../api/socketClient.js';
import { API_MODE } from '../api/apiClient.js';
import { useAuth } from './AuthContext.jsx';

const RealtimeContext = createContext({ socket: null, connected: false, online: [], enabled: false });

// One authenticated Socket.IO connection for the whole app while logged in.
export function RealtimeProvider({ children }) {
  const { token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [online, setOnline] = useState([]);
  const enabled = API_MODE !== 'mock';

  useEffect(() => {
    if (!enabled || !token) return undefined;
    const s = createSocket();
    s.on('connect', () => setConnected(true));
    s.on('disconnect', () => setConnected(false));
    s.on('connect_error', () => setConnected(false));
    s.on('online_users', setOnline);
    s.connect();
    setSocket(s);
    return () => {
      s.removeAllListeners();
      s.disconnect();
      setSocket(null);
      setConnected(false);
      setOnline([]);
    };
  }, [token, enabled]);

  const value = useMemo(() => ({ socket, connected, online, enabled }), [socket, connected, online, enabled]);
  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export const useRealtime = () => useContext(RealtimeContext);
