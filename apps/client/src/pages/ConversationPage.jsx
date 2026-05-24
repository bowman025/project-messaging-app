import { useLoaderData, useParams } from 'react-router';
import { useEffect, useRef } from 'react';
import { useMessageStore } from '../store/messageStore.js';
import { useAuthStore } from '../store/authStore.js';
import { getSocket } from '../lib/socket.js';
import MessageList from '../components/MessageList.jsx';
import MessageInput from '../components/MessageInput.jsx';

export default function ConversationPage() {
  const conversation = useLoaderData();
  const { id } = useParams();
  const { messages, setMessages, addMessage, updateMessage, deleteMessage } = useMessageStore();
  const user = useAuthStore((state) => state.user);
  const bottomRef = useRef(null);

  useEffect(() => {
    setMessages(conversation.messages);
  }, [conversation.messages, setMessages]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.emit('join:conversation', id);

    socket.on('message:new', (message) => {
      if (message.conversationId === id) addMessage(message);
    });

    socket.on('message:edited', (message) => {
      if (message.conversationId === id) updateMessage(message);
    });

    socket.on('message:deleted', ({ messageId, conversationId }) => {
      if (conversationId === id) deleteMessage(messageId);
    });

    return () => {
      socket.off('message:new');
      socket.off('message:edited');
      socket.off('message:deleted');
    };
  }, [id, addMessage, updateMessage, deleteMessage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (content) => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit('message:send', { conversationId: id, content });
  };

  const handleEdit = (messageId, content) => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit('message:edit', { messageId, conversationId: id, content });
  };

  const handleDelete = (messageId) => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit('message:delete', { messageId, conversationId: id });
  };

  return (
    <div className="conversation-page">
      <MessageList
        messages={messages}
        currentUserId={user?.id}
        onEdit={handleEdit}
        onDelete={handleDelete}
        bottomRef={bottomRef}
      />
      <MessageInput onSend={handleSend} />
    </div>
  );
}
