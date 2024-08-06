import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { GasPriceService } from './gas-price/gas-price.service';
import { GasPriceController } from './gas-price/gas-price.controller';
import { RedisConfigService } from '../config/redis.config';
import { RedisModule } from '@nestjs-modules/ioredis';
import helmet from 'helmet';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

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
  ],
  controllers: [GasPriceController],
  providers: [
    GasPriceService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(helmet())
      .forRoutes('*');
  }
}
