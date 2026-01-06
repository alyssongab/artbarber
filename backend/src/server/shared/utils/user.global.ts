declare global {
    namespace Express {
        interface User {
            user_id: number;
            role: string;
            email?: string;
        }
    }
}