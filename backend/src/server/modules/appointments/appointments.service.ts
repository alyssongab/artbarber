import { AppointmentRepository } from "./appointments.repository.ts";
import { ConflictError, ForbiddenError, NotFoundError } from "../../shared/errors/http.errors.ts";
import { Prisma } from "../../../generated/prisma/client.ts";
import type { User } from "../../../generated/prisma/client.ts";
import type { AppointmentWithRelations, AppointmentResponseDTO, UserPublicDTO } from "./appointment.types.ts";
import type { AppointmentInputDTO, AppointmentStatusEnum } from "./appointment.schema.ts";

export class AppointmentService {
    private appointmentRepository: AppointmentRepository;

    constructor(){
        this.appointmentRepository = new AppointmentRepository();

    }

    // Formatting helpers keep conversion logic in one place
    private formatDate(date: Date): string {
        // YYYY-MM-DD
        return date.toISOString().slice(0, 10);
    }
    private formatTime(time: Date): string {
        // HH:MM:SS
        return time.toISOString().slice(11, 19);
    }

    private toUserDTO(u: User | null): UserPublicDTO | null {
        if(!u) return null;
        return {
            full_name: u.full_name,
            phone_number: u.phone_number,
        };
    }

    /** Map Appointment (with relations) into Response DTO */
    private toAppointmentResponseDTO(appointment: AppointmentWithRelations): AppointmentResponseDTO {
        return {
            appointment_id: appointment.appointment_id,
            appointment_date: this.formatDate(appointment.appointment_date),
            appointment_time: this.formatTime(appointment.appointment_time),
            barber: this.toUserDTO(appointment.barber),
            client: this.toUserDTO(appointment.client ?? null),
            service: appointment.service ? {
                name: appointment.service.name,
                price: appointment.service.price.toString(),
                duration: appointment.service.duration
            } : null,
            appointment_status: appointment.appointment_status,
            notification_sent: appointment.notification_sent
        }
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
            throw new ConflictError("Este horário já está ocupado para o barbeiro selecionado.");
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
        return this.toAppointmentResponseDTO(newAppointment);
    }

    /**
     * Get related appointments based on user role
     * - CLIENT: Only their appointments
     * - BARBER: Both their appointments and all appointments
     * @returns List of appointments in DTO Response format
     */
    async getRelatedAppointments(userRole: string, userId: number) {

        let appointments: AppointmentWithRelations[];

        if(userRole === 'CLIENT'){
            appointments = await this.appointmentRepository.findAllByClientId(userId);
        }
        else if(userRole === 'BARBER'){
            appointments = await this.appointmentRepository.findAllByBarberId(userId);
        }
        else{
            appointments = [];
        }
        // const appointments = await this.appointmentRepository.findAll();
        return appointments.map( ap => this.toAppointmentResponseDTO(ap));
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
        return appointments.map( ap => this.toAppointmentResponseDTO(ap));
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
        
        // if(userRole === 'CLIENT') throw new ForbiddenError("Você não tem permissão para realizar essa ação.");
        
    if(appointmentExists.appointment_status === 'PENDENTE') throw new ConflictError("Você não pode deletar um agendamento com status 'Pendente'.");

        return await this.appointmentRepository.delete(appointmentId);
    }

    /**
     * Update appointment status with role based authorization
     * - only BARBER can do it
     * @param appointmentId 
     * @param newStatus 
     * @param userRole Current user's role
     * @returns 
     */
    async updateAppointmentStatus(appointmentId: number, newStatus: AppointmentStatusEnum, userRole: string){
        const appointmentExists = await this.appointmentRepository.findById(appointmentId);
        if(!appointmentExists) throw new NotFoundError("Agendamento informado não encontrado.");
        const updated = await this.appointmentRepository.updateStatus(appointmentId, newStatus.appointment_status);
        return this.toAppointmentResponseDTO(updated);
    }
}