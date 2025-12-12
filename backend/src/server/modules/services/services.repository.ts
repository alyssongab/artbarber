import { Prisma } from "../../../generated/prisma/client.ts";
import prismaClient from '../../shared/config/prisma.ts';
import type { Service } from "../../../generated/prisma/client.ts";

export class ServiceRepository {

    /**
     * Create new service
     * @param data 
     * @returns 
     */
    async create(data: Prisma.ServiceCreateInput): Promise<Service> {
        return await prismaClient.service.create({ data });
    }

    /**
     * Find service by name
     * @param name 
     * @returns 
     */
    async findByName(name: string): Promise<Service | null> {
        return await prismaClient.service.findFirst({
            where: { name }
        });
    }

    /**
     * Find all services
     * @returns 
     */
    async findAll(): Promise<Service[]> {
        return await prismaClient.service.findMany();
    }

    /**
     * Find unique service
     * @param serviceId 
     * @returns 
     */
    async findById(serviceId: number): Promise<Service | null> {
        return await prismaClient.service.findUnique({
            where: { service_id: serviceId }
        });
    }

    /**
     * Update a service
     * @param serviceId 
     * @param data 
     * @returns 
     */
    async update(serviceId: number, data: Prisma.ServiceUpdateInput): Promise<Service> {
        return await prismaClient.service.update({
            data: data,
            where: { service_id: serviceId }
        });
    }

    /**
     * Delete a service
     * @param serviceId 
     * @returns 
     */
    async delete(serviceId: number): Promise<Service> {
        return await prismaClient.service.delete({
            where: { service_id: serviceId }
        });
    }
}