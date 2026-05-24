import { Outlet } from 'react-router';
import Sidebar from '../components/Sidebar.jsx';

export default function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
