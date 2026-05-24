import { Outlet, useLoaderData } from 'react-router';
import { useEffect } from 'react';
import { useConversationStore } from '../store/conversationStore.js';
import { useSocket } from '../hooks/useSocket.js';
import Sidebar from '../components/Sidebar.jsx';

export default function AppLayout() {
  const loaderConversations = useLoaderData();
  const { conversations, setConversations } = useConversationStore();

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
