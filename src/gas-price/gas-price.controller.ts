import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GasPriceService } from './gas-price.service';
import { GasPriceDto } from './gas-price.dto';
import { PATHS, SWAGGER } from '../../config/constants';

@ApiTags(SWAGGER.GAS_PRICE.TAG)
@Controller(PATHS.GAS_PRICE)
export class GasPriceController {
  constructor(private readonly gasPriceService: GasPriceService) {}

  @Get()
  @ApiOperation({ summary: SWAGGER.GAS_PRICE.SUMMARY })
  @ApiResponse(SWAGGER.GAS_PRICE.RESPONSES.OK)
  @ApiResponse(SWAGGER.GAS_PRICE.RESPONSES.ERROR)
  async getGasPrice(): Promise<GasPriceDto> {
    return this.gasPriceService.getCachedGasPrice();
  }
}