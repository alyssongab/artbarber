import { Router } from "express";
import { AppointmentController } from "./appointment.controller.ts";
import { validateId } from "../../shared/middlewares/id.validation.ts";
import { authenticate } from "../../shared/middlewares/auth.middleware.ts";

const appointmentController = new AppointmentController();
const appointmentsRouter = Router();

// create appointment endpoint
appointmentsRouter.post('/', authenticate, appointmentController.createAppointment);

// get all appointments endpoint
appointmentsRouter.get('/', authenticate, appointmentController.getAppointments);

// delete appointment endpoint
appointmentsRouter.delete('/:id', validateId, authenticate, appointmentController.deleteAppointment);

export default appointmentsRouter;