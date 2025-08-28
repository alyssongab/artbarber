import type { User } from "@prisma/client";
import type { CreateClientDTO, LoginInput } from "./user.schema.ts";
import { UserRepository } from "./user.repository.ts";
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

export class UserService {

    private userRepository: UserRepository;

    constructor(){
        this.userRepository = new UserRepository();
    }

    /**
     * Creates new client
     * @param data 
     */
    async createClient(data: CreateClientDTO): Promise<Omit<User, 'password'>> {
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

        const { password, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
    }

    /**
     * Log in
     * @param data email and passoword
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
    async listUsers(): Promise<User[]> {
        return await this.userRepository.findAll();
    }
}