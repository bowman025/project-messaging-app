import { Outlet, useLoaderData, useNavigation, useParams } from 'react-router';
import { useState, useEffect } from 'react';
import { useConversationStore } from '../store/conversationStore.js';
import { useAuthStore } from '../store/authStore.js';
import { useSocket } from '../hooks/useSocket.js';
import Sidebar from '../components/Sidebar.jsx';

export default function AppLayout() {
  const { user, conversations: loaderConversations } = useLoaderData();
  const { conversations, setConversations } = useConversationStore();
  const setUser = useAuthStore((state) => state.setUser);
  const navigation = useNavigation();
  const { id: activeConversationId } = useParams();
  const [longLoad, setLongLoad] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const isLoading = navigation.state === 'loading';

  useEffect(() => {
    setUser(user);
  }, [user, setUser]);

  useEffect(() => {
    setConversations(loaderConversations);
  }, [loaderConversations, setConversations]);

  useEffect(() => {
    let timer;

    if (isLoading) {
      timer = setTimeout(() => setLongLoad(true), 2000);
    } else {
      timer = setTimeout(() => setLongLoad(false), 0);
    }

    return () => clearTimeout(timer);
  }, [isLoading]);

  useSocket(conversations, activeConversationId);

  return (
    <div className={`app-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <button
        className="sidebar-toggle"
        aria-label={sidebarCollapsed ? 'Open sidebar' : 'Close sidebar'}
        aria-expanded={!sidebarCollapsed}
        aria-controls="app-sidebar"
        onClick={() => setSidebarCollapsed((s) => !s)}
      >
        ☰
      </button>
      <Sidebar conversations={conversations} collapsed={sidebarCollapsed} />
      <main className="main-content">
        {isLoading ? (
          longLoad ? (
            <div className="server-wake-loading" role="status" aria-live="polite">
              <div className="loading-spinner" />
              <div className="server-wake-text">Waking server…</div>
              <div className="server-wake-sub">
                The server may take up to a minute to start. Please wait.
              </div>
            </div>
          ) : (
            <div className="loading-state">
              <div className="loading-spinner" />
            </div>
          )
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}
