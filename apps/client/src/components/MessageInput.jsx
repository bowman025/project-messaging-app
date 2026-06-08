import { useState, useRef, useEffect } from 'react';
import { uploadImage } from '../lib/upload.js';
import { getSocket } from '../lib/socket.js';

export default function MessageInput({ onSend, conversationId }) {
  const [content, setContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const activeTypingRoomRef = useRef(null);

  const emitTypingStart = () => {
    const socket = getSocket();
    if (!socket || isTypingRef.current) return;
    isTypingRef.current = true;
    activeTypingRoomRef.current = conversationId;
    socket.emit('typing:start', { conversationId });
  };

  const emitTypingStop = () => {
    const socket = getSocket();
    const targetRoom = activeTypingRoomRef.current || conversationId;

    if (!socket || !isTypingRef.current) return;
    isTypingRef.current = false;
    activeTypingRoomRef.current = null;
    socket.emit('typing:stop', { conversationId: targetRoom });
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);

    if (e.target.value.trim()) {
      emitTypingStart();
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(emitTypingStop, 2000);
    } else {
      clearTimeout(typingTimeoutRef.current);
      emitTypingStop();
    }
  };

  const canSend = (content.trim() || imageUrl) && !isUploading;

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!canSend) return;

    clearTimeout(typingTimeoutRef.current);
    emitTypingStop();

    onSend({ content: content.trim() || undefined, imageUrl: imageUrl || undefined });

    setContent('');
    setImageUrl(null);

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setError(null);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImagePreview(URL.createObjectURL(file));
    setIsUploading(true);
    setError(null);

    try {
      const url = await uploadImage(file, 'message');
      setImageUrl(url);
    } catch (err) {
      setError(err.message);
      setImagePreview(null);
      setImageUrl(null);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setImageUrl(null);
    setError(null);
  };

  useEffect(() => {
    return () => {
      clearTimeout(typingTimeoutRef.current);
      if (isTypingRef.current) {
        const socket = getSocket();
        const room = activeTypingRoomRef.current || conversationId;
        if (socket) socket.emit('typing:stop', { conversationId: room });
      }
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [conversationId, imagePreview]);

  return (
    <div className="message-input-container">
      {imagePreview && (
        <div className="message-image-preview">
          <img src={imagePreview} alt="Attachment" />
          <button onClick={handleRemoveImage} aria-label="Remove image">
            ✕
          </button>
        </div>
      )}
      {error && <p className="message-input-error">{error}</p>}
      <div className="message-input">
        <button
          type="button"
          className="message-input-attach"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || !!imageUrl}
          aria-label="Attach image"
        >
          📎
        </button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <input
          type="text"
          id="message"
          value={content}
          onChange={handleContentChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder={isUploading ? 'Uploading image...' : 'Type a message...'}
          disabled={isUploading}
        />
        <button onClick={handleSubmit} disabled={!canSend}>
          Send
        </button>
      </div>
    </div>
  );
}
