import { useLoaderData, useParams } from 'react-router';
import { useEffect, useRef } from 'react';
import { useMessageStore } from '../store/messageStore.js';
import { useConversationStore } from '../store/conversationStore.js';
import { useAuthStore } from '../store/authStore.js';
import { getSocket } from '../lib/socket.js';
import ConversationHeader from '../components/ConversationHeader.jsx';
import MessageList from '../components/MessageList.jsx';
import MessageInput from '../components/MessageInput.jsx';

export default function ConversationPage() {
  const conversation = useLoaderData();
  const { id } = useParams();
  const messages = useMessageStore((state) => state.messages);
  const setMessages = useMessageStore((state) => state.setMessages);
  const addMessage = useMessageStore((state) => state.addMessage);
  const clearUnread = useConversationStore((state) => state.clearUnread);
  const user = useAuthStore((state) => state.user);
  const bottomRef = useRef(null);

  useEffect(() => {
    setMessages(conversation.messages);
  }, [conversation.messages, setMessages]);

  useEffect(() => {
    clearUnread(id);
  }, [id, clearUnread]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (content) => {
    const socket = getSocket();
    if (!socket) return;

    const tempId = `temp_${Date.now()}`;

    addMessage({
      id: tempId,
      tempId,
      conversationId: id,
      authorId: user.id,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      edited: false,
      author: {
        id: user.id,
        username: user.username,
        avatarUrl: user.avatarUrl,
      },
      isOptimistic: true,
    });

    socket.emit('message:send', { conversationId: id, content, tempId });
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
      <ConversationHeader conversation={conversation} />
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