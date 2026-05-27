import { useLoaderData, useParams } from 'react-router';
import { useEffect, useRef } from 'react';
import { useMessageStore } from '../store/messageStore.js';
import { useAuthStore } from '../store/authStore.js';
import { getSocket } from '../lib/socket.js';
import ConversationHeader from '../components/ConversationHeader.jsx';
import MessageList from '../components/MessageList.jsx';
import MessageInput from '../components/MessageInput.jsx';

export default function ConversationPage() {
  const conversation = useLoaderData();
  const { id } = useParams();
  const { messages, setMessages, addMessage } = useMessageStore();
  const user = useAuthStore((state) => state.user);
  const bottomRef = useRef(null);

  useEffect(() => {
    setMessages(conversation.messages);
  }, [conversation.messages, setMessages]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.emit('join:conversation', id);

    const handleNewMessage = (message) => {
      if (message.conversationId === id) {
        if (message.tempId) {
          useMessageStore.getState().confirmMessage(message.tempId, message);
        } else {
          useMessageStore.getState().addMessage(message);
        }
      }
    };

    const handleEditedMessage = (message) => {
      if (message.conversationId === id) useMessageStore.getState().updateMessage(message);
    };

    const handleDeletedMessage = ({ messageId, conversationId }) => {
      if (conversationId === id) useMessageStore.getState().deleteMessage(messageId);
    };

    const handleError = ({ tempId }) => {
      if (tempId) useMessageStore.getState().removeMessage(tempId);
    };

    socket.on('message:new', handleNewMessage);
    socket.on('message:edited', handleEditedMessage);
    socket.on('message:deleted', handleDeletedMessage);
    socket.on('error', handleError);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('message:edited', handleEditedMessage);
      socket.off('message:deleted', handleDeletedMessage);
      socket.off('error', handleError);
    };
  }, [id]);

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
