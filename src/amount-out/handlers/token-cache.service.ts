import Redis from 'ioredis';

export class TokenCacheService {
  constructor(private readonly redisClient: Redis) {}

  async getCacheValue(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  async setCacheValue(key: string, value: string, ttl: number): Promise<void> {
    await this.redisClient.set(key, value, 'EX', ttl);
  }
}
