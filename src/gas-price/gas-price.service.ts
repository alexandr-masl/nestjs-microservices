import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { GasPriceDto } from './gas-price.dto';
import { PATHS, ERROR_MESSAGES } from '../../config/constants';
import { DataCacheService } from '../shared/services/data-cache.service';

@Injectable()
export class GasPriceService {
  private readonly logger = new Logger(GasPriceService.name);

  constructor(
    private readonly dataCacheService: DataCacheService,
  ) {}

  async getCachedGasPrice(): Promise<GasPriceDto> {
    try {
      const gasPrice = await this.dataCacheService.getCacheValue(PATHS.GAS_PRICE) 
      // await this.redisClient.get(PATHS.GAS_PRICE);
      if (!gasPrice) {
        throw new HttpException(ERROR_MESSAGES.GAS_PRICE_NOT_AVAILABLE, HttpStatus.NOT_FOUND);
      }
      return { gasPrice };
    } catch (error) {
      this.logger.error(ERROR_MESSAGES.GAS_PRICE_RETRIEVE_ERROR, error);
      throw new HttpException(ERROR_MESSAGES.UNEXPECTED_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}