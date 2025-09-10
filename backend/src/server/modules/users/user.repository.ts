import prismaClient from '../../shared/config/prisma.ts';
import { Prisma } from "@prisma/client";
import type { User } from "@prisma/client";

export class UserRepository {

    /**
     * Create new user in database
     * @param data Data input to create new user
     * @returns User
     */
    async create(data: Prisma.UserCreateInput): Promise<User> {
        return await prismaClient.user.create({ data });
    }

    /**
     * List users
     * @returns User[]
     */
    async findAll(): Promise<User[]> {
        return await prismaClient.user.findMany();
    }

    /**
     * Update a existing user
     * @param userId ID of the user to update
     * @param data Data to be updated
     * @returns Updated user
     */
    async update(userId: number, data: Prisma.UserUpdateInput):  Promise<User>{
        return await prismaClient.user.update({
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
        return await prismaClient.user.findUnique({
            where: { user_id: userId }
        });
    }

    /**
     * Find user by their email
     * @param email 
     * @returns User or null
     */
    async findByEmail(email: string): Promise<User | null> {
        return await prismaClient.user.findUnique({
            where: { email }
        });
    }

    /**
     * Delete a user
     * @param userId 
     * @returns User deleted or null
     */
    async delete(userId: number): Promise<User | null>{
        return prismaClient.user.delete({
            where: { user_id: userId }
        });
    }
}