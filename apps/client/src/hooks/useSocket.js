import { useEffect, useRef } from 'react';
import { connectSocket, getSocket } from '../lib/socket.js';
import { usePresenceStore } from '../store/presenceStore.js';
import { useConversationStore } from '../store/conversationStore.js';
import { useMessageStore } from '../store/messageStore.js';
import { useTypingStore } from '../store/typingStore.js';

export const useSocket = (conversations, activeConversationId) => {
  const conversationsRef = useRef(conversations);
  const activeConversationIdRef = useRef(activeConversationId);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;

    const socket = getSocket();
    if (socket?.connected && activeConversationId) {
      socket.emit('join:conversation', activeConversationId);
    }
  }, [activeConversationId]);

  useEffect(() => {
    const socket = connectSocket();

    const joinConversations = () => {
      const ids = conversationsRef.current.map((c) => c.id);
      socket.emit('join:conversations', ids);
      socket.emit('presence:online', ids);
      if (activeConversationIdRef.current) {
        socket.emit('join:conversation', activeConversationIdRef.current);
      }
    };

    socket.on('connect', joinConversations);
    if (socket.connected) joinConversations();

    const handleTypingStart = ({ userId, username, conversationId }) => {
      useTypingStore.getState().setTyping(conversationId, userId, username);
    };

    const handleTypingStop = ({ userId, conversationId }) => {
      useTypingStore.getState().clearTyping(conversationId, userId);
    };

    const handleNewMessage = (message) => {
      useConversationStore.getState().updateLastMessage(message.conversationId, message);

      if (message.conversationId === activeConversationIdRef.current) {
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

    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);
    socket.on('message:new', handleNewMessage);
    socket.on('message:edited', handleEditedMessage);
    socket.on('message:deleted', handleDeletedMessage);
    socket.on('presence:online', handlePresenceOnline);
    socket.on('presence:offline', handlePresenceOffline);

    return () => {
      socket.off('connect', joinConversations);
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
      socket.off('message:new', handleNewMessage);
      socket.off('message:edited', handleEditedMessage);
      socket.off('message:deleted', handleDeletedMessage);
      socket.off('presence:online', handlePresenceOnline);
      socket.off('presence:offline', handlePresenceOffline);
    };
  }, []);

  return getSocket();
};
