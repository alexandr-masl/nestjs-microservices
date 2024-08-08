import { Injectable } from '@nestjs/common';
import { AmountOutDto } from './amount-out.dto';

@Injectable()
export class AmountOutService {
  async getAmountOut(fromTokenAddress: string, toTokenAddress: string, amountIn: number): Promise<AmountOutDto> {
    // Implement your logic to calculate the return value
    console.log('Received parameters:', { fromTokenAddress, toTokenAddress, amountIn });
    
    // Example return value, replace with your actual logic
    const returnValue: AmountOutDto = {
      fromTokenAddress,
      toTokenAddress,
      amountIn: amountIn,
      amountOut: 12345.67
    };

    return returnValue;
  }
}
