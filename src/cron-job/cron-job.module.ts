import { Module } from '@nestjs/common';
import { CronJobService } from './cron-job.service';
import { SharedModule } from '../shared/shared.module';

/**
 * CronJobModule is responsible for managing and scheduling cron jobs in the application.
 * 
 * This module imports the SharedModule, which provides shared services like caching, 
 * and provides the CronJobService for scheduling and managing cron jobs.
 */
@Module({
  imports: [SharedModule], // Import the SharedModule to use shared services like DataCacheService
  providers: [CronJobService], // Provide the CronJobService to handle cron jobs
})
export class CronJobModule {}
