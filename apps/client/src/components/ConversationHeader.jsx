import { Link, useParams, useNavigate } from 'react-router';
import { useAuthStore } from '../store/authStore.js';
import { usePresenceStore } from '../store/presenceStore.js';
import { useConversationStore } from '../store/conversationStore.js';
import Avatar from './Avatar.jsx';
import {
  getOtherUser,
  getConversationName,
  getConversationSubtitle,
} from '../utils/participants.js';
import { fetchWithAuth } from '../lib/api.js';
import { getSocket } from '../lib/socket.js';

export default function ConversationHeader({ conversation }) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const removeConversation = useConversationStore((state) => state.removeConversation);
  const { id: activeId } = useParams();
  const otherUser = getOtherUser(conversation, user?.id);
  const otherUserId = otherUser?.id;
  const isOtherUserOnline = usePresenceStore((state) =>
    !conversation.isGroup && otherUserId ? state.onlineUsers.has(otherUserId) : false
  );
  const name = getConversationName(conversation, user?.id);
  const subtitle = conversation.isGroup
    ? getConversationSubtitle(conversation, user?.id)
    : isOtherUserOnline ? 'Online' : 'Offline';

  const handleDelete = async (e, conversationId) => {
    e.preventDefault();
    e.stopPropagation();

    const res = await fetchWithAuth(`/api/conversations/${conversationId}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      removeConversation(conversationId);
      if (activeId === conversationId) navigate('/conversations');
    }
  };

  const handleLeave = async (e, conversationId) => {
    e.preventDefault();
    e.stopPropagation();

    const socket = getSocket();
    if (socket) socket.emit('leave:conversation', { conversationId });

    removeConversation(conversationId);
    if (activeId === conversationId) navigate('/conversations');
  };

  return (
    <div className="conversation-header">
      <div className="conversation-header-info">
        <Avatar user={conversation.isGroup ? null : otherUser} size="md" />
        <div className="conversation-header-text">
          <div className="conversation-header-title">
            {!conversation.isGroup && otherUser ? (
              <Link to={`/users/${otherUser.id}`} className="conversation-header-link">
                {name}
              </Link>
            ) : (
              name
            )}
          </div>
          <div className="conversation-header-subtitle">{subtitle}</div>
        </div>
      </div>
      {conversation.creatorId === user?.id ? (
        <button
          className="conversation-header-delete"
          onClick={(e) => {
            handleDelete(e, conversation.id);
          }}
          aria-label="Delete conversation"
        >
          Delete
        </button>
      ) : (
        <button
          className="conversation-header-delete"
          onClick={(e) => {
            handleLeave(e, conversation.id);
          }}
          aria-label="Leave conversation"
        >
          Leave
        </button>
      )}
    </div>
  );
}
