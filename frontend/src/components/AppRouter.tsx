import { useAuth } from '../contexts/auth.context';
import Auth from './layout/auth';

// Dashboard components (mocked)
const ClientDashboard = () => {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-green-100 p-8">
      <h1 className="text-3xl font-bold text-green-800">Dashboard do Cliente</h1>
      <p className="mt-4">Bem-vindo ao seu painel de cliente!</p>
      <button onClick={logout} className='bg-black text-white px-3 py-1 rounded-md mt-4'>Logout</button>
    </div>
  );
};

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

  console.log('🔄 AppRouter - loading:', loading, 'user:', user);

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

  // If not logged in, show auth screen
  if (!user) {
    console.log('🚫 AppRouter - No user, showing Auth');
    return <Auth />;
  }

  // Redirect based on user role
  console.log('✅ AppRouter - User authenticated, role:', user.role);
  
  switch (user.role) {
    case 'CLIENT':
      return <ClientDashboard />;
    case 'BARBER':
      return <BarberDashboard />;
    case 'ADMIN':
      return <AdminDashboard />;
    default:
      return <ClientDashboard />;
  }
}

export default AppRouter;