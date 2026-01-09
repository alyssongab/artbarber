import type { UserPublicDTO, AppointmentResponseDTO, AppointmentWithRelations } from "../../modules/appointments/appointment.types";
import type { User } from "../../../generated/prisma/client";


export const appointmentUtils = {
    // Formatting helpers keep conversion logic in one place
    formatDate: (date: Date): string => {
        // YYYY-MM-DD
        return date.toISOString().slice(0, 10);
    },

    formatTime: (time: Date): string => {
        // HH:MM:SS
        return time.toISOString().slice(11, 19);
        // 09:00:00
    },

    toUserDTO: (u: User | null): UserPublicDTO | null => {
        if(!u) return null;
        return {
            full_name: u.full_name,
            phone_number: u.phone_number,
        };
    },

    formatPrice: (value: number) => {
        return value.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
        });
    },

    /** Map Appointment (with relations) into Response DTO */
    toAppointmentResponseDTO: (appointment: AppointmentWithRelations): AppointmentResponseDTO => {
        const priceNumber = appointment.service.price.toNumber();
        return {
            appointment_id: appointment.appointment_id,
            appointment_date: appointmentUtils.formatDate(appointment.appointment_date),
            appointment_time: appointmentUtils.formatTime(appointment.appointment_time),
            barber: appointmentUtils.toUserDTO(appointment.barber),
            client: appointmentUtils.toUserDTO(appointment.client ?? null),
            service: appointment.service ? {
                name: appointment.service.name,
                price: appointmentUtils.formatPrice(priceNumber),
                duration: appointment.service.duration
            } : null,
            appointment_status: appointment.appointment_status,
            notification_sent: appointment.notification_sent
        }
    }
}
