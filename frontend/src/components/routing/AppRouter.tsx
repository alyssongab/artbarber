import { useAuth } from '../../contexts/auth.context';
import { Navigate } from 'react-router';
import { LoadingSpinner } from '../common/LoadingSpinner';

function AppRouter() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role
  
  switch (user.role) {
    case 'CLIENT':
      return <Navigate to="/client/home" replace />;
    case 'BARBER':
      return <Navigate to="/barber/home" replace/>;
    case 'ADMIN':
      return <Navigate to="/admin/home" replace />;
    default:
      return <Navigate to="/client/home" replace />;
  }
}

export default AppRouter;