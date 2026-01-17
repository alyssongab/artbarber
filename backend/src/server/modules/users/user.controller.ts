import { UserService } from "./user.service.ts";
import type { NextFunction, Request, Response } from "express";
import { createClientSchema, updateUserSchema } from "./user.schema.ts";

export class UserController{

    private userService: UserService;
    constructor(){
        this.userService = new UserService();
    }

    // CLIENT ONLY

    /**
     * Create client service
     * @param req 
     * @param res 
     * @returns 
     */
    createClient = async (req: Request, res: Response, next: NextFunction) => {
        try{
            const clientData = createClientSchema.parse(req.body);
            const newClient = await this.userService.createClient(clientData);

            return res.status(201).json(newClient);
        }
        catch(error){
            next(error);
        }
    }

    // BARBER ONLY

    /**
     * Create barber service
     * @param req 
     * @param res 
     * @returns 
     */
    createBarber = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: "A foto do barbeiro é obrigatória." });
            }

            // extract the photo
            const { photo, ...barberData } = req.body;
            const parsedData = createClientSchema.parse(barberData);

            const newBarber = await this.userService.createBarber(parsedData, req.file.buffer);

            return res.status(201).json(newBarber);
        } catch (error) {
            next(error);
        }
    };


    /**
     * Find all users
     * @param req 
     * @param res 
     */
    getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
        const users = await this.userService.listUsers();
        res.status(200).json(users);
    }

    /**
     * Find all barbers
     * @param req 
     * @param res 
     * @param next 
     */
    getBarbers = async (req: Request, res: Response, next: NextFunction) => {
        const barbers = await this.userService.listBarbers();
        res.status(200).json(barbers);
    }

    /**
     * Log in
     * @param req 
     * @param res 
     * @param next 
     */
    login = async (req: Request, res: Response, next: NextFunction) => {
        try{
            const credentials = req.body;
            const { accessToken, user } = await this.userService.login(credentials);
            res.status(200).json({
                accessToken: accessToken,
                user: user,
                message: "logado"
            });
        }
        catch(error){
            next(error);
        }
    }

    refreshToken = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // token already validated by 'authenticate' and put on req.user
            const actor = {
                user_id: req.user!.user_id,
                role: req.user!.role
            };

            const result = await this.userService.refreshToken(actor);
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update user
     * @param req 
     * @param res 
     * @returns 
     */
    updateUser = async (req: Request, res: Response, next: NextFunction) => {
        try{
            const userId = parseInt(req.params.id!);
            const updatedData = updateUserSchema.parse(req.body);
            const actor = req.user!;

            const updatedUser = await this.userService.updateUser(userId, updatedData, actor);

            return res.status(200).json(updatedUser);
        }
        catch(error){
            next(error);
        }
    }

    /**
     * Find a user
     * @param req 
     * @param res 
     * @returns 
     */
    getUser = async (req: Request, res: Response, next: NextFunction) => {
        try{
            const userId = parseInt(req.params.id!);
            const actor = req.user!;
            const user = await this.userService.getUser(userId, actor);

            return res.status(200).json(user);
        }
        catch(error){
            next(error);
        }
    }

    deleteUser = async (req: Request, res: Response, next: NextFunction) => {
        try{
            const userId = parseInt(req.params.id!);
            await this.userService.deleteUser(userId);
            return res.status(204).send();
        }
        catch(error){
            next(error);
        }
    }
    
}