import { Router } from "express";
import { AppointmentController } from "./appointment.controller.ts";
import { validateId } from "../../shared/middlewares/id.validation.ts";
import { authenticate } from "../../shared/middlewares/jwt.authentication.ts";
import { authorize } from "../../shared/middlewares/role.authorization.ts";

const appointmentController = new AppointmentController();
const appointmentsRouter = Router();

// create appointment endpoint
appointmentsRouter.post('/', authenticate, authorize('CLIENT', 'BARBER'), appointmentController.createAppointment);

// get all appointments endpoint
appointmentsRouter.get('/', authenticate, appointmentController.getAppointments);

// delete appointment endpoint
appointmentsRouter.delete('/:id', validateId, authenticate, authorize('CLIENT', 'BARBER'), appointmentController.deleteAppointment);

export default appointmentsRouter;