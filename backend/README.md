# Documentação da API - Artbarber

> **Versão:** 2.0.0  
> **Base URL:** `http://localhost:3030/api`  
> **Autenticação:** JWT Bearer Token (exceto endpoints públicos)  
> **Tecnologias:** Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, Cloudinary, Twilio

---

## 📋 Índice

1. [Autenticação](#autenticação)
2. [Endpoints - Users](#endpoints---users)
3. [Endpoints - Services](#endpoints---services)
4. [Endpoints - Appointments](#endpoints---appointments)
5. [Endpoints - Notifications](#endpoints---notifications)
6. [Banco de Dados](#banco-de-dados)
7. [Variáveis de Ambiente](#variáveis-de-ambiente)
8. [Códigos de Status HTTP](#códigos-de-status-http)

---

## 🔐 Autenticação

A maioria dos endpoints requer autenticação JWT. Após fazer login, você receberá um `accessToken` que deve ser incluído no header de todas as requisições protegidas:

```
Authorization: Bearer <seu_token_jwt>
```

### Roles (Cargos) disponíveis:
- **CLIENT**: Cliente da barbearia (pode agendar e cancelar seus próprios agendamentos)
- **BARBER**: Barbeiro (pode gerenciar agendamentos de seus clientes e visualizar estatísticas)
- **ADMIN**: Administrador (acesso total ao sistema)

### Renovação de Token
- Tokens expiram após **7 dias**
- Use o endpoint `/api/users/refresh-token` para renovar tokens válidos
- Recomenda-se renovar ao abrir a aplicação e periodicamente (ex: a cada 1 hora)

---

## 👥 Endpoints - Users

### **POST** `/api/users/client` 🔓 Público
Cria uma nova conta de cliente.

**Permissão:** Nenhuma (público)

**Body (JSON):**
```json
{
  "full_name": "string",      // Obrigatório - Nome completo (mínimo 1 caractere)
  "email": "string",           // Obrigatório - Email válido
  "password": "string",        // Obrigatório - Mínimo 6 caracteres
  "phone_number": "string",    // Obrigatório - Exatamente 11 dígitos (ex: 92912345678)
  "birthday": "2000-01-15"     // Opcional - Formato ISO date (YYYY-MM-DD) ou null
}
```

**Resposta de sucesso (201):**
```json
{
  "user_id": 1,
  "full_name": "João Silva",
  "email": "joao@email.com",
  "phone_number": "92912345678",
  "birthday": "2000-01-15T00:00:00.000Z",
  "role": "CLIENT",
  "photo_url": null,
  "thumbnail_url": null
}
```

**Erros comuns:**
- `400` - Email já cadastrado
- `400` - Validação falhou (campos obrigatórios ou formato inválido)

---

### **POST** `/api/users/login` 🔓 Público
Autentica um usuário e retorna token JWT.

**Permissão:** Nenhuma (público)

**Body (JSON):**
```json
{
  "email": "string",      // Obrigatório - Email válido
  "password": "string"    // Obrigatório - Mínimo 6 caracteres
}
```

**Resposta de sucesso (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": 1,
    "full_name": "João Silva",
    "email": "joao@email.com",
    "phone_number": "92912345678",
    "birthday": "2000-01-15T00:00:00.000Z",
    "role": "CLIENT",
    "photo_url": null,
    "thumbnail_url": null
  }
}
```

**Erros comuns:**
- `401` - Email ou senha inválidos

---

### **POST** `/api/users/barber` 🔒 ADMIN
Cria uma conta de barbeiro com upload de foto via Cloudinary.

**Permissão:** ADMIN

**Content-Type:** `multipart/form-data`

**Form Data:**
```
full_name: string        // Obrigatório - Nome completo
email: string            // Obrigatório - Email válido
password: string         // Obrigatório - Mínimo 6 caracteres
phone_number: string     // Obrigatório - Exatamente 11 dígitos
photo: file              // Obrigatório - Arquivo de imagem (JPEG, JPG ou PNG)
```

**Resposta de sucesso (201):**
```json
{
  "user_id": 2,
  "full_name": "Carlos Barbeiro",
  "email": "carlos@email.com",
  "phone_number": "92987654321",
  "birthday": null,
  "role": "BARBER",
  "photo_url": "https://res.cloudinary.com/.../barber_photo.jpg",
  "thumbnail_url": "https://res.cloudinary.com/.../barber_thumbnail.jpg"
}
```

**Observações:**
- A foto é enviada para o Cloudinary automaticamente
- Duas versões são geradas:
  - `photo_url`: Imagem em tamanho original (máx 300x300px)
  - `thumbnail_url`: Miniatura (150x150px) para listagens
- O arquivo é processado em buffer (memoryStorage do Multer)

**Erros comuns:**
- `400` - Foto não enviada ou formato inválido
- `400` - Email já cadastrado
- `401` - Token ausente ou inválido
- `403` - Usuário não é ADMIN

---

### **GET** `/api/users/barbers` 🔒 Autenticado
Lista todos os barbeiros cadastrados no sistema.

**Permissão:** Qualquer usuário autenticado

**Resposta de sucesso (200):**
```json
[
  {
    "user_id": 2,
    "full_name": "Carlos Barbeiro",
    "photo_url": "https://res.cloudinary.com/.../barber_photo.jpg",
    "phone_number": "92987654321",
    "thumbnail_url": "https://res.cloudinary.com/.../barber_thumbnail.jpg"
  }
]
```

**Observações:**
- Retorna apenas usuários com `role = "BARBER"`
- DTO otimizado (não expõe email, senha, etc.)

---

### **GET** `/api/users` 🔒 ADMIN
Lista todos os usuários do sistema.

**Permissão:** ADMIN

**Resposta de sucesso (200):**
```json
[
  {
    "user_id": 1,
    "full_name": "João Silva",
    "email": "joao@email.com",
    "phone_number": "92912345678",
    "birthday": "2000-01-15T00:00:00.000Z",
    "role": "CLIENT",
    "photo_url": null,
    "thumbnail_url": null
  },
  {
    "user_id": 2,
    "full_name": "Carlos Barbeiro",
    "email": "carlos@email.com",
    "phone_number": "92987654321",
    "birthday": null,
    "role": "BARBER",
    "photo_url": "https://res.cloudinary.com/.../barber_photo.jpg",
    "thumbnail_url": "https://res.cloudinary.com/.../barber_thumbnail.jpg"
  }
]
```

---

### **GET** `/api/users/:id` 🔒 Autenticado
Busca um usuário específico por ID.

**Permissão:** Qualquer usuário autenticado

**Observações**
- Admin consegue ver qualquer usuário
- Clientes e Barbeiros conseguem consultar apenas seus próprios IDs.

**Parâmetros de rota:**
- `id` (número): ID do usuário

**Resposta de sucesso (200):**
```json
{
  "user_id": 1,
  "full_name": "João Silva",
  "email": "joao@email.com",
  "phone_number": "92912345678",
  "birthday": "2000-01-15T00:00:00.000Z",
  "role": "CLIENT",
  "photo_url": null,
  "thumbnail_url": null
}
```

**Erros comuns:**
- `404` - Usuário não encontrado

---

### **PUT** `/api/users/:id` 🔒 Autenticado
Atualiza dados de um usuário.

**Permissão:** Qualquer usuário autenticado (apenas seus próprios dados)

**Parâmetros de rota:**
- `id` (número): ID do usuário

**Body (JSON):** Todos os campos são opcionais
```json
{
  "full_name": "string",      // Opcional - Nome completo (mínimo 1 caractere)
  "password": "string",        // Opcional - Nova senha (mínimo 6 caracteres)
  "phone_number": "string",    // Opcional - Exatamente 11 dígitos
  "birthday": "2000-01-15"     // Opcional - Formato ISO date ou null
}
```

**Resposta de sucesso (200):**
```json
{
  "user_id": 1,
  "full_name": "João Silva Santos",
  "email": "joao@email.com",
  "phone_number": "92912345678",
  "birthday": "2000-01-15T00:00:00.000Z",
  "role": "CLIENT",
  "photo_url": null,
  "thumbnail_url": null
}
```

**Observações:**
- A senha é automaticamente hasheada com bcrypt
- Email não pode ser alterado (não está no schema de update)
- Usuários só podem atualizar seus próprios dados (validação via `req.user.user_id`)

**Erros comuns:**
- `403` - Tentativa de atualizar dados de outro usuário
- `404` - Usuário não encontrado

---

### **DELETE** `/api/users/:id` 🔒 ADMIN
Remove um usuário do sistema.

**Permissão:** ADMIN

**Parâmetros de rota:**
- `id` (número): ID do usuário

**Resposta de sucesso (204):**
Sem conteúdo (No Content)

**Erros comuns:**
- `404` - Usuário não encontrado
- `409` - Usuário possui agendamentos vinculados (constraint de FK)

---

### **POST** `/api/users/refresh-token` 🔒 Autenticado
Renova o token JWT de um usuário autenticado.

**Permissão:** Qualquer usuário autenticado (token ainda válido)

**Headers:**
```
Authorization: Bearer <seu_token_jwt_válido>
```

**Body:** Não requer body (token extraído do header)

**Resposta de sucesso (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": 1,
    "full_name": "João Silva",
    "email": "joao@email.com",
    "phone_number": "92912345678",
    "birthday": "2000-01-15T00:00:00.000Z",
    "role": "CLIENT",
    "photo_url": null,
    "thumbnail_url": null
  }
}
```

**Observações:**
- O token antigo deve estar **válido** (não expirado)
- Gera um novo token com data de expiração atualizada (+ 7 dias)
- Recomenda-se chamar ao abrir a aplicação e periodicamente (ex: a cada 1 hora)

**Erros comuns:**
- `401` - Token expirado (usuário deve fazer login novamente)

---

## 🛠️ Endpoints - Services

### **POST** `/api/services` 🔒 ADMIN
Cria um novo serviço.

**Permissão:** ADMIN

**Body (JSON):**
```json
{
  "name": "string",       // Obrigatório - Nome do serviço (mínimo 1 caractere)
  "price": number,        // Obrigatório - Preço (mínimo 10)
  "duration": number      // Obrigatório - Duração em minutos (mínimo 15)
}
```

**Exemplo:**
```json
{
  "name": "Corte de cabelo",
  "price": 50,
  "duration": 45
}
```

**Resposta de sucesso (201):**
```json
{
  "service_id": 1,
  "name": "Corte de cabelo",
  "price": "50.00",
  "duration": 45,
  "service_status": "ACTIVE"
}
```

**Observações:**
- `service_status` é automaticamente definido como `"ACTIVE"` na criação
- O preço é armazenado como DECIMAL(10,2) no banco

---

### **GET** `/api/services` 🔒 Autenticado
Lista todos os serviços cadastrados (incluindo inativos).

**Permissão:** Qualquer usuário autenticado

**Resposta de sucesso (200):**
```json
[
  {
    "service_id": 1,
    "name": "Corte de cabelo",
    "price": "50.00",
    "duration": 45,
    "service_status": "ACTIVE"
  },
  {
    "service_id": 2,
    "name": "Barba completa",
    "price": "35.00",
    "duration": 30,
    "service_status": "INACTIVE"
  }
]
```

---

### **GET** `/api/services/active` 🔒 Autenticado
Lista apenas serviços ativos.

**Permissão:** Qualquer usuário autenticado

**Resposta de sucesso (200):**
```json
[
  {
    "service_id": 1,
    "name": "Corte de cabelo",
    "price": "50.00",
    "duration": 45,
    "service_status": "ACTIVE"
  }
]
```

**Observações:**
- Filtra apenas serviços com `service_status = "ACTIVE"`

---

### **PUT** `/api/services/:id` 🔒 ADMIN
Atualiza um serviço existente.

**Permissão:** ADMIN

**Parâmetros de rota:**
- `id` (número): ID do serviço

**Body (JSON):** Todos os campos são opcionais
```json
{
  "name": "string",              // Opcional - Nome (mínimo 1 caractere)
  "price": number,               // Opcional - Preço (mínimo 10)
  "duration": number,            // Opcional - Duração (mínimo 15 minutos)
  "service_status": "ACTIVE"     // Opcional - "ACTIVE" ou "INACTIVE"
}
```

**Exemplo:**
```json
{
  "price": 60,
  "service_status": "INACTIVE"
}
```

**Resposta de sucesso (200):**
```json
{
  "service_id": 1,
  "name": "Corte de cabelo",
  "price": "60.00",
  "duration": 45,
  "service_status": "INACTIVE"
}
```

**Observações:**
- `service_status` permite desativar serviços sem deletar (soft delete)

**Erros comuns:**
- `404` - Serviço não encontrado

---

### **DELETE** `/api/services/:id` 🔒 ADMIN
Remove um serviço do sistema.

**Permissão:** ADMIN

**Parâmetros de rota:**
- `id` (número): ID do serviço

**Resposta de sucesso (204):**
Sem conteúdo (No Content)

**Erro comum (409 - Conflict):**
```json
{
  "message": "Não é possível deletar o serviço, pois existem agendamentos associados."
}
```

**Observações:**
- Não é possível deletar serviços com agendamentos vinculados (constraint de FK)

---

## 📅 Endpoints - Appointments

### **POST** `/api/appointments` 🔒 CLIENT ou BARBER
Cria um novo agendamento.

**Permissão:** CLIENT ou BARBER

**Body (JSON):**
```json
{
  "appointment_datetime": "string",  // Obrigatório - ISO datetime (YYYY-MM-DDTHH:mm:ss.sssZ)
  "id_client": number,               // Opcional/Null - ID do cliente
  "id_barber": number,               // Obrigatório - ID do barbeiro
  "id_service": number               // Obrigatório - ID do serviço
}
```

**Exemplo:**
```json
{
  "appointment_datetime": "2026-01-20T14:30:00.000Z",
  "id_client": 1,
  "id_barber": 2,
  "id_service": 1
}
```

**Regras de Negócio:**
- CLIENTs: Automaticamente têm seu próprio ID atribuído a `id_client` (não podem agendar para outros)
- BARBERs: Podem criar agendamentos para qualquer cliente ou deixar `id_client = null` (agendamentos presenciais)
- Validação de conflito: impede agendamentos no mesmo horário para o mesmo barbeiro

**Resposta de sucesso (201):**
```json
{
  "appointment_id": 1,
  "appointment_datetime": "2026-01-20T14:30:00.000Z",
  "appointment_status": "PENDENTE",
  "notification_sent": false,
  "barber": {
    "full_name": "Carlos Barbeiro",
    "phone_number": "92987654321"
  },
  "client": {
    "full_name": "João Silva",
    "phone_number": "92912345678"
  },
  "service": {
    "name": "Corte de cabelo",
    "price": "50.00",
    "duration": 45
  }
}
```

**Erros comuns:**
- `409` - Horário já ocupado para o barbeiro selecionado
- `404` - Barbeiro, cliente ou serviço não encontrado

---

### **POST** `/api/appointments/availability` 🔒 Autenticado
Retorna os horários disponíveis para um barbeiro em uma data específica.

**Permissão:** Qualquer usuário autenticado

**Body (JSON):**
```json
{
  "appointment_date": "string",  // Obrigatório - Data ISO (YYYY-MM-DD)
  "id_barber": number             // Obrigatório - ID do barbeiro
}
```

**Exemplo:**
```json
{
  "appointment_date": "2026-01-20",
  "id_barber": 2
}
```

**Resposta de sucesso (200):**
```json
[
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00"
]
```

**Observações:**
- Considera horário de funcionamento configurado (business-hours.ts)
- Exclui horários já ocupados pelo barbeiro
- Exclui horários passados (se data for hoje)
- Intervalos de 30 minutos

---

### **GET** `/api/appointments` 🔒 Autenticado
Lista agendamentos relacionados ao usuário autenticado com paginação server-side.

**Permissão:** Qualquer usuário autenticado

**Comportamento por Role:**
- **CLIENT**: Retorna apenas seus próprios agendamentos
- **BARBER**: Retorna agendamentos onde ele é o barbeiro
- **ADMIN**: Comportamento específico (verificar implementação)

**Query Parameters (opcionais):**
- `_page` (número): Número da página (padrão: 1)
- `_limit` (número): Itens por página (padrão: 10)
- `_date` (string): Filtro por data ISO (YYYY-MM-DD)

**Exemplo de requisição:**
```
GET /api/appointments?_page=2&_limit=5&_date=2026-01-20
```

**Resposta de sucesso (200):**
```json
{
  "data": [
    {
      "appointment_id": 1,
      "appointment_datetime": "2026-01-20T14:30:00.000Z",
      "appointment_status": "PENDENTE",
      "notification_sent": false,
      "barber": {
        "full_name": "Carlos Barbeiro",
        "phone_number": "92987654321"
      },
      "client": {
        "full_name": "João Silva",
        "phone_number": "92912345678"
      },
      "service": {
        "name": "Corte de cabelo",
        "price": "50.00",
        "duration": 45
      }
    }
  ],
  "pagination": {
    "page": 2,
    "limit": 5,
    "total": 23,
    "totalPages": 5
  }
}
```

**Observações:**
- Paginação server-side para otimização de performance
- Valores inválidos de `_page` ou `_limit` são tratados com defaults seguros

---

### **GET** `/api/appointments/all` 🔒 BARBER ou ADMIN
Lista todos os agendamentos do sistema (sem paginação).

**Permissão:** BARBER ou ADMIN

**Resposta de sucesso (200):**
```json
[
  {
    "appointment_id": 1,
    "appointment_datetime": "2026-01-20T14:30:00.000Z",
    "appointment_status": "PENDENTE",
    "notification_sent": false,
    "barber": {
      "full_name": "Carlos Barbeiro",
      "phone_number": "92987654321"
    },
    "client": {
      "full_name": "João Silva",
      "phone_number": "92912345678"
    },
    "service": {
      "name": "Corte de cabelo",
      "price": "50.00",
      "duration": 45
    }
  }
]
```
---

### **PATCH** `/api/appointments/:id` 🔒 CLIENT ou BARBER
Atualiza o status de um agendamento.

**Permissão:** CLIENT ou BARBER (com restrições específicas)

**Parâmetros de rota:**
- `id` (número): ID do agendamento

**Body (JSON):**
```json
{
  "appointment_status": "string"  // "PENDENTE" | "CONCLUIDO" | "CANCELADO"
}
```

**Regras de Autorização:**

**CLIENT:**
- Pode alterar **apenas seus próprios agendamentos** (verifica `id_client`)
- Pode **apenas cancelar** (status → `"CANCELADO"`)
- Não pode alterar para `"PENDENTE"` ou `"CONCLUIDO"`

**BARBER:**
- Pode alterar **apenas agendamentos associados a ele** (verifica `id_barber`)
- Pode alterar para **qualquer status**

**Resposta de sucesso (200):**
```json
{
  "appointment_id": 1,
  "appointment_datetime": "2026-01-20T14:30:00.000Z",
  "appointment_status": "CONCLUIDO",
  "notification_sent": false,
  "barber": {
    "full_name": "Carlos Barbeiro",
    "phone_number": "92987654321"
  },
  "client": {
    "full_name": "João Silva",
    "phone_number": "92912345678"
  },
  "service": {
    "name": "Corte de cabelo",
    "price": "50.00",
    "duration": 45
  }
}
```

**Erros comuns:**
- `403` - CLIENT tentando alterar agendamento de outro cliente
- `403` - CLIENT tentando alterar para status diferente de `"CANCELADO"`
- `403` - BARBER tentando alterar agendamento de outro barbeiro
- `404` - Agendamento não encontrado

---

### **DELETE** `/api/appointments/:id` 🔒 BARBER
Remove um agendamento do sistema.

**Permissão:** BARBER

**Parâmetros de rota:**
- `id` (número): ID do agendamento

**Resposta de sucesso (204):**
Sem conteúdo (No Content)

**Erro comum (409 - Conflict):**
```json
{
  "message": "Você não pode deletar um agendamento com status 'PENDENTE'."
}
```

**Observações:**
- Não permite deletar agendamentos com status `"PENDENTE"`
- Recomenda-se usar `PATCH` para cancelar ao invés de deletar

---

### **POST** `/api/appointments/total/:id` 🔒 BARBER
Retorna estatísticas de agendamentos de um barbeiro específico.

**Permissão:** BARBER

**Parâmetros de rota:**
- `id` (número): ID do barbeiro

**Body (JSON):**
```json
{
  "date": "string"  // Opcional - Data ISO (YYYY-MM-DD)
}
```

**Resposta de sucesso (200):**
```json
{
  "totalAppointments": 25,
  "completedAppointments": 20,
  "canceledAppointments": 3,
  "pendingAppointments": 2
}
```

---

### **POST** `/api/appointments/barber/revenue/:id` 🔒 BARBER ou ADMIN
Calcula a receita de um barbeiro em uma data específica.

**Permissão:** BARBER ou ADMIN

**Parâmetros de rota:**
- `id` (número): ID do barbeiro

**Body (JSON):**
```json
{
  "date": "string"  // Obrigatório - Data ISO (YYYY-MM-DD)
}
```

**Resposta de sucesso (200):**
```json
{
  "date": "2026-01-20",
  "totalRevenue": "450.00",
  "totalAppointments": 9,
  "completedAppointments": 8
}
```
**Observações**:
- São considerados apenas agendamentos marcados como 'CONCLUIDO'

---

### **GET** `/api/appointments/barber/:barberId/search` 🔒 BARBER ou ADMIN
Busca agendamentos de um barbeiro por nome do cliente.

**Permissão:** BARBER ou ADMIN

**Parâmetros de rota:**
- `barberId` (número): ID do barbeiro

**Query Parameters:**
- `clientName` (string): Nome do cliente (busca parcial)

**Exemplo de requisição:**
```
GET /api/appointments/barber/2/search?clientName=João
```

**Resposta de sucesso (200):**
```json
[
  {
    "appointment_id": 1,
    "appointment_datetime": "2026-01-20T14:30:00.000Z",
    "appointment_status": "PENDENTE",
    "notification_sent": false,
    "barber": {
      "full_name": "Carlos Barbeiro",
      "phone_number": "92987654321"
    },
    "client": {
      "full_name": "João Silva",
      "phone_number": "92912345678"
    },
    "service": {
      "name": "Corte de cabelo",
      "price": "50.00",
      "duration": 45
    }
  }
]
```

---

## 📢 Endpoints - Notifications

Sistema de notificações via WhatsApp integrado com Twilio.

### 🔔 Como Funciona o Sistema de Notificações

O sistema utiliza **agendamento baseado em eventos** (event-driven scheduling) em vez de polling:

1. **Ao criar agendamento**: Sistema calcula horário da notificação (15min antes) e agenda um `setTimeout`
2. **15 minutos antes**: Envia mensagem WhatsApp via Twilio automaticamente
3. **Twilio processa**: Envia mensagem ao cliente
4. **Webhook confirma**: Twilio notifica o sistema sobre status de entrega (delivered, read, failed)
5. **Sistema atualiza**: Marca `notification_sent = true` quando confirmado

**Vantagens desta abordagem:**
- ⚡ Execução apenas quando necessário (vs. polling a cada 15-20s)
- 🎯 Precisão de segundos (vs. janela de 1 minuto)
- 🚀 Zero carga no banco para verificações
- 📈 Escalável para milhares de agendamentos

**Persistência:** Sistema recarrega notificações pendentes ao reiniciar.

---

### **POST** `/api/notifications/status-webhook` 🔓 Público (Twilio)
Webhook que recebe atualizações de status das mensagens enviadas pelo Twilio.

**Permissão:** Nenhuma (usado pelo Twilio)

**Body (application/x-www-form-urlencoded ou JSON):**
```json
{
  "MessageSid": "string",       // ID único da mensagem no Twilio
  "MessageStatus": "string",    // Status: queued, sent, delivered, read, failed
  "From": "string",             // Número de origem (WhatsApp)
  "To": "string",               // Número de destino (WhatsApp)
  "ErrorCode": "string|null",   // Código de erro (se houver)
  "ErrorMessage": "string|null" // Mensagem de erro (se houver)
}
```

**Resposta de sucesso (200):**
```json
{
  "message": "Webhook recebido com sucesso"
}
```

---

### **GET** `/api/notifications/test` 🔓 Público (diagnóstico)
Endpoint de diagnóstico para verificar se o serviço de notificações está em execução.

**Permissão:** Nenhuma (diagnóstico)

**Resposta de sucesso (200):**
```json
{
  "message": "Notification service is running",
  "webhookUrl": "http://localhost:3030/api/notifications/status-webhook",
  "enabled": true,
  "apiUrl": "http://localhost:3030/api"
}
```

---

### **POST** `/api/notifications/test-webhook` 🔓 Público (diagnóstico)
Permite testar manualmente o fluxo de processamento de webhook.

**Permissão:** Nenhuma (diagnóstico)

**Body (JSON):** Qualquer payload (usado para teste)

**Resposta de sucesso (200):**
```json
{
  "message": "Webhook testado com sucesso"
}
```

---

## 🗄️ Banco de Dados

### Diagrama ER (Resumido)

![diagram](../screens/er_diagram.png)

### Tabela: `User` (usuarios)

| Campo          | Tipo    | Descrição                           | Restrições                |
|----------------|---------|-------------------------------------|---------------------------|
| user_id        | INT     | ID único do usuário                 | PK, AUTO_INCREMENT        |
| full_name      | VARCHAR | Nome completo                       | NOT NULL                  |
| email          | VARCHAR | Email                               | UNIQUE, NOT NULL          |
| password       | VARCHAR | Hash da senha (bcrypt)              | NOT NULL                  |
| phone_number   | VARCHAR | Número de telefone (11 dígitos)     | NOT NULL                  |
| birthday       | DATE    | Data de nascimento                  | NULLABLE                  |
| cpf            | VARCHAR | CPF do usuário                      | UNIQUE, NULLABLE          |
| role           | ENUM    | CLIENT, BARBER, ADMIN               | NOT NULL, DEFAULT CLIENT  |
| photo_url      | VARCHAR | URL da foto (Cloudinary)            | NULLABLE                  |
| thumbnail_url  | VARCHAR | URL da miniatura (Cloudinary)       | NULLABLE                  |

**Índices:**
- UNIQUE: email, cpf
- INDEX: role (para queries de listagem de barbeiros)

---

### Tabela: `Service` (servicos)

| Campo          | Tipo         | Descrição                    | Restrições                |
|----------------|--------------|------------------------------|---------------------------|
| service_id     | INT          | ID único do serviço          | PK, AUTO_INCREMENT        |
| name           | VARCHAR      | Nome do serviço              | NOT NULL                  |
| price          | DECIMAL(10,2)| Preço do serviço             | NOT NULL                  |
| duration       | INT          | Duração em minutos           | NOT NULL                  |
| service_status | ENUM         | ACTIVE, INACTIVE             | NOT NULL, DEFAULT ACTIVE  |

**Índices:**
- INDEX: service_status (para queries de serviços ativos)

---

### Tabela: `Appointment` (agendamentos)

| Campo                       | Tipo     | Descrição                           | Restrições                      |
|-----------------------------|----------|-------------------------------------|---------------------------------|
| appointment_id              | INT      | ID único do agendamento             | PK, AUTO_INCREMENT              |
| appointment_datetime        | DATETIME | Data e hora do agendamento (UTC)    | NOT NULL                        |
| appointment_status          | ENUM     | PENDENTE, CONCLUIDO, CANCELADO      | NOT NULL, DEFAULT PENDENTE      |
| id_barber                   | INT      | ID do barbeiro                      | FK → User(user_id), NOT NULL    |
| id_client                   | INT      | ID do cliente                       | FK → User(user_id), NULLABLE    |
| id_service                  | INT      | ID do serviço                       | FK → Service(service_id), NOT NULL |
| scheduled_notification_time | DATETIME | Horário agendado para notificação   | NULLABLE (15min antes do appointment) |
| notification_sent           | BOOLEAN  | Notificação confirmada como entregue| NOT NULL, DEFAULT false         |

**Índices:**
- INDEX: id_barber, appointment_datetime (para queries de disponibilidade)
- INDEX: id_client, appointment_datetime (para histórico do cliente)
- INDEX: appointment_status (para filtros por status)
- INDEX: scheduled_notification_time, notification_sent (para recarregar notificações pendentes)

**Observações:**
- `id_client` pode ser NULL (agendamentos presenciais sem cadastro prévio)
- `scheduled_notification_time` é calculado automaticamente ao criar agendamento (appointment_datetime - 15min)
- `notification_sent` é atualizado via webhook quando Twilio confirma entrega (status: delivered)
- Sistema agenda `setTimeout` ao criar appointment; ao reiniciar, recarrega notificações pendentes do banco

---

## 🔧 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do backend com as seguintes variáveis:

### Banco de Dados
```env
DATABASE_URL="postgresql://barber_ar:barber_123@localhost:5430/barbearia_db_upgraded"
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
```

### Autenticação JWT
```env
JWT_SECRET="seu_secret"
```

### Cloudinary (Upload de Imagens)
```env
CLOUDINARY_CLOUD_NAME="seu_cloud_name"
CLOUDINARY_API_KEY="sua_api_key"
CLOUDINARY_API_SECRET="seu_api_secret"
```

### Twilio (Notificações WhatsApp)
```env
NOTIFICATIONS_ENABLED="false" # servico de notificacoes automaticas
TWILIO_ACCOUNT_SID="seu_account_sid"
TWILIO_AUTH_TOKEN="seu_auth_token"
TWILIO_WHATSAPP_NUMBER="twilio_wpp_number"
TWILIO_TEMPLATE_SID="seu_template_sid"

SECRET=
SID=
API_URL="ngrok_tunnel"
```

#### 📱 Como Configurar o Twilio WhatsApp

O sistema de notificações é **opcional**. Para ativá-lo:

##### 1. Criar Conta Twilio (Trial)

1. Crie uma conta gratuita em [www.twilio.com](https://www.twilio.com)
2. Você receberá **USD $15,00 em créditos trial** (suficiente para ~1000 mensagens)
3. No [Console](https://console.twilio.com), anote:
   - **Account SID**: Identificador da sua conta
   - **Auth Token**: Token de autenticação

##### 2. Ativar WhatsApp Sandbox

⚠️ **Importante**: Contas trial só funcionam através do **Sandbox do WhatsApp**.

**Como ativar:**

1. Acesse: **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Você verá:
   - Um **número sandbox** (ex: `+14155137896`)
   - Um **código de ativação** (ex: `join happy-cat`)
3. **No seu WhatsApp**:
   - Envie mensagem para o número sandbox
   - Digite o código exato (ex: `join happy-cat`)
   - Aguarde confirmação: *"You are all set!"*

##### 3. Criar Template de Mensagem

1. Acesse: **Messaging** → **Content Editor** → **Create Template**
2. Configure o template:
   - **Name**: `appointment_reminder`
   - **Language**: Portuguese (Brazil)
   - **Content**:
     ```
     Olá {{1}}! 👋
     
     Lembrete: Seu atendimento está agendado para hoje às {{2}}.
     
     📋 Serviço: {{3}}
     💰 Valor: R$ {{4}}
     ✂️ Barbeiro: {{5}}
     
     Nos vemos em breve! 💈
     ```
3. Envie para aprovação e anote o **Content SID** (ex: `HXa1b2c3...`)

##### 4. Configurar Variáveis de Ambiente

Edite o `.env`:

```env
# Ativar notificações
NOTIFICATIONS_ENABLED="true"

# Credenciais Twilio
TWILIO_ACCOUNT_SID="AC..."           # Account SID do console
TWILIO_AUTH_TOKEN="..."               # Auth Token do console
TWILIO_WHATSAPP_NUMBER="whatsapp:+14155137896"  # Seu Número do sandbox
TWILIO_TEMPLATE_SID="HX..."          # Content SID do template

# URL pública para webhooks (obrigatório para confirmação de entrega)
API_URL="https://abc123.ngrok.io/api"  # Use ngrok em desenvolvimento
```

##### 5. Configurar Webhook para Status de Entrega

Para rastrear se as mensagens foram entregues:

**Desenvolvimento Local (com ngrok):**

```bash

# Expor backend na porta 3030
ngrok http 3030

# Copie a URL (ex: https://abc123.ngrok.io)
# Configure no .env:
API_URL="https://abc123.ngrok.io/api"
```

**Configurar na Twilio:**

1. Acesse: **Messaging** → **Settings** → **WhatsApp Sandbox Settings**
2. Em **Status Callback URL**, adicione:
   ```
   https://abc123.ngrok.io/api/notifications/status-webhook
   ```
3. Selecione os eventos:
   - ✅ `Queued`
   - ✅ `Sent`
   - ✅ `Delivered`
   - ✅ `Read`
   - ✅ `Failed`
4. Salve

##### 6. Testar

```bash
# Reiniciar backend
yarn run dev

# Verificar se está ativo
curl http://localhost:3030/api/notifications/test

# Criar um agendamento para daqui a 16 minutos
# Sistema enviará notificação automaticamente em 15min
```

**Logs esperados:**
```
[NotificationService] Notificação agendada para appointment #123 em 2026-01-20 14:15:00
[NotificationService] Enviando lembrete para appointment #123
[Twilio] Message queued: SM...
[Webhook] Status atualizado: delivered (appointment #123)
```

##### Limitações do Trial

- ⚠️ Mensagens só para números no sandbox (use `join [seu codigo]` no WhatsApp)
- ⚠️ Prefixo *"[Trial Account]"* em todas as mensagens
- ⚠️ USD $15,00 em créditos (~1000 mensagens)
- ✅ Ideal para desenvolvimento e testes

##### Upgrade para Produção

1. Adicione créditos à conta Twilio
2. Solicite aprovação do template no **WhatsApp Business API**
3. Configure número dedicado (não sandbox)
4. Remova restrições de destinatários
5. Sem prefixo *"[Trial Account]"*

### Servidor
```env
PORT_BACKEND="3030"
NODE_ENV="development"
```

---

## 📊 Códigos de Status HTTP

| Código | Significado                                              |
|--------|----------------------------------------------------------|
| 200    | OK - Requisição bem-sucedida                             |
| 201    | Created - Recurso criado com sucesso                     |
| 204    | No Content - Requisição ok sem resposta                  |
| 400    | Bad Request - Dados inválidos ou ausentes                |
| 401    | Unauthorized - Token ausente ou inválido                 |
| 403    | Forbidden - Usuário sem permissão para acessar           |
| 404    | Not Found - Recurso não encontrado                       |
| 409    | Conflict - Conflito                                      |
| 500    | Internal Server Error - Erro interno do servidor         |

---

## 📝 Arquitetura e Padrões

### Estrutura de Pastas
```
backend/
├── prisma/
│   ├── schema.prisma          # Schema do banco de dados
│   └── migrations/            # Histórico de migrações
├── src/
│   ├── generated/prisma/      # Prisma Client gerado
│   ├── server/
│   │   ├── modules/
│   │   │   ├── users/
│   │   │   │   ├── user.controller.ts
│   │   │   │   ├── user.service.ts
│   │   │   │   ├── user.repository.ts
│   │   │   │   ├── user.routes.ts
│   │   │   │   └── user.schema.ts
│   │   │   ├── services/
│   │   │   ├── appointments/
│   │   │   └── notification/
│   │   └── shared/
│   │       ├── config/          # Cloudinary, Multer, Prisma, etc.
│   │       ├── errors/          # Classes de erro HTTP
│   │       ├── middlewares/     # Auth, Authorize, Validate
│   │       └── utils/           # Funções utilitárias
│   └── index.ts
└── package.json
```

### Padrões Implementados

1. **Repository Pattern**: Separação de lógica de acesso a dados
2. **Service Layer**: Lógica de negócio isolada
3. **DTO Pattern**: Validação com Zod schemas
4. **Middleware Chain**: Autenticação → Autorização → Validação
5. **Error Handling**: Classes customizadas (NotFoundError, ConflictError, etc.)

### Segurança

- ✅ Bcrypt para hash de senhas (salt rounds: 10)
- ✅ JWT para autenticação stateless
- ✅ CORS configurado
- ✅ Validação de input com Zod
- ✅ SQL Injection protection (Prisma ORM)

### Performance

- ✅ Paginação server-side
- ✅ Índices otimizados no banco
- ✅ Cloudinary para CDN de imagens
- ✅ Prisma connection pooling
- ✅ Sistema de notificações event-driven
  - Zero queries de verificação contínua
  - Execução apenas quando necessário
  - Precisão de segundos
  - Recarrega automático ao reiniciar servidor

---

## 🚀 Como Executar

### Pré-requisitos
- Node.js v18+
- PostgreSQL
- Conta Cloudinary (para upload de fotos)
- Conta Twilio (para notificações WhatsApp)

**Observação**: a variável de ambiente `NOTIFICATIONS_ENABLED` vem  `"false"`  por padrão. O sistema não depende do serviço de notificação para funcionar, é opcional a configuração da conta Twilio para ativar esse serviço.

### Instalação
```bash
# Clone o repositório
git clone <repo_url>

# Instale as dependências
cd backend
yarn install

# Configure o .env
cp .env.example .env
# Edite o .env com suas credenciais

# Execute as migrações
npx prisma migrate deploy

# (Opcional) Popule o banco com dados de teste
npx prisma db seed

# Inicie o servidor
yarn run dev
```

---

## 📞 Contato e Suporte

- **Última Atualização:** Janeiro de 2026
- **Versão da API:** 1.0.0

---

## 📄 Licença

Este projeto está sob a licença Apache. Consulte o arquivo LICENSE para mais detalhes.
