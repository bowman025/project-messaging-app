// src/routes/router.jsx
import { createBrowserRouter, Navigate } from 'react-router';
import AuthLayout from '../layouts/AuthLayout.jsx';
import AppLayout from '../layouts/AppLayout.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import ProfilePage from '../pages/ProfilePage.jsx';
import UserProfilePage from '../pages/UserProfilePage.jsx';
import ConversationsPage from '../pages/ConversationsPage.jsx';
import ConversationPage from '../pages/ConversationPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import ErrorPage from '../pages/ErrorPage.jsx';
import { loginLoader, appLoader, conversationLoader } from './loaders.js';
import ServerWakeUpUI from '../components/ServerWakeUpUI.jsx';

const FallbackUI = <ServerWakeUpUI />;

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    element: <AuthLayout />,
    errorElement: <ErrorPage />,
    hydrateFallbackElement: FallbackUI,
    children: [
      { path: 'login', element: <LoginPage />, loader: loginLoader },
      { path: 'register', element: <RegisterPage /> },
    ],
  },
  {
    element: <AppLayout />,
    loader: appLoader,
    errorElement: <ErrorPage />,
    hydrateFallbackElement: FallbackUI,
    children: [
      { path: 'profile', element: <ProfilePage /> },
      { path: 'conversations', element: <ConversationsPage /> },
      {
        path: 'conversations/:id',
        element: <ConversationPage />,
        loader: conversationLoader,
        errorElement: <ErrorPage />,
        hydrateFallbackElement: FallbackUI,
      },
      { path: 'users/:id', element: <UserProfilePage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);

export default router;
