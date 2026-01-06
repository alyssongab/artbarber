import { AppointmentRepository } from "./appointments.repository.ts";
import { ConflictError, ForbiddenError, NotFoundError } from "../../shared/errors/http.errors.ts";
import { Prisma } from "../../../generated/prisma/client.ts";
import type { User } from "../../../generated/prisma/client.ts";
import type { AppointmentWithRelations, AppointmentResponseDTO, UserPublicDTO } from "./appointment.types.ts";
import type { AppointmentInputDTO, AppointmentStatusEnum } from "./appointment.schema.ts";
import { appointmentUtils } from "../../shared/utils/appointment.utils.ts";

export class AppointmentService {
    private appointmentRepository: AppointmentRepository;

    constructor(){
        this.appointmentRepository = new AppointmentRepository();

    }

    /**
     * Create a new appointment
     * Checks availability of barber at date and time given 
     * @param data Appointment data
     * @param userRole Current user's role
     * @param userId Current user's ID
     * @returns Created appointment
     */
    async createAppointment(data: AppointmentInputDTO, userRole: string, userId: number) {
        // Date conversion
        // Z = UTC Time to keep date and time consistent in server and database
        // iso format: YYYY-MM-DDTHH:mm:ss.sssZ
        const appointmentDate = new Date(`${data.appointment_date}T00:00:00.000Z`);
        const appointmentTime = new Date(`1970-01-01T${data.appointment_time}Z`);

        // Role based verification
        if(userRole === 'CLIENT'){
            if(data.id_client && data.id_client !== userId){
                throw new ForbiddenError("Você não pode fazer agendamento para outro cliente.");
            }
            data.id_client = userId;
        }
        else if(userRole === 'BARBER'){}

        const appointmentExists = await this.appointmentRepository.findByDatetimeAndBarber(
            appointmentDate,
            appointmentTime,
            data.id_barber
        );

        if(appointmentExists){
            throw new ConflictError("Este horário já está ocupado para este barbeiro na data selecionada.");
        }

        const createData: Prisma.AppointmentCreateInput = {
            appointment_date: appointmentDate,
            appointment_time: appointmentTime,
            barber: { 
                connect: { 
                    user_id: data.id_barber 
                } 
            },
            service: { 
                connect: { 
                    service_id: data.id_service 
                } 
            }
        };

        if(data.id_client){
            createData.client = { connect: { user_id: data.id_client } };
        }

        const newAppointment = await this.appointmentRepository.create(createData);
        return appointmentUtils.toAppointmentResponseDTO(newAppointment);
    }

    /**
     * Get related appointments based on user role
     * - CLIENT: Only their appointments
     * - BARBER: Both their appointments and all appointments
     * @returns List of appointments in DTO Response format + pagination
     */
    async getRelatedAppointments(
        userRole: string,
        userId: number,
        page: number,
        limit: number
    ) {
        let data: AppointmentWithRelations[] = [];
        let total = 0;

        if (userRole === 'CLIENT') {
            const result = await this.appointmentRepository.findAllByClientIdPaginated(
                userId,
                page,
                limit
            );
            data = result.data;
            total = result.total;
        } else if (userRole === 'BARBER') {
            const result = await this.appointmentRepository.findAllByBarberIdPaginated(
                userId,
                page,
                limit
            );
            data = result.data;
            total = result.total;
        } else {
            data = [];
            total = 0;
        }

        const items = data.map(ap => appointmentUtils.toAppointmentResponseDTO(ap));
        const totalPages = Math.ceil(total / limit) || 1;

        return {
            data: items,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        };
    }

    /**
     * Get ALL Appointments
     * - only for BARBER and ADMIN
     * @param userRole 
     */
    async getAllAppointments(userRole: string) {
        if(userRole === 'CLIENT'){
            throw new ForbiddenError("Você não tem permissão para essa requisição.");
        }

        const appointments = await this.appointmentRepository.findAll();
        return appointments.map( ap => appointmentUtils.toAppointmentResponseDTO(ap));
    }

