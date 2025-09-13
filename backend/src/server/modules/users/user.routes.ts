import { Router } from "express";
import { UserController } from "./user.controller.ts";
import { upload } from '../../shared/config/multer.ts';
import { validateId } from "../../shared/middlewares/id.validation.ts";
import { authenticate } from "../../shared/middlewares/jwt.authentication.ts";
import { authorize } from "../../shared/middlewares/role.authorization.ts";

const userController = new UserController();
const usersRouter = Router();

// Route ('/users')

// ----- PUBLIC ROUTES (NO JWT) -----
usersRouter.post('/client', userController.createClient);
usersRouter.post('/login',  userController.login);


// ---- PROTECTED ROUTES (JWT) -----
usersRouter.post('/barber', authenticate, authorize('ADMIN'), upload.single('photo'), userController.createBarber);
usersRouter.get('/', authenticate, authorize('ADMIN'), userController.getAllUsers);
usersRouter.get('/:id', validateId, authenticate, userController.getUser);
usersRouter.put('/:id', validateId, authenticate, userController.updateUser);
usersRouter.delete('/:id', validateId, authenticate, authorize('ADMIN'), userController.deleteUser);


export default usersRouter;