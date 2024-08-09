import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class DataCacheService {
  // The constructor injects the Redis client into the service.
  constructor(
    @InjectRedis() private readonly redisClient: Redis,
  ) {}

  /**
   * Retrieves a cached value for a given key from Redis.
   * @param {string} key - The key of the cached value.
   * @returns {Promise<string | null>} - The cached value as a string or null if the key does not exist.
   */
  async getCacheValue(key: string): Promise<string | null> {
    // Use the Redis client's `get` method to retrieve the value associated with the provided key.
    return this.redisClient.get(key);
  }

  /**
   * Sets a value in the cache with a specific time-to-live (TTL).
   * @param {string} key - The key under which the value will be stored.
   * @param {string} value - The value to be stored in the cache.
   * @param {number} ttl - The time-to-live in seconds for the cached value.
   * @returns {Promise<void>} - Resolves when the operation is complete.
   */
  async setCacheValue(key: string, value: string, ttl: number): Promise<void> {
    // Use the Redis client's `set` method to store the value with an expiration time (TTL).
    await this.redisClient.set(key, value, 'EX', ttl);
  }
}
