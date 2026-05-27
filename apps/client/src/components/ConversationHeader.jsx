import { useAuthStore } from '../store/authStore.js';
import { usePresenceStore } from '../store/presenceStore.js';

export default function ConversationHeader({ conversation }) {
  const user = useAuthStore((state) => state.user);
  const onlineUsers = usePresenceStore((state) => state.onlineUsers);

  const getName = () => {
    if (conversation.name) return conversation.name;
    const other = conversation.participants.find((p) => p.user.id !== user?.id);
    return other?.user.username ?? 'Unknown';
  };

  const getSubtitle = () => {
    if (conversation.isGroup) {
      return conversation.participants.map((p) => p.user.username).join(', ');
    }
    const other = conversation.participants.find((p) => p.user.id !== user?.id);
    if (!other) return null;
    return onlineUsers.has(other.user.id) ? 'Online' : 'Offline';
  };

  return (
    <div className="conversation-header">
      <div className="conversation-header-name">{getName()}</div>
      <div className="conversation-header-subtitle">{getSubtitle()}</div>
    </div>
  );
}
