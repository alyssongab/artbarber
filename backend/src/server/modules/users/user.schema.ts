import { z } from "zod";

// =================== INPUT DTOs =====================

export const loginSchema = z.object({
    email: z.email("Email inválido"),
    password: z.string().min(6, "Mínimo 6 caracteres")
}).nonoptional("Campos obrigatórios");


export const createClientSchema = z.strictObject({
    full_name: z.string("Nome inválido").min(1, "Nome obrigatório"),
    email: z.email("Email inválido"),
    password: z.string().min(6, "Mínimo 6 caracteres"),
    phone_number: z.string().length(11, "Número de celular inválido."),
    birthday: z.coerce.date("Formato invalido").nullable().optional().default(null),
}, "Campo fornecido não existe");

export const createBarberSchema = z.strictObject({
    full_name: z.string("Nome inválido").min(1, "Nome obrigatório"),
    email: z.email("Email inválido"),
    password: z.string().min(6, "Mínimo 6 caracteres"),
    phone_number: z.string().length(11, "Número de celular inválido."),
}, "Campo fornecido não existe");

export const updateUserSchema = z.strictObject({
    full_name: z.string().min(1, "Nome obrigatório"),
    password: z.string().min(6, "Senha Mínimo 6 caracteres"),
    phone_number: z.string().length(11, "Número de celular inválido."),
    birthday: z.coerce.date("Formato invalido").nullable()
}, "Campo fornecido não permitido").partial();


// =================== RESPONSE DTOs =====================

export const userResponseSchema = z.strictObject({
    user_id: z.int(),
    full_name: z.string(),
    email: z.email(),
    phone_number: z.string(),
    birthday: z.date().nullable(),
    role: z.string(),
    photo_url: z.string().nullable(),
    thumbnail_url: z.string().nullable()
}, "Chave desconhecida");

export const barberResponseSchema = z.strictObject({
    user_id: z.int(),
    full_name: z.string(),
    photo_url: z.string().nullable(),
    phone_number: z.string(),
    thumbnail_url: z.string().nullable()
}, "Chave desconhecida");

export type CreateClientDTO = z.infer<typeof createClientSchema>;
export type CreateBarberDTO = z.infer<typeof createBarberSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;
export type UserResponseDTO = z.infer<typeof userResponseSchema>;
export type BarberResponseDTO = z.infer<typeof barberResponseSchema>;