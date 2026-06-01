export function getParticipantId(p) {
  return typeof p === 'string' ? p : p?.user?.id ?? p?.userId ?? p?.id;
}

export function getParticipantUser(p) {
  if (!p) return null;
  if (typeof p === 'string') return { id: p, username: 'Unknown' };
  return p.user ?? p;
}

export function getOtherUser(conversation, currentUserId) {
  if (conversation?.isGroup) return null;
  const found = (conversation?.participants || []).find((p) => {
    const id = getParticipantId(p);
    return id !== currentUserId;
  });
  if (!found) return null;
  return getParticipantUser(found);
}

export function getConversationName(conversation, currentUserId) {
  if (conversation?.name) return conversation.name;
  const other = getOtherUser(conversation, currentUserId);
  return other?.username ?? 'Unknown';
}

export function getConversationSubtitle(conversation, currentUserId, onlineUsers) {
  if (conversation?.isGroup) {
    return (conversation.participants || [])
      .map((p) => getParticipantUser(p)?.username)
      .filter(Boolean)
      .join(', ');
  }
  const other = getOtherUser(conversation, currentUserId);
  if (!other) return null;
  return onlineUsers?.has(other.id) ? 'Online' : 'Offline';
}

export function isConversationOnline(conversation, currentUserId, onlineUsers) {
  if (conversation?.isGroup) return false;
  return (conversation.participants || []).some((p) => {
    const id = getParticipantId(p);
    return id !== currentUserId && onlineUsers?.has(id);
  });
}
