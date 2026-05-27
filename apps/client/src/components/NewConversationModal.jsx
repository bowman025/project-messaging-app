import { useState } from 'react';
import { useNavigate } from 'react-router';
import { fetchWithAuth } from '../lib/api.js';
import { useConversationStore } from '../store/conversationStore.js';

export default function NewConversationModal({ onClose }) {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const addConversation = useConversationStore((state) => state.addConversation);

  const isGroup = selected.length > 1;

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
      setUsers(data.users.filter((u) => !selected.find((s) => s.id === u.id)));
    } catch (_err) {
      setError('Failed to search users');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelect = (user) => {
    setSelected((prev) => [...prev, user]);
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
    setQuery('');
  };

  const handleDeselect = (userId) => {
    setSelected((prev) => prev.filter((u) => u.id !== userId));
  };

  const handleCreate = async () => {
    if (selected.length === 0) return;
    if (isGroup && !groupName.trim()) {
      setError('Please enter a group name');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const res = await fetchWithAuth('/api/conversations', {
        method: 'POST',
        body: JSON.stringify({
          participantIds: selected.map((u) => u.id),
          name: isGroup ? groupName.trim() : undefined,
        }),
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
          <h2>{isGroup ? 'New Group' : 'New Conversation'}</h2>
          <button onClick={onClose} aria-label="Close">✕</button>
        </div>

        {selected.length > 0 && (
          <div className="selected-users">
            {selected.map((user) => (
              <span key={user.id} className="selected-user-tag">
                {user.username}
                <button onClick={() => handleDeselect(user.id)} aria-label={`Remove ${user.username}`}>✕</button>
              </span>
            ))}
          </div>
        )}

        {isGroup && (
          <div className="form-field">
            <label htmlFor="groupName">Group name</label>
            <input
              id="groupName"
              type="text"
              placeholder="Enter group name..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>
        )}

        <input
          type="text"
          placeholder="Search by username..."
          value={query}
          onChange={handleSearch}
        />

        {error && <p className="form-error">{error}</p>}

        <ul className="user-search-results">
          {isSearching && <li>Searching...</li>}
          {!isSearching && users.length === 0 && query.length > 0 && (
            <li>No users found</li>
          )}
          {users.map((user) => (
            <li key={user.id}>
              <span>{user.username}</span>
              <button onClick={() => handleSelect(user)}>Add</button>
            </li>
          ))}
        </ul>

        {selected.length > 0 && (
          <button
            className="btn-primary"
            onClick={handleCreate}
            disabled={isCreating || (isGroup && !groupName.trim())}
          >
            {isCreating
              ? 'Creating...'
              : isGroup
                ? 'Create Group'
                : `Message ${selected[0].username}`}
          </button>
        )}
      </div>
    </div>
  );
}
