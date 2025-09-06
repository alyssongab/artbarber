import type { Request, Response, NextFunction } from "express";
import { ZodError, z } from "zod";
import { HttpError } from "../errors/http.errors.ts";

export function errorHandler(error: Error, req: Request, res: Response, next: NextFunction){
    console.log(error);

    // zod validation error
    if(error instanceof ZodError){
        const tree = z.treeifyError(error);
        return res.status(400).json({
            message: "Dados inválidos",
            errors: tree
        });
    }

    // http dynamic errors
    if(error instanceof HttpError){
        return res.status(error.statusCode).json({ message: error.message });
    }

    return res.status(500).json({ message: "Erro no servidor" });
}