import { AppointmentService } from "./appointments.service.ts";
import AvailabilityService from "./availability.service.ts";
import { createAppointmentSchema, updateAppointmentStatusSchema } from "./appointment.schema.ts";
import type { Request, Response, NextFunction } from "express";

export class AppointmentController {
    private appointmentService: AppointmentService
    private availabilityService: AvailabilityService;

    constructor(){
        this.appointmentService = new AppointmentService();
        this.availabilityService = new AvailabilityService();
    }

    createAppointment = async (req: Request, res: Response, next: NextFunction) => {
        try{
            const parsedData = createAppointmentSchema.parse(req.body);
            const userRole = req.user!.role;
            const userId = req.user!.user_id;

            const appointment = await this.appointmentService.createAppointment(parsedData, userRole, userId);
            return res.status(201).json(appointment);
        }
        catch(error){
            next(error);
        }
    }

    getAppointments = async (req: Request, res: Response, next: NextFunction) => {
        try{
            const userRole = req.user!.role;
            const appointments = await this.appointmentService.getAllAppointments(userRole);
            res.status(200).json(appointments);
        }
        catch(error){
            next(error);
        }
    }

    getRelatedAppointments = async (req: Request, res: Response, next: NextFunction) => {
        try{
            const userRole = req.user!.role;
            const userId = req.user!.user_id;
            const appointments = await this.appointmentService.getRelatedAppointments(userRole, userId);
            return res.status(200).json(appointments); 
        }
        catch(error) {
            next(error);
        }
    }

    deleteAppointment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userRole = req.user!.role;
            const id = parseInt(req.params.id!);
            await this.appointmentService.deleteAppointment(id, userRole);
            return res.status(204).send();
        }
        catch(error) {
            next(error);
        }
    }

    updateAppointmentStatus = async (req: Request, res: Response, next: NextFunction) => {
        try{
            const id = parseInt(req.params.id!);
            const userRole = req.user!.role;
            const parsedStatus = updateAppointmentStatusSchema.parse(req.body);
            const updatedAppointment = await this.appointmentService.updateAppointmentStatus(id, parsedStatus, userRole);
            return res.status(200).json(updatedAppointment);
        }
        catch(error) {
            next(error);
        }
    }

    getAvailableHours = async (req: Request, res: Response, next: NextFunction) => {
        try{
            const barberId = req.body.id_barber!;
            const date = req.body.appointment_date!;

            const availableHours = await this.availabilityService.getAvailableHours({ id_barber: barberId, appointment_date: date });
            return res.status(200).json(availableHours);
        }
        catch(error) {
            next(error);
        }
    }   
}