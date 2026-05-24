import { NavLink, useNavigate } from 'react-router';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore.js';
import { usePresenceStore } from '../store/presenceStore.js';
import { formatDistanceToNow } from 'date-fns';
import NewConversationModal from './NewConversationModal.jsx';

export default function Sidebar({ conversations }) {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const onlineUsers = usePresenceStore((state) => state.onlineUsers);
  const [showModal, setShowModal] = useState(false);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
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
    return conversation.participants.some(
      (p) => p.user.id !== user?.id && onlineUsers.has(p.user.id)
    );
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span>{user?.username}</span>
        <button onClick={handleLogout}>Logout</button>
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
            <div className="conversation-time">
              {conversation.updatedAt &&
                formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true })}
            </div>
          </NavLink>
        ))}
      </nav>
      {showModal && <NewConversationModal onClose={() => setShowModal(false)} />}
    </aside>
  );
}
