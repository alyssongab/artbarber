import { Router } from "express";
import { UserController } from "./user.controller.ts";
import { upload } from '../../shared/config/multer.ts';
import { validateId } from "../../shared/middlewares/id.validation.ts";
import { authenticate } from "../../shared/middlewares/jwt.authentication.ts";
import { authorize } from "../../shared/middlewares/role.authorization.ts";
import { UserRepository } from "./user.repository.ts";
import { UserService } from "./user.service.ts";

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

const usersRouter = Router();

// ----- PUBLIC ROUTES (NO JWT) -----
usersRouter.post('/client', userController.createClient);
usersRouter.post('/login',  userController.login);


// ---- PROTECTED ROUTES (JWT) -----
usersRouter.post('/barber', authenticate, authorize('ADMIN'), upload.single('photo'), userController.createBarber);
usersRouter.get('/barbers', authenticate, userController.getBarbers);
usersRouter.get('/', authenticate, authorize('ADMIN'), userController.getAllUsers);
usersRouter.get('/:id', validateId, authenticate, userController.getUser);
usersRouter.put('/:id', validateId, authenticate, userController.updateUser);
usersRouter.delete('/:id', validateId, authenticate, authorize('ADMIN'), userController.deleteUser);
usersRouter.post("/refresh-token", authenticate, userController.refreshToken);

export default usersRouter;