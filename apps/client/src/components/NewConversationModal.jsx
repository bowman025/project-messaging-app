import { useState } from 'react';
import { useNavigate } from 'react-router';
import { fetchWithAuth } from '../lib/api.js';
import { useConversationStore } from '../store/conversationStore.js';

export default function NewConversationModal({ onClose }) {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const addConversation = useConversationStore((state) => state.addConversation);

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim().length < 1) {
      setUsers([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetchWithAuth(`/api/users/search?q=${encodeURIComponent(value)}`);
      const data = await res.json();
      setUsers(data.users);
    } catch (_err) {
      setError('Failed to search users');
    } finally {
      setIsSearching(false);
    }
  };

  const handleStartConversation = async (userId) => {
    setIsCreating(true);
    setError(null);
    try {
      const res = await fetchWithAuth('/api/conversations', {
        method: 'POST',
        body: JSON.stringify({ participantIds: [userId] }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
        return;
      }

      addConversation(data.conversation);
      navigate(`/conversations/${data.conversation.id}`);
      onClose();
    } catch (_err) {
      setError('Failed to create conversation');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="New conversation">
      <div className="modal">
        <div className="modal-header">
          <h2>New Conversation</h2>
          <button onClick={onClose} aria-label="Close">✕</button>
        </div>
        <input
          type="text"
          placeholder="Search by username..."
          value={query}
          onChange={handleSearch}
        />
        {error && <p className="error">{error}</p>}
        <ul className="user-search-results">
          {isSearching && <li>Searching...</li>}
          {!isSearching && users.length === 0 && query.length > 0 && (
            <li>No users found</li>
          )}
          {users.map((user) => (
            <li key={user.id}>
              <span>{user.username}</span>
              <button
                onClick={() => handleStartConversation(user.id)}
                disabled={isCreating}
              >
                Message
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
