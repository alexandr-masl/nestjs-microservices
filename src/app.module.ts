import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { RedisConfigService } from '../config/redis.config';
import { RedisModule } from '@nestjs-modules/ioredis';
import helmet from 'helmet';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { CronJobService } from './cron-job/cron-job.service';
import { GasPriceModule } from './gas-price/gas-price.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 60,
    }]),
    RedisModule.forRootAsync({
      useClass: RedisConfigService,
    }),
    ConfigModule.forRoot(),
    GasPriceModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    CronJobService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(helmet())
      .forRoutes('*');
  }
}
