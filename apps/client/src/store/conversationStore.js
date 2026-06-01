import { create } from 'zustand';

export const useConversationStore = create((set) => ({
  conversations: [],
  unreadCounts: {},

  setConversations: (conversations) => set({ conversations }),

  addConversation: (conversation) =>
    set((state) => {
      const exists = state.conversations.some((c) => c.id === conversation.id);
      if (exists) return {};
      return {
        conversations: [conversation, ...state.conversations],
      };
    }),

  removeConversation: (id) =>
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== id),
      unreadCounts: Object.fromEntries(
        Object.entries(state.unreadCounts).filter(([key]) => key !== id)
      ),
    })),

  removeParticipant: (conversationId, userId) => {
    set((state) => {
      const normalize = (p) => {
        if (p == null) return null;
        if (typeof p === 'string') return p;
        return String(p.user?.id ?? p.userId ?? p.id ?? null);
      };

      const updated = state.conversations.map((c) =>
        c.id === conversationId
          ? {
            ...c,
            participants: c.participants.filter((p) => normalize(p) !== String(userId)),
          }
          : c
      );

      return {
        conversations: updated,
      };
    });
  },

  updateLastMessage: (conversationId, message) =>
    set((state) => ({
      conversations: state.conversations
        .map((c) =>
          c.id === conversationId
            ? { ...c, messages: [message], updatedAt: message.createdAt }
            : c
        )
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
    })),

  incrementUnread: (conversationId) =>
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [conversationId]: (state.unreadCounts[conversationId] ?? 0) + 1,
      },
    })),

  clearUnread: (conversationId) =>
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [conversationId]: 0,
      },
    })),
}));
