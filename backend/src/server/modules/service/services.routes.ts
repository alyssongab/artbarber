import { Router } from "express";
import { ServicesController } from "./services.controller.ts";
import { validateId } from "../../shared/middlewares/id.validation.ts";
import { authenticate } from "../../shared/middlewares/auth.middleware.ts";

const servicesController = new ServicesController();
const servicesRoutes = Router();

servicesRoutes.post('/', authenticate, servicesController.createService);

servicesRoutes.get('/', authenticate, servicesController.getServices);

servicesRoutes.put('/:id', validateId, authenticate, servicesController.updateService);

servicesRoutes.delete('/:id', validateId, authenticate, servicesController.deleteService);

export default servicesRoutes;