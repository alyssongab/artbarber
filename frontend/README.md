# Frontend - Sistema de Barbearia

Aplicação frontend desenvolvida com **React 19**, **TypeScript** e **Vite**, implementando uma interface moderna e responsiva para um sistema completo de gestão de barbearia com três perfis de usuário distintos.

---

## 📋 Índice

- [Stack Tecnológica](#-stack-tecnológica)
- [Arquitetura](#-arquitetura)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Recursos Principais](#-recursos-principais)
- [Padrões e Práticas](#-padrões-e-práticas)
- [Configuração](#-configuração)
- [Scripts Disponíveis](#-scripts-disponíveis)

---

## 🛠 Stack Tecnológica

### Core
- **React 19.1.1** - Biblioteca UI com React Compiler
- **TypeScript 5.8.3** - Tipagem estática e segurança de tipos
- **Vite 7.1.7** - Build tool e dev server ultra-rápido
- **React Router 7.9.5** - Roteamento declarativo

### UI & Styling
- **Tailwind CSS 4.1.14** - Utility-first CSS framework
- **Lucide React** - Biblioteca de ícones SVG
- **shadcn/ui** - Sistema de componentes reutilizáveis

### State Management & Forms
- **React Hook Form 7.63.0** - Gerenciamento de formulários
- **Zod 4.1.11** - Validação de schemas
- **Context API** - Gerenciamento de estado global (Auth)

### HTTP & Data
- **Axios 1.12.2** - Cliente HTTP com interceptors
- **date-fns 4.1.0** - Manipulação de datas

### UX
- **React Hot Toast 2.6.0** - Sistema de notificações
- **React Day Picker 9.13.0** - Seletor de datas

---

## 🏗 Arquitetura

### Padrão de Design
```
Frontend (React SPA)
├── Presentation Layer (Pages/Components)
├── Business Logic Layer (Hooks/Utils)
├── Data Access Layer (Services/API)
└── State Management (Context API)
```

### Fluxo de Dados
```
Component → Service → API (Axios) → Backend
    ↓                                    ↓
Context/State ← Transform/Validate ← Response
```

### Separação de Responsabilidades
- **Pages**: Containers de alto nível, orchestram componentes
- **Components**: UI reutilizável, sem lógica de negócio
- **Services**: Camada de abstração para APIs externas
- **Utils**: Funções puras de transformação e validação
- **Contexts**: Estado global e lógica compartilhada
- **Hooks**: Lógica de UI reutilizável (custom hooks)

---


## 🚀 Recursos Principais

### 1. Sistema de Autenticação
**Arquivos**: `contexts/auth.context.tsx`, `services/api.ts`, `hooks/useAuth.ts`

#### Features
- ✅ Login/Logout com JWT
- ✅ Registro de clientes
- ✅ Persistência de sessão (localStorage)
- ✅ Auto-logout em token expirado (401)
- ✅ Refresh token automático
- ✅ Role-based access control (CLIENT, BARBER, ADMIN)

#### AuthContext Provider
```typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterClientRequest) => Promise<void>;
  logout: () => void;
}
```

#### Axios Interceptors
```typescript
// Request: Adiciona token automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response: Auto-logout em 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);
```

---

### 2. Sistema de Roteamento

**Arquivos**: `routes/index.tsx`, `components/routing/RouterGuard.tsx`

#### Router Guards
```typescript
<RequireAuth>     // Requer autenticação
<RequireClient>   // Requer role CLIENT
<RequireBarber>   // Requer role BARBER
<RequireAdmin>    // Requer role ADMIN
```

#### Estrutura de Rotas
```
/ (root)
├── /login                    [PUBLIC]
├── /register                 [PUBLIC]
│
├── /client                   [CLIENT]
│   ├── /home                 (Agendar serviço)
│   └── /appointments         (Meus agendamentos)
│
├── /barber                   [BARBER]
│   ├── /home                 (Dashboard com estatísticas)
│   ├── /agenda               (Agenda do dia)
│   └── /appointment          (Agendamento manual)
│
└── /admin                    [ADMIN]
    ├── /home                 (Dashboard administrativo)
    ├── /barbers              (CRUD de barbeiros)
    └── /services             (CRUD de serviços)
```

#### AppRouter (Role-based Redirect)
```typescript
// Redireciona baseado no role do usuário
if (user.role === 'CLIENT') return <Navigate to="/client/home" />
if (user.role === 'BARBER') return <Navigate to="/barber/home" />
if (user.role === 'ADMIN') return <Navigate to="/admin/home" />
```

---

### 3. Serviços de API

**Arquivo**: `services/api.ts`

#### Estrutura de Serviços
```typescript
export const authService = {
  login, register, logout, refreshToken,
  getCurrentUser, isAuthenticated
}

export const appointmentService = {
  getServices, getBarbers, getAvailableHours,
  createAppointment, getRelatedAppointments,
  cancelAppointment, updateAppointmentStatus,
  getBarberRevenue, searchAppointmentsByClientName
}

export const userService = {
  getAllBarbers, createBarber, deleteBarber
}

export const servicesService = {
  getAllServices, createService, updateService, deleteService
}
```

#### Exemplo de Uso
```typescript
// Login
const { accessToken, user } = await authService.login({
  email: 'user@example.com',
  password: 'senha123'
});

// Criar agendamento
const appointment = await appointmentService.createAppointment({
  appointment_datetime: '2026-01-20T14:00:00.000Z',
  id_barber: 2,
  id_client: 5,
  id_service: 1
});

// Buscar horários disponíveis
const times = await appointmentService.getAvailableHours({
  appointment_date: '2026-01-20',
  id_barber: 2
});
```

---

### 4. Sistema de Types

**Arquivo**: `types/index.ts`

#### Principais Interfaces

**User Types**
```typescript
interface User {
  user_id: number;
  full_name: string;
  email: string;
  phone_number: string;
  birthday?: string | null;
  role: 'CLIENT' | 'BARBER' | 'ADMIN';
  photo_url?: string | null;
  thumbnail_url?: string | null;
}
```

**Appointment Types**
```typescript
interface AppointmentResponse {
  appointment_id: number;
  appointment_datetime: string; // ISO 8601 UTC
  barber: UserResponseDTO;
  client?: UserResponseDTO;
  service: ServiceResponseDTO;
  appointment_status: 'PENDENTE' | 'CONCLUIDO' | 'CANCELADO';
  notification_sent: boolean;
}
```

**Service Types**
```typescript
interface Service {
  service_id: number;
  name: string;
  price: number;
  duration: number;
  service_status: 'ACTIVE' | 'INACTIVE';
}
```

---

### 5. Utilitários de Formatação

**Arquivo**: `utils/helpers.ts`

#### Date/Time Helpers
```typescript
// ISO 8601 → pt-BR
formatDate('2026-01-20T14:00:00Z')    // '20/01/2026'
formatTime('2026-01-20T14:00:00Z')    // '14:00'

// pt-BR → ISO 8601 UTC
combineDateTimeToISO('2026-01-20', '14:00')  // '2026-01-20T17:00:00.000Z'

// Date → YYYY-MM-DD
formatToISOStandard(new Date())       // '2026-01-20'
```

#### Status Helpers
```typescript
// Status de agendamento
capitalizeStatus('PENDENTE')          // 'Agendado'
capitalizeStatus('CONCLUIDO')         // 'Concluído'
capitalizeStatus('CANCELADO')         // 'Cancelado'

// CSS classes dinâmicas
getStatusStyles('PENDENTE')           // 'bg-yellow-100 text-yellow-950...'
getStatusStyles('CONCLUIDO')          // 'bg-green-100 text-emerald-950...'
getStatusStyles('CANCELADO')          // 'bg-red-100 text-red-950...'

// Status de serviço (Strategy Pattern)
formatServiceStatus('ACTIVE')         
// { label: 'Ativo', className: 'bg-green-100 text-green-950...' }
```

#### Business Logic
```typescript
// Validar se pode cancelar (futuro)
canCancelAppointment('2026-01-20T14:00:00Z')  // true/false

// Formatar duração
formatDuration(30)   // '30 min'
formatDuration(90)   // '1h 30min'
formatDuration(120)  // '2h'
```

---

### 6. Filtros e Validações

**Arquivo**: `utils/filters.ts`

#### Filtro de Horários Válidos
```typescript
/**
 * Remove horários passados se a data for hoje
 * @param times Array de horários ('HH:mm')
 * @param selectedDate Data selecionada ('YYYY-MM-DD')
 * @returns Horários válidos
 */
filterValidTimes(times: string[], selectedDate: string): string[]
```

**Exemplo**:
```typescript
// Hoje: 2026-01-20 15:30
const times = ['14:00', '14:30', '15:00', '15:30', '16:00'];
filterValidTimes(times, '2026-01-20');
// → ['16:00'] (remove horários passados)

filterValidTimes(times, '2026-01-21');
// → ['14:00', '14:30', '15:00', '15:30', '16:00'] (dia futuro, todos válidos)
```

---

### 7. Componentes Especializados

#### BarberSelectionModal
**Arquivo**: `components/features/appointments/BarberSelectionModal.tsx`

Modal visual para seleção de barbeiro com foto e nome.

**Features**:
- ✅ Grid de barbeiros com thumbnail
- ✅ Indicador visual de selecionado (checkmark)
- ✅ Fallback para foto ausente (ícone UserCircle)
- ✅ Fecha automaticamente ao selecionar
- ✅ Estado disabled

**Props**:
```typescript
interface BarberSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  barbers: User[];
  selectedBarberId: string;
  onSelectBarber: (barberId: string) => void;
  disabled?: boolean;
}
```

#### BarberSelector
**Arquivo**: `components/features/appointments/BarberSelector.tsx`

Botão customizado que exibe o barbeiro selecionado.

**Features**:
- ✅ Mostra thumbnail + nome do barbeiro
- ✅ Placeholder quando vazio
- ✅ Estado disabled
- ✅ Ícone ChevronRight

**Uso**:
```typescript
<BarberSelector
  selectedBarber={selectedBarberObj}
  onClick={() => setShowBarberModal(true)}
  disabled={!selectedService}
  placeholder="Selecione o barbeiro"
/>
```

#### AppointmentCard
**Arquivo**: `components/features/appointments/AppointmentCard.tsx`

Card de agendamento para cliente com informações completas.

**Features**:
- ✅ Exibe serviço, barbeiro, data/hora
- ✅ Badge de status (Agendado/Concluído/Cancelado)
- ✅ Botão de cancelamento (apenas futuros)
- ✅ Modal de confirmação

#### BarberAppointmentCard
**Arquivo**: `components/features/appointments/BarberAppointmentCard.tsx`

Card de agendamento para barbeiro com controles de status.

**Features**:
- ✅ Exibe cliente, serviço, horário
- ✅ Atualizar status (Pendente → Concluído)
- ✅ Cancelar agendamento
- ✅ Busca por nome de cliente

---

## 🎨 Padrões e Práticas

### 1. Strategy Pattern
```typescript

const statusConfig = {
  ACTIVE: {
    label: 'Ativo',
    bgColor: 'bg-green-100',
    textColor: 'text-green-950',
    borderColor: 'border-green-500',
  },
  INACTIVE: {
    label: 'Inativo',
    bgColor: 'bg-red-100',
    textColor: 'text-red-950',
    borderColor: 'border-red-500',
  },
};
```

### 3. Composition Over Inheritance
```typescript
// Layout com Outlet (React Router)
<AppLayout>
  <Outlet /> {/* Renderiza children das rotas */}
</AppLayout>

// Composição de Guards
<RequireClient>
  <AppLayout>
    <ClientHomePage />
  </AppLayout>
</RequireClient>
```

### 4. Type Safety
```typescript
// Tipos estritos
type AppointmentStatus = 'PENDENTE' | 'CONCLUIDO' | 'CANCELADO';
type UserRole = 'CLIENT' | 'BARBER' | 'ADMIN';

// Generics em API responses
interface ApiResponse<T> {
  data: T;
  message?: string;
}
```

### 5. Error Handling
```typescript
// Axios interceptor global
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    
    if (status === 401) {
      authService.logout();
      window.location.href = '/';
    }
    
    return Promise.reject(error);
  }
);

// Try-catch em services
try {
  const response = await appointmentService.createAppointment(data);
  toast.success('Agendamento criado com sucesso!');
} catch (error: any) {
  const message = error.response?.data?.message || 'Erro ao criar agendamento';
  toast.error(message);
}
```

### 6. Loading States
```typescript
const [isLoading, setIsLoading] = useState(false);

const fetchData = async () => {
  setIsLoading(true);
  try {
    const data = await service.getData();
    setData(data);
  } finally {
    setIsLoading(false); // Sempre executa
  }
};

{isLoading ? <LoadingSpinner /> : <Content />}
```

---

## ⚙️ Configuração

### Variáveis de Ambiente
**Arquivo**: `.env`

```env
VITE_API_URL="url_backend"
VITE_APP_NAME=ArtBarber
```

### Vite Config
**Arquivo**: `vite.config.ts`

```typescript
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/contexts': path.resolve(__dirname, './src/contexts')
    },
  },
  server: {
    port: 3000,
    host: true
  }
});
```
---

### Comandos
```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview

# Lint
npm run lint
```

---

## 🔗 Integração com Backend

### Base URL
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL; // http://localhost:3030/api
```

### Endpoints Consumidos
```
Auth:
POST   /users/login              # Login
POST   /users/client             # Registro de cliente
POST   /users/refresh-token      # Refresh token

Appointments:
GET    /appointments             # Listar agendamentos (paginado)
POST   /appointments             # Criar agendamento
PUT  /appointments/:id         # Atualizar status
POST   /appointments/availability # Horários disponíveis
POST   /appointments/barber/revenue/:id # Receita do barbeiro
GET    /appointments/barber/:id/search  # Buscar por nome de cliente

Services:
GET    /services                 # Listar todos
GET    /services/active          # Apenas ativos
POST   /services                 # Criar serviço
PUT    /services/:id             # Atualizar serviço
DELETE /services/:id             # Deletar serviço

Users:
GET    /users/barbers            # Listar barbeiros
POST   /users/barber             # Criar barbeiro (multipart)
DELETE /users/:id                # Deletar usuário
```

---

## 📱 Responsividade

### Breakpoints (Tailwind)
```css
xs:       370px   /* custom */ 
mobile:   450px   /* custom2 */ 
sm:       640px   /* Tablets portrait */
md:       768px   /* Tablets landscape */
lg:       1024px  /* Laptops */
xl:       1280px  /* Desktops */
2xl:      1536px  /* Large desktops */
```

### Mobile-First Approach
```tsx
{/* Mobile: Stack vertical */}
<div className="flex flex-col gap-4 md:flex-row md:gap-6">
  
{/* Mobile: Full width | Desktop: Grid */}
<div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

{/* Mobile: Hidden | Desktop: Visible */}
<div className="hidden md:block">
```
---

## 📄 Licença

Este projeto está sob a licença Apache. Consulte o arquivo LICENSE para mais detalhes.

---

**Última atualização**: Janeiro 2026  
**Versão do React**: 19.1.1  
**Versão do TypeScript**: 5.8.3  
**Versão do Vite**: 7.1.7
