import { Module } from '@nestjs/common';
import { DataCacheService } from './services/data-cache.service';

@Module({
  providers: [DataCacheService],
  exports: [DataCacheService],
})
export class SharedModule {}
