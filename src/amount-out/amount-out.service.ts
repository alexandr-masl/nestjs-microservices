import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { AmountOutDto } from './dto/amount-out.dto';
import { TokenHandler } from './handlers/token-handler';
import { TokenHandlerErrorData } from './handlers/error-handler';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { ERROR_MESSAGES } from '../../config/constants';


@Injectable()
export class AmountOutService {
  private tokenHandler: TokenHandler;
  private readonly logger = new Logger(AmountOutService.name);

  constructor(@InjectRedis() private readonly redisClient: Redis) {
    this.tokenHandler = new TokenHandler(redisClient);
  }

  async getAmountOut(fromTokenAddress: string, toTokenAddress: string, amountIn: number): Promise<AmountOutDto> {
    try {

      const amountOut = await this.tokenHandler.getAmountOut(fromTokenAddress, toTokenAddress, amountIn);

      return {
        fromTokenAddress,
        toTokenAddress,
        amountIn,
        amountOut,
      };
    } 
    catch (error) {
      if (error instanceof TokenHandlerErrorData) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      } else {
        this.logger.error(ERROR_MESSAGES.GET_AMOUNT_OUT_ERROR, error);
        throw new HttpException(ERROR_MESSAGES.UNEXPECTED_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
