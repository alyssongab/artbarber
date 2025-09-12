import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { AppointmentController } from "./appointment.controller.ts";
import { validateId } from "../../shared/middlewares/id.validation.ts";

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

appointmentsRouter.delete('/:id',
    validateId,
    (req: Request, res: Response, next: NextFunction) =>
    appointmentController.deleteAppointment(req, res, next)
)

export default appointmentsRouter;