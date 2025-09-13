import { Router } from "express";
import { ServicesController } from "./services.controller.ts";
import { validateId } from "../../shared/middlewares/id.validation.ts";
import { authenticate } from "../../shared/middlewares/jwt.authentication.ts";
import { authorize } from "../../shared/middlewares/role.authorization.ts";

const servicesController = new ServicesController();
const servicesRoutes = Router();

servicesRoutes.post('/', authenticate, authorize('ADMIN'), servicesController.createService);

servicesRoutes.get('/', authenticate, servicesController.getServices);

servicesRoutes.put('/:id', validateId, authenticate, authorize('ADMIN'), servicesController.updateService);

servicesRoutes.delete('/:id', validateId, authenticate, authorize('ADMIN'), servicesController.deleteService);

export default servicesRoutes;