import z from "zod";

export const createServiceSchema = z.strictObject({
    name: z.string("Nome inválido").min(1, "Nome obrigatório"),
    price: z.number("Valor inválido"),
    duration: z.number("Valor inválido")
}, "Chave inválida");

export type CreateServiceDTO = z.infer<typeof createServiceSchema>;