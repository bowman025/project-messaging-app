import { Outlet, useLoaderData } from 'react-router';
import { useEffect } from 'react';
import { useConversationStore } from '../store/conversationStore.js';
import { useAuthStore } from '../store/authStore.js';
import { useSocket } from '../hooks/useSocket.js';
import Sidebar from '../components/Sidebar.jsx';

export default function AppLayout() {
  const { user, conversations: loaderConversations } = useLoaderData();
  const { conversations, setConversations } = useConversationStore();
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    setUser(user);
  }, [user, setUser]);

  useEffect(() => {
    setConversations(loaderConversations);
  }, [loaderConversations, setConversations]);

  useSocket(conversations);

  return (
    <div className="app-layout">
      <Sidebar conversations={conversations} />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
