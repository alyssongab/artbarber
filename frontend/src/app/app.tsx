import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../contexts/auth.context';
import AppRouter from '../components/AppRouter';

function App() {
  return (
    <AuthProvider>
      <AppRouter />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;
