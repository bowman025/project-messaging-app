import { useAuthStore } from '../store/authStore.js';
import { usePresenceStore } from '../store/presenceStore.js';
import Avatar from './Avatar.jsx';
import {
  getOtherUser,
  getConversationName,
  getConversationSubtitle,
} from '../utils/participants.js';

export default function ConversationHeader({ conversation }) {
  const user = useAuthStore((state) => state.user);
  const onlineUsers = usePresenceStore((state) => state.onlineUsers);

  const otherUser = getOtherUser(conversation, user?.id);
  const name = getConversationName(conversation, user?.id);
  const subtitle = getConversationSubtitle(conversation, user?.id, onlineUsers);

  return (
    <div className="conversation-header">
      <Avatar user={otherUser} size="md" />
      <div>
        <div className="conversation-header-name">{name}</div>
        <div className="conversation-header-subtitle">{subtitle}</div>
      </div>
    </div>
  );
}
