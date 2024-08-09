import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule'; // Enables cron jobs and other scheduling features.
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'; // Provides rate-limiting functionality.
import { RedisConfigService } from '../config/redis.config'; // Custom configuration for Redis.
import { RedisModule } from '@nestjs-modules/ioredis'; // Redis module integration.
import helmet from 'helmet'; // Helmet middleware for security headers.
import { ConfigModule } from '@nestjs/config'; // Module to manage environment configurations.
import { APP_GUARD, APP_PIPE } from '@nestjs/core'; // Tokens for applying global guards and pipes.
import { CronJobService } from './cron-job/cron-job.service'; // Custom service to manage cron jobs.
import { GasPriceModule } from './gas-price/gas-price.module'; // Gas price-related functionality.
import { AmountOutModule } from './amount-out/amount-out.module'; // Module for handling token swap logic.
import { ValidationPipe } from '@nestjs/common'; // Validation pipe for request validation.
import { SharedModule } from './shared/shared.module'; // Shared services and utilities.
import { CronJobModule } from './cron-job/cron-job.module'; // Cron job-related functionality.

@Module({
  imports: [
    ScheduleModule.forRoot(), // Initialize schedule module for handling cron jobs.
    ThrottlerModule.forRoot([{
      ttl: 60000, // Time-to-live (TTL) for rate-limiting in milliseconds.
      limit: 60, // Maximum number of requests within the TTL.
    }]), // Global rate-limiting configuration.
    RedisModule.forRootAsync({
      useClass: RedisConfigService, // Async configuration for Redis using a custom service.
    }),
    ConfigModule.forRoot(), // Automatically load and parse environment variables.
    GasPriceModule, // Importing GasPriceModule to make its services/controllers available.
    AmountOutModule, // Importing AmountOutModule to make its services/controllers available.
    SharedModule, // Importing shared module to provide shared services like DataCacheService.
    CronJobModule, // Importing CronJobModule to manage scheduled tasks.
  ],
  providers: [
    {
      provide: APP_GUARD, // Apply a global guard (ThrottlerGuard) for rate-limiting.
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_PIPE, // Apply a global validation pipe for input validation.
      useClass: ValidationPipe,
    },
    CronJobService, // Providing the CronJobService to be used in the module.
  ],
})
export class AppModule implements NestModule {
  // Method to configure middleware
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(helmet()) // Applying Helmet middleware globally for enhanced security.
      .forRoutes('*'); // Apply to all routes.
  }
}
