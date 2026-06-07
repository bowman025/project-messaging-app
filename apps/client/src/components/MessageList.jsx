import { useState, useRef, useEffect } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
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
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const editInputRef = useRef(null);
  const sentinelRef = useRef(null);
  const onLoadMoreRef = useRef(onLoadMore);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    if (editingId) editInputRef.current?.focus();
  }, [editingId]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onLoadMoreRef.current();
      },
      { threshold: 0.1, root: containerRef?.current }
    );

    const current = sentinelRef.current;
    if (current) observer.observe(current);
    return () => {
      if (current) observer.unobserve(current);
    };
  }, [onLoadMoreRef, containerRef]);

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
    <div className="message-list" ref={containerRef}>
      <div ref={sentinelRef} className="message-list-top">
        {hasMore && <div className="loading-spinner" />}
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
                          /* Stops the click from triggering the parent div's select event */
                          e.stopPropagation();
                          window.open(message.imageUrl, '_blank');
                        }}
                        aria-label="Open attachment"
                      >
                        <img
                          src={message.imageUrl}
                          alt="Attachment"
                          className="message-image"
                          onLoad={() => {
                            const container = containerRef?.current;
                            if (!container) return;
                            const distanceFromBottom =
                              container.scrollHeight - container.scrollTop - container.clientHeight;
                            if (distanceFromBottom < 200)
                              container.scrollTop = container.scrollHeight;
                          }}
                        />
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
                      <img
                        src={message.imageUrl}
                        alt="Attachment"
                        className="message-image"
                        onLoad={() => {
                          const container = containerRef?.current;
                          if (!container) return;
                          const distanceFromBottom =
                            container.scrollHeight - container.scrollTop - container.clientHeight;
                          if (distanceFromBottom < 200) {
                            container.scrollTop = container.scrollHeight;
                          }
                        }}
                      />
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
