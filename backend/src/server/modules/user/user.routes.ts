import { Router } from "express";
import type { Request, Response } from "express";
import { UserController } from "./user.controller.ts";

const userController = new UserController();
const usersRouter = Router();

// signup for clients
usersRouter.post(
    '/client', 
    (req: Request, res: Response) => userController.createClient(req, res)
);

// list all users
usersRouter.get(
    '/', 
    (req: Request, res: Response) => userController.getAllUsers(req, res)
);

// get a single user
usersRouter.get(
    '/:id', 
    (req: Request, res: Response) => userController.getUser(req, res)
);

// login for all users
usersRouter.post(
    '/login',
    (req: Request, res: Response) => userController.login(req, res)
);

usersRouter.put(
    '/:id',
    (req: Request, res: Response) => userController.updateUser(req, res)
);



export default usersRouter;