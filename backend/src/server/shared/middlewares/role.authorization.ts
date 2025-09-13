import { ForbiddenError } from "../errors/http.errors.ts";
import type { Request, Response, NextFunction } from "express";


/**
 * Middleware to create a role-based authorization
 * @param allowedRoles List of roles that are allowed to access this route
 * @returns An express middleware function
 */
export const authorize = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user
        if(!user || !allowedRoles.includes(user.role)) {
            return next(new ForbiddenError("Acesso negado. Você não tem permissão para acessar esse recurso."));
        }

        next();
    }
}
