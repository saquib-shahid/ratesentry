import RedisImport from 'ioredis';
const Redis = RedisImport.default || RedisImport;
import dotenv from 'dotenv';
dotenv.config();
let _client;
const _registeredCommands = new Map();
function createClient(url) {
    const client = new Redis(url, {
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
            return Math.min(times * 50, 2000);
        }
    });
    client.on('error', (err) => {
        console.error('Redis connection error:', err);
    });
    client.on('ready', () => {
        console.log('Redis connected successfully to:', url);
    });
    for (const [name, config] of _registeredCommands.entries()) {
        client.defineCommand(name, config);
    }
    return client;
}
_client = createClient(process.env.REDIS_URL || 'redis://localhost:6379');
// We export a Proxy so we can hot-swap the connection instance if updateRedisClient is used
export const redisClient = new Proxy({}, {
    get(target, prop) {
        if (prop === 'defineCommand') {
            return (name, config) => {
                _registeredCommands.set(name, config);
                return _client.defineCommand(name, config);
            };
        }
        const value = _client[prop];
        return typeof value === 'function' ? value.bind(_client) : value;
    }
});
export const updateRedisClient = (url) => {
    if (_client) {
        _client.disconnect();
    }
    _client = createClient(url);
};
//# sourceMappingURL=redis.service.js.map