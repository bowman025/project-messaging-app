import { create } from 'zustand';

export const useConversationStore = create((set) => ({
  conversations: [],
  unreadCounts: {},

  setConversations: (conversations) => set({ conversations }),

  addConversation: (conversation) =>
    set((state) => ({
      conversations: [conversation, ...state.conversations],
    })),

  removeConversation: (id) =>
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== id),
      unreadCounts: Object.fromEntries(
        Object.entries(state.unreadCounts).filter(([key]) => key !== id)
      ),
    })),

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
