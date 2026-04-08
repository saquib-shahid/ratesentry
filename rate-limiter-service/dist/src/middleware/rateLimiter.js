import { slidingWindow } from '../algorithms/sliding-window.js';
import { fixedWindow } from '../algorithms/fixed-window.js';
import { tokenBucket } from '../algorithms/token-bucket.js';
import { configService } from '../services/config.service.js';
import { rateLimitHits, rateLimitBlocks, rateLimitLatency } from '../services/metrics.service.js';
import { Client } from '../services/db.service.js';
export const rateLimiter = (options = {}) => {
    const algo = options.algorithm || 'sliding-window';
    const defaultTierName = options.defaultTier || 'free';
    return async (req, res, next) => {
        const startTime = process.hrtime();
        let algorithmLabel = algo;
        let tierLabel = defaultTierName;
        try {
            const apiKey = req.headers['x-api-key'];
            const ip = req.ip || req.connection.remoteAddress || 'unknown';
            let clientId = null;
            let limit = 100;
            let windowMs = 60 * 1000;
            if (apiKey) {
                const client = await Client.findOne({ apiKey });
                if (client) {
                    clientId = client._id.toString();
                    const tier = await configService.getTierConfig(client.tierId.toString());
                    if (tier) {
                        limit = tier.requestsPerMin;
                        tierLabel = tier.name;
                    }
                }
            }
            else {
                const tier = await configService.getTierByName(defaultTierName);
                if (tier) {
                    limit = tier.requestsPerMin;
                    tierLabel = tier.name;
                }
            }
            rateLimitHits.inc({ algorithm: algo, tier: tierLabel });
            const isBlacklisted = await configService.isBlacklisted(ip, clientId);
            if (isBlacklisted) {
                rateLimitBlocks.inc({ algorithm: algo, tier: tierLabel, reason: 'blacklist' });
                res.status(403).json({ error: 'Forbidden: IP or Client is blacklisted' });
                return;
            }
            const isWhitelisted = await configService.isWhitelisted(ip, clientId);
            if (isWhitelisted) {
                next();
                return;
            }
            if (limit === -1) {
                next();
                return;
            }
            const key = clientId || ip;
            let result = { allowed: true, remaining: limit, resetInMs: windowMs };
            switch (algo) {
                case 'fixed-window':
                    result = await fixedWindow(key, limit, windowMs);
                    break;
                case 'token-bucket':
                    const refillRateSec = limit / 60;
                    result = await tokenBucket(key, limit, refillRateSec);
                    break;
                case 'sliding-window':
                default:
                    result = await slidingWindow(key, limit, windowMs);
                    break;
            }
            res.setHeader('X-RateLimit-Limit', limit.toString());
            res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
            res.setHeader('X-RateLimit-Reset', Math.ceil(Date.now() / 1000 + result.resetInMs / 1000));
            if (!result.allowed) {
                res.setHeader('Retry-After', Math.ceil(result.resetInMs / 1000));
                rateLimitBlocks.inc({ algorithm: algo, tier: tierLabel, reason: 'limited' });
                res.status(429).json({
                    error: 'Too Many Requests',
                    retryAfter: Math.ceil(result.resetInMs / 1000)
                });
                return;
            }
            next();
        }
        catch (err) {
            console.error('Rate Limiter Error:', err);
            next();
        }
        finally {
            const diff = process.hrtime(startTime);
            const latencySeconds = diff[0] + diff[1] / 1e9;
            rateLimitLatency.observe({ algorithm: algo }, latencySeconds);
        }
    };
};
//# sourceMappingURL=rateLimiter.js.map