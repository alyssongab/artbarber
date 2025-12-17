import type { Prisma } from "../../../generated/prisma/client.ts";

// Reusable Prisma payload type with relations included
export type AppointmentWithRelations = Prisma.AppointmentGetPayload<{
  include: { barber: true; client: true; service: true }
}>;

// Optional DTOs (export if you want to reuse outside the service)
export interface UserPublicDTO {
  full_name: string;
  phone_number: string;
}

export interface ServicePublicDTO {
  name: string;
  price: string // Prisma Decimal will serialize to string by default
  duration: number;
}

export interface AppointmentResponseDTO {
  appointment_id: number;
  appointment_date: string; // YYYY-MM-DD
  appointment_time: string; // HH:MM:SS
  barber: UserPublicDTO | null;
  client: UserPublicDTO | null;
  service: ServicePublicDTO | null;
  appointment_status: "PENDENTE" | "CONCLUIDO" | "CANCELADO";
  notification_sent: boolean;
}

export interface GetAvailabilityInput {
    id_barber: number;
    appointment_date: string; // YYYY-MM-DD
}