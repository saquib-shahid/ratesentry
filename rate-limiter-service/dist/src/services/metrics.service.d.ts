import client from 'prom-client';
export declare const rateLimitHits: client.Counter<"algorithm" | "tier">;
export declare const rateLimitBlocks: client.Counter<"algorithm" | "tier" | "reason">;
export declare const rateLimitLatency: client.Histogram<"algorithm">;
export declare const metricsRegister: client.Registry<"text/plain; version=0.0.4; charset=utf-8">;
//# sourceMappingURL=metrics.service.d.ts.map