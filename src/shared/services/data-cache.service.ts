import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class DataCacheService {
  constructor(
    @InjectRedis() private readonly redisClient: Redis,
  ) {}

  async getCacheValue(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  async setCacheValue(key: string, value: string, ttl: number): Promise<void> {
    await this.redisClient.set(key, value, 'EX', ttl);
  }
}
