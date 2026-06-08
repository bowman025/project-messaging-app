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
      if (!state.typingUsers[conversationId]) return state;

      const conversationTyping = { ...state.typingUsers[conversationId] };
      delete conversationTyping[userId];

      const nextTypingUsers = { ...state.typingUsers };

      if (Object.keys(conversationTyping).length === 0) {
        delete nextTypingUsers[conversationId];
      } else {
        nextTypingUsers[conversationId] = conversationTyping;
      }

      return { typingUsers: nextTypingUsers };
    }),
}));
