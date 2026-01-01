import { createBrowserRouter, Navigate } from 'react-router';
import Auth from '../components/layout/AuthLayout';
import AppRouter from '../components/routing/AppRouter';
import { RequireClient } from '../components/routing/RouterGuard';
import ClientLayout from '../components/layout/ClientLayout';
import ClientHomePage from '../pages/client/home';
import ClientAppointmentsPage from '../pages/client/appointments';

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
      { path: 'appointments', element: <ClientAppointmentsPage/> },
    ]
  },

  // Redirecs (Fallback)
  { path: '*', element: <Navigate to="/login" replace /> },
]);

export default router;
