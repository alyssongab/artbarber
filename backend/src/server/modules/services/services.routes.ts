import { Router } from "express";
import { ServicesController } from "./services.controller.ts";
import { validateId } from "../../shared/middlewares/id.validation.ts";
import { authenticate } from "../../shared/middlewares/jwt.authentication.ts";
import { authorize } from "../../shared/middlewares/role.authorization.ts";
import { ServicesService } from "./services.service.ts";
import { ServiceRepository } from "./services.repository.ts";
import { AppointmentRepository } from "../appointments/appointments.repository.ts";

const appointmentRepo = new AppointmentRepository();
const servicesRepository = new ServiceRepository();
const servicesService = new ServicesService(servicesRepository, appointmentRepo);
const servicesController = new ServicesController(servicesService);
const servicesRouter = Router();

servicesRouter.post('/', authenticate, authorize('ADMIN'), servicesController.createService);

servicesRouter.get('/', authenticate, servicesController.getServices);

servicesRouter.get('/active', authenticate, servicesController.getActiveServices);

servicesRouter.put('/:id', validateId, authenticate, authorize('ADMIN'), servicesController.updateService);

servicesRouter.delete('/:id', validateId, authenticate, authorize('ADMIN'), servicesController.deleteService);

export default servicesRouter;