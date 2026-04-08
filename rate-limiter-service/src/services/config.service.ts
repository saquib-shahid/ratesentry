import { Tier, Rule } from './db.service.js';

interface TierCache {
  name: string;
  requestsPerMin: number;
}

interface RuleCache {
  type: string;
  ipAddress: string | null;
  clientId: string | null;
}

class ConfigService {
  private tiersCache: Map<string, TierCache> = new Map();
  private rulesCache: RuleCache[] = [];
  private lastUpdateTime: number = 0;
  private readonly CACHE_TTL_MS = 60 * 1000;

  async refreshCache() {
    try {
      const tiers = await Tier.find();
      this.tiersCache.clear();
      tiers.forEach((t: any) => {
        this.tiersCache.set(t._id.toString(), { name: t.name, requestsPerMin: t.requestsPerMin });
      });

      const rules = await Rule.find();
      this.rulesCache = rules.map((r: any) => ({
        type: r.type,
        ipAddress: r.ipAddress,
        clientId: r.clientId ? r.clientId.toString() : null
      }));

      this.lastUpdateTime = Date.now();
    } catch (err) {
      console.error('Failed to refresh tier/rule cache', err);
    }
  }

  async getTierConfig(tierId: string): Promise<TierCache | null> {
    if (Date.now() - this.lastUpdateTime > this.CACHE_TTL_MS) {
      await this.refreshCache();
    }
    return this.tiersCache.get(tierId.toString()) || null;
  }

  async getTierByName(name: string): Promise<TierCache | null> {
    if (Date.now() - this.lastUpdateTime > this.CACHE_TTL_MS) {
      await this.refreshCache();
    }
    for (const [_, tier] of this.tiersCache.entries()) {
      if (tier.name === name) return tier;
    }
    return null;
  }

  async isBlacklisted(ipAddress: string | null, clientId: string | null): Promise<boolean> {
    if (Date.now() - this.lastUpdateTime > this.CACHE_TTL_MS) {
      await this.refreshCache();
    }
    return this.rulesCache.some(r => 
      r.type === 'BLACKLIST' && 
      ((ipAddress && r.ipAddress === ipAddress) || (clientId && r.clientId === clientId))
    );
  }

  async isWhitelisted(ipAddress: string | null, clientId: string | null): Promise<boolean> {
     if (Date.now() - this.lastUpdateTime > this.CACHE_TTL_MS) {
      await this.refreshCache();
    }
    return this.rulesCache.some(r => 
      r.type === 'WHITELIST' && 
      ((ipAddress && r.ipAddress === ipAddress) || (clientId && r.clientId === clientId))
    );
  }
}

export const configService = new ConfigService();
