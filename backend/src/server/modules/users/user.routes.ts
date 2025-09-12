import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { UserController } from "./user.controller.ts";
import upload from '../../shared/config/multer.ts';
import { validateId } from "../../shared/middlewares/id.validation.ts";

const userController = new UserController();
const usersRouter = Router();

// Route ('/users')

// signup for clients
usersRouter.post('/client', userController.createClient);

// get all users
usersRouter.get('/', userController.getAllUsers);

// get a single user
usersRouter.get('/:id', validateId, userController.getUser);

// login for all users
usersRouter.post('/login',  userController.login);

// update a user
usersRouter.put('/:id', validateId, userController.updateUser);

// create barber with their photo
usersRouter.post('/barber', upload.single('photo'), userController.createBarber);

// delete a user
usersRouter.delete('/:id', validateId, userController.deleteUser);


export default usersRouter;