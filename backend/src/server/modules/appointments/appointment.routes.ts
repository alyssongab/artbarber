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
appointmentsRouter.get('/all', authenticate, authorize('BARBER', 'ADMIN'), appointmentController.getAppointments);

// get appointments related to the user
appointmentsRouter.get('/', authenticate, appointmentController.getRelatedAppointments);

// get upcoming appointments for client
appointmentsRouter.get('/upcoming', authenticate, authorize('CLIENT'), appointmentController.getUpcomingAppointments);

// get past appointments for client
appointmentsRouter.get('/past', authenticate, authorize('CLIENT'), appointmentController.getPastAppointments);

appointmentsRouter.post('/availability', authenticate, appointmentController.getAvailableHours);

// delete appointment endpoint
appointmentsRouter.delete('/:id', validateId, authenticate, authorize('BARBER'), appointmentController.deleteAppointment);

// update the status of an appointment
appointmentsRouter.patch('/:id', validateId, authenticate, authorize('BARBER'), appointmentController.updateAppointmentStatus);

export default appointmentsRouter;