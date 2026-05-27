import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProfileSchema } from '@project-messaging-app/zod-schemas/user';
import { useAuthStore } from '../store/authStore.js';
import { fetchWithAuth } from '../lib/api.js';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    setError,
  } = useForm({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      username: user?.username ?? '',
      avatarUrl: user?.avatarUrl ?? '',
      bio: user?.bio ?? '',
    },
  });

  const onSubmit = async (data) => {
    setSuccess(false);
    try {
      const res = await fetchWithAuth('/api/users/profile', {
        method: 'PATCH',
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setError('root', { message: json.message });
        return;
      }

      setUser(json.user);
      setSuccess(true);
    } catch (_err) {
      setError('root', { message: 'Something went wrong. Please try again.' });
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-form">
        <div className="profile-header">
          <button className="btn-back" onClick={() => navigate(-1)} aria-label="Go back">
            ←
          </button>
          <h1>Edit Profile</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-field">
            <label htmlFor="username">Username</label>
            <input id="username" type="text" {...register('username')} />
            {errors.username && <p className="form-error">{errors.username.message}</p>}
          </div>

          <div className="form-field">
            <label htmlFor="avatarUrl">Avatar URL</label>
            <input id="avatarUrl" type="text" placeholder="https://..." {...register('avatarUrl')} />
            {errors.avatarUrl && <p className="form-error">{errors.avatarUrl.message}</p>}
          </div>

          <div className="form-field">
            <label htmlFor="bio">Bio</label>
            <textarea id="bio" rows={3} {...register('bio')} placeholder="Tell us about yourself..." />
            {errors.bio && <p className="form-error">{errors.bio.message}</p>}
          </div>

          {errors.root && <p className="form-root-error">{errors.root.message}</p>}
          {success && <p className="form-success">Profile updated successfully.</p>}

          <button type="submit" className="btn-primary" disabled={isSubmitting || !isDirty}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
