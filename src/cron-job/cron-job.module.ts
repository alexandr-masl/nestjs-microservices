import { Module } from '@nestjs/common';
import { CronJobService } from './cron-job.service';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [SharedModule], 
  providers: [CronJobService],
})
export class CronJobModule {}
