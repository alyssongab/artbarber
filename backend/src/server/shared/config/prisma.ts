import { PrismaClient } from "@prisma/client";

interface PrismaGlobal {
    prisma: PrismaClient
}

declare const global: PrismaGlobal;

const prismaClient = global.prisma || new PrismaClient();

if(process.env.NODE_ENV === 'development') global.prisma = prismaClient;

export default prismaClient;