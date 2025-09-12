import { Router } from "express";
import { UserController } from "./user.controller.ts";
import upload from '../../shared/config/multer.ts';
import { validateId } from "../../shared/middlewares/id.validation.ts";
import { authenticate } from "../../shared/middlewares/auth.middleware.ts";

const userController = new UserController();
const usersRouter = Router();

// Route ('/users')

// ----- PUBLIC ROUTES (NO JWT) -----
usersRouter.post('/client', userController.createClient);
usersRouter.post('/login',  userController.login);


// ---- PROTECTED ROUTES (JWT) -----
usersRouter.post('/barber', authenticate, upload.single('photo'), userController.createBarber);
usersRouter.get('/', authenticate, userController.getAllUsers);
usersRouter.get('/:id', validateId, authenticate, userController.getUser);
usersRouter.put('/:id', validateId, authenticate, userController.updateUser);
usersRouter.delete('/:id', validateId, authenticate, userController.deleteUser);


export default usersRouter;