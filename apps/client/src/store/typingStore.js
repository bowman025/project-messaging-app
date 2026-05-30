import { create } from 'zustand';

export const useTypingStore = create((set) => ({
  typingUsers: {},

  setTyping: (conversationId, userId, username) =>
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [conversationId]: {
          ...state.typingUsers[conversationId],
          [userId]: username,
        },
      },
    })),

  clearTyping: (conversationId, userId) =>
    set((state) => {
      const conversationTyping = { ...state.typingUsers[conversationId] };
      delete conversationTyping[userId];
      return {
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: conversationTyping,
        },
      };
    }),
}));
