import { useAuthStore } from '../store/authStore.js';
import { usePresenceStore } from '../store/presenceStore.js';
import Avatar from './Avatar.jsx';

export default function ConversationHeader({ conversation }) {
  const user = useAuthStore((state) => state.user);
  const onlineUsers = usePresenceStore((state) => state.onlineUsers);

  const getOtherUser = () => {
    if (conversation.isGroup) return null;
    return conversation.participants.find((p) => p.user.id !== user?.id)?.user ?? null;
  };

  const getName = () => {
    if (conversation.name) return conversation.name;
    const other = getOtherUser();
    return other?.username ?? 'Unknown';
  };

  const getSubtitle = () => {
    if (conversation.isGroup) {
      return conversation.participants.map((p) => p.user.username).join(', ');
    }
    const other = getOtherUser();
    if (!other) return null;
    return onlineUsers.has(other.id) ? 'Online' : 'Offline';
  };

  const otherUser = getOtherUser();

  return (
    <div className="conversation-header">
      <Avatar user={otherUser} size="md" />
      <div>
        <div className="conversation-header-name">{getName()}</div>
        <div className="conversation-header-subtitle">{getSubtitle()}</div>
      </div>
    </div>
  );
}
