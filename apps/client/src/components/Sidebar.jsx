import { useNavigate, useParams, NavLink, Link } from 'react-router';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore.js';
import { usePresenceStore } from '../store/presenceStore.js';
import { useConversationStore } from '../store/conversationStore.js';
import { fetchWithAuth } from '../lib/api.js';
import { getSocket } from '../lib/socket.js';
import { formatDistanceToNow, format } from 'date-fns';
import NewConversationModal from './NewConversationModal.jsx';
import Avatar from './Avatar.jsx';
import {
  getOtherUser,
  getConversationName,
  isConversationOnline,
} from '../utils/participants.js';

export default function Sidebar({ conversations: propConversations, collapsed = false, onInteract }) {
  const navigate = useNavigate();
  const { id: activeId } = useParams();
  const { user } = useAuthStore();
  const onlineUsers = usePresenceStore((state) => state.onlineUsers);
  const storeConversations = useConversationStore((state) => state.conversations);
  const conversations = propConversations ?? storeConversations;
  const removeConversation = useConversationStore((state) => state.removeConversation);
  const unreadCounts = useConversationStore((state) => state.unreadCounts);
  const [showModal, setShowModal] = useState(false);




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

  const getLastMessage = (conversation) => {
    const msg = conversation.messages?.[0];
    if (!msg) return 'No messages yet';
    if (msg.imageUrl && !msg.content) return '📷 Image';
    return msg.content.length > 40 ? msg.content.slice(0, 40) + '...' : msg.content;
  };

  const otherUserForAvatar = (conversation) => getOtherUser(conversation, user?.id);
  const nameForConversation = (conversation) => getConversationName(conversation, user?.id);
  const conversationOnline = (conversation) => isConversationOnline(conversation, user?.id, onlineUsers);

  return (
    <aside
      id="app-sidebar"
      className={`sidebar ${collapsed ? 'collapsed' : ''}`}
    >
      <div className="sidebar-header">
        <div className="sidebar-user">
          <Avatar user={user} size="sm" />
          <Link
            to="/profile"
            className="sidebar-username"
            onClick={() => {
              if (typeof onInteract === 'function') onInteract();
            }}
          >
            {user?.username}
          </Link>
        </div>
      </div>
      <div className="sidebar-actions">
        <button
          onClick={() => {
            setShowModal(true);
            if (typeof onInteract === 'function') onInteract();
          }}
        >
          + New Conversation
        </button>
      </div>
      <nav className="conversation-list">
        {conversations.map((conversation) => (
          <NavLink
            key={conversation.id}
            to={`/conversations/${conversation.id}`}
            className={({ isActive }) =>
              isActive ? 'conversation-item active' : 'conversation-item'
            }
            onClick={() => {
              if (typeof onInteract === 'function') onInteract();
            }}
          >
            <Avatar
              user={conversation.isGroup ? null : otherUserForAvatar(conversation)}
              size="md"
            />
            <div className="conversation-info">
              <div className="conversation-name">
                {nameForConversation(conversation)}
                {conversationOnline(conversation) && (
                  <span className="online-indicator" />
                )}
              </div>
              <div className="conversation-last-message">
                {getLastMessage(conversation)}
              </div>
            </div>
            <div className="conversation-meta">
              <div
                className="conversation-time"
                title={conversation.updatedAt
                  ? format(new Date(conversation.updatedAt), 'MMM d, yyyy HH:mm')
                  : ''}
              >
                {conversation.updatedAt &&
                  formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true })}
              </div>
              {unreadCounts[conversation.id] > 0 && (
                <span className="unread-badge">{unreadCounts[conversation.id]}</span>
              )}
              {conversation.creatorId === user?.id ? (
                <button
                  className="conversation-delete"
                  onClick={(e) => {
                    handleDelete(e, conversation.id);
                    if (typeof onInteract === 'function') onInteract();
                  }}
                  aria-label="Delete conversation"
                >
                  ✕
                </button>
              ) : (
                <button
                  className="conversation-delete"
                  onClick={(e) => {
                    handleLeave(e, conversation.id);
                    if (typeof onInteract === 'function') onInteract();
                  }}
                  aria-label="Leave conversation"
                >
                  ←
                </button>
              )}
            </div>
          </NavLink>
        ))}
      </nav>
      {showModal && <NewConversationModal onClose={() => setShowModal(false)} />}
    </aside>
  );
}
