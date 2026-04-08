import client from 'prom-client';
// Configure the default register
const register = new client.Registry();
// Add default metrics (e.g., node resource usage)
client.collectDefaultMetrics({ register });
// Define custom metrics
export const rateLimitHits = new client.Counter({
    name: 'rate_limiter_requests_total',
    help: 'Total number of requests processed by the rate limiter',
    labelNames: ['algorithm', 'tier'],
});
export const rateLimitBlocks = new client.Counter({
    name: 'rate_limiter_blocks_total',
    help: 'Total number of requests blocked by the rate limiter',
    labelNames: ['algorithm', 'tier', 'reason'],
});
export const rateLimitLatency = new client.Histogram({
    name: 'rate_limiter_latency_seconds',
    help: 'Latency of rate limiting decisions in seconds',
    labelNames: ['algorithm'],
    buckets: [0.001, 0.005, 0.010, 0.050, 0.100], // Fast latency buckets
});
// Register custom metrics
register.registerMetric(rateLimitHits);
register.registerMetric(rateLimitBlocks);
register.registerMetric(rateLimitLatency);
export const metricsRegister = register;
//# sourceMappingURL=metrics.service.js.map