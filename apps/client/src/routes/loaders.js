import { redirect } from 'react-router';
import { getToken, fetchWithAuth, removeToken } from '../lib/api.js';

export const appLoader = () => {
  const token = getToken();
  if (!token) return redirect('/login');
  return null;
};

export const loginLoader = () => {
  const token = getToken();
  if (token) return redirect('/conversations');
  return null;
};

export const conversationsLoader = async () => {
  const res = await fetchWithAuth('/api/conversations');
  if (res.status === 401) {
    removeToken();
    return redirect('/login');
  }
  if (!res.ok) throw new Response('Failed to load conversations', { status: res.status });
  const data = await res.json();
  return data.conversations;
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
