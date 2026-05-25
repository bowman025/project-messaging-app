import { useState, useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';

export default function MessageList({ messages, currentUserId, onEdit, onDelete, bottomRef }) {
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
    <div className="message-list">
      {messages.map((message) => {
        const isOwn = message.authorId === currentUserId;

        return (
          <div key={message.id} className={`message ${isOwn ? 'message--own' : ''} ${message.isOptimistic ? 'message--optimistic' : ''}`}>
            <span className="message-author">{message.author.username}</span>
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
              <p className="message-content">
                {message.content}
                {message.edited && <span className="message-edited"> (edited)</span>}
              </p>
            )}
            <span className="message-time">
              {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
            </span>
            {isOwn && editingId !== message.id && (
              <div className="message-actions">
                <button onClick={() => startEdit(message)}>Edit</button>
                <button onClick={() => onDelete(message.id)}>Delete</button>
              </div>
            )}
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
