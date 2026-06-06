import { io } from 'socket.io-client';
import { getToken } from './api.js';

const SOCKET_URL = import.meta.env.VITE_API_URL ?? '/';

let socket = null;

export const getSocket = () => socket;

export const connectSocket = () => {
  if (socket) return socket;

  socket = io(SOCKET_URL, {
    auth: { token: getToken() },
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
