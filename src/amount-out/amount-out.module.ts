import { Module } from '@nestjs/common';
import { AmountOutService } from './amount-out.service';
import { AmountOutController } from './amount-out.controller';
import { TokenBlockchainService } from './handlers/token-blockchain.service';
import { TokenCalculationService } from './handlers/token-calculation.service';
import { TokenHandler } from './handlers/token-handler.service';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [SharedModule],
  providers: [
    TokenBlockchainService,
    TokenCalculationService,
    TokenHandler,
    AmountOutService,
  ],
  controllers: [AmountOutController],
})
export class AmountOutModule {}
