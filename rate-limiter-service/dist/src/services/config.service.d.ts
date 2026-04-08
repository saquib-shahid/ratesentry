interface TierCache {
    name: string;
    requestsPerMin: number;
}
declare class ConfigService {
    private tiersCache;
    private rulesCache;
    private lastUpdateTime;
    private readonly CACHE_TTL_MS;
    refreshCache(): Promise<void>;
    getTierConfig(tierId: string): Promise<TierCache | null>;
    getTierByName(name: string): Promise<TierCache | null>;
    isBlacklisted(ipAddress: string | null, clientId: string | null): Promise<boolean>;
    isWhitelisted(ipAddress: string | null, clientId: string | null): Promise<boolean>;
}
export declare const configService: ConfigService;
export {};
//# sourceMappingURL=config.service.d.ts.map