import { Router } from "express";
import express from 'express';
import usersRouter from "../../modules/user/user.routes.ts";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { errorHandler } from "../middlewares/error.handler.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const routes = Router();

routes.use('/users', usersRouter);
routes.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
routes.use(errorHandler);

export default routes;