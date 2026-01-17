import { Router } from "express";
import express from 'express';
import usersRouter from "../../modules/users/user.routes.ts";
import servicesRouter from "../../modules/services/services.routes.ts";
import appointmentsRouter from "../../modules/appointments/appointment.routes.ts";
import notificationRouter  from "../../modules/notification/notification.routes.ts";
import { errorHandler } from "../middlewares/error.handler.ts";


const routes = Router();

routes.use('/notifications', notificationRouter);
routes.use('/users', usersRouter);
routes.use('/services', servicesRouter);
routes.use('/appointments', appointmentsRouter);
routes.use(errorHandler);

export default routes;