import { io } from 'socket.io-client';

// Backend origin WITHOUT /api/v1
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export function createSocket() {
  return io(SOCKET_URL, {
    autoConnect: false,
    auth: { token: sessionStorage.getItem('token') },
  });
}
