import { z } from 'zod';

// Helpers
const phone11Schema = z
  .string()
  .trim()
  .regex(/^\d{11}$/, 'Telefone deve ter 11 dígitos');

const birthdayCoerceNullable = z.preprocess((v) => {
  if (v === '' || v === undefined || v === null) return null;
  const d = new Date(String(v));
  return isNaN(d.getTime()) ? null : d;
}, z.date().nullable());

// =================== AUTH =====================
// Backend: loginSchema = { email, password(min 6) }
export const loginSchema = z
  .object({
    email: z.email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  })
  .strict();

// Backend: createClientSchema = { full_name, email, password(min 6), phone_number(11), birthday?: date|null }
export const registerClientSchema = z
  .object({
    full_name: z.string().min(1, 'Nome é obrigatório'),
    email: z.email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
    phone_number: phone11Schema,
    // Aceita string mascarada (DD/MM/AAAA, DD-MM-AAAA, AAAA-MM-DD, AAAA/MM/DD) ou vazio/undefined
    birthday: z
      .union([
        z
          .string()
          .max(10)
          .refine(
            (v) =>
              /^\d{2}[/-]\d{2}[/-]\d{4}$/.test(v) || // DD-MM-YYYY ou DD/MM/YYYY
              /^\d{4}[/-]\d{2}[/-]\d{2}$/.test(v), // YYYY-MM-DD ou YYYY/MM/DD
            'Data inválida'
          ),
        z.literal(''),
        z.undefined(),
      ])
      .optional(),
  })
  .strict();

// Backend: createBarberSchema = { full_name, email, password(min 6), phone_number(11) }
export const registerBarberSchema = z
  .object({
    full_name: z.string().min(1, 'Nome é obrigatório'),
    email: z.email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
    phone_number: phone11Schema,
  })
  .strict();

// Backend: updateUserSchema (partial) = { full_name, password(min 6), phone_number(11), birthday: date|null }
export const updateUserSchema = z
  .object({
    full_name: z.string().min(1, 'Nome é obrigatório'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
    phone_number: phone11Schema,
    birthday: birthdayCoerceNullable,
  })
  .partial()
  .strict();

// Compat: manter o nome antigo registerSchema usado nas telas atuais
// Dica: adapte a tela para usar registerClientSchema e campo full_name assim que possível.
export const registerSchema = registerClientSchema;

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterClientFormData = z.infer<typeof registerClientSchema>;
export type RegisterBarberFormData = z.infer<typeof registerBarberSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;

// =================== SERVICES (para futuras telas) =====================
// Backend: createServiceSchema = { name, price(number >=10), duration(number >=15) }
export const serviceCreateSchema = z
  .object({
    name: z.string().min(1, 'Nome é obrigatório'),
    price: z.coerce.number().min(10, 'Preço deve ser maior que 10'),
    duration: z.coerce.number().min(15, 'Duração deve ter pelo menos 15 minutos'),
  })
  .strict();

// Backend: updateServiceSchema (partial)
export const serviceUpdateSchema = z
  .object({
    name: z.string().min(1, 'Nome não pode ser vazio').optional(),
    price: z.coerce.number().min(10, 'Preço deve ser maior que 10').optional(),
    duration: z.coerce.number().min(15, 'Duração deve ter pelo menos 15 minutos').optional(),
  })
  .strict();

export type ServiceCreateFormData = z.infer<typeof serviceCreateSchema>;
export type ServiceUpdateFormData = z.infer<typeof serviceUpdateSchema>;

// =================== APPOINTMENTS (para futuras telas) =====================
// Backend enums: PENDENTE | CONCLUIDO | CANCELADO
export const AppointmentStatusEnum = z.enum(['PENDENTE', 'CONCLUIDO', 'CANCELADO']);

// Backend: createAppointmentSchema
export const appointmentCreateSchema = z
  .object({
    appointment_date: z.string().refine((v) => !Number.isNaN(Date.parse(v)), 'Data inválida'),
    appointment_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Hora inválida'),
    id_client: z.coerce.number().nullable().optional().default(null),
    id_barber: z.coerce.number(),
    id_service: z.coerce.number(),
  })
  .strict();

export const appointmentStatusSchema = z
  .object({
    appointment_status: AppointmentStatusEnum,
  })
  .strict();

export type AppointmentCreateFormData = z.infer<typeof appointmentCreateSchema>;
export type AppointmentStatusFormData = z.infer<typeof appointmentStatusSchema>;