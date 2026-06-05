import { redirect } from 'react-router';
import { getToken, fetchWithAuth, removeToken } from '../lib/api.js';

export const appLoader = async () => {
  const token = getToken();
  if (!token) return redirect('/login');

  const res = await fetchWithAuth('/api/auth/me');
  if (res.status === 401) {
    removeToken();
    return redirect('/login');
  }
  if (!res.ok) throw new Response('Failed to load user', { status: res.status });

  const [userdata, conversationsRes] = await Promise.all([
    res.json(),
    fetchWithAuth('/api/conversations'),
  ]);

  if (conversationsRes.status === 401) {
    removeToken();
    return redirect('/login');
  }
  if (!conversationsRes.ok)
    throw new Response('Failed to load conversations', { status: conversationsRes.status });

  const conversationsData = await conversationsRes.json();

  return {
    user: userdata.user,
    conversations: conversationsData.conversations,
  };
};

export const loginLoader = () => {
  const token = getToken();
  if (token) return redirect('/conversations');
  return null;
};

export const conversationLoader = async ({ params }) => {
  const res = await fetchWithAuth(`/api/conversations/${params.id}`);
  if (res.status === 401) {
    removeToken();
    return redirect('/login');
  }
  if (!res.ok) throw new Response('Failed to load conversation', { status: res.status });
  const data = await res.json();
  return data.conversation;
};
