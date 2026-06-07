import { useLoaderData, useParams, useNavigate } from 'react-router';
import { useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { useMessageStore } from '../store/messageStore.js';
import { useConversationStore } from '../store/conversationStore.js';
import { useAuthStore } from '../store/authStore.js';
import { getSocket } from '../lib/socket.js';
import { fetchWithAuth } from '../lib/api.js';
import ConversationHeader from '../components/ConversationHeader.jsx';
import MessageList from '../components/MessageList.jsx';
import MessageInput from '../components/MessageInput.jsx';
import TypingIndicator from '../components/TypingIndicator.jsx';

export default function ConversationPage() {
  const conversation = useLoaderData();
  const { id } = useParams();
  const storeConversation = useConversationStore((state) =>
    state.conversations.find((c) => c.id === id)
  );
  const displayedConversation = {
    ...conversation,
    participants: storeConversation?.participants ?? conversation.participants,
    name: storeConversation?.name ?? conversation.name,
    updatedAt: storeConversation?.updatedAt ?? conversation.updatedAt,
  };

  const navigate = useNavigate();

  useEffect(() => {
    if (!storeConversation) navigate('/conversations');
  }, [storeConversation, navigate]);

  const messages = useMessageStore((state) => state.messages);
  const nextCursor = useMessageStore((state) => state.nextCursor);
  const hasMore = useMessageStore((state) => state.hasMore);
  const setMessages = useMessageStore((state) => state.setMessages);
  const prependMessages = useMessageStore((state) => state.prependMessages);
  const addMessage = useMessageStore((state) => state.addMessage);
  const clearUnread = useConversationStore((state) => state.clearUnread);
  const user = useAuthStore((state) => state.user);

  const containerRef = useRef(null);
  const isLoadingMore = useRef(false);

  const scrollToBottom = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, []);

  const isNearBottom = useCallback(() => {
    const container = containerRef.current;
    if (!container) return true;
    return container.scrollHeight - container.scrollTop - container.clientHeight < 150;
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore.current || !nextCursor) return;

    isLoadingMore.current = true;
    const container = containerRef.current;
    const scrollHeightBefore = container?.scrollHeight ?? 0;

    try {
      const res = await fetchWithAuth(`/api/conversations/${id}/messages?cursor=${nextCursor}`);
      if (!res.ok) return;
      const data = await res.json();
      prependMessages(data.messages, data.nextCursor);

      requestAnimationFrame(() => {
        if (container) {
          container.scrollTop = container.scrollHeight - scrollHeightBefore;
        }
      });
    } finally {
      isLoadingMore.current = false;
    }
  }, [id, nextCursor, hasMore, prependMessages]);

  useLayoutEffect(() => {
    setMessages(conversation.messages, conversation.nextCursor);
  }, [conversation.messages, conversation.nextCursor, setMessages]);

  useEffect(() => {
    clearUnread(id);
  }, [id, clearUnread]);

  const totalMessagesCount = messages.length;
  const lastMessageId = messages[messages.length - 1]?.id;
  useEffect(() => {
    if (isNearBottom()) {
      scrollToBottom();
    }
  }, [totalMessagesCount, lastMessageId, isNearBottom, scrollToBottom]);

  const handleSend = ({ content, imageUrl } = {}) => {
    const socket = getSocket();
    if (!socket) return;
    const tempId = `temp_${Date.now()}`;
    addMessage({
      id: tempId,
      tempId,
      conversationId: id,
      authorId: user.id,
      content: content ?? null,
      imageUrl: imageUrl ?? null,
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
    socket.emit('message:send', { conversationId: id, content, imageUrl, tempId });
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
    <div className="conversation-page" key={id}>
      <ConversationHeader conversation={displayedConversation} />
      <MessageList
        key={id}
        messages={messages}
        currentUserId={user?.id}
        onEdit={handleEdit}
        onDelete={handleDelete}
        hasMore={hasMore}
        onLoadMore={loadMore}
        containerRef={containerRef}
      />
      <TypingIndicator conversationId={id} />
      <MessageInput onSend={handleSend} conversationId={id} />
    </div>
  );
}
