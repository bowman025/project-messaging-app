import { useState } from 'react';

export default function MessageInput({ onSend }) {
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim()) {
      onSend(content.trim());
      setContent('');
    }
  };

  return (
    <div className="message-input">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
        placeholder="Type a message..."
      />
      <button onClick={handleSubmit} disabled={!content.trim()}>
        Send
      </button>
    </div>
  );
}
