import type { Request, Response, NextFunction } from "express";

export function validateId(req: Request, res: Response, next: NextFunction){
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: "Id não fornecido na rota" });
    }

    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
        return res.status(400).json({ message: "Id inválido, deve ser um número" });
    }

    next();
}