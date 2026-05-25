import { useEffect } from 'react';
import { connectSocket, disconnectSocket, getSocket } from '../lib/socket.js';
import { usePresenceStore } from '../store/presenceStore.js';
import { useConversationStore } from '../store/conversationStore.js';

export const useSocket = (conversations) => {
  const { setOnline, setOffline } = usePresenceStore();
  const { updateLastMessage } = useConversationStore();

  useEffect(() => {
    const socket = connectSocket();
    const conversationIds = conversations.map((c) => c.id);

    socket.emit('join:conversations', conversationIds);
    socket.emit('presence:online', conversationIds);

    const handleNewMessage = (message) => {
      updateLastMessage(message.conversationId, message);
    };

    socket.on('message:new', handleNewMessage);
    socket.on('presence:online', ({ userId }) => setOnline(userId));
    socket.on('presence:offline', ({ userId }) => setOffline(userId));

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('presence:online');
      socket.off('presence:offline');
      disconnectSocket();
    };
  }, [conversations, setOnline, setOffline, updateLastMessage]);

  return getSocket();
};
