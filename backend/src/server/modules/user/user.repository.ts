import { Prisma, PrismaClient } from "@prisma/client";
import { User } from "@prisma/client";

const prisma = new PrismaClient();

export class UserRepository {

    /**
     * Cria um novo usuario no banco
     * @param data Dados para criar o usuario
     * @returns Promise<User>
     */
    async create(data: Prisma.UserCreateInput): Promise<User> {
        return prisma.user.create({ data });
    }

}