import { RedisModuleOptions, RedisModuleOptionsFactory } from '@nestjs-modules/ioredis';

export class RedisConfigService implements RedisModuleOptionsFactory {
  createRedisModuleOptions(): Promise<RedisModuleOptions> | RedisModuleOptions {
    return {
      type: 'single',
      url: 'redis://localhost:6379',
    };
  }
}
