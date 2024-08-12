import { RedisModuleOptions, RedisModuleOptionsFactory } from '@nestjs-modules/ioredis';
import { PATHS } from "./constants";

export class RedisConfigService implements RedisModuleOptionsFactory {
  createRedisModuleOptions(): Promise<RedisModuleOptions> | RedisModuleOptions {
    const PRODUCTION = process.env.APP === 'PRODUCTION';
    // Redis endpoint URL for the environment
    const REDIS_ENDPOINT = PRODUCTION ? process.env.REDIS_PRODUCTION_URL : PATHS.REDIS_DEV_URL;
    return {
      type: 'single',
      url: REDIS_ENDPOINT,
    };
  }
}
