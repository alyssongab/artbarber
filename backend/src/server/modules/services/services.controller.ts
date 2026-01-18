import { ServicesService } from "./services.service.ts";
import { createServiceSchema, updateServiceSchema } from "./services.schema.ts";
import type { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../../shared/errors/http.errors.ts";

export class ServicesController{

    private servicesService: ServicesService;

    constructor(servicesService: ServicesService){
        this.servicesService = servicesService;
    }

    /**
     * Controller to create new service
     * @param req 
     * @param res 
     * @param next 
     * @returns 
     */
    createService = async (req: Request, res: Response, next: NextFunction) => {
        try{
            const serviceData = createServiceSchema.parse(req.body);
            const newService = await this.servicesService.createService(serviceData);
            return res.status(201).json(newService);
        }
        catch(error: any){
            next(error);
        }
    }

    getServices = async (req: Request, res: Response, next: NextFunction) => {
        try{
            const services = await this.servicesService.getServices();
            return res.status(200).json(services);
        }
        catch(error: any){
            next(error);
        }
    }

    getService = async (req: Request, res: Response, next: NextFunction) => {
        try{
            const serviceId = parseInt(req.params.id!);
            const service = await this.servicesService.getService(serviceId);
            return res.status(200).json(service);
        }
        catch(error: any){
            next(error);
        }
    }

    updateService = async (req: Request, res: Response, next: NextFunction) => {
        try{
            const serviceId = parseInt(req.params.id!);
            const dataToUpdate = updateServiceSchema.parse(req.body);
            const updatedService =  await this.servicesService.updateService(serviceId, dataToUpdate);
            
            return res.status(200).json(updatedService);
        }
        catch(error: any){
            next(error);
        }
    }

    deleteService = async (req: Request, res: Response, next: NextFunction) => {
        try{
            const serviceId = parseInt(req.params.id!);
            await this.servicesService.deleteService(serviceId);
            return res.status(204).send();
        }
        catch(error){
            next(error);
        }
    }

    getActiveServices = async(req: Request, res: Response, next: NextFunction) => {
        try{
            const activeServices = await this.servicesService.getActiveServices();
            return res.status(200).json(activeServices);
        }
        catch(error: any) {
            next(error);
        }
    }

}