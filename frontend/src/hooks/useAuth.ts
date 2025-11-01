import { useAuth } from '../contexts/auth.context';

// Re-export to facilitate import
export { useAuth } from '../contexts/auth.context';

// Hook to verify if logged in
export const useIsAuthenticated = () => {
  const { user } = useAuth();
  return !!user;
};

// Hook to get user role
export const useUserRole = () => {
  const { user } = useAuth();
  return user?.role || null;
};

// Hook to verify if user is admin
export const useIsAdmin = () => {
  const { user } = useAuth();
  return user?.role === 'ADMIN';
};

// Hook to verify if user is barber
export const useIsBarber = () => {
  const { user } = useAuth();
  return user?.role === 'BARBER';
};

// Hook to verify if user is client
export const useIsClient = () => {
  const { user } = useAuth();
  return user?.role === 'CLIENT';
};