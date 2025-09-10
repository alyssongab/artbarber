import { Prisma } from "@prisma/client";
import prismaClient from '../../shared/config/prisma.ts';
import type { Service } from "@prisma/client";

export class ServiceRepository {

    /**
     * Create new service
     * @param data 
     * @returns 
     */
    async create(data: Prisma.ServiceCreateInput): Promise<Service> {
        return await prismaClient.service.create({ data });
    }

    async findByName(name: string): Promise<Service | null> {
        return await prismaClient.service.findFirst({
            where: { name }
        });
    }

    async findAll(): Promise<Service[]> {
        return await prismaClient.service.findMany();
    }
}