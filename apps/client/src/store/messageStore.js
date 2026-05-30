import { create } from 'zustand';

export const useMessageStore = create((set) => ({
  messages: [],
  nextCursor: null,
  hasMore: true,

  setMessages: (messages, nextCursor) => set({
    messages,
    nextCursor: nextCursor ?? null,
    hasMore: nextCursor !== null,
  }),

  prependMessages: (olderMessages, nextCursor) =>
    set((state) => ({
      messages: [
        ...olderMessages.map((m) => ({ ...m, isOlderBatch: true })),
        ...state.messages,
      ],
      nextCursor: nextCursor ?? null,
      hasMore: nextCursor !== null,
    })),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  confirmMessage: (tempId, realMessage) =>
    set((state) => ({
      messages: state.messages.map((m) => (m.id === tempId ? realMessage : m)),
    })),

  removeMessage: (id) =>
    set((state) => ({
      messages: state.messages.filter((m) => m.id !== id),
    })),

  updateMessage: (updatedMessage) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === updatedMessage.id ? updatedMessage : m
      ),
    })),

  deleteMessage: (messageId) =>
    set((state) => ({
      messages: state.messages.filter((m) => m.id !== messageId),
    })),
}));
