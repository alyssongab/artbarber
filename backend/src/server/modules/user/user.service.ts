import { Prisma } from "@prisma/client";
import type { User } from "@prisma/client";
import type { CreateClientDTO, LoginInput, UserResponseDTO, UpdateUserDTO } from "./user.schema.ts";
import { UserRepository } from "./user.repository.ts";
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { removeUndefined } from "../../shared/utils/object.utils.ts";

export class UserService {

    private userRepository: UserRepository;

    constructor(){
        this.userRepository = new UserRepository();
    }

    /**
     * DTO to prevent responses with sensitive data
     * @param user 
     * @returns DTO For User responses
     */
    private toUserResponseDTO(user: User): UserResponseDTO{
        return{
            id: user.user_id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone_number: user.phone_number,
            birthday: user.birthday,
            role: user.role
        }
    }

    /**
     * Creates new client
     * @param data 
     */
    async createClient(data: CreateClientDTO): Promise<UserResponseDTO> {
        const existingClient = await this.userRepository.findByEmail(data.email);
        if(existingClient) throw new Error("Usuário com esse email já existe.");
        
        // encrypt the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);

        const newUser = await this.userRepository.create({
            ...data,
            password: hashedPassword,
            role: 'CLIENT'
        });

        return this.toUserResponseDTO(newUser);
    }

    /**
     * Log in
     * @param data email and password
     * @returns jwt token
     */
    async login(data: LoginInput): Promise<{ accessToken: string }> {
        const user = await this.userRepository.findByEmail(data.email);
        if(!user) throw new Error("Email ou senha inválidos.");

        const validPassword = await bcrypt.compare(data.password, user.password);
        if(!validPassword) throw new Error("Email ou senha inválidos.");

        const payload = {
            sub: user.user_id,
            role: user.role
        };

        const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
            expiresIn: "3600"
        });

        return { accessToken };
    }

    /**
     * List all users
     * @returns Users[]
     */
    async listUsers(): Promise<UserResponseDTO[]> {
        const users = await this.userRepository.findAll();
        return users.map(user => this.toUserResponseDTO(user));
    }

    async updateUser(userId: number, data: UpdateUserDTO): Promise<UserResponseDTO> {

        const userExists = await this.userRepository.findById(userId);
        if(!userExists) throw new Error("Usuário não encontrado.");

        // if password is provided
        if(data.password){
            const salt = 10;
            data.password = await bcrypt.hash(data.password, salt);
        }

        const cleanData = removeUndefined(data);

        const updatedUser = await this.userRepository.update(userId, cleanData as Prisma.UserUpdateInput);

        return this.toUserResponseDTO(updatedUser);
    }

    async findUser(userId: number): Promise<UserResponseDTO | null> {
        const user = await this.userRepository.findById(userId);
        if(!user) throw new Error("Usuário não encontrado.");

        return this.toUserResponseDTO(user);
    }
}