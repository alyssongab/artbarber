import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .email('Email inválido')
    .min(1, 'Email é obrigatório'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export const registerSchema = z.object({
  first_name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(2, 'Nome deve ter no mínimo 2 caracteres'),
  last_name: z
    .string()
    .optional(),
  email: z
    .email('Email inválido')
    .min(1, 'Email é obrigatório'),  
  phone_number: z
    .string()
    .min(1, 'Telefone é obrigatório')
    .regex(/^[0-9]{11}$/, 'Telefone deve ter 11 dígitos'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;