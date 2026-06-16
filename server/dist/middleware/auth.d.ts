import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}
export declare function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
export declare function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
export declare function generateToken(user: {
    id: string;
    email: string;
    role: string;
}): string;
//# sourceMappingURL=auth.d.ts.map