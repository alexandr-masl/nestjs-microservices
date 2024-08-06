import { Controller, Get, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { GasPriceService } from './gas-price.service';

@Controller('gasPrice')
@UseGuards(ThrottlerGuard)
export class GasPriceController {
  constructor(private readonly gasPriceService: GasPriceService) {}

  @Get()
  async getGasPrice(): Promise<{ gasPrice: string }> {
    const gasPrice = await this.gasPriceService.getCachedGasPrice();
    return { gasPrice };
  }
}
