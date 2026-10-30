import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as api from '../services/api.js';
import { useAuth } from './AuthContext.jsx';
import { useRealtime } from './RealtimeContext.jsx';
import { errMsg } from '../utils/ui.js';
import Toast from '../components/Toast.jsx';

const DataContext = createContext(null);

// Central app state: course catalogue + notifications (+ toast messages).
export function DataProvider({ children }) {
  const { token, isStudent } = useAuth();
  const { socket } = useRealtime();

  const [courses, setCourses] = useState([]);
  const [coursesStatus, setCoursesStatus] = useState('loading'); // loading | ready | error
  const [coursesError, setCoursesError] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [toast, setToast] = useState('');

  const showToast = useCallback((msg) => {
    setToast(msg);
    window.clearTimeout(showToast.t);
    showToast.t = window.setTimeout(() => setToast(''), 3500);
  }, []);

  const loadCourses = useCallback(async () => {
    setCoursesStatus('loading');
    try {
      setCourses(await api.getCourses());
      setCoursesError('');
      setCoursesStatus('ready');
    } catch (e) {
      setCoursesError(errMsg(e));
      setCoursesStatus('error');
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    if (!token) { setNotifications([]); return; }
    try { setNotifications(await api.getNotifications()); } catch { /* ignore */ }
  }, [token]);

  useEffect(() => { loadCourses(); }, [loadCourses]);
  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  // live notifications pushed by the server
  useEffect(() => {
    if (!socket) return undefined;
    const onNew = (n) => {
      setNotifications((prev) => (prev.some((x) => x.id === n.id) ? prev : [n, ...prev]));
      showToast(`🔔 ${n.message}`);
    };
    socket.on('new_notification', onNew);
    return () => socket.off('new_notification', onNew);
  }, [socket, showToast]);

  const markRead = useCallback(async (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    try { await api.markRead(id); } catch { loadNotifications(); }
  }, [loadNotifications]);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try { await api.markAllRead(); } catch { loadNotifications(); }
  }, [loadNotifications]);

  const unread = notifications.filter((n) => !n.isRead).length;

  const value = useMemo(() => ({
    courses, coursesStatus, coursesError, loadCourses,
    notifications, unread, loadNotifications, markRead, markAllRead,
    showToast, isStudent,
  }), [courses, coursesStatus, coursesError, loadCourses, notifications, unread, loadNotifications, markRead, markAllRead, showToast, isStudent]);

  return (
    <DataContext.Provider value={value}>
      {children}
      <Toast message={toast} />
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
