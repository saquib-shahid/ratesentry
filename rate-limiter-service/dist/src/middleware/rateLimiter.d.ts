import { Request, Response, NextFunction } from 'express';
export interface RateLimiterOptions {
    algorithm?: 'sliding-window' | 'fixed-window' | 'token-bucket';
    defaultTier?: string;
    redisUrl?: string;
    standalone?: boolean;
    limit?: number;
    windowMs?: number;
}
export declare const rateLimiter: (options?: RateLimiterOptions) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=rateLimiter.d.ts.map