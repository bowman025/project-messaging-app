import { useState, useRef } from 'react';
import { uploadImage } from '../lib/upload.js';

export default function MessageInput({ onSend }) {
  const [content, setContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!content.trim() && !imageUrl) return;
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

  return (
    <div className="message-input-container">
      {imagePreview && (
        <div className="message-image-preview">
          <img src={imagePreview} alt="Upload preview" />
          <button onClick={handleRemoveImage} aria-label="Remove image">✕</button>
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
          onChange={(e) => setContent(e.target.value)}
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