    /**
     * Delete an appointment
     * - only for BARBER and ADMIN
     * @param appointmentId 
     * @returns 
     */
    async deleteAppointment(appointmentId: number, userRole: string){
        const appointmentExists = await this.appointmentRepository.findById(appointmentId);
        if(!appointmentExists) throw new NotFoundError("Agendamento não encontrado");
        
        if(userRole === 'CLIENT') throw new ForbiddenError("Você não tem permissão para realizar essa ação.");
        
        if(appointmentExists.appointment_status === 'PENDENTE') throw new ConflictError("Você não pode deletar um agendamento com status 'Pendente'.");

        return await this.appointmentRepository.delete(appointmentId);
    }

    /**
     * Update appointment status with role based authorization
     * - CLIENT: Can only cancel their own appointments (change status to CANCELADO)
     * - BARBER: Can update any appointment status (associated with them)
     * @param appointmentId 
     * @param newStatus 
     * @param userRole Current user's role
     * @param userId Current user's ID
     * @returns 
     */
    async updateAppointmentStatus(appointmentId: number, newStatus: AppointmentStatusEnum, userRole: string, userId: number){
        const appointmentExists = await this.appointmentRepository.findById(appointmentId);
        if(!appointmentExists) throw new NotFoundError("Agendamento informado não encontrado.");

        // CLIENT validation
        if(userRole === 'CLIENT'){
            // Check if appointment belongs to the client
            if(appointmentExists.id_client !== userId){
                throw new ForbiddenError("Você não pode alterar um agendamento que não é seu.");
            }

            // Client can only cancel (status = CANCELADO)
            if(newStatus.appointment_status !== 'CANCELADO'){
                throw new ForbiddenError("Clientes só podem cancelar seus agendamentos.");
            }

            // Check if appointment time has not passed
            const now = new Date();
            const appointmentDateTime = new Date(appointmentExists.appointment_date);
            appointmentDateTime.setUTCHours(
                appointmentExists.appointment_time.getUTCHours(),
                appointmentExists.appointment_time.getUTCMinutes(),
                0,
                0
            );

            if (appointmentDateTime <= now) {
                throw new ForbiddenError("Você não pode cancelar um agendamento que já começou ou passou.");
            }
        }

        // BARBER validation
        if(userRole === 'BARBER'){
            // Check if appointment is associated with the barber
            if(appointmentExists.id_barber !== userId){
                throw new ForbiddenError("Você não pode alterar um agendamento que não está associado a você.");
            }
        }

        const updated = await this.appointmentRepository.updateStatus(appointmentId, newStatus.appointment_status);
        return appointmentUtils.toAppointmentResponseDTO(updated);
    }

    /**
     * Get upcoming appointments for a client (future from now)
     * @param userId Client ID
     * @returns List of upcoming appointments in DTO format
     */
    async getUpcomingAppointments(userId: number, userRole: string) {
        if(userRole !== 'CLIENT'){
            throw new ForbiddenError("Apenas clientes podem acessar esta funcionalidade.");
        }

        const appointments = await this.appointmentRepository.findUpcomingByClientId(userId);
        return appointments.map(ap => appointmentUtils.toAppointmentResponseDTO(ap));
    }

    /**
     * Get past appointments for a client (past from now)
     * @param userId Client ID
     * @returns List of past appointments in DTO format
     */
    async getPastAppointments(userId: number, userRole: string) {
        if(userRole !== 'CLIENT'){
            throw new ForbiddenError("Apenas clientes podem acessar esta funcionalidade.");
        }

        const appointments = await this.appointmentRepository.findPastByClientId(userId);
        return appointments.map(ap => appointmentUtils.toAppointmentResponseDTO(ap));
    }

    /**
     * Count all appointments of a specific barber in a specific date
     * @param userRole 
     * @param selectedDate 
     * @param userId 
     * @returns 
     */
    async countAllAppointments(userRole: string, selectedDate: Date, paramId: number, reqId: number){
        if(userRole !== 'BARBER'){
            throw new Error("Funcionalidade apenas para barbeiros.");
        }
        
        if(paramId !== reqId){
            throw new ForbiddenError("Você não pode consultar agendamentos de outro barbeiro.");
        }

        // Parse date properly to Date object
        const dateObject = new Date(`${selectedDate}T00:00:00.000Z`);
        const totalAppointments = await this.appointmentRepository.countAllByBarberAndDate(dateObject, paramId);
        return totalAppointments !== null ? totalAppointments : 0;
    }
}