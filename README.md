# 🪒 ArtBarber - Sistema de Barbearia

Sistema completo de gerenciamento de barbearia com agendamentos, notificações WhatsApp e controle de usuários.

## 📋 Índice

- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso da API](#uso-da-api)
- [Sistema de Notificações](#sistema-de-notificações)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Variáveis de Ambiente](#variáveis-de-ambiente)

## ✨ Funcionalidades

### 🔐 Autenticação e Autorização
- Sistema completo de login/registro
- JWT para autenticação
- Roles: `CLIENT`, `BARBER`, `ADMIN`
- Middlewares de autorização por papel

### 📅 Sistema de Agendamentos
- **Clientes**: Podem criar e visualizar apenas seus próprios agendamentos
- **Barbeiros**: Podem criar agendamentos walk-in (sem cliente) e visualizar todos os agendamentos
- Validação de conflitos de horário
- Status de agendamento: `PENDENTE`, `CONFIRMADO`, `CANCELADO`, `CONCLUIDO`

### 💬 Notificações WhatsApp (Twilio)
- Lembretes automáticos **15 minutos antes** do agendamento
- Webhook para rastreamento de entrega
- Templates personalizados para mensagens
- Logs detalhados de status de entrega

### 👥 Gestão de Usuários
- Perfis completos de clientes e barbeiros
- Validação de telefone brasileiro
- Hash seguro de senhas (bcrypt)

### 🛠️ Serviços
- Cadastro de serviços da barbearia
- Preços e descrições
- Vinculação aos agendamentos

## 🚀 Tecnologias

### Backend
- **Node.js** + **TypeScript**
- **Express.js** - Framework web
- **Prisma** - ORM e migrations
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **Zod** - Validação de dados
- **Twilio** - API WhatsApp
- **Bcrypt** - Hash de senhas
- **Node-cron** - Agendador de tarefas

### Infraestrutura
- **Docker** - Containerização
- **Ngrok** - Tunneling para webhooks (desenvolvimento)

## 📦 Instalação

### Pré-requisitos
- Node.js 18+
- Docker & Docker Compose
- Conta Twilio (para WhatsApp)

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/artbarber.git
cd artbarber/backend
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o banco de dados
```bash
# Suba o PostgreSQL com Docker
docker-compose up -d

# Execute as migrations
npx prisma migrate dev
npx prisma db seed
```

### 4. Configure as variáveis de ambiente
Copie `.env.example` para `.env` e preencha:

```env
# Database
DATABASE_URL="postgresql://barber_ar:barber_123@localhost:5430/barbearia_db"

# JWT
JWT_SECRET="BARBEARIA_SANTOS_2025"

# Twilio WhatsApp
TWILIO_ACCOUNT_SID="seu_account_sid"
TWILIO_AUTH_TOKEN="seu_auth_token" 
TWILIO_WHATSAPP_NUMBER="+14155238886"
TWILIO_TEMPLATE_SID="seu_template_sid"

# Notificações
NOTIFICATIONS_ENABLED="true"
API_URL="https://seu-ngrok-url.ngrok.app"
```

### 5. Execute o servidor
```bash
npm run dev
```

## 🔧 Configuração

### Twilio WhatsApp Setup
1. Crie uma conta na [Twilio](https://twilio.com)
2. Configure o WhatsApp Sandbox
3. Crie um template de mensagem aprovado
4. Configure o webhook URL: `https://seu-app.com/api/notifications/status-webhook`

### Ngrok para Desenvolvimento
```bash
# Instale o ngrok
npm install -g ngrok

# Exponha o servidor local
ngrok http 3030

# Use a URL gerada no .env como API_URL
```

## 🌐 Uso da API

### Autenticação
```bash
# Registro
POST /api/users/register
{
  "first_name": "João",
  "last_name": "Silva", 
  "email": "joao@email.com",
  "phone_number": "85987654321",
  "password": "123456",
  "role": "CLIENT"
}

# Login
POST /api/users/login
{
  "email": "joao@email.com",
  "password": "123456"
}
```

### Agendamentos
```bash
# Cliente cria agendamento para si mesmo
POST /api/appointments
Authorization: Bearer <token>
{
  "appointment_date": "2025-09-25",
  "appointment_time": "14:30:00",
  "id_barber": 2,
  "id_service": 1
}

# Barbeiro cria agendamento walk-in
POST /api/appointments
Authorization: Bearer <barber_token>
{
  "appointment_date": "2025-09-25",
  "appointment_time": "15:00:00",
  "id_barber": 2,
  "id_service": 1
  // Sem id_client = cliente presencial
}
```

### Endpoints Principais

| Método | Endpoint | Descrição | Acesso |
|--------|----------|-----------|--------|
| `POST` | `/api/users/register` | Cadastro de usuário | Público |
| `POST` | `/api/users/login` | Login | Público |
| `GET` | `/api/users/profile` | Perfil do usuário | Autenticado |
| `POST` | `/api/appointments` | Criar agendamento | CLIENT, BARBER |
| `GET` | `/api/appointments` | Agendamentos do usuário | Autenticado |
| `GET` | `/api/appointments/all` | Todos os agendamentos | BARBER, ADMIN |
| `DELETE` | `/api/appointments/:id` | Cancelar agendamento | CLIENT, BARBER |
| `GET` | `/api/services` | Listar serviços | Público |

## 📱 Sistema de Notificações

### Como Funciona
1. **Cron Job** executa a cada 15 segundos
2. Busca agendamentos que acontecem em **exatamente 15 minutos**
3. Envia mensagem via **Twilio WhatsApp API**
4. Twilio envia **webhooks** com status de entrega
5. Sistema processa e loga o status no console

### Fluxo de Notificação
```
12:00:00 - Cron encontra agendamento às 12:15
12:00:01 - Envia para Twilio: "Oi João, seu agendamento é em 15min"
12:00:02 - Twilio: "Recebi! MessageSid: SM123abc"
12:00:03 - Webhook: "Status: SENT"
12:00:05 - WhatsApp entrega para João
12:00:06 - Webhook: "Status: DELIVERED"  
12:00:10 - João lê a mensagem
12:00:11 - Webhook: "Status: READ"
```

### Template de Mensagem
```
🔔 *Lembrete ArtBarber*

Olá, João!

Seu agendamento é em 15 minutos:

📅 25/09/2025 às 14:30
✂️ Serviço: Corte Masculino  
👨‍💼 Barbeiro: Carlos
💰 R$ 25.00

Te esperamos! 😊
```

### Logs do Sistema
O sistema fornece logs detalhados no console:

```bash
📤 ENVIANDO NOTIFICAÇÃO:
   Cliente: João (85987654321)
   Agendamento: 25/09/2025, 14:30:00
   Diferença EXATA: 15 minutos

✅ [25/09/2025, 14:15:23] WhatsApp Status Update:
   MessageSid: SM123abc
   Cliente: João
   Agendamento ID: 25
   Status: DELIVERED
   Descrição: Mensagem entregue ao destinatário
```

## 📁 Estrutura do Projeto

```
artbarber/
├── backend/
│   ├── src/
│   │   └── server/
│   │       ├── modules/
│   │       │   ├── users/           # Usuários e autenticação
│   │       │   ├── appointments/    # Sistema de agendamentos
│   │       │   ├── services/        # Serviços da barbearia
│   │       │   └── notification/    # Sistema de notificações
│   │       ├── shared/
│   │       │   ├── middlewares/     # Auth, validação, etc.
│   │       │   ├── errors/          # Tratamento de erros
│   │       │   └── types/           # Tipagens TypeScript
│   │       └── server.ts
│   ├── prisma/
│   │   ├── schema.prisma           # Schema do banco
│   │   └── migrations/             # Migrations
│   ├── docker-compose.yml          # PostgreSQL container
│   └── package.json
└── README.md
```

## 🔐 Variáveis de Ambiente

```env
# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5430/barbearia_db"
POSTGRES_USER=barber_ar
POSTGRES_PASSWORD=barber_123
POSTGRES_DB=barbearia_db

# JWT Secret Key
JWT_SECRET="BARBEARIA_SANTOS_2025"

# Server Port
PORT_BACKEND=3030

# Twilio WhatsApp Configuration
TWILIO_ACCOUNT_SID="ACxxxx"
TWILIO_AUTH_TOKEN="xxxx"
TWILIO_WHATSAPP_NUMBER="+14155238886"
TWILIO_TEMPLATE_SID="HXxxxx"
NOTIFICATIONS_ENABLED="true"

# API URL (for webhooks)
API_URL="https://seu-app.com"
```

## 📊 Status do Projeto

### ✅ Implementado
- [x] Sistema de autenticação JWT
- [x] CRUD de usuários com roles
- [x] Sistema completo de agendamentos
- [x] Validações de conflito de horário
- [x] Notificações WhatsApp automáticas
- [x] Webhooks de rastreamento de entrega
- [x] Middleware de autorização baseado em roles
- [x] Validação de dados com Zod
- [x] Containerização com Docker

### 🎯 Próximas Features
- [ ] Frontend React (Mobile first)
- [ ] Telas para cliente, barbeiro e admin
- [ ] Dashboard administrativo
- [ ] Upload de imagens de perfil
- [ ] Sistema de avaliações

## 👥 Contribuição

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-feature`
3. Commit suas mudanças: `git commit -m 'Add nova feature'`
4. Push para a branch: `git push origin feature/nova-feature`
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Contato

**Desenvolvedor**: Alysson Gabriel
- GitHub: [@alysson](https://github.com/alyssongab)

---

⭐ **Se este projeto foi útil para você, considere dar uma estrela!**