import { AppointmentService } from "./appointments.service.ts";
import { createAppointmentSchema } from "./appointment.schema.ts";
import type { Request, Response, NextFunction } from "express";

export class AppointmentController {
    private appointmentService: AppointmentService

    constructor(){
        this.appointmentService = new AppointmentService();
    }

    createAppointment = async (req: Request, res: Response, next: NextFunction) => {
        try{
            const parsedData = createAppointmentSchema.parse(req.body);
            const appointment = await this.appointmentService.createAppointment(parsedData);
            return res.status(201).json(appointment);
        }
        catch(error){
            next(error);
        }
    }

    getAppointments = async (req: Request, res: Response, next: NextFunction) => {
        try{
            const appointments = await this.appointmentService.getAppointments();
            res.status(200).json(appointments);
        }
        catch(error){
            next(error);
        }
    }

    deleteAppointment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params.id!);
            await this.appointmentService.deleteAppointment(id);
            return res.status(204).send();
        }
        catch(error) {
            next(error);
        }
    }
}