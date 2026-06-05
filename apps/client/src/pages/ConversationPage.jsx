import { useLoaderData, useParams, useNavigate } from 'react-router';
import { useEffect, useRef, useCallback } from 'react';
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
    if (!storeConversation) {
      navigate('/conversations');
    }
  }, [storeConversation, navigate]);
  const messages = useMessageStore((state) => state.messages);
  const nextCursor = useMessageStore((state) => state.nextCursor);
  const hasMore = useMessageStore((state) => state.hasMore);
  const setMessages = useMessageStore((state) => state.setMessages);
  const prependMessages = useMessageStore((state) => state.prependMessages);
  const addMessage = useMessageStore((state) => state.addMessage);
  const clearUnread = useConversationStore((state) => state.clearUnread);
  const user = useAuthStore((state) => state.user);
  const bottomRef = useRef(null);
  const topRef = useRef(null);
  const messageListRef = useRef(null);
  const isLoadingMore = useRef(false);
  const hasInitiallyScrolled = useRef(false);
  const prevMessageCountRef = useRef(0);

  useEffect(() => {
    setMessages(conversation.messages, conversation.nextCursor);
  }, [conversation.messages, conversation.nextCursor, setMessages]);

  useEffect(() => {
    hasInitiallyScrolled.current = false;
    prevMessageCountRef.current = 0;
    clearUnread(id);
  }, [id, clearUnread]);

  useEffect(() => {
    if (messages.length > 0 && !hasInitiallyScrolled.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'instant' });
      hasInitiallyScrolled.current = true;
    }
  }, [messages]);

  useEffect(() => {
    const prevCount = prevMessageCountRef.current;
    const currentCount = messages.length;

    if (currentCount > prevCount && hasInitiallyScrolled.current) {
      const lastMessage = messages[currentCount - 1];
      if (lastMessage && !lastMessage.isOlderBatch) {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }

    prevMessageCountRef.current = currentCount;
  }, [messages]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore.current || !nextCursor) return;

    isLoadingMore.current = true;

    const container = messageListRef.current;
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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.1 }
    );

    const current = topRef.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, [loadMore]);

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
    <div className="conversation-page">
      <ConversationHeader conversation={displayedConversation} />
      <MessageList
        messages={messages}
        currentUserId={user?.id}
        onEdit={handleEdit}
        onDelete={handleDelete}
        bottomRef={bottomRef}
        topRef={topRef}
        hasMore={hasMore}
        containerRef={messageListRef}
      />
      <TypingIndicator conversationId={id} />
      <MessageInput onSend={handleSend} conversationId={id} />
    </div>
  );
}
