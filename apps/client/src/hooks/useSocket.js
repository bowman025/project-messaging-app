import { useEffect, useRef } from 'react';
import { connectSocket, getSocket } from '../lib/socket.js';
import { usePresenceStore } from '../store/presenceStore.js';
import { useConversationStore } from '../store/conversationStore.js';
import { useMessageStore } from '../store/messageStore.js';
import { useTypingStore } from '../store/typingStore.js';

export const useSocket = (conversations, activeConversationId) => {
  const conversationsRef = useRef(conversations);
  const activeConversationIdRef = useRef(activeConversationId);
  const previousConversationIdRef = useRef(null);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  useEffect(() => {
    const socket = getSocket();

    if (!socket?.connected) {
      previousConversationIdRef.current = activeConversationId;
      return;
    }

    const previousId = previousConversationIdRef.current;

    if (activeConversationId && previousId !== activeConversationId) {
      socket.emit('join:conversation', activeConversationId);
    }

    previousConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  useEffect(() => {
    const socket = connectSocket();

    const joinRooms = () => {
      const conversationIds = conversationsRef.current.map((conversation) => conversation.id);

      socket.emit('join:conversations', conversationIds);
      socket.emit('presence:online', conversationIds);

      const activeId = activeConversationIdRef.current;

      if (activeId) {
        socket.emit('join:conversation', activeId);
      }
    };

    const handleTypingStart = ({ userId, username, conversationId }) => {
      useTypingStore.getState().setTyping(conversationId, userId, username);
    };

    const handleTypingStop = ({ userId, conversationId }) => {
      useTypingStore.getState().clearTyping(conversationId, userId);
    };

    const handleNewMessage = (message) => {
      const activeId = activeConversationIdRef.current;

      useConversationStore.getState().updateLastMessage(message.conversationId, message);

      if (message.conversationId === activeId) {
        if (message.tempId) {
          useMessageStore.getState().confirmMessage(message.tempId, message);
        } else {
          useMessageStore.getState().addMessage(message);
        }
      } else {
        useConversationStore.getState().incrementUnread(message.conversationId);
      }
    };

    const handleEditedMessage = (message) => {
      if (message.conversationId === activeConversationIdRef.current) {
        useMessageStore.getState().updateMessage(message);
      }
    };

    const handleDeletedMessage = ({ messageId, conversationId }) => {
      if (conversationId === activeConversationIdRef.current) {
        useMessageStore.getState().deleteMessage(messageId);
      }
    };

    const handlePresenceOnline = ({ userId }) => {
      usePresenceStore.getState().setOnline(userId);
    };

    const handlePresenceOffline = ({ userId }) => {
      usePresenceStore.getState().setOffline(userId);
    };

    const handleConversationDeleted = ({ conversationId }) => {
      useConversationStore.getState().removeConversation(conversationId);
    };

    const handleParticipantLeft = ({ conversationId, userId, deleted }) => {
      if (deleted) {
        useConversationStore.getState().removeConversation(conversationId);
      } else {
        useConversationStore.getState().removeParticipant(conversationId, userId);
      }
    };

    const handleNewConversation = (conversation) => {
      try {
        const store = useConversationStore.getState();
        const exists = store.conversations.some((c) => c.id === conversation.id);
        if (!exists) {
          store.addConversation(conversation);
        }
        const s = getSocket();
        if (s?.connected) {
          s.emit('join:conversation', conversation.id);
        }
      } catch (err) {
        console.error('Error handling conversation:new', err);
      }
    };

    socket.on('connect', joinRooms);

    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);

    socket.on('message:new', handleNewMessage);
    socket.on('message:edited', handleEditedMessage);
    socket.on('message:deleted', handleDeletedMessage);

    socket.on('presence:online', handlePresenceOnline);
    socket.on('presence:offline', handlePresenceOffline);

    socket.on('conversation:participant_left', handleParticipantLeft);
    socket.on('conversation:new', handleNewConversation);
    socket.on('conversation:deleted', handleConversationDeleted);

    if (socket.connected) {
      joinRooms();
    }

    return () => {
      socket.off('connect', joinRooms);

      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);

      socket.off('message:new', handleNewMessage);
      socket.off('message:edited', handleEditedMessage);
      socket.off('message:deleted', handleDeletedMessage);

      socket.off('presence:online', handlePresenceOnline);
      socket.off('presence:offline', handlePresenceOffline);

      socket.off('conversation:participant_left', handleParticipantLeft);
      socket.off('conversation:new', handleNewConversation);
      socket.off('conversation:deleted', handleConversationDeleted);
    };
  }, []);

  return getSocket();
};
