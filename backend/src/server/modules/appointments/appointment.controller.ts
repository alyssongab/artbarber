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
        catch(error: any){
            next(error);
        }
    }

    getAppointments = async (req: Request, res: Response, next: NextFunction) => {
        try{
            const userRole = req.user!.role;
            const appointments = await this.appointmentService.getAllAppointments(userRole);
            res.status(200).json(appointments);
        }
        catch(error: any){
            next(error);
        }
    }

    getRelatedAppointments = async (req: Request, res: Response, next: NextFunction) => {
        try{
            const userRole = req.user!.role;
            const userId = req.user!.user_id;

            const page = req.query._page ? parseInt(req.query._page as string, 10) : 1;
            const limit = req.query._limit ? parseInt(req.query._limit as string, 10) : 10;
            const date = req.query._date as string;

            const safePage = Number.isNaN(page) || page < 1 ? 1 : page;
            const safeLimit = Number.isNaN(limit) || limit < 1 ? 10 : limit;

            const result = await this.appointmentService.getRelatedAppointments(
                userRole,
                userId,
                safePage,
                safeLimit,
                date
            );

            return res.status(200).json(result); 
        }
        catch(error: any) {
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
        catch(error: any) {
            next(error);
        }
    }

    updateAppointmentStatus = async (req: Request, res: Response, next: NextFunction) => {
        try{
            const id = parseInt(req.params.id!);
            const userRole = req.user!.role;
            const userId = req.user!.user_id;
            const parsedStatus = updateAppointmentStatusSchema.parse(req.body);
            const updatedAppointment = await this.appointmentService.updateAppointmentStatus(id, parsedStatus, userRole, userId);
            return res.status(200).json(updatedAppointment);
        }
        catch(error: any) {
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
        catch(error: any) {
            next(error);
        }
    }

    getUpcomingAppointments = async (req: Request, res: Response, next: NextFunction) => {
        try{
            const userId = req.user!.user_id;
            const userRole = req.user!.role;
            const appointments = await this.appointmentService.getUpcomingAppointments(userId, userRole);
            return res.status(200).json(appointments);
        }
        catch(error: any) {
            next(error);
        }
    }

    getPastAppointments = async (req: Request, res: Response, next: NextFunction) => {
        try{
            const userId = req.user!.user_id;
            const userRole = req.user!.role;
            const appointments = await this.appointmentService.getPastAppointments(userId, userRole);
            return res.status(200).json(appointments);
        }
        catch(error: any) {
            next(error);
        }
    }

    getTotalAppointmentsForBarber = async (req: Request, res: Response, next: NextFunction) => {
        try{
            const userRole = req.user!.role;
            const userId = req.user!.user_id;
            const paramUserId = parseInt(req.params.id!);
            const dt = req.body.selected_date!;
            const total = await this.appointmentService.countAllAppointments(userRole, dt, paramUserId, userId);
            return res.status(200).json({ total_appoinments: total });
        }
        catch(error: any){
            next(error);
        }
    }

    getRevenue = async (req: Request, res: Response, next: NextFunction) => {
        try{
            const userRole = req.user!.role;
            const userId = req.user!.user_id;
            const paramUserId = parseInt(req.params.id!);
            const dt = req.body.selected_date!;
            const revenueDate = await this.appointmentService.calculateRevenue(userRole, dt, paramUserId, userId);
            
            return res.status(200).json(revenueDate);
        }
        catch(error: any){
            next(error);
        }
    }
}