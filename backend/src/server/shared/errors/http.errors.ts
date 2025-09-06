// not found - 404
// conflict - 409
// bad request - 400

export class HttpError extends Error {
    public readonly statusCode: number;
    
    constructor(message: string, statusCode: number){
        super(message);
        this.statusCode = statusCode;
    }
}

export class NotFoundError extends HttpError {
    constructor(message: string){
        super(message, 404);
    }
}

export class ConflictError extends HttpError {
    constructor(message: string){
        super(message, 409);
    }
}

export class BadRequestError extends HttpError {
    constructor(message: string){
        super(message, 400);
    }
}