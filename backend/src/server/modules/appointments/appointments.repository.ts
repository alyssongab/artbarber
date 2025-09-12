import type { Appointment } from "@prisma/client";
import prismaClient from "../../shared/config/prisma.ts";
import { Prisma } from "@prisma/client";

export class AppointmentRepository {

    /**
     * Create appointment
     * @param data date, time, clientId?, barberId, serviceId
     * @returns 
     */
    async create(data: Prisma.AppointmentCreateInput): Promise<Appointment> {
        return await prismaClient.appointment.create({ data });
    }

    /**
     * Find an appointment by Id
     * @param appointmentId 
     * @returns 
     */
    async findById(appointmentId: number): Promise<Appointment | null> {
        return await prismaClient.appointment.findUnique({
            where: { appointment_id: appointmentId }
        });
    }

    /**
     * Get all appointments
     * @returns 
     */
    async findAll(): Promise<Appointment[]> {
        return await prismaClient.appointment.findMany();
    }

    /**
     * Find an appointment for a specific barber at an exact date and time
     * This is used to avoid scheduling conflicts
     * @param date Date object for specific day.
     * @param time Date object for specific time.
     * @param barberId 
     * @returns An appointment if exists or null
     */
    async findByDatetimeAndBarber(appointmentDate: Date, appointmentTime: Date, barberId: number): Promise<Appointment | null> {
        return await prismaClient.appointment.findFirst({
            where: {
                AND: [
                    { appointment_date: appointmentDate },
                    { appointment_time: appointmentTime },
                    { id_barber: barberId }
                ]
            }
        });
    }

    /**
     * Delete an appointment by id
     * @param appointmentId 
     * @returns The deleted object
     */
    async delete(appointmentId: number): Promise<Appointment> {
        return await prismaClient.appointment.delete({
            where: { appointment_id: appointmentId }
        });
    }
}