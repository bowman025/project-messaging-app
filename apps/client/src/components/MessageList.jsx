import { useState, useRef, useEffect, useCallback } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { useParams } from 'react-router';
import Avatar from './Avatar.jsx';

export default function MessageList({
  messages,
  currentUserId,
  onEdit,
  onDelete,
  hasMore,
  onLoadMore,
  containerRef,
}) {
  const { id: conversationId } = useParams();
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const editInputRef = useRef(null);
  const [selectedId, setSelectedId] = useState(null);

  const isInitialRenderComplete = useRef(false);
  const sentinelRef = useRef(null);
  const onLoadMoreRef = useRef(onLoadMore);

  useEffect(() => {
    isInitialRenderComplete.current = false;
  }, [conversationId]);

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    if (editingId) editInputRef.current?.focus();
  }, [editingId]);

  useEffect(() => {
    const container = containerRef?.current;
    const currentSentinel = sentinelRef.current;
    if (!container || !currentSentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && isInitialRenderComplete.current) {
          onLoadMoreRef.current();
        }
      },
      { threshold: 0.1, root: container }
    );

    observer.observe(currentSentinel);
    return () => observer.unobserve(currentSentinel);
  }, [containerRef, conversationId]);

  const forceScrollToBottom = useCallback((node) => {
    if (!node) return;
    node.style.scrollBehavior = 'auto';
    node.scrollTop = node.scrollHeight;
    isInitialRenderComplete.current = true;
  }, []);

  const setMergedRefs = useCallback((node) => {
    if (containerRef) {
      containerRef.current = node;
    }

    if (node && !isInitialRenderComplete.current) {
      if (messages.length === 0) {
        isInitialRenderComplete.current = true;
      } else {
        requestAnimationFrame(() => {
          forceScrollToBottom(node);
        });
      }
    }
  }, [containerRef, forceScrollToBottom, messages.length]);

  useEffect(() => {
    if (!isInitialRenderComplete.current && messages.length > 0) {
      requestAnimationFrame(() => {
        forceScrollToBottom(containerRef?.current);
      });
    }
  }, [messages.length, conversationId, forceScrollToBottom, containerRef]);

  const startEdit = (message) => {
    setEditingId(message.id);
    setEditContent(message.content);
    setSelectedId(null);
  };

  const submitEdit = (messageId) => {
    if (editContent.trim()) onEdit(messageId, editContent.trim());
    setEditingId(null);
    setEditContent('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  return (
    <div className="message-list" ref={setMergedRefs}>
      <div ref={sentinelRef} className="message-list-top" style={{ height: '1px' }}>
        {hasMore && (
          <div style={{ padding: '10px 0', display: 'flex', justifyContent: 'center' }}>
            <div className="loading-spinner" />
          </div>
        )}
      </div>

      {messages.map((message) => {
        const isOwn = message.authorId === currentUserId;
        return (
          <div
            key={message.id}
            className={`message ${isOwn ? 'message--own' : ''} ${message.isOptimistic ? 'message--optimistic' : ''}`}
          >
            {!isOwn && <Avatar user={message.author} size="sm" />}
            <div className="message-body">
              {!isOwn && <span className="message-author">{message.author.username}</span>}

              {isOwn && editingId !== message.id ? (
                <div
                  className="message-select-btn"
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedId((prev) => (prev === message.id ? null : message.id))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedId((prev) => (prev === message.id ? null : message.id));
                    }
                  }}
                  aria-label="Message options"
                  aria-expanded={selectedId === message.id}
                >
                  <div className="message-content">
                    {message.imageUrl && (
                      <button
                        className="message-image-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(message.imageUrl, '_blank');
                        }}
                        aria-label="Open attachment"
                      >
                        <img src={message.imageUrl} alt="Attachment" className="message-image" />
                      </button>
                    )}
                    {message.content && (
                      <p>
                        {message.content}
                        {message.edited && <span className="message-edited"> (edited)</span>}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="message-content">
                  {message.imageUrl && (
                    <button
                      className="message-image-btn"
                      onClick={() => window.open(message.imageUrl, '_blank')}
                      aria-label="Open attachment"
                    >
                      <img src={message.imageUrl} alt="Attachment" className="message-image" />
                    </button>
                  )}
                  {message.content && (
                    <p>
                      {message.content}
                      {message.edited && <span className="message-edited"> (edited)</span>}
                    </p>
                  )}
                </div>
              )}
              <span
                className="message-time"
                title={format(new Date(message.createdAt), 'MMM d, yyyy HH:mm')}
              >
                {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
              </span>
              {isOwn && editingId !== message.id && selectedId === message.id && (
                <div className="message-actions">
                  <button onClick={() => startEdit(message)}>Edit</button>
                  <button onClick={() => onDelete(message.id)}>Delete</button>
                </div>
              )}
              {editingId === message.id && (
                <div className="message-edit">
                  <input
                    ref={editInputRef}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') submitEdit(message.id);
                      if (e.key === 'Escape') cancelEdit();
                    }}
                  />
                  <button onClick={() => submitEdit(message.id)}>Save</button>
                  <button onClick={cancelEdit}>Cancel</button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
