import type { Appointment, AppointmentStatus, Prisma } from "../../../generated/prisma/client.ts";
import prismaClient from "../../shared/config/prisma.ts";
import type { AppointmentWithRelations } from "./appointment.types.ts";

const INCLUDE_RELATIONS = { barber: true, client: true, service: true } as const;

export class AppointmentRepository {

    /**
     * Create appointment
     * @param data date, time, clientId?, barberId, serviceId
     * @returns 
     */
    async create(data: Prisma.AppointmentCreateInput): Promise<AppointmentWithRelations> {
        return await prismaClient.appointment.create({ 
            data,
            include: INCLUDE_RELATIONS
        });
    }

    /**
     * Find an appointment by Id
     * @param appointmentId 
     * @returns 
     */
    async findById(appointmentId: number): Promise<AppointmentWithRelations | null> {
        return await prismaClient.appointment.findUnique({
            where: { appointment_id: appointmentId },
            include: INCLUDE_RELATIONS
        });
    }

    /**
     * Get all appointments
     * @returns 
     */
    async findAll(): Promise<AppointmentWithRelations[]> {
        return await prismaClient.appointment.findMany({
            include: INCLUDE_RELATIONS
        });
    }

    /**
     * Find an appointment for a specific barber at an exact date and time
     * This is used to avoid scheduling conflicts
     * @param date Date object for specific day.
     * @param time Date object for specific time.
     * @param barberId 
     * @returns An appointment if exists or nulls
     */
    async findByDatetimeAndBarber(appointmentDateTime: Date, barberId: number): Promise<Appointment | null> {
        return await prismaClient.appointment.findFirst({
            where: {
                appointment_datetime: appointmentDateTime,
                id_barber: barberId
            }
        });
    }

    /**
     * Finds all appointments for a specific barber on a given date.
     * @param appointmentDate - The date to search for appointments
     * @param barberId - The unique identifier of the barber
     * @returns Appointments sorted by appointment time in ascending order          
     */
    async findAllByDateAndBarber(appointmentDate: Date, barberId: number): Promise<AppointmentWithRelations[]> {
        const startOfDay = new Date(appointmentDate);
        startOfDay.setUTCHours(0, 0, 0, 0);

        const endOfDay = new Date(appointmentDate);
        endOfDay.setUTCHours(23, 59, 59, 999);

        return await prismaClient.appointment.findMany({
            where: {
                id_barber: barberId,
                appointment_datetime: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            },
            include: INCLUDE_RELATIONS,
            orderBy: {
                appointment_datetime: 'asc'
            }
        });
    }

    async findAllByClientId(clientId: number): Promise<AppointmentWithRelations[]> {
        return await prismaClient.appointment.findMany({
            where: { id_client: clientId },
            include: INCLUDE_RELATIONS,
            orderBy: {
                appointment_datetime: 'asc'
            }
        });
    }

