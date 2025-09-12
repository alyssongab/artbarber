import { AppointmentRepository } from "./appointments.repository.ts";
import { BadRequestError, ConflictError, NotFoundError } from "../../shared/errors/http.errors.ts";
import { Prisma } from "@prisma/client";
import type { Appointment } from "@prisma/client";
import type { AppointmentInputDTO } from "./appointment.schema.ts";

export class AppointmentService {
    private appointmentRepository: AppointmentRepository;

    constructor(){
        this.appointmentRepository = new AppointmentRepository();
    }

    // DTO 
    private toAppointmentResponseDTO(appointment: Appointment) {
        return {
            appointment_id: appointment.appointment_id,
            appointment_date: appointment.appointment_date.toISOString().split('T')[0],
            appointment_time: appointment.appointment_time.toISOString().split('T')[1]!.substring(0, 8),
            id_barber: appointment.id_barber,
            id_client: appointment.id_client,
            id_service: appointment.id_service
        }
    }

    async createAppointment(data: AppointmentInputDTO) {
        // Date conversion
        // Z = UTC Time to keep date and time consistent in server and database
        const appointmentDate = new Date(`${data.appointment_date}T00:00:00.000Z`);
        const appointmentTime = new Date(`1970-01-01T${data.appointment_time}Z`);

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
     * Get all appointments
     * @returns List of appointments in DTO Response format
     */
    async getAppointments() {
        const appointments = await this.appointmentRepository.findAll();
        return appointments.map( ap => this.toAppointmentResponseDTO(ap));
    }

    async deleteAppointment(appointmentId: number){
        const appointmentExists = await this.appointmentRepository.findById(appointmentId);
        if(!appointmentExists) throw new NotFoundError("Agendamento não encontrado");
        return await this.appointmentRepository.delete(appointmentId);
    }
}