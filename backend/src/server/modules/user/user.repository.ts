import { Prisma, PrismaClient } from "@prisma/client";
import { User } from "@prisma/client";

const prisma = new PrismaClient();

export class UserRepository {

    /**
     * Cria um novo usuario no banco
     * @param data Dados para criar o usuario
     * @returns User
     */
    async create(data: Prisma.UserCreateInput): Promise<User> {
        return prisma.user.create({ data });
    }

    /**
     * Lista usuários
     * @returns User[]
     */
    async findAll(): Promise<User[]> {
        return prisma.user.findMany();
    }

    /**
     * Encontra usuario pelo email
     * @param email 
     * @returns User ou null
     */
    async findByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { email }
        });
    }
}