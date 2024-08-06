import { Module } from '@nestjs/common';
import { GasPriceController } from './gas-price.controller';
import { GasPriceService } from './gas-price.service';

@Module({
  controllers: [GasPriceController],
  providers: [GasPriceService]
})
export class GasPriceModule {}
