import { useTypingStore } from '../store/typingStore.js';
import { useAuthStore } from '../store/authStore.js';
import { useMemo } from 'react';

export default function TypingIndicator({ conversationId }) {
  const currentUserId = useAuthStore((state) => state.user?.id);

  const roomMap = useTypingStore((state) => state.typingUsers[conversationId]);

  const typingUsernames = useMemo(() => {
    if (!roomMap) return [];

    return Object.entries(roomMap)
      .filter(([userId]) => userId !== currentUserId)
      .map(([_, username]) => username);
  }, [roomMap, currentUserId]);

  if (typingUsernames.length === 0) return null;

  const text =
    typingUsernames.length === 1
      ? `${typingUsernames[0]} is typing...`
      : typingUsernames.length === 2
        ? `${typingUsernames[0]} and ${typingUsernames[1]} are typing...`
        : 'Several people are typing...';

  return (
    <div className="typing-indicator">
      <span className="typing-dots">
        <span />
        <span />
        <span />
      </span>
      <span className="typing-text">{text}</span>
    </div>
  );
}
