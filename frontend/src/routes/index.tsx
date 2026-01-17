import { createBrowserRouter, Navigate } from 'react-router';
import Auth from '../components/layout/AuthLayout';
import AppRouter from '../components/routing/AppRouter';
import { RequireBarber, RequireClient, RequireAdmin } from '../components/routing/RouterGuard';
import AppLayout from '../components/layout/AppLayout';
import ClientHomePage from '../pages/client/home';
import ClientAppointmentsPage from '../pages/client/appointments';
import BarberHomePage from '../pages/barber/home';
import BarberAgenda from '../pages/barber/agenda';
import BarberManualAppointmentPage from '../pages/barber/appointment';
import AdminHomePage from '../pages/admin/home';
import AdminBarbersPage from '../pages/admin/barbers';

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
        <AppLayout />
      </RequireClient>
    ),
    children: [
      { index: true, element: <Navigate to="home" replace/> },
      { path: 'home', element: <ClientHomePage /> },
      // placeholders
      { path: 'appointments', element: <ClientAppointmentsPage/> },
    ]
  },

  // Barber 
  {
    path: '/barber',
    element: (
      <RequireBarber>
        <AppLayout />
      </RequireBarber>
    ),
    children: [
      { index: true, element: <Navigate to="home" replace/> },
      { path: 'home', element: <BarberHomePage/> },
      { path: 'agenda', element: <BarberAgenda /> },
      { path: 'appointment', element: <BarberManualAppointmentPage /> }
    ]
  },

  // Admin
  {
    path: '/admin',
    element: (
      <RequireAdmin>
        <AppLayout />
      </RequireAdmin>
    ),
    children: [
      { index: true, element: <Navigate to="home" replace/> },
      { path: 'home', element: <AdminHomePage/> },
      { path: 'barbers', element: <AdminBarbersPage/> }
    ]
  },

  // Redirecs (Fallback)
  { path: '*', element: <Navigate to="/login" replace /> },
]);

export default router;
