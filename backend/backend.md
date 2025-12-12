# Documentação da API - Artbarber

> **Versão:** 1.22.22  
> **Base URL:** `http://localhost:3030/api`  
> **Autenticação:** JWT Bearer Token (exceto endpoints públicos)

---

## 📋 Índice

1. [Autenticação](#autenticação)
2. [Endpoints - Users](#endpoints---users)
3. [Endpoints - Services](#endpoints---services)
4. [Endpoints - Appointments](#endpoints---appointments)
5. [Banco de Dados](#banco-de-dados)
6. [Códigos de Status HTTP](#códigos-de-status-http)

---

## 🔐 Autenticação

A maioria dos endpoints requer autenticação JWT. Após fazer login, você receberá um `accessToken` que deve ser incluído no header de todas as requisições protegidas:

```
Authorization: Bearer <seu_token_jwt>
```

### Roles (Cargos) disponíveis:
- **CLIENT**: Cliente da barbearia
- **BARBER**: Barbeiro
- **ADMIN**: Administrador do sistema

---

## 👥 Endpoints - Users

### **POST** `/api/users/client` 🔓 Público
Cria uma nova conta de cliente.

**Permissão:** Nenhuma (público)

**Body (JSON):**
```json
{
  "full_name": "string",      // Obrigatório - Nome completo
  "email": "string",           // Obrigatório - Email válido
  "password": "string",        // Obrigatório - Mínimo 6 caracteres
  "phone_number": "string",    // Obrigatório - Exatamente 11 dígitos (ex: 92912345678)
  "birthday": "string"         // Opcional - Formato ISO date (YYYY-MM-DD) ou null
}
```

**Resposta de sucesso (201):**
```json
{
  "user_id": 1,
  "full_name": "João Silva",
  "email": "joao@email.com",
  "phone_number": "92912345678",
  "birthday": "1990-01-15",
  "role": "CLIENT",
  "photo_url": null
}
```

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
    "birthday": "1990-01-15",
    "role": "CLIENT",
    "photo_url": null
  }
}
```

---

### **POST** `/api/users/barber` 🔒 ADMIN
Cria uma conta de barbeiro (com upload de foto opcional).

**Permissão:** ADMIN

**Content-Type:** `multipart/form-data`

**Form Data:**
```
full_name: string        // Obrigatório - Nome completo
email: string            // Obrigatório - Email válido
password: string         // Obrigatório - Mínimo 6 caracteres
phone_number: string     // Obrigatório - Exatamente 11 dígitos
photo: file              // Opcional - Arquivo de imagem
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
  "photo_url": "/uploads/barber-photo-123456.jpg"
}
```

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
    "birthday": "1990-01-15",
    "role": "CLIENT",
    "photo_url": null
  },
  {
    "user_id": 2,
    "full_name": "Carlos Barbeiro",
    "email": "carlos@email.com",
    "phone_number": "92987654321",
    "birthday": null,
    "role": "BARBER",
    "photo_url": "/uploads/barber-photo-123456.jpg"
  }
]
```

---

### **GET** `/api/users/:id` 🔒 Autenticado
Busca um usuário específico por ID.

**Permissão:** Qualquer usuário autenticado

**Parâmetros de rota:**
- `id` (número): ID do usuário

**Resposta de sucesso (200):**
```json
{
  "user_id": 1,
  "full_name": "João Silva",
  "email": "joao@email.com",
  "phone_number": "92912345678",
  "birthday": "1990-01-15",
  "role": "CLIENT",
  "photo_url": null
}
```

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
  "birthday": "string"         // Opcional - Formato ISO date ou null
}
```

**Resposta de sucesso (200):**
```json
{
  "user_id": 1,
  "full_name": "João Silva Santos",
  "email": "joao@email.com",
  "phone_number": "92912345678",
  "birthday": "1990-01-15",
  "role": "CLIENT",
  "photo_url": null
}
```

---

### **DELETE** `/api/users/:id` 🔒 ADMIN
Remove um usuário do sistema.

**Permissão:** ADMIN

**Parâmetros de rota:**
- `id` (número): ID do usuário

**Resposta de sucesso (204):**
Sem conteúdo (No Content)

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
  "duration": 45
}
```

---

### **GET** `/api/services` 🔒 Autenticado
Lista todos os serviços disponíveis.

**Permissão:** Qualquer usuário autenticado

**Resposta de sucesso (200):**
```json
[
  {
    "service_id": 1,
    "name": "Corte de cabelo",
    "price": "50.00",
    "duration": 45
  },
  {
    "service_id": 2,
    "name": "Barba completa",
    "price": "35.00",
    "duration": 30
  }
]
```

---

### **PUT** `/api/services/:id` 🔒 ADMIN
Atualiza um serviço existente.

**Permissão:** ADMIN

**Parâmetros de rota:**
- `id` (número): ID do serviço

**Body (JSON):** Todos os campos são opcionais
```json
{
  "name": "string",       // Opcional - Nome do serviço (mínimo 1 caractere)
  "price": number,        // Opcional - Preço (mínimo 10)
  "duration": number      // Opcional - Duração em minutos (mínimo 15)
}
```

**Resposta de sucesso (200):**
```json
{
  "service_id": 1,
  "name": "Corte de cabelo premium",
  "price": "60.00",
  "duration": 60
}
```

---

### **DELETE** `/api/services/:id` 🔒 ADMIN
Remove um serviço (apenas se não houver agendamentos associados).

**Permissão:** ADMIN

**Parâmetros de rota:**
- `id` (número): ID do serviço

**Resposta de sucesso (204):**
Sem conteúdo (No Content)

**Erro comum (409):**
```json
{
  "message": "Não é possível deletar o serviço, pois existem agendamentos associados."
}
```

---

## 📅 Endpoints - Appointments

### **POST** `/api/appointments` 🔒 CLIENT ou BARBER
Cria um novo agendamento.

**Permissão:** CLIENT ou BARBER

**Body (JSON):**
```json
{
  "appointment_date": "string",  // Obrigatório - Data no formato ISO (YYYY-MM-DD)
  "appointment_time": "string",  // Obrigatório - Hora no formato ISO (HH:MM:SS)
  "id_client": number,           // Opcional - ID do cliente (null se agendamento presencial)
  "id_barber": number,           // Obrigatório - ID do barbeiro
  "id_service": number           // Obrigatório - ID do serviço
}
```

**Exemplo:**
```json
{
  "appointment_date": "2025-12-15",
  "appointment_time": "14:30:00",
  "id_client": 1,
  "id_barber": 2,
  "id_service": 1
}
```

**Observações:**
- **CLIENTs** automaticamente têm seu próprio ID atribuído ao `id_client`, não podem agendar para outros.
- **BARBERs** podem criar agendamentos para qualquer cliente ou deixar `id_client` como `null` para agendamentos presenciais.

**Resposta de sucesso (201):**
```json
{
  "appointment_id": 1,
  "appointment_date": "2025-12-15",
  "appointment_time": "14:30:00",
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
  },
  "appointment_status": "PENDENTE",
  "notification_sent": false
}
```

**Erro comum (409):**
```json
{
  "message": "Este horário já está ocupado para o barbeiro selecionado."
}
```

---

### **GET** `/api/appointments` 🔒 Autenticado
Lista agendamentos relacionados ao usuário autenticado.

**Permissão:** Qualquer usuário autenticado

**Comportamento:**
- **CLIENT**: Retorna apenas seus próprios agendamentos
- **BARBER**: Retorna agendamentos onde ele é o barbeiro

**Resposta de sucesso (200):**
```json
[
  {
    "appointment_id": 1,
    "appointment_date": "2025-12-15",
    "appointment_time": "14:30:00",
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
    },
    "appointment_status": "PENDENTE",
    "notification_sent": false
  }
]
```

---

### **GET** `/api/appointments/all` 🔒 BARBER ou ADMIN
Lista todos os agendamentos do sistema.

**Permissão:** BARBER ou ADMIN

**Resposta de sucesso (200):**
```json
[
  {
    "appointment_id": 1,
    "appointment_date": "2025-12-15",
    "appointment_time": "14:30:00",
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
    },
    "appointment_status": "PENDENTE",
    "notification_sent": false
  }
]
```

---

### **PATCH** `/api/appointments/:id` 🔒 BARBER
Atualiza o status de um agendamento.

**Permissão:** BARBER

**Parâmetros de rota:**
- `id` (número): ID do agendamento

**Body (JSON):**
```json
{
  "appointment_status": "string"  // Obrigatório - Valores: "PENDENTE" | "CONCLUIDO" | "CANCELADO"
}
```

**Resposta de sucesso (200):**
```json
{
  "appointment_id": 1,
  "appointment_date": "2025-12-15",
  "appointment_time": "14:30:00",
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
  },
  "appointment_status": "CONCLUIDO",
  "notification_sent": false
}
```

---

### **DELETE** `/api/appointments/:id` 🔒 BARBER
Remove um agendamento (apenas se não estiver com status PENDENTE).

**Permissão:** BARBER

**Parâmetros de rota:**
- `id` (número): ID do agendamento

**Resposta de sucesso (204):**
Sem conteúdo (No Content)

**Erro comum (409):**
```json
{
  "message": "Você não pode deletar um agendamento com status 'Pendente'."
}
```

---

## 🗄️ Banco de Dados

### Tabela: `User`

Armazena informações de todos os usuários (clientes, barbeiros e administradores).

| Campo               | Tipo         | Descrição                                    | Restrições                |
|---------------------|--------------|----------------------------------------------|---------------------------|
| `user_id`           | INT          | ID único do usuário                          | PK, AUTO_INCREMENT        |
| `full_name`         | VARCHAR      | Nome completo do usuário                     | NOT NULL                  |
| `email`             | VARCHAR      | Email do usuário                             | UNIQUE, NOT NULL          |
| `password`          | VARCHAR      | Hash da senha (bcrypt)                       | NOT NULL                  |
| `phone_number`      | VARCHAR      | Número de telefone (11 dígitos)              | NOT NULL                  |
| `birthday`          | DATE         | Data de nascimento                           | NULLABLE                  |
| `cpf`               | VARCHAR      | CPF do usuário                               | UNIQUE, NULLABLE          |
| `role`              | ENUM         | Cargo: CLIENT, BARBER, ADMIN                 | NOT NULL, DEFAULT CLIENT  |
| `photo_url`         | VARCHAR      | URL/caminho da foto do perfil                | NULLABLE                  |

**Relacionamentos:**
- Um `User` com role `BARBER` pode ter muitos `Appointment` (como barbeiro)
- Um `User` com role `CLIENT` pode ter muitos `Appointment` (como cliente)

---

### Tabela: `Service`

Armazena os serviços oferecidos pela barbearia.

| Campo         | Tipo         | Descrição                           | Restrições                |
|---------------|--------------|-------------------------------------|---------------------------|
| `service_id`  | INT          | ID único do serviço                 | PK, AUTO_INCREMENT        |
| `name`        | VARCHAR      | Nome do serviço                     | NOT NULL                  |
| `price`       | DECIMAL      | Preço do serviço                    | NOT NULL                  |
| `duration`    | INT          | Duração do serviço em minutos       | NOT NULL                  |

**Relacionamentos:**
- Um `Service` pode ter muitos `Appointment`

---

### Tabela: `Appointment`

Armazena os agendamentos realizados.

| Campo                | Tipo         | Descrição                                 | Restrições                      |
|----------------------|--------------|-------------------------------------------|---------------------------------|
| `appointment_id`     | INT          | ID único do agendamento                   | PK, AUTO_INCREMENT              |
| `appointment_date`   | DATE         | Data do agendamento                       | NOT NULL                        |
| `appointment_time`   | TIME         | Horário do agendamento                    | NOT NULL                        |
| `appointment_status` | ENUM         | Status: PENDENTE, CONCLUIDO, CANCELADO    | NOT NULL, DEFAULT PENDENTE      |
| `id_barber`          | INT          | ID do barbeiro                            | FK → User(user_id), NOT NULL    |
| `id_client`          | INT          | ID do cliente                             | FK → User(user_id), NULLABLE    |
| `id_service`         | INT          | ID do serviço                             | FK → Service(service_id), NOT NULL |
| `notification_sent`  | BOOLEAN      | Se notificação WhatsApp foi enviada       | NOT NULL, DEFAULT false         |

**Relacionamentos:**
- `id_barber` → FK para `User.user_id` (relação BarberAppointments)
- `id_client` → FK para `User.user_id` (relação ClientAppointments) - pode ser NULL para agendamentos presenciais
- `id_service` → FK para `Service.service_id`

**Observações importantes:**
- `id_client` pode ser `NULL` quando o agendamento é feito presencialmente sem cadastro prévio do cliente
- `notification_sent` é usado pelo sistema de notificações automáticas via WhatsApp

---

## 📊 Códigos de Status HTTP

| Código | Significado                                              |
|--------|----------------------------------------------------------|
| 200    | OK - Requisição bem-sucedida                             |
| 201    | Created - Recurso criado com sucesso                     |
| 204    | No Content - Requisição bem-sucedida sem corpo de resposta |
| 400    | Bad Request - Dados inválidos ou ausentes                |
| 401    | Unauthorized - Token ausente ou inválido                 |
| 403    | Forbidden - Usuário sem permissão para acessar           |
| 404    | Not Found - Recurso não encontrado                       |
| 409    | Conflict - Conflito (ex: horário já agendado)            |
| 500    | Internal Server Error - Erro interno do servidor         |

---

## 📝 Notas Importantes

### Autenticação JWT
- O token JWT expira após determinado período (configurado no servidor)
- Inclua o token no header `Authorization: Bearer <token>` em todas as requisições protegidas
- O token é retornado no endpoint `/api/users/login`

### Validações
- Todos os endpoints validam os dados de entrada usando Zod schemas
- Campos obrigatórios devem ser fornecidos, caso contrário retornarão erro 400
- IDs inválidos retornam erro 400

### Sistema de Notificações
- O campo `notification_sent` é gerenciado automaticamente pelo sistema
- Notificações via WhatsApp são enviadas 15 minutos antes do horário agendado
- Configurado via variáveis de ambiente (Twilio)

<!-- ### Boas Práticas
- Sempre use HTTPS em produção
- Mantenha seu token JWT seguro
- Não compartilhe credenciais de ADMIN
- Valide dados no frontend antes de enviar para a API -->

---

**Última atualização:** 12 de dezembro de 2025  
**Contato:** Equipe de desenvolvimento
