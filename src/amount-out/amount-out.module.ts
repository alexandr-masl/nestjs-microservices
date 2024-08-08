import { Module } from '@nestjs/common';
import { AmountOutController } from './amount-out.controller';
import { AmountOutService } from './amount-out.service';

@Module({
  controllers: [AmountOutController],
  providers: [AmountOutService]
})
export class AmountOutModule {}
