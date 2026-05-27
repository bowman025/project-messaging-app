export default function Avatar({ user, size = 'md' }) {
  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : '??';

  const colors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
    '#10b981', '#3b82f6', '#ef4444', '#14b8a6',
  ];

  const color = colors[
    (user?.username?.charCodeAt(0) ?? 0) % colors.length
  ];

  if (user?.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.username}
        className={`avatar avatar--${size}`}
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
    );
  }

  return (
    <div
      className={`avatar avatar--${size} avatar--initials`}
      style={{ backgroundColor: color }}
      aria-label={user?.username}
    >
      {initials}
    </div>
  );
}
