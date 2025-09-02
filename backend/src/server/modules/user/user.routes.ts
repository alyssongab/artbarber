import { Router } from "express";
import type { Request, Response } from "express";
import { UserController } from "./user.controller.ts";
import upload from '../../shared/config/multer.ts';

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

// update a user
usersRouter.put(
    '/:id',
    (req: Request, res: Response) => userController.updateUser(req, res)
);

// create barber with their photo
usersRouter.post(
    '/barber',
    upload.single('photo'),
    (req: Request, res: Response) => userController.createBarber(req, res)
);

usersRouter.delete(
    '/:id',
    (req: Request, res: Response) => userController.deleteUser(req, res)
);


export default usersRouter;