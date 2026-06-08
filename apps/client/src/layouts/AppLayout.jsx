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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);


  const isLoading = navigation.state === 'loading';

  useEffect(() => {
    setUser(user);
  }, [user, setUser]);

  useEffect(() => {
    setConversations(loaderConversations);
  }, [loaderConversations, setConversations]);

  useSocket(conversations, activeConversationId);

  useEffect(() => {
    function handleOutside(e) {
      if (sidebarCollapsed) return;
      const sidebar = document.getElementById('app-sidebar');
      const toggle = document.querySelector('.sidebar-toggle');
      const target = e.target;
      if (sidebar && sidebar.contains(target)) return;
      if (toggle && toggle.contains(target)) return;
      setSidebarCollapsed(true);
    }

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [sidebarCollapsed]);

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
      <Sidebar
        conversations={conversations}
        collapsed={sidebarCollapsed}
        onInteract={() => setSidebarCollapsed(true)}
      />
      <main className="main-content">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner" />
          </div>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}
