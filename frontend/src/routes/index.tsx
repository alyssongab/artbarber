import { createBrowserRouter, Navigate } from 'react-router';
import Auth from '../components/layout/auth';
import AppRouter from '../components/AppRouter';
import { RequireClient } from '../components/RouterGuard';
import ClientLayout from '../components/layout/client';
import ClientHomePage from '../pages/client/home';

// Router v7
export const router = createBrowserRouter([
  // Public
  { path: '/login', element: <Auth /> },
  { path: '/register', element: <Auth /> },

  // Auth area (AppRouter handles routes by role)
  { path: '/', element: <AppRouter /> },
  { path: '/*', element: <AppRouter /> },

  // Client (layout + children)
  {
    path: '/client',
    element: (
      <RequireClient>
        <ClientLayout />
      </RequireClient>
    ),
    children: [
      { index: true, element: <Navigate to="home" replace/> },
      { path: 'home', element: <ClientHomePage /> },
      // placeholders
      { path: 'appointments', element: <div className="p-4">Agendamentos</div> },
      { path: 'history', element: <div className="p-4">Histórico</div> },
    ]
  },

  // Redirecs (Fallback)
  { path: '*', element: <Navigate to="/login" replace /> },
]);

export default router;
