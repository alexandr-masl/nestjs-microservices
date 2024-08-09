import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GasPriceService } from './gas-price.service';
import { GasPriceDto } from './gas-price.dto';
import { PATHS, SWAGGER } from "../../config/constants";

@ApiTags(PATHS.GAS_PRICE)  // Swagger tag to group related endpoints
@Controller(PATHS.GAS_PRICE)  // Set the route path for this controller
export class GasPriceController {
  constructor(private readonly gasPriceService: GasPriceService) {}  // Dependency injection of GasPriceService

  @Get()
  @ApiOperation({ summary: SWAGGER.GAS_PRICE.SUMMARY })  // Swagger operation summary for documentation
  @ApiResponse({ 
    status: SWAGGER.GAS_PRICE.RESPONSES.OK.status,  // 200 status code description
    description: SWAGGER.GAS_PRICE.RESPONSES.OK.description, 
    type: GasPriceDto 
  })
  @ApiResponse({ 
    status: SWAGGER.GAS_PRICE.RESPONSES.ERROR.status,  // 400/500 status code description
    description: SWAGGER.GAS_PRICE.RESPONSES.ERROR.description 
  })
  async getGasPrice(): Promise<GasPriceDto> {
    // Calls the service to get the cached gas price and returns it
    return this.gasPriceService.getCachedGasPrice();
  }
}
