import { RedisModuleOptions, RedisModuleOptionsFactory } from '@nestjs-modules/ioredis';
import { PATHS } from "./constants";

export class RedisConfigService implements RedisModuleOptionsFactory {
  createRedisModuleOptions(): Promise<RedisModuleOptions> | RedisModuleOptions {
    return {
      type: 'single',
      url: process.env.PROD === 'PRODUCTION' ? process.env.REDIS_PRODUCTION_URL : PATHS.REDIS_DEV_URL,
    };
  }
}
