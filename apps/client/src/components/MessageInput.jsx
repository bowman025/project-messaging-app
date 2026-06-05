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

  const emitTypingStart = () => {
    const socket = getSocket();
    if (!socket || isTypingRef.current) return;
    isTypingRef.current = true;
    socket.emit('typing:start', { conversationId });
  };

  const emitTypingStop = () => {
    const socket = getSocket();
    if (!socket || !isTypingRef.current) return;
    isTypingRef.current = false;
    socket.emit('typing:stop', { conversationId });
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

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!content.trim() && !imageUrl) return;
    clearTimeout(typingTimeoutRef.current);
    emitTypingStop();
    onSend({ content: content.trim() || undefined, imageUrl: imageUrl || undefined });
    setContent('');
    setImageUrl(null);
    setImagePreview(null);
    setError(null);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
    setImagePreview(null);
    setImageUrl(null);
    setError(null);
  };

  const canSend = (content.trim() || imageUrl) && !isUploading;

  useEffect(() => {
    return () => {
      clearTimeout(typingTimeoutRef.current);
    };
  }, []);

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
