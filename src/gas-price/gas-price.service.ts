import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { GasPriceDto } from './gas-price.dto';
import { PATHS, ERROR_MESSAGES } from '../../config/constants';

@Injectable()
export class GasPriceService {
  private readonly logger = new Logger(GasPriceService.name);

  constructor(
    @InjectRedis() private readonly redisClient: Redis,
  ) {}

  async getCachedGasPrice(): Promise<GasPriceDto> {
    try {
      const gasPrice = await this.redisClient.get(PATHS.GAS_PRICE);
      if (!gasPrice) {
        throw new HttpException(ERROR_MESSAGES.GAS_PRICE_NOT_AVAILABLE, HttpStatus.NOT_FOUND);
      }
      return { gasPrice };
    } catch (error) {
      this.logger.error(ERROR_MESSAGES.GAS_PRICE_RETRIEVE_ERROR, error);
      throw new HttpException(ERROR_MESSAGES.GAS_PRICE_RETRIEVE_FAIL, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}