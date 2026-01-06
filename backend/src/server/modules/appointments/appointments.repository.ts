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
     * Finds all appointments for a specific barber on a given date.
     * @param appointmentDate - The date to search for appointments
     * @param barberId - The unique identifier of the barber
     * @returns Appointments sorted by appointment time in ascending order          
     */
    async findByDateAndBarber(appointmentDate: Date, barberId: number): Promise<AppointmentWithRelations[]> {
        return await prismaClient.appointment.findMany({
            where: {
                AND: [
                    { appointment_date: appointmentDate },
                    { id_barber: barberId }
                ]
            },
            include: INCLUDE_RELATIONS,
            orderBy: { appointment_time: 'asc' }
        });
    }

    async findAllByClientId(clientId: number): Promise<AppointmentWithRelations[]> {
        return await prismaClient.appointment.findMany({
            where: { id_client: clientId },
            include: INCLUDE_RELATIONS,
            orderBy: [
                { appointment_date: 'asc' },
                { appointment_time: 'asc' }
            ]
        });
    }

    async findAllByBarberId(barberId: number): Promise<AppointmentWithRelations[]> {
        return await prismaClient.appointment.findMany({
            where: { id_barber: barberId },
            include: INCLUDE_RELATIONS,
            orderBy: [
                { appointment_date: 'asc' },
                { appointment_time: 'asc' }
            ]
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
                AND: [
                    {
                        appointment_date: {
                            gte: startDate,
                            lte: endDate
                        }
                    },
                    { appointment_status: 'PENDENTE' },
                    { notification_sent: false }
                ]
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
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        return await prismaClient.appointment.findMany({
            where: {
                id_client: clientId,
                OR: [
                    // Future dates
                    {
                        appointment_date: {
                            gt: today
                        }
                    },
                    // Today but future time
                    {
                        AND: [
                            { appointment_date: today },
                            { appointment_time: { gte: now } }
                        ]
                    }
                ]
            },
            include: INCLUDE_RELATIONS,
            orderBy: [
                { appointment_date: 'asc' },
                { appointment_time: 'asc' }
            ]
        });
    }

    /**
     * Find past appointments for a client (past appointments from now)
     * @param clientId 
     * @returns Appointments with date < today or (date = today and time < now)
     */
    async findPastByClientId(clientId: number): Promise<AppointmentWithRelations[]> {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        return await prismaClient.appointment.findMany({
            where: {
                id_client: clientId,
                OR: [
                    // Past dates
                    {
                        appointment_date: {
                            lt: today
                        }
                    },
                    // Today but past time
                    {
                        AND: [
                            { appointment_date: today },
                            { appointment_time: { lt: now } }
                        ]
                    }
                ]
            },
            include: INCLUDE_RELATIONS,
            orderBy: [
                { appointment_date: 'desc' },
                { appointment_time: 'desc' }
            ]
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
                orderBy: [
                    { appointment_date: 'desc' },
                    { appointment_time: 'desc' }
                ],
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
        limit: number
    ): Promise<{ data: AppointmentWithRelations[]; total: number }> {
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            prismaClient.appointment.findMany({
                where: { id_barber: barberId },
                include: INCLUDE_RELATIONS,
                orderBy: [
                    { appointment_date: 'desc' },
                    { appointment_time: 'desc' }
                ],
                skip,
                take: limit
            }),
            prismaClient.appointment.count({
                where: { id_barber: barberId }
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
        const total = await prismaClient.appointment.count({
            where: {
                id_barber: barberId,
                appointment_date: selectedDate
            }
        });
        return total;
    }
}