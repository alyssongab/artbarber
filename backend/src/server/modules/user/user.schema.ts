import { z } from "zod";

// =================== INPUT DTOs =====================

export const loginSchema = z.object({
    email: z.email("Email inválido"),
    password: z.string().min(6, "Mínimo 6 caracteres")
}).nonoptional("Campos obrigatórios");


export const createClientSchema = z.strictObject({
    first_name: z.string("Nome inválido").min(1, "Nome obrigatório"),
    last_name: z.string("Sobrenome inválido").nullable().optional().default(null),
    email: z.email("Email inválido"),
    password: z.string().min(6, "Mínimo 6 caracteres"),
    phone_number: z.string().length(11, "Número de celular inválido."),
    birthday: z.coerce.date("Formato invalido").nullable().optional().default(null),
}, "Campo fornecido não existe");

export const createBarberSchema = z.strictObject({
    first_name: z.string("Nome inválido").min(1, "Nome obrigatório"),
    last_name: z.string("Sobrenome inválido").nullable().optional().default(null),
    email: z.email("Email inválido"),
    password: z.string().min(6, "Mínimo 6 caracteres"),
    phone_number: z.string().length(11, "Número de celular inválido."),
}, "Campo fornecido não existe");

export const updateUserSchema = z.strictObject({
    first_name: z.string().min(1, "Nome obrigatório"),
    last_name: z.string().nullable(),
    password: z.string().min(6, "Senha Mínimo 6 caracteres"),
    phone_number: z.string().length(11, "Número de celular inválido."),
    pix_key: z.string(),
    birthday: z.coerce.date("Formato invalido").nullable()
}, "Campo fornecido não existe").partial();


// =================== RESPONSE DTOs =====================

export const userResponseSchema = z.strictObject({
    id: z.int(),
    first_name: z.string(),
    last_name: z.string().nullable(),
    email: z.email(),
    phone_number: z.string(),
    birthday: z.date().nullable(),
    role: z.string(),
    photo_url: z.string().nullable()
}, "Chave desconhecida");


export type CreateClientDTO = z.infer<typeof createClientSchema>;
export type CreateBarberDTO = z.infer<typeof createBarberSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;
export type UserResponseDTO = z.infer<typeof userResponseSchema>;