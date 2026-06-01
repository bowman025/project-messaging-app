import { useAuthStore } from '../store/authStore.js';
import { usePresenceStore } from '../store/presenceStore.js';
import Avatar from './Avatar.jsx';

export default function ConversationHeader({ conversation }) {
  const user = useAuthStore((state) => state.user);
  const onlineUsers = usePresenceStore((state) => state.onlineUsers);

  const getOtherUser = () => {
    if (conversation.isGroup) return null;
    const found = conversation.participants.find((p) => {
      const id = typeof p === 'string' ? p : p.user?.id ?? p.userId ?? p.id;
      return id !== user?.id;
    });
    if (!found) return null;
    if (typeof found === 'string') return { id: found, username: 'Unknown' };
    return found.user ?? found;
  };

  const getName = () => {
    if (conversation.name) return conversation.name;
    const other = getOtherUser();
    return other?.username ?? 'Unknown';
  };

  const getSubtitle = () => {
    if (conversation.isGroup) {
      return conversation.participants
        .map((p) => (typeof p === 'string' ? null : p.user?.username ?? p.username))
        .filter(Boolean)
        .join(', ');
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
        {!conversation.isGroup && otherUser?.bio && (
          <div className="conversation-header-bio">{otherUser.bio}</div>
        )}
      </div>
    </div>
  );
}
