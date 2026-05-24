import { createBrowserRouter, Navigate } from 'react-router';
import AuthLayout from '../layouts/AuthLayout.jsx';
import AppLayout from '../layouts/AppLayout.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import ConversationsPage from '../pages/ConversationsPage.jsx';
import ConversationPage from '../pages/ConversationPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import { loginLoader, appLoader, conversationsLoader, conversationLoader } from './loaders.js';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage />, loader: loginLoader },
      { path: 'register', element: <RegisterPage /> },
    ],
  },
  {
    element: <AppLayout />,
    loader: appLoader,
    children: [
      { path: 'conversations', element: <ConversationsPage />, loader: conversationsLoader },
      { path: 'conversations/:id', element: <ConversationPage />, loader: conversationLoader },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);

export default router;