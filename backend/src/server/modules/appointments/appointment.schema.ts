import z from "zod";
import { AppointmentStatus } from "../../../generated/prisma/client.ts";

export const createAppointmentSchema = z.strictObject({
    appointment_date: z.iso.date("Data inválida"),
    appointment_time: z.iso.time({ precision: 0 }),
    id_client: z.coerce.number().optional().nullable().default(null),
    id_barber: z.coerce.number("ID Inválido"),
    id_service: z.coerce.number("ID Inválido") 
}, "Chave inválida");

export const updateAppointmentStatusSchema = z.strictObject({
    appointment_status: z.enum(Object.values(AppointmentStatus))
});

export type AppointmentInputDTO = z.infer<typeof createAppointmentSchema>;
export type AppointmentStatusEnum = z.infer<typeof updateAppointmentStatusSchema>;