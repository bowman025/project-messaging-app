import { useNavigate, NavLink, Link } from 'react-router';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore.js';
import { usePresenceStore } from '../store/presenceStore.js';
import { useConversationStore } from '../store/conversationStore.js';
import { disconnectSocket } from '../lib/socket.js';
import { formatDistanceToNow, format } from 'date-fns';
import NewConversationModal from './NewConversationModal.jsx';
import Avatar from './Avatar.jsx';
import { getOtherUser, getConversationName, isConversationOnline } from '../utils/participants.js';
import { useTheme } from '../hooks/useTheme.js';

export default function Sidebar({
  conversations: propConversations,
  collapsed = false,
  onInteract,
}) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const onlineUsers = usePresenceStore((state) => state.onlineUsers);
  const storeConversations = useConversationStore((state) => state.conversations);
  const conversations = propConversations ?? storeConversations;
  const unreadCounts = useConversationStore((state) => state.unreadCounts);
  const [showModal, setShowModal] = useState(false);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const { theme, toggleTheme } = useTheme();



  const handleLogout = () => {
    disconnectSocket();
    clearAuth();
    navigate('/login');
  };

  const getLastMessage = (conversation) => {
    const msg = conversation.messages?.[0];
    if (!msg) return 'No messages yet';
    if (msg.imageUrl && !msg.content) return '📷 Image';
    return msg.content.length > 40 ? msg.content.slice(0, 40) + '...' : msg.content;
  };

  const otherUserForAvatar = (conversation) => getOtherUser(conversation, user?.id);
  const nameForConversation = (conversation) => getConversationName(conversation, user?.id);
  const conversationOnline = (conversation) =>
    isConversationOnline(conversation, user?.id, onlineUsers);

  return (
    <aside id="app-sidebar" className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
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
        <div className="sidebar-actions-main">
          <button onClick={() => {
            toggleTheme();
            if (typeof onInteract === 'function') onInteract();
          }} aria-label="Toggle theme">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button onClick={() => {
            handleLogout();
            if (typeof onInteract === 'function') onInteract();
          }}>Logout</button>
        </div>
        <button className="sidebar-actions-new"
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
                {conversationOnline(conversation) && <span className="online-indicator" />}
              </div>
              <div className="conversation-last-message">{getLastMessage(conversation)}</div>
            </div>
            <div className="conversation-meta">
              <div
                className="conversation-time"
                title={
                  conversation.updatedAt
                    ? format(new Date(conversation.updatedAt), 'MMM d, yyyy HH:mm')
                    : ''
                }
              >
                {conversation.updatedAt &&
                  formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true })}
              </div>
              {unreadCounts[conversation.id] > 0 && (
                <span className="unread-badge">{unreadCounts[conversation.id]}</span>
              )}
            </div>
          </NavLink>
        ))}
      </nav>
      {showModal && <NewConversationModal onClose={() => setShowModal(false)} />}
    </aside>
  );
}
