import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { AppointmentController } from "./appointment.controller.ts";
import { validateId } from "../../shared/middlewares/id.validation.ts";

const appointmentController = new AppointmentController();
const appointmentsRouter = Router();

// create appointment endpoint
appointmentsRouter.post('/', appointmentController.createAppointment);

// get all appointments endpoint
appointmentsRouter.get('/', appointmentController.getAppointments);

// delete appointment endpoint
appointmentsRouter.delete('/:id', validateId, appointmentController.deleteAppointment);

export default appointmentsRouter;