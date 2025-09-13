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
        try{

            // validate file (photo)
            if(!req.file){
                return res.status(400).json({ message: "A foto do barbeiro é obrigatória" });
            }

            // validate file format
            const allowedMimeTypes = ["image/jpg", "image/jpeg", "image/png"];
            if(!allowedMimeTypes.includes(req.file.mimetype)){
                return res.status(400).json({ message: "Formato de arquivo inválido. Use JPEG, JPG ou PNG." });
            }

            const barberData = createClientSchema.parse(req.body);
            const newBarber = await this.userService.createBarber(barberData, req.file.filename);

            return res.status(201).json(newBarber);
        }
        catch(error){
            next(error);
        }
    }


    /**
     * Find all users
     * @param req 
     * @param res 
     */
    getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
        const users = await this.userService.listUsers();
        res.status(200).json({
            data: users
        });
    }

    login = async (req: Request, res: Response, next: NextFunction) => {
        try{
            const credentials = req.body;
            const { accessToken } = await this.userService.login(credentials);
            res.status(200).json({
                accessToken: accessToken,
                message: "logado"
            });
        }
        catch(error){
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