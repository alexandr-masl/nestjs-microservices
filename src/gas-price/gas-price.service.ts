import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { GasPriceDto } from './gas-price.dto';

@Injectable()
export class GasPriceService {
  private readonly logger = new Logger(GasPriceService.name);

  constructor(
    @InjectRedis() private readonly redisClient: Redis,
  ) {}

  async getCachedGasPrice(): Promise<GasPriceDto> {
    try {
      const gasPrice = await this.redisClient.get('gasPrice');
      if (!gasPrice) {
        throw new HttpException('Gas price not available', HttpStatus.NOT_FOUND);
      }
      return { gasPrice };
    } catch (error) {
      this.logger.error('Error retrieving gas price:', error);
      throw new HttpException('Failed to retrieve gas price', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
