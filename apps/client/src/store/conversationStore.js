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

  removeParticipant: (conversationId, userId) => {
    console.warn('removeParticipant called', { conversationId, userId });
    set((state) => {
      const conversation = state.conversations.find((c) => c.id === conversationId);
      console.warn(
        'conversation found:',
        conversation?.id,
        'participants:',
        conversation?.participants?.map((p) => p.user?.id ?? p.userId)
      );
      return {
        conversations: state.conversations.map((c) =>
          c.id === conversationId
            ? {
              ...c,
              participants: c.participants.filter(
                (p) => String(p.user?.id ?? p.userId) !== String(userId)
              ),
            }
            : c
        ),
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
