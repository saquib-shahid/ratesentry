/**
 * Fixed Window Counter Algorithm
 * @param key unique identifier
 * @param limit max requests per window
 * @param windowMs window size in milliseconds
 */
export declare const fixedWindow: (key: string, limit: number, windowMs: number) => Promise<{
    allowed: boolean;
    remaining: number;
    resetInMs: number;
}>;
//# sourceMappingURL=fixed-window.d.ts.map