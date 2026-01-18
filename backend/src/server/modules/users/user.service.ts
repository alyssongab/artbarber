import { Prisma } from "../../../generated/prisma/client.ts";
import type { User } from "../../../generated/prisma/client.ts";
import type { CreateClientDTO, LoginInput, UserResponseDTO, UpdateUserDTO,CreateBarberDTO, BarberResponseDTO } from "./user.schema.ts";
import { UserRepository } from "./user.repository.ts";
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { removeUndefined } from "../../shared/utils/object.utils.ts";
import { NotFoundError, ConflictError, BadRequestError, UnauthorizedError, ForbiddenError} from "../../shared/errors/http.errors.ts";
import cloudinary from "../../shared/config/cloudinary.ts";

type Actor = {
    user_id: number,
    role: string
}

export class UserService {

    private userRepository: UserRepository;

    constructor(userRepository: UserRepository){
        this.userRepository = userRepository;
    }

    /**
     * DTO to prevent responses with sensitive data
     * @param user 
     * @returns DTO For User responses
     */
    private toUserResponseDTO(user: User): UserResponseDTO{
        return{
            user_id: user.user_id,
            full_name: user.full_name,
            email: user.email,
            phone_number: user.phone_number,
            birthday: user.birthday,
            role: user.role,
            photo_url: user.photo_url,
            thumbnail_url: user.thumbnail_url
        }
    }

    private toBarberResponseDTO(user: User): BarberResponseDTO {
        return{
            user_id: user.user_id,
            full_name: user.full_name,
            photo_url: user.photo_url,
            phone_number: user.phone_number,
            thumbnail_url: user.thumbnail_url
        }
    }

    /**
     * Creates new client
     * @param data 
     */
    async createClient(data: CreateClientDTO): Promise<UserResponseDTO> {
        const existingClient = await this.userRepository.findByEmail(data.email);
        if(existingClient) throw new ConflictError("Usuário com esse email já existe.");
        
        // encrypt the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);

        const newClient = await this.userRepository.create({
            ...data,
            password: hashedPassword,
            role: 'CLIENT'
        });

        return this.toUserResponseDTO(newClient);
    }

