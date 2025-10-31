import { createBrowserRouter, Navigate } from 'react-router';
import Auth from '../components/layout/auth';
import AppRouter from '../components/AppRouter';

// Router baseado em react-router v7
export const router = createBrowserRouter([
  // Públicas
  { path: '/login', element: <Auth /> },
  { path: '/register', element: <Auth /> },

  // Área autenticada (AppRouter decide dashboard por role)
  { path: '/', element: <AppRouter /> },
  { path: '/*', element: <AppRouter /> },

  // Redirecionamentos
  { path: '*', element: <Navigate to="/login" replace /> },
]);

export default router;
