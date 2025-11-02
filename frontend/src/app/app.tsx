import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../contexts/auth.context';
import { RouterProvider } from 'react-router';
import router from '../routes/index';

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster 
        position="bottom-right"
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