    async findAllByBarberId(barberId: number): Promise<AppointmentWithRelations[]> {
        return await prismaClient.appointment.findMany({
            where: { id_barber: barberId },
            include: INCLUDE_RELATIONS,
            orderBy: {
                appointment_datetime: 'asc'
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

    /**
     * Finds the first appointment asssociated with a service id
     * This is invoked when user tries to delete a existing service
     * @param serviceId 
     * @returns An appointment or null
     */
    async findFirstByServiceId(serviceId: number): Promise<Appointment | null> {
        return await prismaClient.appointment.findFirst({
            where: {
                id_service: serviceId
            }
        });
    }

    /**
     * Updates the status of a specific appointment
     * @param appointmentId 
     * @param newStatus Status to be set (PENDENTE, CONCLUIDO, CANCELADO)
     * @returns Appointment object
     */
    async updateStatus(appointmentId: number, newStatus: AppointmentStatus): Promise<AppointmentWithRelations> {
        return await prismaClient.appointment.update({
            where: { appointment_id: appointmentId },
            data: { appointment_status: newStatus },
            include: INCLUDE_RELATIONS
        });
    }

    /**
     * Find appointments by date range (simple database query)
     * @param startDate 
     * @param endDate 
     * @returns 
     */
    async findByDateRange(startDate: Date, endDate: Date): Promise<Appointment[]> {
        return await prismaClient.appointment.findMany({
            where: {
                appointment_datetime: {
                    gte: startDate,
                    lte: endDate
                },
                appointment_status: 'PENDENTE',
                notification_sent: false
            },
            include: {
                client: true,
                barber: true,
                service: true
            }
        });
    }

    /**
     * Update notification status
     * @param appointmentId 
     * @param notificationSent 
     * @returns 
     */
    async updateNotificationStatus(appointmentId: number, status: boolean){
        return await prismaClient.appointment.update({
            where: { appointment_id: appointmentId },
            data: { notification_sent: status }
        });
    }

    /**
     * Find upcoming appointments for a client (future appointments from now)
     * @param clientId 
     * @returns Appointments with date >= today and time >= now (if today)
     */
    async findUpcomingByClientId(clientId: number): Promise<AppointmentWithRelations[]> {
        const now = new Date();

        return await prismaClient.appointment.findMany({
            where: {
                id_client: clientId,
                appointment_datetime: {
                    gte: now
                }
            },
            include: INCLUDE_RELATIONS,
            orderBy: {
                appointment_datetime: 'asc'
            }
        });
    }

    /**
     * Find past appointments for a client (past appointments from now)
     * @param clientId 
     * @returns Appointments with date < today or (date = today and time < now)
     */
    async findPastByClientId(clientId: number): Promise<AppointmentWithRelations[]> {
        const now = new Date();

        return await prismaClient.appointment.findMany({
            where: {
                id_client: clientId,
                appointment_datetime: {
                    lt: now
                }
            },
            include: INCLUDE_RELATIONS,
            orderBy: {
                appointment_datetime: 'desc'
            }
        });
    }

    /**
     * Find all client appointment paginated by Id
     * @param clientId 
     * @param page which page at
     * @param limit how many results per page
     * @returns Appointment data and total appointments
     */
    async findAllByClientIdPaginated(
        clientId: number,
        page: number,
        limit: number
    ): Promise<{ data: AppointmentWithRelations[]; total: number }> {
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            prismaClient.appointment.findMany({
                where: { id_client: clientId },
                include: INCLUDE_RELATIONS,
                orderBy: {
                    appointment_datetime: 'desc'
                },
                skip,
                take: limit
            }),
            prismaClient.appointment.count({
                where: { id_client: clientId }
            })
        ]);

        return { data, total };
    }

    /**
     * Find all client appointment paginated by Id
     * @param barberId 
     * @param page which page at
     * @param limit how many results per page
     * @returns Appointment data and total appointments
     */
    async findAllByBarberIdPaginated(
        barberId: number,
        page: number,
        limit: number,
        filterDate?: Date
    ): Promise<{ data: AppointmentWithRelations[]; total: number }> {
        const skip = (page - 1) * limit;
        const whereClause: Prisma.AppointmentWhereInput = {
            id_barber: barberId
        }

        if(filterDate) {
            const startOfDay = new Date(filterDate);
            startOfDay.setUTCHours(0, 0, 0, 0);

            const endOfDay = new Date(filterDate);
            endOfDay.setUTCHours(23, 59, 59, 999);
            
            whereClause.appointment_datetime = {
                gte: startOfDay,
                lte: endOfDay
            };
        }
        const [data, total] = await Promise.all([
            prismaClient.appointment.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: {
                    appointment_datetime: 'desc'
                },
                include: INCLUDE_RELATIONS,
            }),
            prismaClient.appointment.count({
                where: whereClause
            })
        ]);

        return { data, total };
    }

    /**
     * Count all the appointments for a specific barber in a given date
     * @param selectedDate 
     * @param barberId 
     * @returns Total appointments or null
     */
    async countAllByBarberAndDate(selectedDate: Date, barberId: number): Promise<number | null> {
        const startOfDay = new Date(selectedDate);
        startOfDay.setUTCHours(0, 0, 0, 0);

        const endOfDay = new Date(selectedDate);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const total = await prismaClient.appointment.count({
            where: {
                id_barber: barberId,
                appointment_datetime: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            }
        });
        return total;
    }

    /**
     * Find expired pending appointments (today + time passed + status PENDENTE)
     * @param date Today's date
     * @param fullDateTime Time converted to prisma format
     * @returns List of expired appointments
     */
    async findExpiredPendingAppointments(now: Date): Promise<AppointmentWithRelations[]> {
        return await prismaClient.appointment.findMany({
            where: {
                appointment_status: 'PENDENTE',
                appointment_datetime: {
                    lt: now
                }
            },
            include: INCLUDE_RELATIONS
        });
    }

    /**
     * Cancel expired pending appointments
     * @param date Today's date
     * @param fullDateTime Time converted to prisma format
     * @returns Number of cancelled appointments
     */
    async cancelExpiredAppointments(now: Date): Promise<number> {
        const result = await prismaClient.appointment.updateMany({
            where: {
                appointment_status: 'PENDENTE',
                appointment_datetime: {
                    lt: now
                }
            },
            data: {
                appointment_status: 'CANCELADO' 
            }
        });

        return result.count;
    }

    /**
     * Search appointments by client name for a specific barber
     * @param barberId The barber ID
     * @param clientName Client name to search (partial match)
     * @returns List of appointments matching the search
     */
    async searchByClientName(barberId: number, clientName: string): Promise<AppointmentWithRelations[]> {
        return await prismaClient.appointment.findMany({
            where: {
                id_barber: barberId,
                client: {
                    full_name: {
                        contains: clientName,
                        mode: 'insensitive'
                    }
                }
            },
            include: INCLUDE_RELATIONS,
            orderBy: {
                appointment_datetime: 'desc'
            }
        });
    }

    /**
     * Find appointment for a specific client at a specific datetime
     * to prevent double-booking for the same client
     * @param appointmentDateTime The datetime to check
     * @param clientId The client ID
     * @returns An appointment if exists or null
     */
    async findByDatetimeAndClient(appointmentDateTime: Date, clientId: number): Promise<Appointment | null> {
        return await prismaClient.appointment.findFirst({
            where: {
                appointment_datetime: appointmentDateTime,
                id_client: clientId,
                appointment_status: {
                    not: 'CANCELADO'
                }
            }
        });
    }
}