import RedisImport from 'ioredis';
const Redis = RedisImport.default || RedisImport;
import dotenv from 'dotenv';
dotenv.config();
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
// We export a singleton Redis client
export const redisClient = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
        return Math.min(times * 50, 2000);
    }
});
redisClient.on('error', (err) => {
    console.error('Redis connection error:', err);
});
redisClient.on('ready', () => {
    console.log('Redis connected successfully.');
});
//# sourceMappingURL=redis.service.js.map