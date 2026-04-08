/**
 * Sliding Window Log Algorithm
 * @param key unique identifier (e.g., IP or API Key)
 * @param limit maximum requests allowed in the window
 * @param windowMs window size in milliseconds
 * @returns { allowed: boolean, remaining: number, resetInMs: number }
 */
export declare const slidingWindow: (key: string, limit: number, windowMs: number) => Promise<{
    allowed: boolean;
    remaining: number;
    resetInMs: number;
}>;
//# sourceMappingURL=sliding-window.d.ts.map