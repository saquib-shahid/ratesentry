import { redisClient } from '../services/redis.service.js';
/**
 * Fixed Window Counter Algorithm
 * @param key unique identifier
 * @param limit max requests per window
 * @param windowMs window size in milliseconds
 */
export const fixedWindow = async (key, limit, windowMs) => {
    const currentWindowStr = Math.floor(Date.now() / windowMs).toString();
    const redisKey = `rl:fw:${key}:${currentWindowStr}`;
    const pipeline = redisClient.multi();
    pipeline.incr(redisKey);
    pipeline.pttl(redisKey);
    const results = await pipeline.exec();
    if (!results) {
        throw new Error('Redis transaction failed');
    }
    const requestCount = results[0]?.[1];
    let ttl = results[1]?.[1];
    if (ttl === -1 || ttl === -2) {
        // Set expire if it doesn't have one (first request in window)
        await redisClient.pexpire(redisKey, windowMs);
        ttl = windowMs;
    }
    return {
        allowed: requestCount <= limit,
        remaining: Math.max(0, limit - requestCount),
        resetInMs: Math.max(0, ttl)
    };
};
//# sourceMappingURL=fixed-window.js.map