import { Controller, Get, Param, UsePipes } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { AmountOutService } from './amount-out.service';
import { AmountOutDto } from './dto/amount-out.dto';
import { PATHS, SWAGGER } from '../../config/constants';

@ApiTags(PATHS.AMOUNT_OUT)
@Controller(PATHS.AMOUNT_OUT)
export class AmountOutController {
  constructor(private readonly amountOutService: AmountOutService) {}

  @Get(':fromTokenAddress/:toTokenAddress/:amountIn')
  @ApiOperation({ summary: SWAGGER.AMOUNT_OUT.SUMMARY })
  @ApiResponse({ 
    status: SWAGGER.AMOUNT_OUT.RESPONSES.OK.status, 
    description: SWAGGER.AMOUNT_OUT.RESPONSES.OK.description, 
    type: AmountOutDto 
  })
  @ApiResponse({ 
    status: SWAGGER.AMOUNT_OUT.RESPONSES.ERROR.status, 
    description: SWAGGER.AMOUNT_OUT.RESPONSES.ERROR.description 
  })
  @ApiParam({ name: 'fromTokenAddress', required: true, description: 'Address of the from token' })
  @ApiParam({ name: 'toTokenAddress', required: true, description: 'Address of the to token' })
  @ApiParam({ name: 'amountIn', required: true, description: 'Amount to convert' })
  async getAmountOut(
    @Param() params: AmountOutDto
  ): Promise<AmountOutDto> {
    return this.amountOutService.getAmountOut(params.fromTokenAddress, params.toTokenAddress, params.amountIn);
  }
}

