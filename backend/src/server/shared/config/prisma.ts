import { PrismaClient } from "../../../generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";

interface PrismaGlobal {
    prisma: PrismaClient
}

declare const global: PrismaGlobal;

const adapter = new PrismaPg({ 
  connectionString: process.env.DATABASE_URL 
});

const prismaClient = global.prisma || new PrismaClient({ adapter });

if(process.env.NODE_ENV === 'development') global.prisma = prismaClient;

export default prismaClient;