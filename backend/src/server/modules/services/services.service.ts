import type { Prisma, Service } from "../../../generated/prisma/client.ts";
import type { InputServiceDTO, UpdateServiceDTO } from "./services.schema.ts";
import { ServiceRepository } from "./services.repository.ts";
import { ConflictError, NotFoundError, BadRequestError } from "../../shared/errors/http.errors.ts";
import { removeUndefined } from "../../shared/utils/object.utils.ts";
import { AppointmentRepository } from "../appointments/appointments.repository.ts";

export class ServicesService {
    private serviceRepository: ServiceRepository;
    private appointmentRepository: AppointmentRepository;

    constructor(){
        this.serviceRepository = new ServiceRepository();
        this.appointmentRepository = new AppointmentRepository();
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

    async deleteService(serviceId: number): Promise<void> {
        const serviceExists = await this.serviceRepository.findById(serviceId);
        if(!serviceExists) throw new NotFoundError("Serviço não encontrado");

        // It keeps integrity
        const existingAppointment = await this.appointmentRepository.findFirstByServiceId(serviceId);
        if(existingAppointment) {
            throw new ConflictError("Não é possível deletar o serviço pois ele está vinculado a um ou mais agendamentos.");
        }

        await this.serviceRepository.delete(serviceId);
    }
}