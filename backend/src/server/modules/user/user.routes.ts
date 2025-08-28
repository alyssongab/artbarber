import { Router } from "express";
import type { Request, Response } from "express";
import { UserController } from "./user.controller.ts";

const userController = new UserController();
const usersRouter = Router();

usersRouter.post(
    '/client', 
    (req: Request, res: Response) => userController.createClient(req, res));

usersRouter.get(
    '/', 
    (req: Request, res: Response) => userController.getAllUsers(req, res));

export default usersRouter;