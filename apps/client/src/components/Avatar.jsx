import { useState } from 'react';

export default function Avatar({ user, size = 'md' }) {
  const [imgError, setImgError] = useState(false);

  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : '??';

  const colors = [
    '#6366f1',
    '#8b5cf6',
    '#ec4899',
    '#f59e0b',
    '#10b981',
    '#3b82f6',
    '#ef4444',
    '#14b8a6',
  ];

  const color = colors[(user?.username?.charCodeAt(0) ?? 0) % colors.length];

  const showImage = user?.avatarUrl && !imgError;

  if (showImage) {
    return (
      <img
        src={user.avatarUrl}
        alt={user?.username}
        className={`avatar avatar--${size}`}
        onError={() => setImgError(true)}
        onLoad={() => setImgError(false)}
      />
    );
  }

  return (
    <div
      className={`avatar avatar--${size} avatar--initials`}
      style={{ '--avatar-color': color }}
      aria-label={user?.username}
    >
      {initials}
    </div>
  );
}
