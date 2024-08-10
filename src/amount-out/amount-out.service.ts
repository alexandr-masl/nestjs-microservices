import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { AmountOutDto } from './dto/amount-out.dto';
import { TokenHandler } from './handlers/token-handler.service';
import { TokenHandlerErrorData } from '../shared/services/error-handler.service';
import { ERROR_MESSAGES } from '../../config/constants';

@Injectable()
export class AmountOutService {

  private readonly logger = new Logger(AmountOutService.name); // Initialize a logger for the service

  constructor(
    private readonly tokenHandler: TokenHandler // Inject the TokenHandler service to handle the core logic
  ) {}

  /**
   * Calculates the output amount when swapping tokens.
   * 
   * @param fromTokenAddress - The address of the token being exchanged.
   * @param toTokenAddress - The address of the token being received.
   * @param amountIn - The amount of the input token.
   * @returns The details of the swap, including the output amount.
   * @throws HttpException if there is an error in the calculation or an unexpected error occurs.
   */
  async getAmountOut(fromTokenAddress: string, toTokenAddress: string, amountIn: number): Promise<AmountOutDto> {
    try {
      // Use the tokenHandler to calculate the amount out
      const amountOut = await this.tokenHandler.getAmountOut(fromTokenAddress, toTokenAddress, amountIn);

      // Return the result as an AmountOutDto object
      return {
        fromTokenAddress,
        toTokenAddress,
        amountIn,
        amountOut,
      };
    } catch (error) {
      // Handle known errors from the TokenHandler
      if (error instanceof TokenHandlerErrorData) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      } else {
        // Log and throw an unexpected error
        this.logger.error(ERROR_MESSAGES.GET_AMOUNT_OUT_ERROR, error);
        throw new HttpException(ERROR_MESSAGES.UNEXPECTED_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
