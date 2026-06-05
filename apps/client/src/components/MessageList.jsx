import { useState, useEffect, useRef } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import Avatar from './Avatar.jsx';

export default function MessageList({
  messages,
  currentUserId,
  onEdit,
  onDelete,
  bottomRef,
  topRef,
  hasMore,
  containerRef,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const editInputRef = useRef(null);

  useEffect(() => {
    if (editingId) editInputRef.current?.focus();
  }, [editingId]);

  const startEdit = (message) => {
    setEditingId(message.id);
    setEditContent(message.content);
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
      <div ref={topRef} className="message-list-top">
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
              {editingId === message.id ? (
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
                        onLoad={() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })}
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
              {isOwn && editingId !== message.id && (
                <div className="message-actions">
                  <button onClick={() => startEdit(message)}>Edit</button>
                  <button onClick={() => onDelete(message.id)}>Delete</button>
                </div>
              )}
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
