declare global {
    namespace Express {
        interface User {
            user_id: number;
            role: string
        }
    }
}

declare global {
  namespace Express {
    interface Request {
      User: {
        user_id: number;
        role: string;
        email: string;
      };
    }
  }
}