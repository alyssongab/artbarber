import { Router } from "express";
import { ServicesController } from "./services.controller.ts";
import { validateId } from "../../shared/middlewares/id.validation.ts";
import { authenticate } from "../../shared/middlewares/jwt.authentication.ts";
import { authorize } from "../../shared/middlewares/role.authorization.ts";

const servicesController = new ServicesController();
const servicesRouter = Router();

servicesRouter.post('/', authenticate, authorize('ADMIN'), servicesController.createService);

servicesRouter.get('/', authenticate, servicesController.getServices);

servicesRouter.get('/active', authenticate, servicesController.getActiveServices);

servicesRouter.put('/:id', validateId, authenticate, authorize('ADMIN'), servicesController.updateService);

servicesRouter.delete('/:id', validateId, authenticate, authorize('ADMIN'), servicesController.deleteService);

export default servicesRouter;