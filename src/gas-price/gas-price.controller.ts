import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GasPriceService } from './gas-price.service';
import { GasPriceDto } from './gas-price.dto';
import {PATHS, SWAGGER} from "../../config/constants";


@ApiTags(PATHS.GAS_PRICE)
@Controller(PATHS.GAS_PRICE)
export class GasPriceController {
  constructor(private readonly gasPriceService: GasPriceService) {}

  @Get()
  @ApiOperation({ summary: SWAGGER.GAS_PRICE.SUMMARY })
  @ApiResponse({ 
    status: SWAGGER.GAS_PRICE.RESPONSES.OK.status, 
    description: SWAGGER.GAS_PRICE.RESPONSES.OK.description, 
    type: GasPriceDto 
  })
  @ApiResponse({ 
    status: SWAGGER.GAS_PRICE.RESPONSES.ERROR.status, 
    description: SWAGGER.GAS_PRICE.RESPONSES.ERROR.description 
  })
  async getGasPrice(): Promise<GasPriceDto> {
    return this.gasPriceService.getCachedGasPrice();
  }
}
