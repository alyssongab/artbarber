import { Router } from "express";
import usersRouter from "../../modules/user/user.routes.ts";

const routes = Router();

routes.use('/users', usersRouter);

export default routes;