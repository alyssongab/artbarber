import { createContext, ReactNode, useEffect, useState, useContext } from "react";
import { LoginRequest, RegisterRequest, User } from "../types";
import { authService } from "../services/api";
import toast from 'react-hot-toast';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (data: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => void;
}

// Context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook para usar o contexto
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};

// Provider
interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);

    // Clear corrupted data
    const clearCorruptedData = () => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token === 'undefined' || token === 'null' || userData === 'undefined' || userData === 'null') {
            console.log('AuthContext - Limpando dados corrompidos');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return true;
        }
        return false;
    };

    // Verify current user on localStorage at initialization
    useEffect(() => {
        if (initialized) return;

        console.log('AuthContext - Inicializando...');

        const wasCorrupted = clearCorruptedData();
        if (wasCorrupted) {
            console.log('AuthContext - Dados corrompidos removidos');
            setLoading(false);
            setInitialized(true);
            return;
        }

        try {
            const currentUser = authService.getCurrentUser();
            const isAuth = authService.isAuthenticated();
            
            console.log('AuthContext - Usuário do localStorage:', currentUser);
            console.log('AuthContext - Está autenticado:', isAuth);

            if (currentUser && isAuth) {
                setUser(currentUser);
                console.log('AuthContext - Usuário definido:', currentUser);
            }
        } catch (error) {
            console.error('AuthContext - Erro ao carregar usuário:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        } finally {
            setLoading(false);
            setInitialized(true);
        }
    }, [initialized]);

    const login = async (data: LoginRequest): Promise<void> => {
        try {
            console.log('AuthContext - Login iniciado com:', data);
            setLoading(true);

            const response = await authService.login(data);
            console.log('AuthContext - Response recebida:', response);

            if (!response.accessToken || !response.user) {
                throw new Error('Resposta inválida do servidor');
            }

            // Save on localstorage
            localStorage.setItem('token', response.accessToken);
            localStorage.setItem('user', JSON.stringify(response.user));
            
            // update state
            setUser(response.user);
            console.log('AuthContext - Usuário logado com sucesso:', response.user);
            
            toast.success('Login realizado com sucesso!');
            
        } catch (error: any) {
            console.error('AuthContext - Erro no login:', error);
            const message = error.response?.data?.message || error.message || 'Erro ao fazer login';
            toast.error(message);
            throw error; // Re-throw to allow handle the error on component
        } finally {
            setLoading(false);
        }
    };

    const register = async (data: RegisterRequest): Promise<void> => {
        try {
            console.log('AuthContext - Register iniciado com:', data);
            setLoading(true);

            const response = await authService.register(data);
            console.log('AuthContext - Register response:', response);

            if (!response.accessToken || !response.user) {
                throw new Error('Resposta inválida do servidor');
            }

            // Save on localstorage
            localStorage.setItem('token', response.accessToken);
            localStorage.setItem('user', JSON.stringify(response.user));
            
            // Update state
            setUser(response.user);
            console.log('AuthContext - Usuário registrado com sucesso:', response.user);
            
            toast.success('Cadastro realizado com sucesso!');
            
        } catch (error: any) {
            console.error('AuthContext - Erro no register:', error);
            const message = error.response?.data?.message || error.message || 'Erro ao criar conta';
            toast.error(message);
            throw error; // Re-throw to allow handle the error on component
        } finally {
            setLoading(false);
        }
    };

    const logout = (): void => {
        console.log('AuthContext - Logout executado');
        
        setUser(null);
        authService.logout();
        
        toast.success('Logout realizado com sucesso!');
    };

    const value: AuthContextType = {
        user,
        loading,
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};