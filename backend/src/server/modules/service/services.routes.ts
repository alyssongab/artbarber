import type { Request, Response, NextFunction } from "express";
import { Router } from "express";
import { ServicesController } from "./services.controller.ts";
import { validateId } from "../../shared/middlewares/id.validation.ts";

const servicesController = new ServicesController();
const servicesRoutes = Router();

servicesRoutes.post('/',
    (req: Request, res: Response, next: NextFunction) =>
    servicesController.createService(req, res, next)
);

servicesRoutes.get('/',
    (req: Request, res: Response, next: NextFunction) =>
    servicesController.getServices(req, res, next)
);

servicesRoutes.put('/:id',
     validateId,
    (req: Request, res: Response, next: NextFunction) =>
    servicesController.updateService(req, res, next)
);

servicesRoutes.delete('/:id',
    validateId,
    (req: Request, res: Response, next: NextFunction) =>
    servicesController.deleteService(req, res, next)
);

export default servicesRoutes;