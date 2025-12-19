import { useAuth } from '../contexts/auth.context';
import { Navigate } from 'react-router';
// import ClientHomePage from '../pages/client/home';

// Dashboard components (mocked)
const BarberDashboard = () => {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-blue-100 p-8">
      <h1 className="text-3xl font-bold text-blue-800">Dashboard do Barbeiro</h1>
      <p className="mt-4">Bem-vindo ao seu painel de barbeiro!</p>
      <button onClick={logout} className='bg-black text-white px-3 py-1 rounded-md mt-4'>Logout</button>
    </div>
  );
};

const AdminDashboard = () => {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-purple-100 p-8">
      <h1 className="text-3xl font-bold text-purple-800">Dashboard do Admin</h1>
      <p className="mt-4">Bem-vindo ao painel administrativo!</p>
      <button onClick={logout} className='bg-black text-white px-3 py-1 rounded-md mt-4'>Logout</button>
    </div>
  );
};

function AppRouter() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role
  
  switch (user.role) {
    case 'CLIENT':
      return <Navigate to="/client/home" replace />;
    case 'BARBER':
      return <BarberDashboard />;
    case 'ADMIN':
      return <AdminDashboard />;
    default:
      return <Navigate to="/client/home" replace />;
  }
}

export default AppRouter;