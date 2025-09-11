import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { UserController } from "./user.controller.ts";
import upload from '../../shared/config/multer.ts';
import { validateId } from "../../shared/middlewares/id.validation.ts";

const userController = new UserController();
const usersRouter = Router();

// signup for clients
usersRouter.post(
    '/client',
    (req: Request, res: Response, next: NextFunction) => userController.createClient(req, res, next)
);

// list all users
usersRouter.get(
    '/', 
    (req: Request, res: Response, next: NextFunction) => userController.getAllUsers(req, res, next)
);

// get a single user
usersRouter.get(
    '/:id',
    validateId, 
    (req: Request, res: Response, next: NextFunction) => userController.getUser(req, res, next)
);

// login for all users
usersRouter.post(
    '/login',
    (req: Request, res: Response, next: NextFunction) => userController.login(req, res, next)
);

// update a user
usersRouter.put(
    '/:id',
    validateId,
    (req: Request, res: Response, next: NextFunction) => userController.updateUser(req, res, next)
);

// create barber with their photo
usersRouter.post(
    '/barber',
    upload.single('photo'),
    (req: Request, res: Response, next: NextFunction) => userController.createBarber(req, res, next)
);

usersRouter.delete(
    '/:id',
    validateId,
    (req: Request, res: Response, next: NextFunction) => userController.deleteUser(req, res, next)
);


export default usersRouter;