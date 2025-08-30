import { Prisma, PrismaClient } from "@prisma/client";
import type { User } from "@prisma/client";

const prisma = new PrismaClient();

export class UserRepository {

    /**
     * Create new user in database
     * @param data Data input to create new user
     * @returns User
     */
    async create(data: Prisma.UserCreateInput): Promise<User> {
        return prisma.user.create({ data });
    }

    /**
     * List users
     * @returns User[]
     */
    async findAll(): Promise<User[]> {
        return await prisma.user.findMany();
    }

    /**
     * Update a existing user
     * @param userId ID of the user to update
     * @param data Data to be updated
     * @returns Updated user
     */
    async update(userId: number, data: Prisma.UserUpdateInput):  Promise<User>{
        return await prisma.user.update({
            data: data,
            where: {
                user_id: userId
            }
        });
    }

    /**
     * Find a specific user
     * @param userId
     * @returns User found or null
     */
    async findById(userId: number): Promise<User | null> {
        return await prisma.user.findUnique({
            where: { user_id: userId }
        });
    }

    /**
     * Find user by their email
     * @param email 
     * @returns User or null
     */
    async findByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { email }
        });
    }
}