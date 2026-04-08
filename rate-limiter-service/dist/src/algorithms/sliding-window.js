import { redisClient } from '../services/redis.service.js';
/**
 * Sliding Window Log Algorithm
 * @param key unique identifier (e.g., IP or API Key)
 * @param limit maximum requests allowed in the window
 * @param windowMs window size in milliseconds
 * @returns { allowed: boolean, remaining: number, resetInMs: number }
 */
export const slidingWindow = async (key, limit, windowMs) => {
    const now = Date.now();
    const windowStart = now - windowMs;
    const redisKey = `rl:sw:${key}`;
    const member = `${now}-${Math.random().toString(36).substring(2, 9)}`;
    // Atomic pipeline
    const pipeline = redisClient.multi();
    // Remove logs older than the window
    pipeline.zremrangebyscore(redisKey, 0, windowStart);
    // Add current request
    pipeline.zadd(redisKey, now, member);
    // Count elements in the window
    pipeline.zcard(redisKey);
    // Get the oldest element to calculate reset time
    pipeline.zrange(redisKey, 0, 0, 'WITHSCORES');
    // Update expiration
    pipeline.pexpire(redisKey, windowMs);
    const results = await pipeline.exec();
    if (!results) {
        throw new Error('Redis transaction failed');
    }
    const requestCount = results[2]?.[1];
    const oldestElement = results[3]?.[1];
    let resetInMs = windowMs;
    if (oldestElement && oldestElement.length >= 2) {
        const oldestTimestamp = parseInt(oldestElement[1], 10);
        resetInMs = Math.max(0, oldestTimestamp + windowMs - now);
    }
    const allowed = requestCount <= limit;
    if (!allowed) {
        // If not allowed, we shouldn't necessarily keep it in the window if we want a hard reject.
        // However, Sliding Window Log strictly counts *all* attempts. 
        // For production optimization to prevent memory bloat on heavy DDOS, 
        // optionally remove the newly added item here if allowed == false:
        // await redisClient.zrem(redisKey, member);
    }
    return {
        allowed,
        remaining: Math.max(0, limit - requestCount),
        resetInMs
    };
};
//# sourceMappingURL=sliding-window.js.map