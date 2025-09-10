import type { Service } from "@prisma/client";
import type { CreateServiceDTO } from "./services.schema.ts";
import { ServiceRepository } from "./services.repository.ts";
import { ConflictError } from "../../shared/errors/http.errors.ts";

export class ServicesService {
    private serviceRepository: ServiceRepository;

    constructor(){
        this.serviceRepository = new ServiceRepository();
    }

    async createService(data: CreateServiceDTO): Promise<Service> {
        const existingName = await this.serviceRepository.findByName(data.name);
        if(existingName) throw new ConflictError("Nome de serviço já cadastrado");
        return await this.serviceRepository.create(data);
    }

    async getServices(): Promise<Service[]> {
        return await this.serviceRepository.findAll();
    }
}