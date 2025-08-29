import { UserService } from "./user.service.ts";
import type { Request, Response } from "express";
import { createClientSchema } from "./user.schema.ts";
import { z, ZodError } from "zod";

export class UserController{

    private userService: UserService;
    constructor(){
        this.userService = new UserService();
    }

    // CLIENT ONLY
    async createClient(req: Request, res: Response){
        try{
            const clientData = createClientSchema.parse(req.body);
            const newUser = await this.userService.createClient(clientData);

            return res.status(201).json(newUser);
        }
        catch(error){
            // zod validation error
            if(error instanceof ZodError){
                const tree = z.treeifyError(error);
                return res.status(400).json({
                    message: "Dados inválidos",
                    errors: tree
                });
            }
            // if error comes from service
            else if(error instanceof Error){
                return res.status(409).json({
                    message: error.message
                });
            }
            else{
                return res.status(500).json({ message: "Erro no servidor" });
            }
        }
    }

    // for all user roles
    async getAllUsers(req: Request, res: Response){
        const users = await this.userService.listUsers();
        res.status(200).json({
            data: users
        });
    }

    async login(req: Request, res: Response){
        try{
            const credentials = req.body;
            const { accessToken } = await this.userService.login(credentials);
            res.status(200).json({
                accessToken: accessToken,
                message: "logado"
            });
        }
        catch(error){
            if(error instanceof ZodError){
                const tree = z.treeifyError(error);
                return res.status(400).json({
                    message: "Dados inválidos",
                    errors: tree
                });
            }
            if(error instanceof Error){
                // invalid credentials
                res.status(409).json({
                    message: error.message
                });
            }
            else{
                res.status(500).json({ message: "Erro interno do servidor" });
            }
        }
    }
    
}