    /**
     * Create new barber
     * @param data 
     * @param photoBuffer image bytes
     */
    async createBarber(data: CreateBarberDTO, photoBuffer: Buffer): Promise<UserResponseDTO> {
        const barberExists = await this.userRepository.findByEmail(data.email);
        if(barberExists) throw new ConflictError("Usuário com esse email já existe.");

        const salt = 10;
        const hashedPassword = await bcrypt.hash(data.password, salt);

        // upload into cloudinary
        const uploadResult = await new Promise<any>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream({
                folder: 'barbers',
                public_id: `barber_${Date.now()}`,
                transformation: [
                    { width: 300, height: 300, crop: 'fill', gravity: 'face' },
                    { fetch_format: 'auto', quality: 'auto' }
                ],
            }, (error, result) => {
                if (error) {
                    reject(new BadRequestError("Erro no upload da imagem: " + error.message));
                } else {
                    resolve(result);
                }
            });
            uploadStream.end(photoBuffer); 
        });

        const photoUrl = uploadResult.secure_url;

        // generates thumbnail
        const thumbnailUrl = cloudinary.url(uploadResult.public_id, {
            crop: 'auto',
            gravity: 'auto',
            width: 150,
            height: 150,
            fetch_format: 'auto',
            quality: 'auto'
        });

        const newBarber = await this.userRepository.create({
            ...data,
            password: hashedPassword,
            photo_url: photoUrl,
            thumbnail_url: thumbnailUrl,  
            role: 'BARBER'
        });

        return this.toUserResponseDTO(newBarber);
    }

    /**
     * Log in
     * @param data email and password
     * @returns jwt token and user data
     */
    async login(credentials: LoginInput): Promise<{ accessToken: string; user: UserResponseDTO }> {
        const user = await this.userRepository.findByEmail(credentials.email);
        if(!user) throw new UnauthorizedError("Credenciais inválidas.");

        const validPassword = await bcrypt.compare(credentials.password, user.password);
        if(!validPassword) throw new UnauthorizedError("Credenciais inválidas.");

        const payload = {
            sub: user.user_id,
            role: user.role
        };

        const signOptions: jwt.SignOptions = {
            expiresIn: "7d",
            algorithm: "HS256"
        }

        const accessToken = jwt.sign(
            payload,
            process.env.JWT_SECRET as jwt.Secret,
            signOptions
        );

        return { 
            accessToken,
            user: this.toUserResponseDTO(user)
        };
    }

    /**
     * Refreshes jwt token
     * @param actor 
     * @returns refreshed jwt token and user data
     */
    async refreshToken(actor: Actor): Promise<{ accessToken: string; user: UserResponseDTO }> {
        const user = await this.userRepository.findById(actor.user_id);
        if (!user) {
            throw new UnauthorizedError("Usuário não encontrado.");
        }

        const payload = {
            sub: user.user_id,
            role: user.role
        };

        const signOptions: jwt.SignOptions = {
            expiresIn: "7d",
            algorithm: "HS256"
        }

        const accessToken = jwt.sign(
            payload,
            process.env.JWT_SECRET as jwt.Secret,
            signOptions
        );

        return {
            accessToken,
            user: this.toUserResponseDTO(user)
        };
    }

    /**
     * List all users
     * @returns Users[]
     */
    async listUsers(): Promise<UserResponseDTO[]> {
        const users = await this.userRepository.findAll();
        return users.map(user => this.toUserResponseDTO(user));
    }

    /**
     * List all barbers
     * @returns BarberResponseDTO[]
     */
    async listBarbers(): Promise<BarberResponseDTO[]> {
        const barbers = await this.userRepository.findAllBarbers();
        return barbers.map(barber => this.toBarberResponseDTO(barber));
    }

    /**
     * Update a user
     * @param userId 
     * @param data 
     * @returns 
     */
    async updateUser(userId: number, data: UpdateUserDTO, actor: Actor): Promise<UserResponseDTO> {

        const userExists = await this.userRepository.findById(userId);
        if(!userExists) throw new NotFoundError("Usuário não encontrado.");

        const isOwner = actor.user_id === userExists.user_id;
        const isAdmin = actor.role === 'ADMIN';

        if(isAdmin && userExists.role !== 'ADMIN'){}
        else if(isOwner){}
        
        else{
            throw new ForbiddenError("Você não tem permissão para atualizar este usuário.");    
        }

        // if password is provided
        if(data.password){
            const salt = 10;
            data.password = await bcrypt.hash(data.password, salt);
        }

        const cleanData = removeUndefined(data);

        const updatedUser = await this.userRepository.update(userId, cleanData as Prisma.UserUpdateInput);

        return this.toUserResponseDTO(updatedUser);
    }

    /**
     * Find a unique user
     * @param userId 
     * @returns User or null
     */
    async getUser(userId: number, actor: Actor): Promise<UserResponseDTO | null> {
        const user = await this.userRepository.findById(userId);
        if(!user) throw new NotFoundError("Usuário não encontrado.");

        const isOwner = actor.user_id === user.user_id;
        const isAdmin = actor.role === 'ADMIN';

        if(isAdmin && user.role !== 'ADMIN'){}
        else if(isOwner){}
        
        else{
            throw new ForbiddenError("Você não tem permissão para visualizar este usuário.");    
        }

        return this.toUserResponseDTO(user);
    }

    async deleteUser(userId: number): Promise<Boolean | null> {
        const user = await this.userRepository.findById(userId);
        if(!user) throw new NotFoundError("Usuário não encontrado.");

        const deletedUser = await this.userRepository.delete(userId);
        return (deletedUser) ? true : false;
    }
}