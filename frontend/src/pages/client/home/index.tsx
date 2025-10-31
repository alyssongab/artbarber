import { useAuth } from "../../../contexts/auth.context";

function ClientHome() {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-green-100 p-8">
      <h1 className="text-3xl font-bold text-green-800">Dashboard do Cliente</h1>
      <p className="mt-4">Bem-vindo ao seu painel de cliente!</p>
      <button onClick={logout} className='bg-black text-white px-3 py-1 rounded-md mt-4'>Logout</button>
    </div>
  );
}

export default ClientHome;