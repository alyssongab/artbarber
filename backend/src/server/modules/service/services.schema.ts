import z from "zod";

export const createServiceSchema = z.strictObject({
    name: z.string("Nome inválido").min(1, "Nome obrigatório"),
    price: z.number("Valor do preço inválido").min(10, "Preço deve ser maior que 10"),
    duration: z.number("Duração inválida").min(15, "Duração deve ter pelo menos 15 minutos")
}, "Chave inválida");

export const updateServiceSchema = z.strictObject({
    name: z.string("Nome inválido")
        .min(1, "Nome não pode ser vazio") // Garante que se for enviado, não é ""
        .optional(), // Torna o campo opcional
    price: z.number("Valor do preço inválido")
        .min(10, "Preço deve ser maior que 10")
        .optional(),
    duration: z.number("Duração inválida")
        .min(15, "Duração deve ter pelo menos 15 minutos")
        .optional()
});

export type UpdateServiceDTO = z.infer<typeof updateServiceSchema>;
export type InputServiceDTO = z.infer<typeof createServiceSchema>;