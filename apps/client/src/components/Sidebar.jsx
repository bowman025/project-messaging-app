import { useNavigate, useParams, NavLink } from 'react-router';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore.js';
import { usePresenceStore } from '../store/presenceStore.js';
import { useConversationStore } from '../store/conversationStore.js';
import { fetchWithAuth } from '../lib/api.js';
import { disconnectSocket } from '../lib/socket.js';
import { formatDistanceToNow } from 'date-fns';
import NewConversationModal from './NewConversationModal.jsx';
import { useTheme } from '../hooks/useTheme.js';

export default function Sidebar({ conversations }) {
  const navigate = useNavigate();
  const { id: activeId } = useParams();
  const { user, clearAuth } = useAuthStore();
  const onlineUsers = usePresenceStore((state) => state.onlineUsers);
  const removeConversation = useConversationStore((state) => state.removeConversation);
  const [showModal, setShowModal] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    disconnectSocket();
    clearAuth();
    navigate('/login');
  };

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

  const getConversationName = (conversation) => {
    if (conversation.name) return conversation.name;
    const other = conversation.participants.find((p) => p.user.id !== user?.id);
    return other?.user.username ?? 'Unknown';
  };

  const getLastMessage = (conversation) => {
    const msg = conversation.messages?.[0];
    if (!msg) return 'No messages yet';
    return msg.content.length > 40 ? msg.content.slice(0, 40) + '...' : msg.content;
  };

  const isConversationOnline = (conversation) => {
    if (conversation.isGroup) return false;
    return conversation.participants.some(
      (p) => p.user.id !== user?.id && onlineUsers.has(p.user.id)
    );
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span>{user?.username}</span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
      <div className="sidebar-actions">
        <button onClick={() => setShowModal(true)}>+ New Conversation</button>
      </div>
      <nav className="conversation-list">
        {conversations.map((conversation) => (
          <NavLink
            key={conversation.id}
            to={`/conversations/${conversation.id}`}
            className={({ isActive }) =>
              isActive ? 'conversation-item active' : 'conversation-item'
            }
          >
            <div className="conversation-info">
              <div className="conversation-name">
                {getConversationName(conversation)}
                {isConversationOnline(conversation) && (
                  <span className="online-indicator" />
                )}
              </div>
              <div className="conversation-last-message">
                {getLastMessage(conversation)}
              </div>
            </div>
            <div className="conversation-meta">
              <div className="conversation-time">
                {conversation.updatedAt &&
                  formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true })}
              </div>
              <button
                className="conversation-delete"
                onClick={(e) => handleDelete(e, conversation.id)}
                aria-label="Delete conversation"
              >
                ✕
              </button>
            </div>
          </NavLink>
        ))}
      </nav>
      {showModal && <NewConversationModal onClose={() => setShowModal(false)} />}
    </aside>
  );
}
