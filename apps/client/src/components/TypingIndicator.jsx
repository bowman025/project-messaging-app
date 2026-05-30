import { useTypingStore } from '../store/typingStore.js';
import { useAuthStore } from '../store/authStore.js';
import { useMemo } from 'react';

export default function TypingIndicator({ conversationId }) {
  const typingUsers = useTypingStore(
    (state) => state.typingUsers[conversationId],
    (a, b) => a === b // Shallow comparison
  );
  const currentUserId = useAuthStore((state) => state.user?.id);

  const otherTypingUsers = useMemo(() => {
    if (!typingUsers) return [];
    return Object.entries(typingUsers)
      .filter(([userId]) => userId !== currentUserId)
      .map(([_, username]) => username);
  }, [typingUsers, currentUserId]);

  if (otherTypingUsers.length === 0) return null;

  const text =
    otherTypingUsers.length === 1
      ? `${otherTypingUsers[0]} is typing...`
      : otherTypingUsers.length === 2
        ? `${otherTypingUsers[0]} and ${otherTypingUsers[1]} are typing...`
        : 'Several people are typing...';

  return (
    <div className="typing-indicator">
      <span className="typing-dots">
        <span /><span /><span />
      </span>
      <span className="typing-text">{text}</span>
    </div>
  );
}
