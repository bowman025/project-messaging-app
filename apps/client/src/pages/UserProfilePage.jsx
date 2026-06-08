import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { fetchWithAuth } from '../lib/api.js';
import Avatar from '../components/Avatar.jsx';

export default function UserProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchWithAuth(`/api/users/${id}`);
        if (!res.ok) throw new Error('User not found');
        const data = await res.json();
        setUser(data.user);
      } catch (_err) {
        setError('Could not load profile.');
      }
    };
    load();
  }, [id]);

  return (
    <div className="profile-page">
      <div className="profile-form">
        <div className="profile-header">
          <button className="btn-back" onClick={() => navigate(-1)} aria-label="Go back">
            ←
          </button>
          <h1>Profile</h1>
        </div>
        {error && <p className="form-error">{error}</p>}
        {user && (
          <>
            <div className="avatar-upload">
              <Avatar user={user} size="xl" />
            </div>
            <div className="user-profile-info">
              <p className="user-profile-username">{user.username}</p>
              {user.bio && <p className="user-profile-bio">{user.bio}</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
