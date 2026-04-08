export declare const tokenBucket: (key: string, capacity: number, refillRateSec: number) => Promise<{
    allowed: boolean;
    remaining: number;
    resetInMs: number;
}>;
//# sourceMappingURL=token-bucket.d.ts.map