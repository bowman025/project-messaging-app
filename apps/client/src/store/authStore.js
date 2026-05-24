import { create } from 'zustand';
import { getToken, setToken, removeToken } from '../lib/api.js';

export const useAuthStore = create((set) => ({
  token: getToken(),
  user: null,

  setAuth: (token, user) => {
    setToken(token);
    set({ token, user });
  },

  clearAuth: () => {
    removeToken();
    set({ token: null, user: null });
  },

  setUser: (user) => set({ user }),
}));
