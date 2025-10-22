import { useAuth } from '../contexts/auth.context';

// Re-export do hook principal para facilitar importação
export { useAuth } from '../contexts/auth.context';

// Hook para verificar se está logado
export const useIsAuthenticated = () => {
  const { user } = useAuth();
  return !!user;
};

// Hook para obter role do usuário
export const useUserRole = () => {
  const { user } = useAuth();
  return user?.role || null;
};

// Hook para verificar se é admin
export const useIsAdmin = () => {
  const { user } = useAuth();
  return user?.role === 'ADMIN';
};

// Hook para verificar se é barbeiro
export const useIsBarber = () => {
  const { user } = useAuth();
  return user?.role === 'BARBER';
};

// Hook para verificar se é cliente
export const useIsClient = () => {
  const { user } = useAuth();
  return user?.role === 'CLIENT';
};