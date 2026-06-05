import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProfileSchema } from '@project-messaging-app/zod-schemas/user';
import { useAuthStore } from '../store/authStore.js';
import { fetchWithAuth } from '../lib/api.js';
import { uploadImage } from '../lib/upload.js';
import Avatar from '../components/Avatar.jsx';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [success, setSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl ?? null);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    setError,
    setValue,
  } = useForm({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      username: user?.username ?? '',
      avatarUrl: user?.avatarUrl ?? undefined,
      bio: user?.bio ?? '',
    },
  });

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    setIsUploading(true);
    try {
      const url = await uploadImage(file, 'avatar');
      setValue('avatarUrl', url, { shouldDirty: true });
      setAvatarPreview(url);
    } catch (_err) {
      setError('root', { message: 'Failed to upload avatar. Please try again.' });
      setAvatarPreview(user?.avatarUrl ?? null);
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data) => {
    setSuccess(false);

    const payload = { ...data };
    if (!payload.avatarUrl) delete payload.avatarUrl;

    try {
      const res = await fetchWithAuth('/api/users/profile', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        setError('root', { message: json.message || 'Failed to update profile' });
        return;
      }

      setUser(json.user);
      setAvatarPreview(json.user?.avatarUrl ?? avatarPreview);
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

        <div className="avatar-upload">
          <div className="avatar-upload-preview">
            <Avatar user={{ ...user, avatarUrl: avatarPreview }} size="lg" />
            <button
              type="button"
              className="avatar-upload-btn"
              onClick={handleAvatarClick}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Change'}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-field">
            <label htmlFor="username">Username</label>
            <input id="username" type="text" {...register('username')} />
            {errors.username && <p className="form-error">{errors.username.message}</p>}
          </div>

          <div className="form-field">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              rows={3}
              {...register('bio')}
              placeholder="Tell us about yourself..."
            />
            {errors.bio && <p className="form-error">{errors.bio.message}</p>}
          </div>

          {errors.root && <p className="form-root-error">{errors.root.message}</p>}
          {success && <p className="form-success">Profile updated successfully.</p>}

          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting || isUploading || !isDirty}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
