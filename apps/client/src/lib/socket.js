import { io } from 'socket.io-client';
import { getToken } from './api.js';

let socket = null;

export const getSocket = () => socket;

export const connectSocket = () => {
  if (socket) return socket;

  socket = io('/', {
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
