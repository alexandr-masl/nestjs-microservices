import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { GasPriceService } from './gas-price/gas-price.service';
import { GasPriceController } from './gas-price/gas-price.controller';
import { RedisConfigService } from '../config/redis.config';
import { RedisModule } from '@nestjs-modules/ioredis';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    RedisModule.forRootAsync({
      useClass: RedisConfigService,
    }),
  ],
  controllers: [GasPriceController],
  providers: [GasPriceService],
})
export class AppModule {}
