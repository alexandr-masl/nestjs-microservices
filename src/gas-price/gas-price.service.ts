import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { ethers } from 'ethers';
import * as cron from 'node-cron';
import { GasPriceDto } from './gas-price.dto';

@Injectable()
export class GasPriceService {
  private provider: ethers.JsonRpcProvider;
  private readonly logger = new Logger(GasPriceService.name);

  constructor(
    private configService: ConfigService,
    @InjectRedis() private readonly redisClient: Redis,
  ) {
    const alchemyApiKey = this.configService.get<string>('ALCHEMY_API_KEY');
    if (!alchemyApiKey) {
      this.logger.error('Alchemy API Key is not configured');
      throw new Error('Alchemy API Key is not configured');
    }
    this.provider = new ethers.JsonRpcProvider(`https://eth-mainnet.alchemyapi.io/v2/${alchemyApiKey}`);
    this.scheduleGasPriceUpdate();
  }

  async onModuleInit() {
    await this.fetchGasPrice();
    this.scheduleGasPriceUpdate();
  }

  async fetchGasPrice() {
    try {
      const feeData = await this.provider.getFeeData();
      const formattedGasPrice = ethers.formatUnits(feeData.gasPrice, 'gwei');
      this.logger.log(`Fetched gas price: ${formattedGasPrice}`);
      await this.redisClient.set('gasPrice', formattedGasPrice, 'EX', 60); // Cache for 60 seconds
    } catch (error) {
      this.logger.error('Error fetching or setting gas price:', error);
    }
  }

  scheduleGasPriceUpdate() {
    cron.schedule('*/7 * * * * *', async () => {
      await this.fetchGasPrice();
      this.logger.log('Gas price updated');
    });
  }

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
