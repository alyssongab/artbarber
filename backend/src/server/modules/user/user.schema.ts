import { z } from "zod";

// =================== INPUT DTOs =====================

export const loginSchema = z.object({
    email: z.email("Email inválido"),
    password: z.string()
})

export type LoginInput = z.infer<typeof loginSchema>;

export const createClientSchema = z.object({
    first_name: z.string({error: "Nome inválido"}),
    last_name: z.string().nullable().optional().default(null),
    email: z.email({error: "Email inválido"}),
    password: z.string(),
    phone_number: z.string().length(11),
    birthday: z.coerce.date("Formato invalido").nullable().optional().default(null),
});

export type CreateClientDTO = z.infer<typeof createClientSchema>;

// =================== RESPONSE DTOs =====================

export const userResponseSchema = z.object({
    first_name: z.string(),
    last_name: z.string().nullable(),
    email: z.email(),
    phone_number: z.string(),
    birthday: z.date().nullable(),
    role: z.string()
})

export type UserResponseDTO = z.infer<typeof userResponseSchema>;