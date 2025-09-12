import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { AppointmentController } from "./appointment.controller.ts";

const appointmentController = new AppointmentController();
const appointmentsRouter = Router();

// create appointment endpoint
appointmentsRouter.post('/',
    (req: Request, res: Response, next: NextFunction) =>
    appointmentController.createAppointment(req, res, next)
);

// get all appointments endpoint
appointmentsRouter.get('/',
    (req: Request, res: Response, next: NextFunction) =>
    appointmentController.getAppointments(req, res, next)
);

export default appointmentsRouter;