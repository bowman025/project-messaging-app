import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import router from './routes/router.jsx';
import ServerWakeUp from './components/ServerWakeUp.jsx';
import './index.css';

const savedTheme = localStorage.getItem('theme') ?? 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ServerWakeUp>
      <RouterProvider router={router} />
    </ServerWakeUp>
  </StrictMode>
);
