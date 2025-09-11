import type { Prisma, Service } from "@prisma/client";
import type { InputServiceDTO, UpdateServiceDTO } from "./services.schema.ts";
import { ServiceRepository } from "./services.repository.ts";
import { ConflictError, NotFoundError, BadRequestError } from "../../shared/errors/http.errors.ts";
import { removeUndefined } from "../../shared/utils/object.utils.ts";

export class ServicesService {
    private serviceRepository: ServiceRepository;

    constructor(){
        this.serviceRepository = new ServiceRepository();
    }

    async createService(data: InputServiceDTO): Promise<Service> {
        const existingName = await this.serviceRepository.findByName(data.name);
        if(existingName) throw new ConflictError("Nome de serviço já cadastrado");
        return await this.serviceRepository.create(data);
    }

    async getServices(): Promise<Service[]> {
        return await this.serviceRepository.findAll();
    }

    async getService(serviceId: number): Promise<Service | null> {
        const service = await this.serviceRepository.findById(serviceId);
        if(!service) throw new NotFoundError("Serviço não encontrado");
        return service;
    }

    async updateService(serviceId: number, data: UpdateServiceDTO): Promise<Service> {

        if (Object.keys(data).length === 0) {
            throw new BadRequestError("Pelo menos um campo deve ser fornecido para atualização.");
        }
        
        const service = await this.serviceRepository.findById(serviceId);
        if(!service) throw new NotFoundError("Serviço não encontrado");

        const cleanData = removeUndefined(data);

        return await this.serviceRepository.update(serviceId, cleanData as Prisma.ServiceUpdateInput);
    }

    async deleteService(serviceId: number): Promise<Boolean> {
        const service = await this.serviceRepository.findById(serviceId);
        if(!service) throw new NotFoundError("Serviço não encontrado");

        const deletedService = await this.serviceRepository.delete(serviceId);
        return (deletedService) ? true : false;
    }
}