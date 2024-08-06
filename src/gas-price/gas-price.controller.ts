import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GasPriceService } from './gas-price.service';
import { GasPriceDto } from './gas-price.dto';

@ApiTags('gasPrice')
@Controller('gasPrice')
export class GasPriceController {
  constructor(private readonly gasPriceService: GasPriceService) {}

  @Get()
  @ApiOperation({ summary: 'Get current gas price' })
  @ApiResponse({ status: 200, description: 'Returns the current gas price', type: GasPriceDto })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getGasPrice(): Promise<GasPriceDto> {
    return this.gasPriceService.getCachedGasPrice();
  }
}
