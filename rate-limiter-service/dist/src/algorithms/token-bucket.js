import { redisClient } from '../services/redis.service.js';
/**
 * Token Bucket Algorithm (via Lua Script for atomicity)
 */
const TOKEN_BUCKET_SCRIPT = `
  local key = KEYS[1]
  local capacity = tonumber(ARGV[1])
  local refillRate = tonumber(ARGV[2])
  local now = tonumber(ARGV[3])
  
  local bucket = redis.call('HMGET', key, 'tokens', 'lastRefill')
  local tokens = tonumber(bucket[1])
  local lastRefill = tonumber(bucket[2])
  
  if not tokens then
    tokens = capacity
    lastRefill = now
  end
  
  -- Calculate refilled tokens based on time passed
  local timePassedInSeconds = math.max(0, (now - lastRefill) / 1000)
  local refilledTokens = math.floor(timePassedInSeconds * refillRate)
  
  if refilledTokens > 0 then
    tokens = math.min(capacity, tokens + refilledTokens)
    lastRefill = now
  end
  
  local allowed = 0
  if tokens >= 1 then
    tokens = tokens - 1
    allowed = 1
  end
  
  redis.call('HMSET', key, 'tokens', tokens, 'lastRefill', lastRefill)
  -- Expire cleanly based on time needed to fully refill
  local timeToFull = math.ceil((capacity - tokens) / refillRate) * 1000
  if timeToFull > 0 then
    redis.call('PEXPIRE', key, timeToFull)
  end
  
  return { allowed, tokens }
`;
// Register the script so it only compiles once in Redis
redisClient.defineCommand('tokenBucket', {
    numberOfKeys: 1,
    lua: TOKEN_BUCKET_SCRIPT,
});
export const tokenBucket = async (key, capacity, refillRateSec) => {
    const now = Date.now();
    const redisKey = `rl:tb:${key}`;
    // @ts-ignore - custom command
    const result = await redisClient.tokenBucket(redisKey, capacity, refillRateSec, now);
    const allowed = result[0] === 1;
    const remaining = result[1];
    // Token bucket reset is continuous, approx reset in ms to get 1 token
    const resetInMs = remaining === 0 ? Math.ceil(1000 / refillRateSec) : 0;
    return {
        allowed,
        remaining,
        resetInMs
    };
};
//# sourceMappingURL=token-bucket.js.map