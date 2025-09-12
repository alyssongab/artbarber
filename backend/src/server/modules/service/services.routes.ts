import type { Request, Response, NextFunction } from "express";
import { Router } from "express";
import { ServicesController } from "./services.controller.ts";
import { validateId } from "../../shared/middlewares/id.validation.ts";

const servicesController = new ServicesController();
const servicesRoutes = Router();

servicesRoutes.post('/', servicesController.createService);

servicesRoutes.get('/', servicesController.getServices);

servicesRoutes.put('/:id', validateId, servicesController.updateService);

servicesRoutes.delete('/:id', validateId, servicesController.deleteService);

export default servicesRoutes;