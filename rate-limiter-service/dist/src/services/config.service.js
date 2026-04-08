import { Tier, Rule } from './db.service.js';
class ConfigService {
    tiersCache = new Map();
    rulesCache = [];
    lastUpdateTime = 0;
    CACHE_TTL_MS = 60 * 1000;
    async refreshCache() {
        try {
            const tiers = await Tier.find();
            this.tiersCache.clear();
            tiers.forEach((t) => {
                this.tiersCache.set(t._id.toString(), { name: t.name, requestsPerMin: t.requestsPerMin });
            });
            const rules = await Rule.find();
            this.rulesCache = rules.map((r) => ({
                type: r.type,
                ipAddress: r.ipAddress,
                clientId: r.clientId ? r.clientId.toString() : null
            }));
            this.lastUpdateTime = Date.now();
        }
        catch (err) {
            console.error('Failed to refresh tier/rule cache', err);
        }
    }
    async getTierConfig(tierId) {
        if (Date.now() - this.lastUpdateTime > this.CACHE_TTL_MS) {
            await this.refreshCache();
        }
        return this.tiersCache.get(tierId.toString()) || null;
    }
    async getTierByName(name) {
        if (Date.now() - this.lastUpdateTime > this.CACHE_TTL_MS) {
            await this.refreshCache();
        }
        for (const [_, tier] of this.tiersCache.entries()) {
            if (tier.name === name)
                return tier;
        }
        return null;
    }
    async isBlacklisted(ipAddress, clientId) {
        if (Date.now() - this.lastUpdateTime > this.CACHE_TTL_MS) {
            await this.refreshCache();
        }
        return this.rulesCache.some(r => r.type === 'BLACKLIST' &&
            ((ipAddress && r.ipAddress === ipAddress) || (clientId && r.clientId === clientId)));
    }
    async isWhitelisted(ipAddress, clientId) {
        if (Date.now() - this.lastUpdateTime > this.CACHE_TTL_MS) {
            await this.refreshCache();
        }
        return this.rulesCache.some(r => r.type === 'WHITELIST' &&
            ((ipAddress && r.ipAddress === ipAddress) || (clientId && r.clientId === clientId)));
    }
}
export const configService = new ConfigService();
//# sourceMappingURL=config.service.js.map