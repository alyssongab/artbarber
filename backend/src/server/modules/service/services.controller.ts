import { ServicesService } from "./services.service.ts";
import { createServiceSchema } from "./services.schema.ts";
import type { Request, Response, NextFunction } from "express";

export class ServicesController{

    private servicesService: ServicesService;

    constructor(){
        this.servicesService = new ServicesService();
    }

    /**
     * Controller to create new service
     * @param req 
     * @param res 
     * @param next 
     * @returns 
     */
    async createService(req: Request, res: Response, next: NextFunction){
        try{
            const serviceData = createServiceSchema.parse(req.body);
            const newService = await this.servicesService.createService(serviceData);
            return res.status(201).json(newService);
        }
        catch(error){
            next(error);
        }
    }

    async getServices(req: Request, res: Response, next: NextFunction){
        try{
            const services = await this.servicesService.getServices();
            return res.status(200).json(services);
        }
        catch(error){
            next(error);
        }
    }

}