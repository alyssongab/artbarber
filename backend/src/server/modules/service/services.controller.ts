import { ServicesService } from "./services.service.ts";
import { createServiceSchema, updateServiceSchema } from "./services.schema.ts";
import type { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../../shared/errors/http.errors.ts";

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

    async getService(req: Request, res: Response, next: NextFunction){
        try{
            const serviceId = parseInt(req.params.id!);
            const service = await this.servicesService.getService(serviceId);
            return res.status(200).json(service);
        }
        catch(error){
            next(error);
        }
    }

    async updateService(req: Request, res: Response, next: NextFunction) {
        try{
            const serviceId = parseInt(req.params.id!);
            const dataToUpdate = updateServiceSchema.parse(req.body);
            const updatedService =  await this.servicesService.updateService(serviceId, dataToUpdate);
            
            return res.status(200).json(updatedService);
        }
        catch(error){
            next(error);
        }
    }

    async deleteService(req: Request, res: Response, next: NextFunction) {
        try{
            const serviceId = parseInt(req.params.id!);
            await this.servicesService.deleteService(serviceId);
            return res.status(204).send();
        }
        catch(error){
            next(error);
        }
    }

}